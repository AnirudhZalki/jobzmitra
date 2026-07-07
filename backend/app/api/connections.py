from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List
from app.db.database import get_db
from app.models.user import User, Connection
from app.models.notification import Notification
from app.schemas.user import UserOut
from app.api.feed import get_current_user

router = APIRouter()

@router.post("/{user_id}/follow")
def follow_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot follow yourself")
        
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    existing_conn = db.query(Connection).filter(
        Connection.follower_id == current_user.id,
        Connection.following_id == user_id
    ).first()
    
    if existing_conn:
        return {"message": "Already following or connection pending"}
        
    # For MVP, connections are auto-accepted (like Instagram following public accounts)
    # Alternatively we can set to pending, but the prompt says "freely connect with others"
    new_conn = Connection(
        follower_id=current_user.id,
        following_id=user_id,
        status="accepted" 
    )
    db.add(new_conn)
    db.commit()
    
    # Send Notification
    notif = Notification(
        user_id=user_id,
        sender_id=current_user.id,
        type="connection",
        content=f"{current_user.full_name} wants to connect with you."
    )
    db.add(notif)
    db.commit()
    
    return {"message": f"Successfully connected with {target_user.full_name}"}

@router.post("/{user_id}/unfollow")
def unfollow_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    conn = db.query(Connection).filter(
        Connection.follower_id == current_user.id,
        Connection.following_id == user_id
    ).first()
    
    if conn:
        db.delete(conn)
        db.commit()
        
    return {"message": "Unfollowed successfully"}

@router.get("/my-connections", response_model=List[UserOut])
def get_my_connections(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # People I follow
    following_conns = db.query(Connection).filter(
        Connection.follower_id == current_user.id,
        Connection.status == "accepted"
    ).all()
    
    # People who follow me
    follower_conns = db.query(Connection).filter(
        Connection.following_id == current_user.id,
        Connection.status == "accepted"
    ).all()
    
    user_ids = set([c.following_id for c in following_conns] + [c.follower_id for c in follower_conns])
    if current_user.id in user_ids:
        user_ids.remove(current_user.id)
        
    if not user_ids:
        return []
        
    users = db.query(User).filter(User.id.in_(user_ids)).all()
    return users
