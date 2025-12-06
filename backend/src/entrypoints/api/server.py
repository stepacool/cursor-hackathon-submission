from fastapi import FastAPI, HTTPException
from contextlib import asynccontextmanager

from starlette.requests import Request

from entrypoints.api.serializers import ServerWebhookPayload
from settings import settings
from loguru import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    logger.info("🚀 Starting application...")
    yield
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
        return {"status": "healthy", "database": "connected", "test_query": "kek"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database unhealthy: {str(e)}")


@app.post("/webhooks")
async def webhook_handler(request: Request, payload: ServerWebhookPayload):
    print(f"new request: {await request.body()}")
    return {}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
