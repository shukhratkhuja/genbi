from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_database
from app.api.deps import get_current_user
from app.models.user import User
from app.models.connection import DatabaseConnection, SelectedTable
from app.schemas.connection import (
    DatabaseConnectionCreate, 
    DatabaseConnection as DatabaseConnectionSchema,
    DatabaseConnectionUpdate,
    TableInfo,
    SelectedTableCreate,
    SelectedTable as SelectedTableSchema
)
from app.services.database_service import DatabaseService

router = APIRouter()

@router.post("/", response_model=DatabaseConnectionSchema)
async def create_connection(
    connection_data: DatabaseConnectionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database)
):
    # Check if user already has a connection (limit 1)
    result = await db.execute(
        select(DatabaseConnection).where(
            DatabaseConnection.user_id == current_user.id,
            DatabaseConnection.is_active == True
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=400,
            detail="User already has an active database connection. Please delete the existing one first."
        )
    
    # Test connection
    db_service = DatabaseService()
    connection_status = await db_service.test_connection(connection_data)
    
    if connection_status != "connected":
        raise HTTPException(
            status_code=400,
            detail="Failed to connect to database. Please check your credentials."
        )
    
    # Create connection
    db_connection = DatabaseConnection(
        user_id=current_user.id,
        name=connection_data.name,
        db_type=connection_data.db_type,
        host=connection_data.host,
        port=connection_data.port,
        username=connection_data.username,
        password=connection_data.password,  # В продакшене нужно шифровать
        database_name=connection_data.database_name,
        ssl_enabled=connection_data.ssl_enabled,
        connection_status=connection_status
    )
    
    db.add(db_connection)
    await db.commit()
    await db.refresh(db_connection)
    
    return db_connection

@router.get("/", response_model=List[DatabaseConnectionSchema])
async def get_connections(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database)
):
    result = await db.execute(
        select(DatabaseConnection).where(
            DatabaseConnection.user_id == current_user.id,
            DatabaseConnection.is_active == True
        )
    )
    return result.scalars().all()

@router.get("/{connection_id}", response_model=DatabaseConnectionSchema)
async def get_connection(
    connection_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database)
):
    result = await db.execute(
        select(DatabaseConnection).where(
            DatabaseConnection.id == connection_id,
            DatabaseConnection.user_id == current_user.id
        )
    )
    connection = result.scalar_one_or_none()
    
    if not connection:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    return connection

@router.put("/{connection_id}", response_model=DatabaseConnectionSchema)
async def update_connection(
    connection_id: int,
    connection_update: DatabaseConnectionUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database)
):
    result = await db.execute(
        select(DatabaseConnection).where(
            DatabaseConnection.id == connection_id,
            DatabaseConnection.user_id == current_user.id
        )
    )
    connection = result.scalar_one_or_none()
    
    if not connection:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    # Update fields
    update_data = connection_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(connection, field, value)
    
    # Test updated connection
    if any(field in update_data for field in ['host', 'port', 'username', 'password', 'database_name']):
        db_service = DatabaseService()
        connection_status = await db_service.test_connection(connection)
        connection.connection_status = connection_status
    
    await db.commit()
    await db.refresh(connection)
    
    return connection

@router.delete("/{connection_id}")
async def delete_connection(
    connection_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database)
):
    result = await db.execute(
        select(DatabaseConnection).where(
            DatabaseConnection.id == connection_id,
            DatabaseConnection.user_id == current_user.id
        )
    )
    connection = result.scalar_one_or_none()
    
    if not connection:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    connection.is_active = False
    await db.commit()
    
    return {"message": "Connection deleted successfully"}

@router.get("/{connection_id}/tables", response_model=List[TableInfo])
async def get_available_tables(
    connection_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database)
):
    result = await db.execute(
        select(DatabaseConnection).where(
            DatabaseConnection.id == connection_id,
            DatabaseConnection.user_id == current_user.id
        )
    )
    connection = result.scalar_one_or_none()
    
    if not connection:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    db_service = DatabaseService()
    tables = await db_service.get_tables(connection)
    
    return tables

@router.post("/{connection_id}/tables", response_model=List[SelectedTableSchema])
async def select_tables(
    connection_id: int,
    tables: List[SelectedTableCreate],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database)
):
    result = await db.execute(
        select(DatabaseConnection).where(
            DatabaseConnection.id == connection_id,
            DatabaseConnection.user_id == current_user.id
        )
    )
    connection = result.scalar_one_or_none()
    
    if not connection:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    # Clear existing selected tables
    await db.execute(
        select(SelectedTable).where(SelectedTable.connection_id == connection_id)
    )
    
    # Get table schemas
    db_service = DatabaseService()
    available_tables = await db_service.get_tables(connection)
    
    selected_tables = []
    for table_data in tables:
        # Find table info
        table_info = next(
            (t for t in available_tables if t.table_name == table_data.table_name),
            None
        )
        
        if table_info:
            selected_table = SelectedTable(
                connection_id=connection_id,
                table_name=table_data.table_name,
                schema_name=table_data.schema_name,
                columns_info=table_info.columns
            )
            db.add(selected_table)
            selected_tables.append(selected_table)
    
    await db.commit()
    
    return selected_tables

@router.get("/{connection_id}/selected-tables", response_model=List[SelectedTableSchema])
async def get_selected_tables(
    connection_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database)
):
    result = await db.execute(
        select(SelectedTable).where(SelectedTable.connection_id == connection_id)
    )
    return result.scalars().all()