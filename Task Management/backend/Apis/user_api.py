from fastapi import (
    APIRouter,
    Depends,
    status
)
from Core.auth import get_current_user
from fastapi.security import OAuth2PasswordRequestForm
from Core.db import get_db
from User.schema import (
    CreateUser,
    UpdateUser,
    PublicUser,
    Token
)
from typing import Annotated
from User import service


router = APIRouter()


@router.post(
    "/sign_up",
    response_model=PublicUser,
    status_code=status.HTTP_201_CREATED
)
async def create_user(
    user_data: CreateUser,
    db=Depends(get_db)
):
    return await service.create_user(
        user_data,
        db
    )

@router.get("/me")
async def get_current_user(
    current_user = Depends(get_current_user)
):
    return current_user

@router.patch(
    "/update",
    response_model=PublicUser
)
async def update_user(
    user_data: UpdateUser,
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    return await service.update_user(
        user_data,
        db,
        current_user,
    )


@router.delete(
    "/delete",
    status_code=status.HTTP_204_NO_CONTENT
)
async def delete_user(
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    await service.delete_user(
        current_user["_id"],
        db
    )

@router.post("/token",response_model=Token)
async def login_user_for_access_token(
    form_data: Annotated[
        OAuth2PasswordRequestForm,
        Depends()
    ],
    db=Depends(get_db),
):
    return await service.login_user(
        form_data,
        db
    )