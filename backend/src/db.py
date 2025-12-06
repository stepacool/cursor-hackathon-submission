import ssl

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy import select, insert, update, delete, text
from contextlib import asynccontextmanager
from typing import AsyncGenerator
from settings import settings

ctx = ssl.SSLContext(ssl.PROTOCOL_SSLv23)
ctx.check_hostname = False
engine = create_async_engine(
    str(settings.ASYNC_DB_DSN),
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    connect_args={
        "ssl": ctx,
    }
)


# Create session factory
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

Base = declarative_base()


# Dependency for FastAPI
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()


@asynccontextmanager
async def get_db_context():
    """Context manager for database session"""
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()


# ============= REPOSITORY METHODS =============

async def test_connection():
    """Test database connection"""
    async with get_db_context() as db:
        result = await db.execute(text("SELECT 1"))
        return result.scalar()


async def execute_raw_query(query: str, params: dict = None):
    """Execute raw SQL query"""
    async with get_db_context() as db:
        result = await db.execute(text(query), params or {})
        await db.commit()
        return result


async def fetch_one(query: str, params: dict = None):
    """Fetch single row from raw query"""
    async with get_db_context() as db:
        result = await db.execute(text(query), params or {})
        return result.first()


async def fetch_all(query: str, params: dict = None):
    """Fetch all rows from raw query"""
    async with get_db_context() as db:
        result = await db.execute(text(query), params or {})
        return result.fetchall()


# ============= EXAMPLE REPOSITORY METHODS =============
# Customize these based on your tables

async def create_item(db: AsyncSession, table_name: str, data: dict):
    """Generic insert - replace with specific methods for your tables"""
    columns = ", ".join(data.keys())
    placeholders = ", ".join([f":{k}" for k in data.keys()])
    query = f"INSERT INTO {table_name} ({columns}) VALUES ({placeholders})"

    result = await db.execute(text(query), data)
    await db.commit()
    return result.lastrowid


async def get_item_by_id(db: AsyncSession, table_name: str, item_id: int):
    """Generic get by id - replace with specific methods"""
    query = f"SELECT * FROM {table_name} WHERE id = :id"
    result = await db.execute(text(query), {"id": item_id})
    return result.first()


async def get_all_items(db: AsyncSession, table_name: str, limit: int = 100):
    """Generic get all - replace with specific methods"""
    query = f"SELECT * FROM {table_name} LIMIT :limit"
    result = await db.execute(text(query), {"limit": limit})
    return result.fetchall()


async def update_item(db: AsyncSession, table_name: str, item_id: int, data: dict):
    """Generic update - replace with specific methods"""
    set_clause = ", ".join([f"{k} = :{k}" for k in data.keys()])
    query = f"UPDATE {table_name} SET {set_clause} WHERE id = :id"

    params = {**data, "id": item_id}
    result = await db.execute(text(query), params)
    await db.commit()
    return result.rowcount


async def delete_item(db: AsyncSession, table_name: str, item_id: int):
    """Generic delete - replace with specific methods"""
    query = f"DELETE FROM {table_name} WHERE id = :id"
    result = await db.execute(text(query), {"id": item_id})
    await db.commit()
    return result.rowcount


# ============= ADD YOUR SPECIFIC REPOSITORY METHODS HERE =============

# === CONFIGURATIONS ===
async def create_configuration(
        db: AsyncSession,
        user_id: str,
        name: str,
        system_prompt: str,
        description: str = None,
        voice_id: str = None,
        max_duration_seconds: int = 300,
        expected_fields: list = None
):
    """Create a new call configuration"""
    import json
    query = """
            INSERT INTO configurations
            (user_id, name, description, voice_id, system_prompt, max_duration_seconds, expected_fields)
            VALUES (:user_id, :name, :description, :voice_id, :system_prompt, :max_duration, :expected_fields) \
            """
    result = await db.execute(text(query), {
        "user_id": user_id,
        "name": name,
        "description": description,
        "voice_id": voice_id,
        "system_prompt": system_prompt,
        "max_duration": max_duration_seconds,
        "expected_fields": json.dumps(expected_fields or [])
    })
    await db.commit()
    return result.lastrowid


async def get_configuration(db: AsyncSession, config_id: str):
    """Get configuration by ID"""
    query = "SELECT * FROM configurations WHERE id = :id AND archived_at IS NULL"
    result = await db.execute(text(query), {"id": config_id})
    return result.first()


async def get_user_configurations(db: AsyncSession, user_id: str):
    """Get all configurations for a user"""
    query = "SELECT * FROM configurations WHERE user_id = :user_id AND archived_at IS NULL ORDER BY created_at DESC"
    result = await db.execute(text(query), {"user_id": user_id})
    return result.fetchall()


