from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timedelta, timezone
from typing import Optional, Annotated
from fastapi import HTTPException, status, Depends
from .config import settings
from sqlalchemy.ext.asyncio import AsyncSession
from .db import get_session
from crud import CrudUser

SECRET_KEY = settings().SECRET_KEY
ALGORITHM = settings().ALGORITHM
ACCESS_TOKEN_EXPIRY = 10
Oauth2_schema = OAuth2PasswordBearer(tokenUrl="/api/v1/user/token")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRY)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(
    token: Annotated[str, Depends(Oauth2_schema)],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    print("TOKEN =", repr(token))
    credential_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials",
        headers={"WWW-Authentication": "Bearer"},
    )
    try:
        payload = jwt.decode(token,SECRET_KEY,algorithms=[ALGORITHM])
        username:str=payload.get("sub")
        if not username:
            raise credential_exception
    except JWTError:
        raise credential_exception

    user = await CrudUser.get_user_by_name(username=username,session=session)
    if not user:
        raise credential_exception
    return user


# def check_roles(roles:list[str]):
#     def check_role_dependency(current_user:Annotated[dict,Depends(get_current_user)]):
#         if current_user.role not in roles:
#             raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="User not authorized for this",headers={"WWW-Authentication":"Bearer"})
#         return current_user
#     return check_role_dependency