from Model.models import Blog,User
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from fastapi import HTTPException, status
from Schema.blogschema import CreateBlog,UpdateBlog


async def create_blog(
    blog: CreateBlog, user_id: int, session: AsyncSession
) -> Blog:
    db_blog = Blog(topic=blog.topic, text=blog.text, user_id=user_id)
    session.add(db_blog)
    try:
        await session.commit()
    except Exception:
        await session.rollback()
        raise
    await session.refresh(db_blog)
    return db_blog


async def get_blog_by_topic(topic: str, session: AsyncSession) -> List[Blog]:
    statement = select(Blog).where(Blog.topic == topic)
    result = await session.execute(statement)
    blogs = result.scalars().all()
    return blogs


async def get_user_blog(user_id: int, session: AsyncSession) -> List[Blog]:
    statement = select(Blog).where(Blog.user_id == user_id)
    result = await session.execute(statement)
    blogs = result.scalars().all()
    return blogs


async def delete_blog(user_id: int, blog_id: int, session: AsyncSession) -> None:
    statement = select(Blog).where(Blog.id == blog_id, Blog.user_id == user_id)
    result = await session.execute(statement)
    result = result.scalar_one_or_none()
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Blog not found"
        )
    await session.delete(result)
    await session.commit()
    return None


async def update_blog(
    blog_id: int, blog: UpdateBlog, session: AsyncSession,user:User
) -> Blog:

    statement = select(Blog).where(Blog.user_id == user.id, Blog.id==blog_id)
    result = await session.execute(statement)
    db_blog = result.scalar_one_or_none()

    if not db_blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Blog not found"
        )

    updates = blog.model_dump(exclude_unset=True)
    for field,value in updates.items():
        setattr(db_blog,field,value)

    await session.commit()
    await session.refresh(db_blog)

    return db_blog
