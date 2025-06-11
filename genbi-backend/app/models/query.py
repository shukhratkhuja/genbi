from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, JSON, Float, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..core.database import Base

class Query(Base):
    __tablename__ = "queries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    connection_id = Column(Integer, ForeignKey("database_connections.id"), nullable=True)
    
    # Query details
    natural_language_query = Column(Text, nullable=False)
    generated_sql = Column(Text, nullable=True)
    execution_result = Column(JSON, nullable=True)  # Query results
    
    # AI Generated insights
    ai_insights = Column(Text, nullable=True)
    chart_config = Column(JSON, nullable=True)  # Plotly config
    
    # Performance metrics
    execution_time_ms = Column(Float, nullable=True)
    is_successful = Column(Boolean, default=False)
    error_message = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="queries")
