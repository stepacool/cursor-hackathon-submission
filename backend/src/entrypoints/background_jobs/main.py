import asyncio
from loguru import logger

from core.calls.initiate_call import initiate_call
from infrastructure.models import Call, CallStatus
from infrastructure.repositories import get_scheduled_calls, update_call_status


async def process_call(call: Call):
    try:
        await initiate_call(call)
        await update_call_status(call.id, CallStatus.IN_PROGRESS)
    except Exception as e:
        logger.opt(exception=e).error(f"ERROR IN BACKGROUND JOB LOOP: {e}")


async def main():
    while True:
        try:
            calls = await get_scheduled_calls()
            await asyncio.gather(*[
                process_call(call) for call in calls
            ], return_exceptions=True)

        except Exception as e:
            logger.opt(exception=e).error(f"ERROR IN BACKGROUND JOB LOOP: {e}")
        finally:
            await asyncio.sleep(15)

if __name__ == "__main__":
    asyncio.run(main())