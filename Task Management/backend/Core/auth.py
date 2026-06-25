from jose import JWTError, jwt #type:ignore
from fastapi.security import OAuth2PasswordBearer
from datetime import timedelta, timezone, datetime
from typing import Optional, Annotated
from fastapi import Depends, status, HTTPException
from User import crud
from enum import Enum
from Core.db import get_db
from Core.config import get_settings

class Roles(str,Enum):
    MANAGER = "manager"
    CONTRIBUTOR = "contributor"

SECRET_KEY = get_settings().SECRET_KEY
ALGORITHM = get_settings().ALGORITHM
ACCESS_TOKEN_EXPIRY = 15

print("SECRET_KEY:", SECRET_KEY)
print("ALGORITHM:", repr(ALGORITHM))
oauth2_schema = OAuth2PasswordBearer(
    tokenUrl="/api/v1/user/token"
)


def create_access_token(
    data: dict,
    expiry_delta: Optional[timedelta] = None
):
    to_encode = data.copy()

    expiry = (
        datetime.now(timezone.utc)
        + (
            expiry_delta
            or timedelta(
                minutes=ACCESS_TOKEN_EXPIRY
            )
        )
    )

    to_encode.update(
        {
            "exp": expiry
        }
    )

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


async def get_current_user(
    token: Annotated[
        str,
        Depends(oauth2_schema)
    ],
    db=Depends(get_db)
):
    credential_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="unauthorized for this action",
        headers={
            "WWW-Authenticate": "Bearer"
        }
    )

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get(
            "sub"
        )

        if user_id is None:
            raise credential_exception

    except JWTError:
        raise credential_exception

    user = await crud.get_user_by_id(
        user_id,
        db
    )

    if not user:
        raise credential_exception
    user["_id"] = str(user["_id"])

    user.pop("password", None)
    return user

#RBAC implementation can be added here in the future, if needed

def check_roles(roles:list[Roles]):
    def dependency(
        current_user=Depends(get_current_user)
    ):
        user_role = Roles(current_user["role"])

        if user_role not in roles:
            raise HTTPException(
                status_code=403,
                detail="Not authorized"
            )

        return current_user

    return dependency
