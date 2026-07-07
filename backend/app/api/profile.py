from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.models.post import Post
from app.models.job import Job, Application
from app.schemas.user import UserOut, UserUpdate
from app.schemas.post import PostOut
from app.api.feed import get_current_user
import os
import re
import uuid
import shutil
import PyPDF2

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_RESUME_EXTENSIONS = {"pdf", "doc", "docx"}

TECH_SKILLS = [
    "python", "react", "next.js", "fastapi", "node.js", "typescript", 
    "javascript", "html", "css", "sql", "postgresql", "docker", "aws", 
    "git", "java", "c++", "c#", "machine learning", "data science", 
    "angular", "vue", "django", "flask", "kubernetes"
]

def safe_resume_extension(filename: str) -> str:
    if "." in filename:
        ext = filename.rsplit(".", 1)[-1].lower()
        if re.match(r'^[a-z0-9]{1,10}$', ext) and ext in ALLOWED_RESUME_EXTENSIONS:
            return ext
    return "pdf"

@router.get("/me", response_model=UserOut)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserOut)
def update_profile(profile_update: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if profile_update.full_name is not None:
        current_user.full_name = profile_update.full_name
    if profile_update.headline is not None:
        current_user.headline = profile_update.headline
    if profile_update.bio is not None:
        current_user.bio = profile_update.bio
    if profile_update.avatar_url is not None:
        current_user.avatar_url = profile_update.avatar_url
    if profile_update.location is not None:
        current_user.location = profile_update.location
    if profile_update.portfolio_url is not None:
        current_user.portfolio_url = profile_update.portfolio_url
        
    db.commit()
    db.refresh(current_user)
    return current_user

from datetime import datetime, timedelta

@router.post("/upgrade", response_model=UserOut)
def upgrade_to_premium(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    current_user.is_premium = True
    current_user.premium_expires_at = datetime.utcnow() + timedelta(days=30)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/posts")
def get_my_posts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    posts = db.query(Post).filter(Post.author_id == current_user.id).order_by(Post.created_at.desc()).all()
    return [
        {
            "id": p.id,
            "content": p.content,
            "created_at": p.created_at,
            "like_count": len(p.likes),
            "comment_count": len(p.comments),
            "media_attachments": p.media_attachments,
            "author": {
                "id": current_user.id,
                "full_name": current_user.full_name,
                "avatar_url": current_user.avatar_url
            }
        }
        for p in posts
    ]

@router.get("/jobs")
def get_my_applied_jobs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    applications = db.query(Application).filter(Application.seeker_id == current_user.id).order_by(Application.created_at.desc()).all()
    return [
        {
            "id": app.id,
            "status": app.status,
            "applied_at": app.created_at,
            "job": {
                "id": app.job.id,
                "title": app.job.title,
                "company_name": app.job.company_name,
                "location": app.job.location
            }
        }
        for app in applications
    ]

@router.get("/users", response_model=list[UserOut])
def get_all_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Exclude current user from the networking directory
    users = db.query(User).filter(User.id != current_user.id).all()
    return users

@router.get("/{user_id}", response_model=UserOut)
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        file_extension = safe_resume_extension(file.filename or "")
        filename = f"{uuid.uuid4()}.{file_extension}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Parse PDF
        extracted_skills = []
        if file_extension.lower() == "pdf":
            try:
                with open(filepath, "rb") as pdf_file:
                    reader = PyPDF2.PdfReader(pdf_file)
                    text = ""
                    for page in reader.pages:
                        text += page.extract_text() + " "
                    
                    text_lower = text.lower()
                    for skill in TECH_SKILLS:
                        if skill in text_lower:
                            extracted_skills.append(skill.title())
            except Exception as e:
                print(f"Error parsing PDF: {e}")
                
        # Update user profile
        current_skills = []
        if current_user.skills:
            current_skills = [s.strip() for s in current_user.skills.split(",")]
            
        # Merge unique skills
        all_skills = list(set(current_skills + extracted_skills))
        
        current_user.skills = ", ".join(all_skills)
        current_user.resume_url = f"/uploads/{filename}"
        
        db.commit()
        db.refresh(current_user)
        
        return {
            "message": "Resume uploaded successfully",
            "extracted_skills": extracted_skills,
            "resume_url": current_user.resume_url,
            "all_skills": current_user.skills
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
