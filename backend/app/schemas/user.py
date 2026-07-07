from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: str = "seeker"
    company_name: Optional[str] = None

class UserCreate(UserBase):
    password: str
    company_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(UserBase):
    id: int
    is_active: bool
    headline: Optional[str] = None
    bio: Optional[str] = None
    company_name: Optional[str] = None
    resume_url: Optional[str] = None
    skills: Optional[str] = None
    avatar_url: Optional[str] = None
    location: Optional[str] = None
    portfolio_url: Optional[str] = None
    is_premium: bool = False
    premium_expires_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    headline: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    location: Optional[str] = None
    portfolio_url: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str
