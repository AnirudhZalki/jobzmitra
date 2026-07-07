from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.user import UserOut

class JobBase(BaseModel):
    title: str
    company_name: str
    location: str
    salary_range: Optional[str] = None
    job_type: str
    description: str

class JobCreate(JobBase):
    pass

class JobOut(JobBase):
    id: int
    recruiter_id: int
    created_at: datetime
    recruiter: UserOut
    match_score: Optional[int] = None
    
    class Config:
        from_attributes = True

class ApplicationOut(BaseModel):
    id: int
    job_id: int
    seeker_id: int
    custom_resume_url: Optional[str] = None
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class ApplicationWithSeekerOut(ApplicationOut):
    seeker: UserOut
    match_score: Optional[int] = None

    class Config:
        from_attributes = True
