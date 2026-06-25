from pydantic import BaseModel,Field
from typing import Optional

class BaseBlog(BaseModel):
    topic: Optional[str]=None,Field(max_length=100)
    text: Optional[str]=None,Field(min_length=20)

class CreateBlog(BaseBlog):
   pass


class PublicBlog(BaseBlog):
    id: int

    class Config:
        from_attributes = True
class UpdateBlog(BaseModel):
    topic: Optional[str] = None
    text: Optional[str] = None