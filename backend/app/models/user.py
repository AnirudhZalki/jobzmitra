from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="seeker") # seeker, recruiter, company, admin
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Profile information
    full_name = Column(String, nullable=True)
    profile_image = Column(String, nullable=True)
    headline = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    company_name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    skills = Column(String, nullable=True) # Stored as comma-separated
    resume_url = Column(String, nullable=True)
    location = Column(String, nullable=True)
    portfolio_url = Column(String, nullable=True)
    points = Column(Integer, default=0)
    badges = Column(String, default="") # Stored as comma-separated
    is_premium = Column(Boolean, default=False)
    premium_expires_at = Column(DateTime(timezone=True), nullable=True)

class Connection(Base):
    __tablename__ = "connections"

    id = Column(Integer, primary_key=True, index=True)
    follower_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    following_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(String, default="pending") # pending, accepted
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    follower = relationship("User", foreign_keys=[follower_id], backref="following")
    following = relationship("User", foreign_keys=[following_id], backref="followers")
