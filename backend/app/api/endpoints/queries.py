from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List, Dict, Any
from pydantic import BaseModel

from app.core.database import get_database
from app.api.deps import get_current_user
from app.models.user import User
from app.models.connection import DatabaseConnection
from app.models.query import Query
from app.services.text_to_sql import TextToSQLService
from app.services.openai_service import OpenAIService
from app.utils.helpers import serialize_for_json

router = APIRouter()

class QueryRequest(BaseModel):
    natural_language_query: str
    connection_id: int

class QueryResponse(BaseModel):
    id: int
    natural_language_query: str
    generated_sql: str
    execution_result: List[Dict[str, Any]]
    ai_insights: str
    chart_config: Dict[str, Any]
    execution_time_ms: float
    is_successful: bool

class QueryStats(BaseModel):
    total_queries: int
    successful_queries: int
    success_rate: float
    avg_response_time: float
    data_sources_connected: int

@router.post("/", response_model=QueryResponse)
async def execute_query(
    query_request: QueryRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database)
):
    # Get connection
    result = await db.execute(
        select(DatabaseConnection).where(
            DatabaseConnection.id == query_request.connection_id,
            DatabaseConnection.user_id == current_user.id
        )
    )
    connection = result.scalar_one_or_none()
    
    if not connection:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    # Execute text-to-SQL
    text_to_sql_service = TextToSQLService()
    sql_result = await text_to_sql_service.generate_sql(
        query_request.natural_language_query,
        connection
    )
    
    # Serialize data for JSON storage
    serialized_execution_result = serialize_for_json(sql_result.data)
    serialized_chart_config = serialize_for_json(sql_result.chart_config)
    
    # Create query record
    query_record = Query(
        user_id=current_user.id,
        connection_id=connection.id,
        natural_language_query=query_request.natural_language_query,
        generated_sql=sql_result.sql,
        execution_result=serialized_execution_result,
        ai_insights=sql_result.insights,
        chart_config=serialized_chart_config,
        execution_time_ms=sql_result.execution_time_ms,
        is_successful=sql_result.is_successful,
        error_message=sql_result.error_message
    )
    
    db.add(query_record)
    await db.commit()
    await db.refresh(query_record)
    
    if not sql_result.is_successful:
        raise HTTPException(
            status_code=400,
            detail=f"Query execution failed: {sql_result.error_message}"
        )
    
    return QueryResponse(
        id=query_record.id,
        natural_language_query=query_record.natural_language_query,
        generated_sql=query_record.generated_sql,
        execution_result=query_record.execution_result,
        ai_insights=query_record.ai_insights,
        chart_config=query_record.chart_config,
        execution_time_ms=query_record.execution_time_ms,
        is_successful=query_record.is_successful
    )

@router.get("/", response_model=List[QueryResponse])
async def get_user_queries(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database)
):
    result = await db.execute(
        select(Query)
        .where(Query.user_id == current_user.id)
        .order_by(desc(Query.created_at))
        .limit(limit)
    )
    queries = result.scalars().all()
    
    return [
        QueryResponse(
            id=q.id,
            natural_language_query=q.natural_language_query,
            generated_sql=q.generated_sql,
            execution_result=q.execution_result or [],
            ai_insights=q.ai_insights or "",
            chart_config=q.chart_config or {},
            execution_time_ms=q.execution_time_ms or 0,
            is_successful=q.is_successful
        ) for q in queries
    ]

@router.get("/stats", response_model=QueryStats)
async def get_query_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database)
):
    from sqlalchemy import func, case
    
    # Get query statistics
    stats_result = await db.execute(
        select(
            func.count(Query.id).label('total_queries'),
            func.count(case((Query.is_successful == True, 1))).label('successful_queries'),
            func.avg(Query.execution_time_ms).label('avg_response_time')
        ).where(Query.user_id == current_user.id)
    )
    stats = stats_result.first()
    
    # Get connections count
    connections_result = await db.execute(
        select(func.count(DatabaseConnection.id))
        .where(
            DatabaseConnection.user_id == current_user.id,
            DatabaseConnection.is_active == True
        )
    )
    connections_count = connections_result.scalar()
    
    total_queries = stats.total_queries or 0
    successful_queries = stats.successful_queries or 0
    success_rate = (successful_queries / total_queries * 100) if total_queries > 0 else 0
    
    return QueryStats(
        total_queries=total_queries,
        successful_queries=successful_queries,
        success_rate=round(success_rate, 1),
        avg_response_time=round(stats.avg_response_time or 0, 1),
        data_sources_connected=connections_count or 0
    )