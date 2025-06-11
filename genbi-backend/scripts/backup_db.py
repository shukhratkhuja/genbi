#!/usr/bin/env python3
"""
Script to backup the database
"""
import os
import subprocess
import sys
from datetime import datetime

def backup_database():
    """Create database backup"""
    
    # Database credentials from environment
    db_host = os.getenv('DB_HOST', 'localhost')
    db_port = os.getenv('DB_PORT', '5432')
    db_name = os.getenv('DB_NAME', 'genbi_db')
    db_user = os.getenv('DB_USER', 'genbi_user')
    
    # Create backup filename with timestamp
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_filename = f"genbi_backup_{timestamp}.sql"
    backup_path = f"backups/{backup_filename}"
    
    # Create backups directory if it doesn't exist
    os.makedirs('backups', exist_ok=True)
    
    # Create pg_dump command
    cmd = [
        'pg_dump',
        f'--host={db_host}',
        f'--port={db_port}',
        f'--username={db_user}',
        f'--dbname={db_name}',
        '--verbose',
        '--clean',
        '--no-owner',
        '--no-privileges',
        f'--file={backup_path}'
    ]
    
    try:
        # Run pg_dump
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"Backup created successfully: {backup_path}")
            
            # Get file size
            file_size = os.path.getsize(backup_path)
            print(f"Backup size: {file_size / (1024*1024):.2f} MB")
            
        else:
            print(f"Backup failed: {result.stderr}")
            sys.exit(1)
            
    except FileNotFoundError:
        print("Error: pg_dump not found. Please install PostgreSQL client tools.")
        sys.exit(1)

if __name__ == "__main__":
    backup_database()
