from sqlalchemy.ext.asyncio import AsyncSession
from crud import Crudbolg
from fastapi import HTTPException, status, Depends, APIRouter
from Core.db import get_session
from Schema.blogschema import CreateBlog, PublicBlog,UpdateBlog
from typing import Annotated, List
from Model.models import Blog, User
from Core.auth import get_current_user


router = APIRouter()


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=PublicBlog)
async def create_blog(
    blog: CreateBlog,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> Blog:
    blogs = await Crudbolg.create_blog(
        blog=blog, user_id=current_user.id, session=session
    )
    return blogs


@router.get("/user_blog", response_model=List[PublicBlog])
async def get_user_blog(
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> Blog:
    user_blogs = await Crudbolg.get_user_blog(
        user_id=current_user.id, session=session
    )
    if not user_blogs:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No blog found"
        )
    return user_blogs

@router.get("/{topics}", response_model=List[PublicBlog])
async def get_blog_by_topic(
    topics: str, session: Annotated[AsyncSession, Depends(get_session)]
) -> Blog:
    topic = await Crudbolg.get_blog_by_topic(topic=topics, session=session)
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found"
        )
    return topic




@router.patch("/{blog_id}", response_model=PublicBlog)
async def update_blog(
    blog_id: int,
    blog_data: UpdateBlog,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user:Annotated[User,Depends(get_current_user)]
) -> Blog:
    blog = await Crudbolg.update_blog(blog_id=blog_id, blog=blog_data, session=session,user=current_user)
    return blog


@router.delete("/{blog_id}", status_code=204)
async def delete_blogs(
    blog_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> None:
    await Crudbolg.delete_blog(
        blog_id=blog_id, user_id=current_user.id, session=session
    )
    return {"message": "Deleted Succesfully"}
