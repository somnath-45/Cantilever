from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker,create_async_engine
from typing import AsyncGenerator
from .config import settings


engine = create_async_engine(settings().DB_URL, echo=True)
SessionLocal = async_sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
