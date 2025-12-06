import asyncio

import httpx

from core.calls.build_payload import build_call_payload
from infrastructure.models import Call
from loguru import logger

from infrastructure.repositories import get_call_by_id
from settings import settings


async def initiate_call(scheduled_call: Call) -> None:
    """
    Initiate a GROQ call for a scheduled call entry.

    Args:
        scheduled_call: The ScheduledCall model instance to initiate
    """
    logger.info(
        f"Initiating call for scheduled_call {scheduled_call.id}",
        scheduled_call_id=scheduled_call.id,
        phone_number=scheduled_call.phone_number,
    )

    if not settings.GROQ_PRIVATE_API_KEY:
        error_msg = "GROQ_PRIVATE_API_KEY not configured"
        logger.error(error_msg)
        return

    if not settings.GROQ_PHONE_NUMBER_ID:
        error_msg = "GROQ_PHONE_NUMBER_ID not configured"
        logger.error(error_msg)
        return

    try:
        assistant_config = await build_call_payload(scheduled_call)
    except Exception as e:
        error_msg = f"Failed to build assistant config: {str(e)}"
        logger.opt(exception=e).error(error_msg, scheduled_call_id=scheduled_call.id)
        return

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            if not scheduled_call.phone_number.startswith("+"):
                scheduled_call.phone_number = f"+{scheduled_call.phone_number}"
            response = await client.post(
                "https://api.vapi.ai/call",
                headers={
                    "Authorization": f"Bearer {settings.GROQ_PRIVATE_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "assistant": assistant_config,
                    "phoneNumberId": settings.GROQ_PHONE_NUMBER_ID,
                    "customer": {
                        "number": scheduled_call.phone_number,
                        "name": scheduled_call.customer_name,
                    },
                },
            )
            response.raise_for_status()

            data = response.json()
            groq_call_id = data.get("id")

            logger.info(
                f"Successfully initiated call for scheduled_call {scheduled_call.id}",
                scheduled_call_id=scheduled_call.id,
                groq_call_id=groq_call_id,
                response_data=data,
            )

    except httpx.HTTPStatusError as e:
        error_msg = f"GROQ API error: {e.response.status_code} - {e.response.text}"
        logger.opt(exception=e).error(
            f"Failed to initiate call for scheduled_call {scheduled_call.id}",
            scheduled_call_id=scheduled_call.id,
            status_code=e.response.status_code,
            response_text=e.response.text,
        )

    except Exception as e:
        error_msg = f"Unexpected error: {str(e)}"
        logger.opt(exception=e).error(
            f"Failed to initiate call for scheduled_call {scheduled_call.id}",
            scheduled_call_id=scheduled_call.id,
        )


async def main():
    call = await get_call_by_id(1)
    await initiate_call(call)


if __name__ == "__main__":
    asyncio.run(main())