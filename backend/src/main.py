from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from contextlib import asynccontextmanager
from db import get_db, test_connection, create_user, get_user_by_email
from settings import settings
from loguru import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    logger.info("🚀 Starting application...")
    try:
        result = await test_connection()
        logger.info(f"✅ Database connected successfully! Test query result: {result}")
    except Exception as e:
        logger.info(f"❌ Database connection failed: {e}")
        raise

    yield

    # Shutdown
    logger.info("👋 Shutting down application...")


app = FastAPI(
    title=settings.APP_NAME,
    lifespan=lifespan,
)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "database": "connected"
    }


@app.get("/health")
async def health_check():
    """Database health check"""
    try:
        result = await test_connection()
        return {"status": "healthy", "database": "connected", "test_query": result}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database unhealthy: {str(e)}")


# ============= EXAMPLE ENDPOINTS =============

@app.post("/users")
async def create_user_endpoint(
        username: str,
        email: str,
        db: AsyncSession = Depends(get_db)
):
    """Create a new user"""
    try:
        # Check if user exists
        existing_user = await get_user_by_email(db, email)
        if existing_user:
            raise HTTPException(status_code=400, detail="User with this email already exists")

        user_id = await create_user(db, username, email)
        return {"id": user_id, "username": username, "email": email}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/users/{email}")
async def get_user_endpoint(
        email: str,
        db: AsyncSession = Depends(get_db)
):
    """Get user by email"""
    user = await get_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "created_at": user.created_at
    }


# ============= ADD YOUR HACKATHON ENDPOINTS HERE =============


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
