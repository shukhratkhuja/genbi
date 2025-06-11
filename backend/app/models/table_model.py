from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, JSON, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..core.database import Base

class TableModel(Base):
    __tablename__ = "table_models"
    
    id = Column(Integer, primary_key=True, index=True)
    connection_id = Column(Integer, ForeignKey("database_connections.id"), nullable=False)
    
    table_name = Column(String, nullable=False)
    model_name = Column(String, nullable=False)  # User-friendly name
    description = Column(Text, nullable=True)
    
    # Model configuration
    primary_key_columns = Column(JSON)  # List of column names
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    connection = relationship("DatabaseConnection", back_populates="table_models")
    relationships = relationship("TableRelationship", 
                               foreign_keys="[TableRelationship.from_table_id]",
                               back_populates="from_table",
                               cascade="all, delete-orphan")
    calculated_fields = relationship("CalculatedField", back_populates="table_model", cascade="all, delete-orphan")

class TableRelationship(Base):
    __tablename__ = "table_relationships"
    
    id = Column(Integer, primary_key=True, index=True)
    from_table_id = Column(Integer, ForeignKey("table_models.id"), nullable=False)
    to_table_id = Column(Integer, ForeignKey("table_models.id"), nullable=False)
    
    # Relationship details
    from_column = Column(String, nullable=False)
    to_column = Column(String, nullable=False)
    relationship_type = Column(String, default="one_to_many")  # one_to_one, one_to_many, many_to_many
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    from_table = relationship("TableModel", foreign_keys=[from_table_id], back_populates="relationships")
    to_table = relationship("TableModel", foreign_keys=[to_table_id])

class CalculatedField(Base):
    __tablename__ = "calculated_fields"
    
    id = Column(Integer, primary_key=True, index=True)
    table_model_id = Column(Integer, ForeignKey("table_models.id"), nullable=False)
    
    field_name = Column(String, nullable=False)
    expression = Column(Text, nullable=False)  # SQL expression
    data_type = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    table_model = relationship("TableModel", back_populates="calculated_fields")
