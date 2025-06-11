import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_register_user(test_client: AsyncClient):
    response = await test_client.post(
        "/api/auth/register",
        json={
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "newpass123"
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "newuser"
    assert data["email"] == "newuser@example.com"
    assert "id" in data

@pytest.mark.asyncio
async def test_login_user(test_client: AsyncClient, test_user):
    response = await test_client.post(
        "/api/auth/login",
        data={
            "username": "testuser",
            "password": "testpass"
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

@pytest.mark.asyncio
async def test_get_current_user(test_client: AsyncClient, auth_headers):
    response = await test_client.get(
        "/api/auth/me",
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"