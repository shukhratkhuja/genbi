#!/usr/bin/env python3
"""
Script to seed database with sample data
"""
import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.user import User
from app.models.connection import DatabaseConnection
from app.core.security import get_password_hash

async def seed_database():
    """Seed database with sample data"""
    
    engine = create_async_engine(settings.DATABASE_URL)
    AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with AsyncSessionLocal() as session:
        
        # Create sample users
        users_data = [
            {
                "username": "demo_user",
                "email": "demo@genbi.com",
                "password": "demo123"
            },
            {
                "username": "analyst",
                "email": "analyst@genbi.com", 
                "password": "analyst123"
            }
        ]
        
        for user_data in users_data:
            # Check if user already exists
            from sqlalchemy import select
            result = await session.execute(
                select(User).where(User.username == user_data["username"])
            )
            existing_user = result.scalar_one_or_none()
            
            if not existing_user:
                user = User(
                    username=user_data["username"],
                    email=user_data["email"],
                    hashed_password=get_password_hash(user_data["password"])
                )
                session.add(user)
                print(f"Created user: {user_data['username']}")
        
        await session.commit()
        print("Sample data seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_database())
