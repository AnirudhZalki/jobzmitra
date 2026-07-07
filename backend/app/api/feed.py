from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from app.db.database import get_db
from app.models.post import Post, Like, Comment
from app.models.notification import Notification
from app.models.user import User
from app.schemas.post import PostCreate, PostOut, CommentCreate, CommentOut
from app.core.config import settings
import jwt
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter()
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        # Support both old (email as sub) and new (user_id as sub) tokens
        sub: str = payload.get("sub")
        if sub is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Try to find user by ID first (new token format), then by email (legacy)
    user = None
    if sub.isdigit():
        user = db.query(User).filter(User.id == int(sub)).first()
    if user is None:
        email = payload.get("email", sub)
        user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.get("", response_model=List[PostOut])
def get_feed(db: Session = Depends(get_db), current_user: User = Depends(get_current_user), skip: int = 0, limit: int = 20):
    posts = db.query(Post).order_by(desc(Post.created_at)).offset(skip).limit(limit).all()
    
    # Process counts and like status
    result = []
    for post in posts:
        post_out = PostOut.from_orm(post)
        post_out.like_count = db.query(Like).filter(Like.post_id == post.id).count()
        post_out.comment_count = db.query(Comment).filter(Comment.post_id == post.id).count()
        
        is_liked = db.query(Like).filter(Like.post_id == post.id, Like.user_id == current_user.id).first()
        post_out.is_liked_by_user = is_liked is not None
        result.append(post_out)
        
    return result

@router.post("/post", response_model=PostOut)
def create_post(post: PostCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_post = Post(**post.dict(), author_id=current_user.id)
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    
    # Award gamification points
    from app.api.gamification import award_points_for_action
    award_points_for_action(current_user, "post_created", db)
    
    return PostOut.from_orm(new_post)

@router.delete("/post/{post_id}")
def delete_post(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    if post.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
        
    db.delete(post)
    db.commit()
    return {"status": "deleted"}

@router.post("/{post_id}/like")
def toggle_like(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    existing_like = db.query(Like).filter(Like.post_id == post_id, Like.user_id == current_user.id).first()
    
    if existing_like:
        db.delete(existing_like)
        db.commit()
        return {"status": "unliked"}
    else:
        new_like = Like(post_id=post_id, user_id=current_user.id)
        db.add(new_like)
        
        if post.author_id != current_user.id:
            notif = Notification(
                user_id=post.author_id,
                sender_id=current_user.id,
                type="like",
                content=f"{current_user.full_name} liked your post."
            )
            db.add(notif)
            
        db.commit()
        return {"status": "liked"}

@router.get("/{post_id}/comments", response_model=List[CommentOut])
def get_post_comments(post_id: int, db: Session = Depends(get_db)):
    comments = db.query(Comment).filter(Comment.post_id == post_id).order_by(desc(Comment.created_at)).all()
    return comments

@router.post("/{post_id}/comments", response_model=CommentOut)
def add_post_comment(post_id: int, comment: CommentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    new_comment = Comment(
        post_id=post_id,
        author_id=current_user.id,
        content=comment.content
    )
    db.add(new_comment)
    
    if post.author_id != current_user.id:
        notif = Notification(
            user_id=post.author_id,
            sender_id=current_user.id,
            type="comment",
            content=f"{current_user.full_name} commented on your post."
        )
        db.add(notif)
        
    db.commit()
    db.refresh(new_comment)
    
    # Award points
    from app.api.gamification import award_points_for_action
    award_points_for_action(current_user, "comment_added", db)
    
    return new_comment
