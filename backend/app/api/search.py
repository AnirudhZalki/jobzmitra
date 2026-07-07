from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.models.post import Post
from app.models.job import Job
from app.api.feed import get_current_user
from typing import List

router = APIRouter()

@router.get("/")
def global_search(q: str = Query(..., min_length=1), type: str = "all", db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    search_term = f"%{q}%"
    
    results = {
        "users": [],
        "jobs": [],
        "posts": []
    }
    
    # 1. Search Users
    if type in ["all", "people"]:
        users = db.query(User).filter(User.full_name.ilike(search_term)).limit(10).all()
        results["users"] = [{"id": u.id, "full_name": u.full_name, "role": u.role, "headline": u.headline} for u in users]
        
    # 2. Search Jobs
    if type in ["all", "jobs"]:
        jobs = db.query(Job).filter((Job.title.ilike(search_term)) | (Job.company_name.ilike(search_term))).limit(10).all()
        results["jobs"] = [{"id": j.id, "title": j.title, "company_name": j.company_name, "location": j.location, "salary_range": j.salary_range} for j in jobs]
        
    # 3. Search Posts
    if type in ["all", "posts"]:
        posts = db.query(Post).filter(Post.content.ilike(search_term)).limit(10).all()
        
        posts_out = []
        for p in posts:
            posts_out.append({
                "id": p.id,
                "content": p.content,
                "author": {"id": p.author.id, "full_name": p.author.full_name},
                "created_at": p.created_at,
                "media_attachments": p.media_attachments
            })
        results["posts"] = posts_out
        
    return results
