import ssl
from asyncio import current_task

from sqlalchemy import DateTime, func, Column
from sqlalchemy.ext.asyncio import AsyncAttrs, async_scoped_session, async_sessionmaker, AsyncSession, \
    create_async_engine
from sqlalchemy.orm import DeclarativeBase, declared_attr, Mapped, mapped_column, declarative_base

from settings import settings


class CustomBase(AsyncAttrs, DeclarativeBase):
    @declared_attr
    def __tablename__(cls):
        return cls.__name__.lower()

    id: Mapped[int] = mapped_column(primary_key=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())


Base = declarative_base(cls=CustomBase)

ctx = ssl.SSLContext(ssl.PROTOCOL_SSLv23)
ctx.check_hostname = False
engine = create_async_engine(
    url=settings.ASYNC_DB_DSN,
    connect_args={
        "ssl": ctx,
    }
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
