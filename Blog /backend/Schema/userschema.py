from pydantic import BaseModel, Field,ConfigDict
from typing import Optional


class BaseUser(BaseModel):
    username: str = Field(min_length=3)
    email: Optional[str] = None

class UserCreate(BaseModel):
    username: str = Field(min_length=3)
    email: Optional[str] = None
    password: str = Field(min_length=6)


class UserPublic(BaseModel):
    id: int
    username:str
    email:str

    model_config=ConfigDict(
        from_attributes=True
    )

class UpdateUser(BaseModel):
    username:Optional[str]=None
    email:Optional[str]=None