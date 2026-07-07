from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.api.feed import get_current_user

router = APIRouter()

# Validated actions and their point values
VALID_ACTIONS = {
    "post_created": 10,
    "job_applied": 15,
    "reel_uploaded": 20,
    "profile_updated": 5,
    "resume_uploaded": 25,
    "connection_made": 10,
    "post_liked": 2,
    "comment_added": 3,
    "mock_interview_completed": 15,
}

BADGE_THRESHOLDS = [
    (50,  "First Steps"),
    (100, "Rising Talent"),
    (250, "Job Hunter"),
    (500, "Career Explorer"),
    (1000, "Networking Pro"),
    (2500, "Industry Leader"),
]

def award_points_for_action(user: User, action: str, db: Session):
    """Internal helper to award points. Returns updated badges list."""
    points = VALID_ACTIONS.get(action, 0)
    if points == 0:
        return
    
    user.points = (user.points or 0) + points
    badges = [b for b in (user.badges or "").split(",") if b]
    
    for threshold, badge_name in BADGE_THRESHOLDS:
        if user.points >= threshold and badge_name not in badges:
            badges.append(badge_name)
    
    user.badges = ",".join(badges)
    db.commit()
    db.refresh(user)

@router.get("/status")
def get_gamification_status(current_user: User = Depends(get_current_user)):
    badges = [b for b in (current_user.badges or "").split(",") if b]
    return {
        "points": current_user.points or 0,
        "badges": badges,
        "level": next(
            (name for threshold, name in reversed(BADGE_THRESHOLDS) if (current_user.points or 0) >= threshold),
            "Newcomer"
        ),
        "next_badge": next(
            ({"name": name, "points_needed": threshold - (current_user.points or 0)}
             for threshold, name in BADGE_THRESHOLDS
             if (current_user.points or 0) < threshold),
            None
        )
    }

from sqlalchemy import func

@router.get("/leaderboard")
def get_leaderboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    top_users = db.query(User).order_by(func.coalesce(User.points, 0).desc()).limit(10).all()
    return [
        {
            "rank": idx + 1,
            "id": u.id,
            "full_name": u.full_name,
            "points": u.points or 0,
            "avatar_url": u.avatar_url,
            "top_badge": next(
                (name for threshold, name in reversed(BADGE_THRESHOLDS) if (u.points or 0) >= threshold),
                "Newcomer"
            )
        }
        for idx, u in enumerate(top_users)
    ]

@router.post("/award")
def award_points(action: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if action not in VALID_ACTIONS:
        raise HTTPException(status_code=400, detail=f"Invalid action. Valid actions: {list(VALID_ACTIONS.keys())}")
    
    points = VALID_ACTIONS[action]
    award_points_for_action(current_user, action, db)
    
    return {
        "message": f"Awarded {points} points for '{action}'",
        "total_points": current_user.points,
        "badges": [b for b in (current_user.badges or "").split(",") if b]
    }
