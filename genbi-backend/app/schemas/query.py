from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

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
    created_at: datetime
    
    class Config:
        from_attributes = True

class QueryStats(BaseModel):
    total_queries: int
    successful_queries: int
    success_rate: float
    avg_response_time: float
    data_sources_connected: int

class QueryHistory(BaseModel):
    queries: List[QueryResponse]
    total_count: int
    page: int
    page_size: int