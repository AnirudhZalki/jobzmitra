from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.api import auth, feed, jobs, profile, upload, recruiter, gamification, mentor, messages, connections, reels, search, notifications
# Import all models so SQLAlchemy mapper can resolve relationships
from app.models import user, reel, post, job, message, notification  # noqa: F401

app = FastAPI(
    title="JobzMitra API",
    description="Backend API for JobzMitra - The Instagram for Careers",
    version="1.0.0",
)

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(feed.router, prefix="/api/feed", tags=["Feed"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["Jobs"])
app.include_router(profile.router, prefix="/api/profile", tags=["Profile"])
app.include_router(upload.router, prefix="/api/upload", tags=["Upload"])
app.include_router(recruiter.router, prefix="/api/recruiter", tags=["Recruiter"])
app.include_router(gamification.router, prefix="/api/gamification", tags=["Gamification"])
app.include_router(mentor.router, prefix="/api/mentor", tags=["Mentor"])
app.include_router(messages.router, prefix="/api/messages", tags=["Messages"])
app.include_router(connections.router, prefix="/api/connections", tags=["Connections"])
app.include_router(reels.router, prefix="/api/reels", tags=["Reels"])
app.include_router(search.router, prefix="/api/search", tags=["Search"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])

@app.get("/")
def read_root():
    return {"message": "Welcome to JobzMitra API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
