from asyncio import current_task

from sqlalchemy import DateTime, func
from sqlalchemy.ext.asyncio import (
    AsyncAttrs,
    async_scoped_session,
    async_sessionmaker,
    AsyncSession,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase, declared_attr, Mapped, mapped_column

from settings import settings


class CustomBase(AsyncAttrs, DeclarativeBase):
    @declared_attr.directive
    def __tablename__(cls) -> str:
        return cls.__name__.lower()

    id: Mapped[int] = mapped_column(primary_key=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())


# Neon Postgres - SSL is handled via sslmode=require in the connection string
engine = create_async_engine(
    url=settings.ASYNC_DB_DSN,
    echo=settings.DEBUG,
)

session_maker = async_scoped_session(
    async_sessionmaker(
        autocommit=False,
        autoflush=False,
        class_=AsyncSession,
        expire_on_commit=False,
        bind=engine,
    ),
    scopefunc=current_task,
)
