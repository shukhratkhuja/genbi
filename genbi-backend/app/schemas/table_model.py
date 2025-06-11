from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class TableModelCreate(BaseModel):
    table_name: str
    model_name: str
    description: str = ""
    primary_key_columns: List[str] = []

class TableModelUpdate(BaseModel):
    model_name: Optional[str] = None
    description: Optional[str] = None
    primary_key_columns: Optional[List[str]] = None

class RelationshipCreate(BaseModel):
    from_table_id: int
    to_table_id: int
    from_column: str
    to_column: str
    relationship_type: str = "one_to_many"

class RelationshipResponse(BaseModel):
    id: int
    from_table_id: int
    to_table_id: int
    from_column: str
    to_column: str
    relationship_type: str

class CalculatedFieldCreate(BaseModel):
    table_model_id: int
    field_name: str
    expression: str
    data_type: str
    description: str = ""

class CalculatedFieldResponse(BaseModel):
    id: int
    field_name: str
    expression: str
    data_type: str
    description: str

class TableModelResponse(BaseModel):
    id: int
    table_name: str
    model_name: str
    description: str
    primary_key_columns: List[str]
    relationships: List[RelationshipResponse] = []
    calculated_fields: List[CalculatedFieldResponse] = []
    
    class Config:
        from_attributes = True