from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc
from typing import List
from app.db.database import get_db
from app.models.message import Message
from app.models.user import User, Connection
from app.schemas.message import MessageCreate, MessageOut, ConversationSummary
from app.api.feed import get_current_user

router = APIRouter()

@router.get("/conversations", response_model=List[ConversationSummary])
def get_conversations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Find all unique users the current user has exchanged messages with
    messages = db.query(Message).filter(
        or_(Message.sender_id == current_user.id, Message.receiver_id == current_user.id)
    ).order_by(desc(Message.created_at)).all()
    
    conversations = {}
    
    for msg in messages:
        other_user_id = msg.receiver_id if msg.sender_id == current_user.id else msg.sender_id
        if other_user_id not in conversations:
            other_user = db.query(User).filter(User.id == other_user_id).first()
            if other_user:
                unread_count = db.query(Message).filter(
                    Message.sender_id == other_user_id,
                    Message.receiver_id == current_user.id,
                    Message.is_read.is_(False)
                ).count()
                
                conversations[other_user_id] = ConversationSummary(
                    user=other_user,
                    last_message=msg.content,
                    unread_count=unread_count,
                    updated_at=msg.created_at
                )
                
    return list(conversations.values())

@router.get("/{user_id}", response_model=List[MessageOut])
def get_messages(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Mark messages as read
    unread_msgs = db.query(Message).filter(
        Message.sender_id == user_id,
        Message.receiver_id == current_user.id,
        Message.is_read.is_(False)
    ).all()
    
    for msg in unread_msgs:
        msg.is_read = True
    if unread_msgs:
        db.commit()

    messages = db.query(Message).filter(
        or_(
            and_(Message.sender_id == current_user.id, Message.receiver_id == user_id),
            and_(Message.sender_id == user_id, Message.receiver_id == current_user.id)
        )
    ).order_by(Message.created_at).all()
    
    return messages

@router.post("/{user_id}", response_model=MessageOut)
def send_message(user_id: int, message: MessageCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Verify receiver exists
    receiver = db.query(User).filter(User.id == user_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Check connection
    conn = db.query(Connection).filter(
        or_(
            and_(Connection.follower_id == current_user.id, Connection.following_id == user_id, Connection.status == "accepted"),
            and_(Connection.follower_id == user_id, Connection.following_id == current_user.id, Connection.status == "accepted")
        )
    ).first()
    
    if not conn:
        raise HTTPException(status_code=403, detail="You can only message your connections")
        
    new_msg = Message(
        sender_id=current_user.id,
        receiver_id=user_id,
        content=message.content,
        attachment_url=message.attachment_url
    )
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)
    return new_msg
