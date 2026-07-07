from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from app.db.database import get_db
from app.models.job import Job, Application
from app.models.user import User
from app.schemas.job import JobOut, ApplicationWithSeekerOut
from app.api.feed import get_current_user
from app.core.ai_matcher import calculate_match_score
from pydantic import BaseModel

router = APIRouter()

class StatusUpdate(BaseModel):
    status: str

def get_current_recruiter(current_user: User = Depends(get_current_user)):
    if current_user.role not in ["recruiter", "company"]:
        raise HTTPException(status_code=403, detail="Not authorized. Must be a recruiter.")
    return current_user

@router.get("/jobs", response_model=List[JobOut])
def get_recruiter_jobs(db: Session = Depends(get_db), current_user: User = Depends(get_current_recruiter)):
    return db.query(Job).filter(Job.recruiter_id == current_user.id).order_by(desc(Job.created_at)).all()

@router.get("/jobs/{job_id}/applicants", response_model=List[ApplicationWithSeekerOut])
def get_job_applicants(job_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_recruiter)):
    # Verify the job belongs to the recruiter
    job = db.query(Job).filter(Job.id == job_id, Job.recruiter_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or not owned by you")
        
    applications = db.query(Application).filter(Application.job_id == job_id).order_by(desc(Application.created_at)).all()
    
    # Calculate AI Match score for each applicant
    for app in applications:
        app.match_score = calculate_match_score(
            job.description,
            job.title,
            app.seeker.skills,
            app.seeker.bio
        )
        
    return applications

@router.put("/applications/{app_id}/status", response_model=ApplicationWithSeekerOut)
def update_application_status(app_id: int, status_update: StatusUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_recruiter)):
    application = db.query(Application).filter(Application.id == app_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
        
    # Verify job ownership
    job = db.query(Job).filter(Job.id == application.job_id, Job.recruiter_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=403, detail="Not authorized to update this application")
        
    application.status = status_update.status
    db.commit()
    db.refresh(application)
    return application
