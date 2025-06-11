from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging

logger = logging.getLogger(__name__)

class GenBIException(Exception):
    """Base exception for GenBI platform"""
    def __init__(self, message: str, error_code: str = None):
        self.message = message
        self.error_code = error_code
        super().__init__(self.message)

class DatabaseConnectionError(GenBIException):
    """Exception raised when database connection fails"""
    pass

class SQLGenerationError(GenBIException):
    """Exception raised when SQL generation fails"""
    pass

class QueryExecutionError(GenBIException):
    """Exception raised when query execution fails"""
    pass

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors"""
    logger.error(f"Validation error: {exc}")
    return JSONResponse(
        status_code=422,
        content={
            "error": "Validation Error",
            "details": exc.errors()
        }
    )

async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handle HTTP exceptions"""
    logger.error(f"HTTP error: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail
        }
    )

async def genbi_exception_handler(request: Request, exc: GenBIException):
    """Handle GenBI specific exceptions"""
    logger.error(f"GenBI error: {exc.message}")
    return JSONResponse(
        status_code=500,
        content={
            "error": exc.message,
            "error_code": exc.error_code
        }
    )
