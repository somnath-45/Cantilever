from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from Model.models import User
from fastapi import HTTPException, status
from Schema.userschema import UserCreate,UpdateUser
from Core.security import get_password_hash


async def create_user(user: UserCreate, session: AsyncSession,) -> User:
    statement = select(User).where(User.username == user.username)
    result = await session.execute(statement)
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Username already exists"
        )
    db_user = User(
        username=user.username,
        password=get_password_hash(user.password),
        email=user.email,
    )
    session.add(db_user)
    try:
        await session.commit()
    except Exception:
        await session.rollback()
        raise
    await session.refresh(db_user)
    return db_user


async def get_user_by_id(user_id:int,session:AsyncSession)->User:
    statement = select(User).where(User.id == user_id)
    user = await session.execute(statement)
    return user.scalar_one_or_none()

async def get_user_by_name(username:str,session:AsyncSession)->User:
    statement = select(User).where(User.username==username)
    user = await session.execute(statement)
    return user.scalar_one_or_none()

async def update_user(user:User,user_data:UpdateUser,session:AsyncSession)->User:
    if user_data.username is not None:
        user.username = user_data.username
    if user_data.email is not None:
        user.email = user_data.email
    try:
        await session.commit()
        await session.refresh(user)
    except Exception as e:
        await session.rollback()
        raise e
    return user

async def delete_user(user:User,session:AsyncSession):
    await session.delete(user)
    try:
        await session.commit()
        await session.refresh(user)
    except Exception as e:
        await session.rollback()