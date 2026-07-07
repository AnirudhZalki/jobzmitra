from pydantic import BaseModel
from datetime import datetime
from app.schemas.user import UserOut

from typing import Optional

class MessageBase(BaseModel):
    content: str
    attachment_url: Optional[str] = None

class MessageCreate(MessageBase):
    pass

class MessageOut(MessageBase):
    id: int
    sender_id: int
    receiver_id: int
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class ConversationSummary(BaseModel):
    user: UserOut
    last_message: str
    unread_count: int
    updated_at: datetime
