from contextlib import asynccontextmanager
from fastapi import FastAPI
import asyncpg

# Your SQL constant
CREATE_TABLES_SQL = """
                    CREATE TABLE IF NOT EXISTS users \
                    ( \
                        id \
                        SERIAL \
                        PRIMARY \
                        KEY, \
                        name \
                        VARCHAR \
                    ( \
                        255 \
                    ) NOT NULL,
                        email VARCHAR \
                    ( \
                        255 \
                    ) UNIQUE NOT NULL
                        );

                    CREATE TABLE IF NOT EXISTS posts \
                    ( \
                        id \
                        SERIAL \
                        PRIMARY \
                        KEY, \
                        user_id \
                        INTEGER \
                        REFERENCES \
                        users \
                    ( \
                        id \
                    ),
                        title VARCHAR \
                    ( \
                        255 \
                    ) NOT NULL,
                        content TEXT
                        ); \
                    """


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables
    conn = await asyncpg.connect(
        host="localhost",
        database="your_db",
        user="your_user",
        password="your_password"
    )
    await conn.execute(CREATE_TABLES_SQL)
    await conn.close()

    yield

    # Shutdown: cleanup if needed
    pass


app = FastAPI(
    title="My API",
    lifespan=lifespan,
)


@app.get("/")
async def root():
    return {"message": "Hello World"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
