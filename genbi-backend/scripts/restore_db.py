#!/usr/bin/env python3
"""
Script to restore database from backup
"""
import os
import subprocess
import sys

def restore_database(backup_file):
    """Restore database from backup file"""
    
    if not os.path.exists(backup_file):
        print(f"Error: Backup file {backup_file} not found.")
        sys.exit(1)
    
    # Database credentials from environment
    db_host = os.getenv('DB_HOST', 'localhost')
    db_port = os.getenv('DB_PORT', '5432')
    db_name = os.getenv('DB_NAME', 'genbi_db')
    db_user = os.getenv('DB_USER', 'genbi_user')
    
    # Create psql command
    cmd = [
        'psql',
        f'--host={db_host}',
        f'--port={db_port}',
        f'--username={db_user}',
        f'--dbname={db_name}',
        '--file', backup_file
    ]
    
    try:
        # Run psql
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"Database restored successfully from: {backup_file}")
        else:
            print(f"Restore failed: {result.stderr}")
            sys.exit(1)
            
    except FileNotFoundError:
        print("Error: psql not found. Please install PostgreSQL client tools.")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python restore_db.py <backup_file>")
        sys.exit(1)
    
    backup_file = sys.argv[1]
    restore_database(backup_file)
