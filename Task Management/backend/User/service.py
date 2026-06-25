from User import crud
from Core.security import verify_password
from Core.auth import create_access_token
from fastapi import HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from User.schema import CreateUser, UpdateUser


async def get_user_by_name(user_name: str, db):
    user = await crud.get_user_by_name(
        user_name,
        db
    )

    if not user:
        return None
    user["id"] = str(
        user.pop("_id")
    )
    return user


async def get_user_by_id(user_id, db):
    user = await crud.get_user_by_id(
        user_id,
        db
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    user["id"] = str(
        user.pop("_id")
    )
    return user


async def create_user(
    user_data: CreateUser,
    db
):
    existing_user = await crud.get_user_by_name(
        user_data.name,
        db
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already exists"
        )

    return await crud.create_user(
        user_data,
        db
    )


async def update_user(
    user_data: UpdateUser,
    db,
    current_user
):
    await get_user_by_id(
        current_user["id"],
        db
    )
    return await crud.update_user(
        current_user["id"],
        user_data,
        db
    )


async def delete_user(
    db,
    current_user
):
    await get_user_by_id(
        current_user["id"],
        db
    )
    
    return await crud.delete_user(
        current_user["id"],
        db
    )

async def login_user(
    form_data: OAuth2PasswordRequestForm,
    db
):
    user = await crud.get_user_by_name(
        form_data.username,
        db
    )
    if (
        not user
        or not verify_password(
            form_data.password,
            user["password"]
        )
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={
                "WWW-Authenticate": "Bearer"
            }
        )
    
    access_token = create_access_token(
        data={
            "sub":str(user["_id"])
        }
    )
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }