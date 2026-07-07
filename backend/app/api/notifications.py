from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from app.db.database import get_db
from app.models.notification import Notification
from app.models.user import User
from app.api.feed import get_current_user
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class NotificationOut(BaseModel):
    id: int
    type: str
    content: str
    is_read: bool
    created_at: datetime
    
    # Nested simple user object if sender_id exists
    sender: Optional[dict] = None

    class Config:
        from_attributes = True

@router.get("/", response_model=List[NotificationOut])
def get_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    notifications = db.query(Notification).filter(Notification.user_id == current_user.id).order_by(desc(Notification.created_at)).all()
    
    result = []
    for n in notifications:
        n_out = NotificationOut.from_orm(n)
        if n.sender:
            n_out.sender = {
                "id": n.sender.id,
                "full_name": n.sender.full_name,
                "role": n.sender.role
            }
        result.append(n_out)
    return result

@router.put("/{notif_id}/read")
def mark_read(notif_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    notif = db.query(Notification).filter(Notification.id == notif_id, Notification.user_id == current_user.id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notif.is_read = True
    db.commit()
    return {"message": "Marked as read"}

@router.put("/read-all")
def mark_all_read(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db.query(Notification).filter(Notification.user_id == current_user.id, Notification.is_read.is_(False)).update({"is_read": True})
    db.commit()
    return {"message": "All marked as read"}
