import asyncio
import asyncpg
from typing import List, Dict, Any, Optional
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from app.models.connection import DatabaseConnection
from app.schemas.connection import TableInfo, DatabaseConnectionCreate

class DatabaseService:
    def __init__(self):
        self.supported_drivers = {
            'postgresql': self._create_postgresql_engine,
            'mysql': self._create_mysql_engine,
            'sqlite': self._create_sqlite_engine
        }
    
    def _create_postgresql_engine(self, connection: DatabaseConnection) -> Engine:
        connection_string = (
            f"postgresql://{connection.username}:{connection.password}@"
            f"{connection.host}:{connection.port}/{connection.database_name}"
        )
        if connection.ssl_enabled:
            connection_string += "?sslmode=require"
        
        return create_engine(connection_string)
    
    def _create_mysql_engine(self, connection: DatabaseConnection) -> Engine:
        connection_string = (
            f"mysql+pymysql://{connection.username}:{connection.password}@"
            f"{connection.host}:{connection.port}/{connection.database_name}"
        )
        return create_engine(connection_string)
    
    def _create_sqlite_engine(self, connection: DatabaseConnection) -> Engine:
        return create_engine(f"sqlite:///{connection.database_name}")
    
    async def test_connection(self, connection) -> str:
        """Test database connection and return status"""
        try:
            if hasattr(connection, 'dict'):
                # Pydantic model
                db_type = connection.db_type
                host = connection.host
                port = connection.port
                username = connection.username
                password = connection.password
                database_name = connection.database_name
                ssl_enabled = connection.ssl_enabled
            else:
                # SQLAlchemy model
                db_type = connection.db_type
                host = connection.host
                port = connection.port
                username = connection.username
                password = connection.password
                database_name = connection.database_name
                ssl_enabled = connection.ssl_enabled
            
            if db_type == 'postgresql':
                # Test PostgreSQL connection using asyncpg
                conn = await asyncpg.connect(
                    host=host,
                    port=port,
                    user=username,
                    password=password,
                    database=database_name,
                    ssl='require' if ssl_enabled else 'prefer'
                )
                await conn.execute('SELECT 1')
                await conn.close()
                return "connected"
            
            else:
                # For other databases, use synchronous connection
                engine = self.supported_drivers[db_type](connection)
                with engine.connect() as conn:
                    conn.execute(text("SELECT 1"))
                return "connected"
                
        except Exception as e:
            print(f"Connection test failed: {str(e)}")
            return "failed"
    
    async def get_tables(self, connection: DatabaseConnection) -> List[TableInfo]:
        """Get list of tables and their schemas from database"""
        try:
            if connection.db_type == 'postgresql':
                return await self._get_postgresql_tables(connection)
            else:
                # Implement for other databases
                return []
        except Exception as e:
            print(f"Failed to get tables: {str(e)}")
            return []
    
    async def _get_postgresql_tables(self, connection: DatabaseConnection) -> List[TableInfo]:
        """Get PostgreSQL tables and columns"""
        conn = await asyncpg.connect(
            host=connection.host,
            port=connection.port,
            user=connection.username,
            password=connection.password,
            database=connection.database_name,
            ssl='require' if connection.ssl_enabled else 'prefer'
        )
        
        # Get tables
        tables_query = """
        SELECT schemaname, tablename
        FROM pg_tables
        WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
        ORDER BY schemaname, tablename
        """
        
        tables = await conn.fetch(tables_query)
        table_infos = []
        
        for table in tables:
            schema_name = table['schemaname']
            table_name = table['tablename']
            
            # Get columns for this table
            columns_query = """
            SELECT 
                column_name,
                data_type,
                is_nullable,
                column_default,
                character_maximum_length,
                numeric_precision,
                numeric_scale
            FROM information_schema.columns
            WHERE table_schema = $1 AND table_name = $2
            ORDER BY ordinal_position
            """
            
            columns = await conn.fetch(columns_query, schema_name, table_name)
            
            columns_info = {}
            for col in columns:
                columns_info[col['column_name']] = {
                    'type': col['data_type'],
                    'nullable': col['is_nullable'] == 'YES',
                    'default': col['column_default'],
                    'max_length': col['character_maximum_length'],
                    'precision': col['numeric_precision'],
                    'scale': col['numeric_scale']
                }
            
            table_infos.append(TableInfo(
                schema_name=schema_name,
                table_name=table_name,
                columns=columns_info
            ))
        
        await conn.close()
        return table_infos
    
    async def execute_sql(self, connection: DatabaseConnection, sql: str) -> Dict[str, Any]:
        """Execute SQL query and return results"""
        try:
            if connection.db_type == 'postgresql':
                return await self._execute_postgresql_sql(connection, sql)
            else:
                # Implement for other databases
                return {"error": "Database type not supported"}
        except Exception as e:
            return {"error": str(e)}
    
    async def _execute_postgresql_sql(self, connection: DatabaseConnection, sql: str) -> Dict[str, Any]:
        """Execute PostgreSQL query"""
        import time
        start_time = time.time()
        
        conn = await asyncpg.connect(
            host=connection.host,
            port=connection.port,
            user=connection.username,
            password=connection.password,
            database=connection.database_name,
            ssl='require' if connection.ssl_enabled else 'prefer'
        )
        
        try:
            rows = await conn.fetch(sql)
            execution_time = (time.time() - start_time) * 1000  # Convert to milliseconds
            
            # Convert rows to list of dictionaries
            data = [dict(row) for row in rows]
            
            await conn.close()
            
            return {
                "data": data,
                "execution_time_ms": execution_time,
                "row_count": len(data),
                "success": True
            }
            
        except Exception as e:
            await conn.close()
            return {
                "error": str(e),
                "success": False
            }
