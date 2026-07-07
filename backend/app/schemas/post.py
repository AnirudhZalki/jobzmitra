from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.schemas.user import UserOut

class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    pass

class CommentOut(CommentBase):
    id: int
    post_id: int
    author_id: int
    created_at: datetime
    author: UserOut
    
    class Config:
        from_attributes = True

class MediaAttachment(BaseModel):
    url: str
    type: str

class PostBase(BaseModel):
    content: Optional[str] = None
    media_attachments: Optional[List[MediaAttachment]] = []

class PostCreate(PostBase):
    pass

class PostOut(PostBase):
    id: int
    author_id: int
    created_at: datetime
    author: UserOut
    like_count: int = 0
    comment_count: int = 0
    is_liked_by_user: bool = False
    
    class Config:
        from_attributes = True
