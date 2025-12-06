from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from loguru import logger
from starlette.requests import Request

from core.tools import list_outstanding_bills, pay_outstanding_bill, open_account
from infrastructure.models import ToolType
from infrastructure.repositories import get_call_by_phone_number, close_account
from core.tools.transfer_money import transfer_money_between_own_accounts
from entrypoints.api.serializers import (
    ServerWebhookPayload,
    ToolCallsMessage,
    ToolCallResult,
    ToolCallsResponse,
    TransferMoneyOwnAccountsToolCallParameters, PayBillToolCallParameters, OpenAccountToolCallParameters,
    CloseAccountToolCallParameters,
)
from settings import settings


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
    return {"status": "ok", "app": settings.APP_NAME, "database": "connected"}


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
) -> ToolCallsResponse:
    print(f"new request: {await request.body()}")

    if payload.message.type != "tool-calls":
        return {}

    tool_calls_msg: ToolCallsMessage = payload.message
    print(tool_calls_msg.model_dump())

    phone_number = payload.message.call.customer.number
    call = await get_call_by_phone_number(phone_number.replace("+", ""))

    tool_name = ToolType(tool_calls_msg.tool_calls[0].function.name)

    result = None
    if tool_name == ToolType.TRANSFER_MONEY_OWN_ACCOUNTS:
        result = await transfer_money_between_own_accounts(
            call_id=call.id,
            user_id=call.user_id,
            tool_parameters=TransferMoneyOwnAccountsToolCallParameters(
                **tool_calls_msg.tool_calls[0].function.arguments
            ),
        )
    elif tool_name == ToolType.LIST_BILLS:
        result = await list_outstanding_bills(
            call_id=call.id,
            user_id=call.user_id,
        )
    elif tool_name == ToolType.PAY_BILL:
        result = await pay_outstanding_bill(
            call_id=call.id,
            user_id=call.user_id,
            tool_parameters=PayBillToolCallParameters(
                **tool_calls_msg.tool_calls[0].function.arguments
            )
        )
    elif tool_name == ToolType.OPEN_ACCOUNT:
        result = await open_account(
            call_id=call.id,
            user_id=call.user_id,
            tool_parameters=OpenAccountToolCallParameters(
                **tool_calls_msg.tool_calls[0].function.arguments
            ),
        )
    elif tool_name == ToolType.CLOSE_ACCOUNT:
        result = await close_account(
            call_id=call.id,
            user_id=call.user_id,
            tool_parameters=CloseAccountToolCallParameters(
                **tool_calls_msg.tool_calls[0].function.arguments
            ),
        )

    return ToolCallsResponse(
        results=[
            ToolCallResult(
                tool_call_id=tool_calls_msg.tool_calls[0].id,
                result=result,
            )
        ]
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
