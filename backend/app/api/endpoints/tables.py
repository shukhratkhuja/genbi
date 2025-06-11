from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Any
from pydantic import BaseModel

from app.core.database import get_database
from app.api.deps import get_current_user
from app.models.user import User
from app.models.connection import DatabaseConnection
from app.models.table_model import TableModel, TableRelationship, CalculatedField

router = APIRouter()

class TableModelCreate(BaseModel):
    table_name: str
    model_name: str
    description: str = ""
    primary_key_columns: List[str] = []

class TableModelResponse(BaseModel):
    id: int
    table_name: str
    model_name: str
    description: str
    primary_key_columns: List[str]
    relationships: List[Dict[str, Any]] = []
    calculated_fields: List[Dict[str, Any]] = []

class RelationshipCreate(BaseModel):
    from_table_id: int
    to_table_id: int
    from_column: str
    to_column: str
    relationship_type: str = "one_to_many"

class CalculatedFieldCreate(BaseModel):
    table_model_id: int
    field_name: str
    expression: str
    data_type: str
    description: str = ""

@router.post("/{connection_id}/models", response_model=TableModelResponse)
async def create_table_model(
    connection_id: int,
    model_data: TableModelCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database)
):
    # Verify connection ownership
    result = await db.execute(
        select(DatabaseConnection).where(
            DatabaseConnection.id == connection_id,
            DatabaseConnection.user_id == current_user.id
        )
    )
    connection = result.scalar_one_or_none()
    
    if not connection:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    # Create table model
    table_model = TableModel(
        connection_id=connection_id,
        table_name=model_data.table_name,
        model_name=model_data.model_name,
        description=model_data.description,
        primary_key_columns=model_data.primary_key_columns
    )
    
    db.add(table_model)
    await db.commit()
    await db.refresh(table_model)
    
    return TableModelResponse(
        id=table_model.id,
        table_name=table_model.table_name,
        model_name=table_model.model_name,
        description=table_model.description,
        primary_key_columns=table_model.primary_key_columns,
        relationships=[],
        calculated_fields=[]
    )

@router.get("/{connection_id}/models", response_model=List[TableModelResponse])
async def get_table_models(
    connection_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database)
):
    # Verify connection ownership
    result = await db.execute(
        select(DatabaseConnection).where(
            DatabaseConnection.id == connection_id,
            DatabaseConnection.user_id == current_user.id
        )
    )
    connection = result.scalar_one_or_none()
    
    if not connection:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    # Get table models with relationships and calculated fields
    models_result = await db.execute(
        select(TableModel).where(TableModel.connection_id == connection_id)
    )
    models = models_result.scalars().all()
    
    response_models = []
    for model in models:
        # Get relationships
        relationships_result = await db.execute(
            select(TableRelationship).where(TableRelationship.from_table_id == model.id)
        )
        relationships = relationships_result.scalars().all()
        
        # Get calculated fields
        fields_result = await db.execute(
            select(CalculatedField).where(CalculatedField.table_model_id == model.id)
        )
        calculated_fields = fields_result.scalars().all()
        
        response_models.append(TableModelResponse(
            id=model.id,
            table_name=model.table_name,
            model_name=model.model_name,
            description=model.description,
            primary_key_columns=model.primary_key_columns,
            relationships=[{
                "id": r.id,
                "to_table_id": r.to_table_id,
                "from_column": r.from_column,
                "to_column": r.to_column,
                "relationship_type": r.relationship_type
            } for r in relationships],
            calculated_fields=[{
                "id": f.id,
                "field_name": f.field_name,
                "expression": f.expression,
                "data_type": f.data_type,
                "description": f.description
            } for f in calculated_fields]
        ))
    
    return response_models

@router.post("/relationships")
async def create_relationship(
    relationship_data: RelationshipCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database)
):
    # Verify table models ownership (через connection)
    from_table_result = await db.execute(
        select(TableModel)
        .join(DatabaseConnection)
        .where(
            TableModel.id == relationship_data.from_table_id,
            DatabaseConnection.user_id == current_user.id
        )
    )
    from_table = from_table_result.scalar_one_or_none()
    
    if not from_table:
        raise HTTPException(status_code=404, detail="From table not found")
    
    # Create relationship
    relationship = TableRelationship(
        from_table_id=relationship_data.from_table_id,
        to_table_id=relationship_data.to_table_id,
        from_column=relationship_data.from_column,
        to_column=relationship_data.to_column,
        relationship_type=relationship_data.relationship_type
    )
    
    db.add(relationship)
    await db.commit()
    await db.refresh(relationship)
    
    return {"id": relationship.id, "message": "Relationship created successfully"}

@router.post("/calculated-fields")
async def create_calculated_field(
    field_data: CalculatedFieldCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database)
):
    # Verify table model ownership
    table_result = await db.execute(
        select(TableModel)
        .join(DatabaseConnection)
        .where(
            TableModel.id == field_data.table_model_id,
            DatabaseConnection.user_id == current_user.id
        )
    )
    table_model = table_result.scalar_one_or_none()
    
    if not table_model:
        raise HTTPException(status_code=404, detail="Table model not found")
    
    # Create calculated field
    calculated_field = CalculatedField(
        table_model_id=field_data.table_model_id,
        field_name=field_data.field_name,
        expression=field_data.expression,
        data_type=field_data.data_type,
        description=field_data.description
    )
    
    db.add(calculated_field)
    await db.commit()
    await db.refresh(calculated_field)
    
    return {"id": calculated_field.id, "message": "Calculated field created successfully"}