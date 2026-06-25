from pydantic import BaseModel, Field, ConfigDict
from typing import Optional


class CreateUser(BaseModel):
    name: str
    email: str
    password: str = Field(min_length=6,max_length=72)
    role:str=Field(default="contributor")


class PublicUser(BaseModel):
    id: str
    name: str
    email: str

    model_config = ConfigDict(
        populate_by_name=True
    )


class UpdateUser(BaseModel):
    name: Optional[str]
    email: Optional[str]

    
class Token(BaseModel):
    access_token: str
    token_type: str