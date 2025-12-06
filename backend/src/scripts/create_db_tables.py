"""
Quick table creation script for hackathon
Run this once to set up your database schema
"""
import asyncio
from db import get_db_context, execute_raw_query


# Define your table schemas here
TABLES = {
    "configurations": """
        CREATE TABLE IF NOT EXISTS configurations (
            id VARCHAR(36) PRIMARY KEY,
            user_id VARCHAR(36) NOT NULL,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            
            voice_id VARCHAR(100),
            system_prompt TEXT NOT NULL,
            max_duration_seconds INT DEFAULT 300,
            
            expected_fields JSON,
            
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            archived_at TIMESTAMP NULL
        )
    """,

    "contacts": """
        CREATE TABLE IF NOT EXISTS contacts (
            id VARCHAR(36) PRIMARY KEY,
            configuration_id VARCHAR(36) NOT NULL,
            
            phone VARCHAR(20) NOT NULL,
            name VARCHAR(255),
            metadata JSON,
            
            extracted_fields JSON NULL,
            
            total_calls INT DEFAULT 0,
            last_called_at TIMESTAMP NULL,
            
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            
            UNIQUE KEY unique_config_phone (configuration_id, phone),
            FOREIGN KEY (configuration_id) REFERENCES configurations(id) ON DELETE CASCADE,
            INDEX idx_contacts_config (configuration_id),
            INDEX idx_contacts_phone (phone)
        )
    """,

    "calls": """
        CREATE TABLE IF NOT EXISTS calls (
            id VARCHAR(36) PRIMARY KEY,
            contact_id VARCHAR(36) NOT NULL,
            configuration_id VARCHAR(36) NOT NULL,
            
            status VARCHAR(50) NOT NULL,
            scheduled_for TIMESTAMP NULL,
            started_at TIMESTAMP NULL,
            ended_at TIMESTAMP NULL,
            
            duration_seconds INT NULL,
            recording_url TEXT NULL,
            transcript TEXT NULL,
            
            raw_result JSON NULL,
            extracted_data JSON NULL,
            
            error_message TEXT NULL,
            retry_count INT DEFAULT 0,
            
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            
            FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
            FOREIGN KEY (configuration_id) REFERENCES configurations(id) ON DELETE CASCADE,
            INDEX idx_calls_contact (contact_id),
            INDEX idx_calls_status (status),
            INDEX idx_calls_scheduled (scheduled_for, status)
        )
    """,
}


async def create_tables():
    """Create all tables defined in TABLES dict"""
    print("🚀 Creating tables...")

    for table_name, create_sql in TABLES.items():
        try:
            await execute_raw_query(create_sql)
            print(f"✅ Table '{table_name}' created successfully")
        except Exception as e:
            print(f"❌ Error creating table '{table_name}': {e}")

    print("✨ Done!")


async def drop_tables():
    """Drop all tables (use with caution!)"""
    print("⚠️  Dropping tables...")

    # Reverse order to handle foreign key constraints
    for table_name in reversed(list(TABLES.keys())):
        try:
            await execute_raw_query(f"DROP TABLE IF EXISTS {table_name}")
            print(f"🗑️  Table '{table_name}' dropped")
        except Exception as e:
            print(f"❌ Error dropping table '{table_name}': {e}")

    print("✨ Done!")


async def reset_tables():
    """Drop and recreate all tables"""
    await drop_tables()
    await create_tables()


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1:
        command = sys.argv[1]

        if command == "create":
            asyncio.run(create_tables())
        elif command == "drop":
            confirm = input("⚠️  Are you sure you want to DROP all tables? (yes/no): ")
            if confirm.lower() == "yes":
                asyncio.run(drop_tables())
            else:
                print("Cancelled.")
        elif command == "reset":
            confirm = input("⚠️  Are you sure you want to RESET all tables? (yes/no): ")
            if confirm.lower() == "yes":
                asyncio.run(reset_tables())
            else:
                print("Cancelled.")
        else:
            print(f"Unknown command: {command}")
            print("Usage: python create_tables.py [create|drop|reset]")
    else:
        # Default: just create tables
        asyncio.run(create_tables())
