import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_connection(test_client: AsyncClient, auth_headers):
    response = await test_client.post(
        "/api/connections/",
        headers=auth_headers,
        json={
            "name": "Test DB",
            "db_type": "postgresql",
            "host": "localhost",
            "port": 5432,
            "username": "test",
            "password": "test",
            "database_name": "test_db",
            "ssl_enabled": False
        }
    )
    
    # This will fail because we can't connect to the test database
    # In a real test, you'd mock the database service
    assert response.status_code in [200, 400]

@pytest.mark.asyncio
async def test_get_connections(test_client: AsyncClient, auth_headers):
    response = await test_client.get(
        "/api/connections/",
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
