from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc, select, and_, insert, delete
from typing import List
from app.db.database import get_db
from app.models.reel import Reel, ReelComment, reel_likes
from app.models.user import User
from app.api.feed import get_current_user
from pydantic import BaseModel
from datetime import datetime
from app.schemas.user import UserOut

router = APIRouter()

class ReelBase(BaseModel):
    video_url: str
    caption: str

class ReelOut(ReelBase):
    id: int
    user_id: int
    likes_count: int = 0
    comments_count: int = 0
    created_at: datetime
    user: UserOut
    
    class Config:
        from_attributes = True

class CommentCreate(BaseModel):
    content: str

class CommentOut(BaseModel):
    id: int
    content: str
    created_at: datetime
    user: UserOut

    class Config:
        from_attributes = True

@router.get("", response_model=List[ReelOut])
def get_reels(db: Session = Depends(get_db)):
    return db.query(Reel).order_by(desc(Reel.created_at)).all()

@router.get("/{reel_id}", response_model=ReelOut)
def get_reel(reel_id: int, db: Session = Depends(get_db)):
    reel = db.query(Reel).filter(Reel.id == reel_id).first()
    if not reel:
        raise HTTPException(status_code=404, detail="Reel not found")
    return reel

@router.post("", response_model=ReelOut)
def create_reel(reel: ReelBase, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_reel = Reel(
        user_id=current_user.id,
        video_url=reel.video_url,
        caption=reel.caption
    )
    db.add(new_reel)
    db.commit()
    db.refresh(new_reel)
    return new_reel

@router.post("/{reel_id}/like")
def like_reel(reel_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    reel = db.query(Reel).filter(Reel.id == reel_id).first()
    if not reel:
        raise HTTPException(status_code=404, detail="Reel not found")
    
    # Check if user already liked this reel
    existing = db.execute(
        reel_likes.select().where(
            and_(
                reel_likes.c.user_id == current_user.id,
                reel_likes.c.reel_id == reel_id
            )
        )
    ).first()
    
    if existing:
        # Already liked, unlike
        db.execute(
            reel_likes.delete().where(
                and_(
                    reel_likes.c.user_id == current_user.id,
                    reel_likes.c.reel_id == reel_id
                )
            )
        )
        reel.likes_count = max(0, (reel.likes_count or 0) - 1)
        status = "unliked"
    else:
        # Like
        db.execute(reel_likes.insert().values(user_id=current_user.id, reel_id=reel_id))
        reel.likes_count = (reel.likes_count or 0) + 1
        status = "liked"
    
    db.commit()
    return {"status": status, "likes_count": reel.likes_count}

@router.get("/{reel_id}/comments", response_model=List[CommentOut])
def get_reel_comments(reel_id: int, db: Session = Depends(get_db)):
    return db.query(ReelComment).filter(ReelComment.reel_id == reel_id).order_by(desc(ReelComment.created_at)).all()

@router.post("/{reel_id}/comments", response_model=CommentOut)
def add_reel_comment(reel_id: int, comment: CommentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    reel = db.query(Reel).filter(Reel.id == reel_id).first()
    if not reel:
        raise HTTPException(status_code=404, detail="Reel not found")
        
    new_comment = ReelComment(
        reel_id=reel_id,
        user_id=current_user.id,
        content=comment.content
    )
    db.add(new_comment)
    reel.comments_count += 1
    db.commit()
    db.refresh(new_comment)
    
    return new_comment
