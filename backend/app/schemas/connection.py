from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class DatabaseConnectionBase(BaseModel):
    name: str
    db_type: str
    host: str
    port: int
    username: str
    database_name: str
    ssl_enabled: bool = False

class DatabaseConnectionCreate(DatabaseConnectionBase):
    password: str

class DatabaseConnectionUpdate(BaseModel):
    name: Optional[str] = None
    host: Optional[str] = None
    port: Optional[int] = None
    username: Optional[str] = None
    password: Optional[str] = None
    database_name: Optional[str] = None
    ssl_enabled: Optional[bool] = None

class DatabaseConnection(DatabaseConnectionBase):
    id: int
    user_id: int
    is_active: bool
    connection_status: str
    last_tested: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True

class TableInfo(BaseModel):
    schema_name: Optional[str]
    table_name: str
    columns: Dict[str, Any]

class SelectedTableCreate(BaseModel):
    table_name: str
    schema_name: Optional[str] = None

class SelectedTable(BaseModel):
    id: int
    table_name: str
    schema_name: Optional[str]
    columns_info: Dict[str, Any]
    
    class Config:
        from_attributes = True