# === CONTACTS ===
async def create_contact(
        db: AsyncSession,
        configuration_id: str,
        phone: str,
        name: str = None,
        metadata: dict = None
):
    """Create a new contact"""
    import json
    query = """
            INSERT INTO contacts (configuration_id, phone, name, metadata)
            VALUES (:config_id, :phone, :name, :metadata) \
            """
    result = await db.execute(text(query), {
        "config_id": configuration_id,
        "phone": phone,
        "name": name,
        "metadata": json.dumps(metadata or {})
    })
    await db.commit()
    return result.lastrowid


async def get_contact(db: AsyncSession, contact_id: str):
    """Get contact by ID"""
    query = "SELECT * FROM contacts WHERE id = :id"
    result = await db.execute(text(query), {"id": contact_id})
    return result.first()


async def get_contacts_by_config(db: AsyncSession, configuration_id: str, limit: int = 100):
    """Get all contacts for a configuration"""
    query = "SELECT * FROM contacts WHERE configuration_id = :config_id ORDER BY created_at DESC LIMIT :limit"
    result = await db.execute(text(query), {"config_id": configuration_id, "limit": limit})
    return result.fetchall()


async def update_contact_extracted_fields(db: AsyncSession, contact_id: str, extracted_fields: dict):
    """Update extracted fields after a successful call"""
    import json
    query = """
            UPDATE contacts
            SET extracted_fields = :fields, \
                updated_at       = NOW()
            WHERE id = :id \
            """
    result = await db.execute(text(query), {
        "id": contact_id,
        "fields": json.dumps(extracted_fields)
    })
    await db.commit()
    return result.rowcount


# === CALLS ===
async def create_call(
        db: AsyncSession,
        contact_id: str,
        configuration_id: str,
        status: str = "scheduled",
        scheduled_for: str = None
):
    """Create a new call record"""
    query = """
            INSERT INTO calls (contact_id, configuration_id, status, scheduled_for)
            VALUES (:contact_id, :config_id, :status, :scheduled_for) \
            """
    result = await db.execute(text(query), {
        "contact_id": contact_id,
        "config_id": configuration_id,
        "status": status,
        "scheduled_for": scheduled_for
    })
    await db.commit()

    # Increment contact's total_calls
    await db.execute(
        text("UPDATE contacts SET total_calls = total_calls + 1 WHERE id = :id"),
        {"id": contact_id}
    )
    await db.commit()

    return result.lastrowid


async def get_call(db: AsyncSession, call_id: str):
    """Get call by ID"""
    query = "SELECT * FROM calls WHERE id = :id"
    result = await db.execute(text(query), {"id": call_id})
    return result.first()


async def update_call_status(
        db: AsyncSession,
        call_id: str,
        status: str,
        started_at: str = None,
        ended_at: str = None,
        duration_seconds: int = None,
        recording_url: str = None,
        transcript: str = None,
        extracted_data: dict = None,
        raw_result: dict = None,
        error_message: str = None
):
    """Update call with results"""
    import json

    updates = ["status = :status", "updated_at = NOW()"]
    params = {"id": call_id, "status": status}

    if started_at:
        updates.append("started_at = :started_at")
        params["started_at"] = started_at
    if ended_at:
        updates.append("ended_at = :ended_at")
        params["ended_at"] = ended_at
    if duration_seconds is not None:
        updates.append("duration_seconds = :duration")
        params["duration"] = duration_seconds
    if recording_url:
        updates.append("recording_url = :recording_url")
        params["recording_url"] = recording_url
    if transcript:
        updates.append("transcript = :transcript")
        params["transcript"] = transcript
    if extracted_data:
        updates.append("extracted_data = :extracted_data")
        params["extracted_data"] = json.dumps(extracted_data)
    if raw_result:
        updates.append("raw_result = :raw_result")
        params["raw_result"] = json.dumps(raw_result)
    if error_message:
        updates.append("error_message = :error_message")
        params["error_message"] = error_message

    query = f"UPDATE calls SET {', '.join(updates)} WHERE id = :id"
    result = await db.execute(text(query), params)
    await db.commit()

    # Update contact's last_called_at if call completed
    if status == "completed":
        await db.execute(
            text(
                "UPDATE contacts SET last_called_at = NOW() WHERE id = (SELECT contact_id FROM calls WHERE id = :call_id)"),
            {"call_id": call_id}
        )
        await db.commit()

    return result.rowcount


async def get_calls_by_contact(db: AsyncSession, contact_id: str):
    """Get all calls for a contact"""
    query = "SELECT * FROM calls WHERE contact_id = :contact_id ORDER BY created_at DESC"
    result = await db.execute(text(query), {"contact_id": contact_id})
    return result.fetchall()


async def get_scheduled_calls(db: AsyncSession, limit: int = 50):
    """Get upcoming scheduled calls"""
    query = """
            SELECT * \
            FROM calls
            WHERE status = 'scheduled' \
              AND scheduled_for <= NOW()
            ORDER BY scheduled_for ASC LIMIT :limit \
            """
    result = await db.execute(text(query), {"limit": limit})
    return result.fetchall()
