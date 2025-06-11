import re
import json
from typing import Dict, Any, List, Optional
from datetime import datetime, date
from decimal import Decimal

class JSONEncoder(json.JSONEncoder):
    """Custom JSON encoder for handling special types"""
    
    def default(self, obj):
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        elif isinstance(obj, Decimal):
            return float(obj)
        return super().default(obj)

def serialize_for_json(data: Any) -> Any:
    """Recursively serialize data for JSON storage"""
    if isinstance(data, dict):
        return {key: serialize_for_json(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [serialize_for_json(item) for item in data]
    elif isinstance(data, (datetime, date)):
        return data.isoformat()
    elif isinstance(data, Decimal):
        return float(data)
    else:
        return data

def sanitize_sql(sql: str) -> str:
    """Basic SQL sanitization - remove dangerous keywords"""
    dangerous_keywords = [
        'DROP', 'DELETE', 'INSERT', 'UPDATE', 'CREATE', 'ALTER', 
        'TRUNCATE', 'EXEC', 'EXECUTE', 'GRANT', 'REVOKE'
    ]
    
    # Convert to uppercase for checking
    sql_upper = sql.upper()
    
    # Check for dangerous keywords
    for keyword in dangerous_keywords:
        if keyword in sql_upper:
            raise ValueError(f"SQL contains dangerous keyword: {keyword}")
    
    return sql

def validate_table_name(table_name: str) -> bool:
    """Validate table name format"""
    pattern = r'^[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)?$'
    return bool(re.match(pattern, table_name))

def validate_column_name(column_name: str) -> bool:
    """Validate column name format"""
    pattern = r'^[a-zA-Z_][a-zA-Z0-9_]*$'
    return bool(re.match(pattern, column_name))

def format_query_result(data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Format query results for JSON serialization"""
    return serialize_for_json(data)

def generate_connection_string(connection_data: Dict[str, Any]) -> str:
    """Generate database connection string"""
    db_type = connection_data['db_type']
    
    if db_type == 'postgresql':
        ssl_mode = "?sslmode=require" if connection_data.get('ssl_enabled') else ""
        return (
            f"postgresql://{connection_data['username']}:{connection_data['password']}@"
            f"{connection_data['host']}:{connection_data['port']}/{connection_data['database_name']}{ssl_mode}"
        )
    elif db_type == 'mysql':
        return (
            f"mysql+pymysql://{connection_data['username']}:{connection_data['password']}@"
            f"{connection_data['host']}:{connection_data['port']}/{connection_data['database_name']}"
        )
    elif db_type == 'sqlite':
        return f"sqlite:///{connection_data['database_name']}"
    else:
        raise ValueError(f"Unsupported database type: {db_type}")