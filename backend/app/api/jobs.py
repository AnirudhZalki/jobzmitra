from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from app.db.database import get_db
from app.models.job import Job, Application
from app.models.user import User
from app.schemas.job import JobCreate, JobOut, ApplicationOut
from app.api.feed import get_current_user
from app.core.ai_matcher import calculate_match_score

router = APIRouter()

@router.get("/", response_model=List[JobOut])
def get_jobs(db: Session = Depends(get_db), skip: int = 0, limit: int = 20, current_user: User = Depends(get_current_user)):
    jobs = db.query(Job).order_by(desc(Job.created_at)).offset(skip).limit(limit).all()
    
    # Calculate AI match score for each job relative to the current user
    for job in jobs:
        job.match_score = calculate_match_score(
            job.description, 
            job.title, 
            current_user.skills, 
            current_user.bio
        )
        
    return jobs

@router.get("/recommended", response_model=List[JobOut])
def get_recommended_jobs(db: Session = Depends(get_db), limit: int = 10, current_user: User = Depends(get_current_user)):
    # Get all jobs
    jobs = db.query(Job).all()
    
    # Calculate match score for all jobs
    for job in jobs:
        job.match_score = calculate_match_score(
            job.description, 
            job.title, 
            current_user.skills, 
            current_user.bio
        )
        
    # Sort by match score descending
    recommended_jobs = sorted(jobs, key=lambda x: x.match_score, reverse=True)
    
    # Return top N jobs
    return recommended_jobs[:limit]

@router.post("/", response_model=JobOut)
def create_job(job: JobCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ["recruiter", "company"]:
        raise HTTPException(status_code=403, detail="Not authorized to post jobs")
        
    new_job = Job(**job.dict(), recruiter_id=current_user.id)
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job

@router.post("/{job_id}/apply", response_model=ApplicationOut)
def apply_job(job_id: int, custom_resume_url: str = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    existing_app = db.query(Application).filter(Application.job_id == job_id, Application.seeker_id == current_user.id).first()
    if existing_app:
        raise HTTPException(status_code=400, detail="Already applied to this job")
        
    new_app = Application(job_id=job_id, seeker_id=current_user.id, custom_resume_url=custom_resume_url)
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    
    # Award gamification points for applying
    from app.api.gamification import award_points_for_action
    award_points_for_action(current_user, "job_applied", db)
    
    return new_app
