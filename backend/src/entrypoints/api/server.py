from fastapi import FastAPI, HTTPException
from contextlib import asynccontextmanager

from starlette.requests import Request

from entrypoints.api.serializers import ServerWebhookPayload, ToolCallsMessage, ToolCallResult
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
async def webhook_handler(
        request: Request,
        payload: ServerWebhookPayload,
):
    print(f"new request: {await request.body()}")

    if payload.message.type == "tool-calls":
        # Cast to the specific message type
        tool_calls_msg: ToolCallsMessage = payload.message
        print(tool_calls_msg.model_dump())

        # Get the first tool call ID from the message
        tool_call_id = tool_calls_msg.tool_call_list[0].id if tool_calls_msg.tool_call_list else "unknown"

        # Return properly formatted response for tool-calls
        return {
            "results": [
                {
                    "toolCallId": tool_call_id,
                    "result": "FAILED_TO_TRANSFER_MONEY. ACCOUNT 'SECONDARY' doesn't exist"
                }
            ]
        }

    return {}


@app.post("/webhooks_v2")
async def webhook_handler_v2(
        request: Request,
        payload: ServerWebhookPayload,
):
    print(f"new request: {await request.body()}")

    if payload.message.type == "tool-calls":
        tool_calls_msg: ToolCallsMessage = payload.message
        print(tool_calls_msg.model_dump())

        # Build response using Pydantic models
        results = []
        for tool_call in tool_calls_msg.tool_call_list or []:
            results.append(
                ToolCallResult(
                    tool_call_id=tool_call.id,
                    result="FAILED_TO_TRANSFER_MONEY. ACCOUNT 'SECONDARY' doesn't exist"
                )
            )

        # Return as dict (FastAPI will serialize)
        return {"results": [r.model_dump(by_alias=True) for r in results]}

    return {}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
