from typing import Dict, Any, List
from dataclasses import dataclass
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.connection import DatabaseConnection, SelectedTable
from app.models.table_model import TableModel, TableRelationship
from app.services.database_service import DatabaseService
from app.services.openai_service import OpenAIService

@dataclass
class SQLResult:
    sql: str
    data: List[Dict[str, Any]]
    insights: str
    chart_config: Dict[str, Any]
    execution_time_ms: float
    is_successful: bool
    error_message: str = ""

class TextToSQLService:
    def __init__(self):
        self.db_service = DatabaseService()
        self.openai_service = OpenAIService()
    
    async def generate_sql(self, natural_query: str, connection: DatabaseConnection) -> SQLResult:
        """Main method to convert natural language to SQL and execute"""
        
        try:
            # Get table schemas for context
            table_schemas = await self._build_schema_context(connection)
            
            # Generate SQL using OpenAI
            sql_query = await self.openai_service.generate_sql(natural_query, table_schemas)
            
            # Execute SQL
            execution_result = await self.db_service.execute_sql(connection, sql_query)
            
            if not execution_result.get("success", False):
                return SQLResult(
                    sql=sql_query,
                    data=[],
                    insights="",
                    chart_config={},
                    execution_time_ms=0,
                    is_successful=False,
                    error_message=execution_result.get("error", "Unknown error")
                )
            
            data = execution_result["data"]
            execution_time = execution_result["execution_time_ms"]
            
            # Generate insights and chart config
            insights = await self.openai_service.generate_insights(natural_query, data)
            chart_config = await self.openai_service.generate_chart_config(data, natural_query)
            
            return SQLResult(
                sql=sql_query,
                data=data,
                insights=insights,
                chart_config=chart_config,
                execution_time_ms=execution_time,
                is_successful=True
            )
            
        except Exception as e:
            return SQLResult(
                sql="",
                data=[],
                insights="",
                chart_config={},
                execution_time_ms=0,
                is_successful=False,
                error_message=str(e)
            )
    
    async def _build_schema_context(self, connection: DatabaseConnection) -> str:
        """Build schema context for OpenAI prompt"""
        
        # Get all available tables (you would get this from your database session)
        tables = await self.db_service.get_tables(connection)
        
        schema_context = f"Database: {connection.database_name} ({connection.db_type})\n\n"
        
        for table in tables:
            schema_context += f"Table: {table.schema_name}.{table.table_name}\n"
            schema_context += "Columns:\n"
            
            for col_name, col_info in table.columns.items():
                nullable = "NULL" if col_info['nullable'] else "NOT NULL"
                schema_context += f"  - {col_name}: {col_info['type']} {nullable}\n"
            
            schema_context += "\n"
        
        # Add relationships information if available
        # This would require querying TableModel and TableRelationship
        # For now, we'll skip this part but you can add it later
        
        return schema_context
