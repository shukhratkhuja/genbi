from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..core.database import Base

class DatabaseConnection(Base):
    __tablename__ = "database_connections"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Connection details
    name = Column(String, nullable=False)
    db_type = Column(String, nullable=False)  # postgresql, mysql, etc.
    host = Column(String, nullable=False)
    port = Column(Integer, nullable=False)
    username = Column(String, nullable=False)
    password = Column(String, nullable=False)  # В продакшене будет зашифрован
    database_name = Column(String, nullable=False)
    ssl_enabled = Column(Boolean, default=False)
    
    # Metadata
    is_active = Column(Boolean, default=True)
    connection_status = Column(String, default="pending")  # pending, connected, failed
    last_tested = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="connections")
    selected_tables = relationship("SelectedTable", back_populates="connection", cascade="all, delete-orphan")
    table_models = relationship("TableModel", back_populates="connection", cascade="all, delete-orphan")

class SelectedTable(Base):
    __tablename__ = "selected_tables"
    
    id = Column(Integer, primary_key=True, index=True)
    connection_id = Column(Integer, ForeignKey("database_connections.id"), nullable=False)
    
    schema_name = Column(String, nullable=True)
    table_name = Column(String, nullable=False)
    is_selected = Column(Boolean, default=True)
    
    # Table metadata from introspection
    columns_info = Column(JSON)  # {column_name: {type, nullable, default, etc}}
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    connection = relationship("DatabaseConnection", back_populates="selected_tables")
