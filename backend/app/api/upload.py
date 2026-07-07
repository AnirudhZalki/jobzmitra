import os
import re
import uuid
import shutil
import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.api.feed import get_current_user
from app.models.user import User
from app.core.config import settings

router = APIRouter()

USE_CLOUDINARY = bool(settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET)

if USE_CLOUDINARY:
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
    )

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_TYPES = {
    "image/jpeg", "image/png", "image/gif", "image/webp",
    "video/mp4", "video/webm", "video/quicktime",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}

EXT_MAP = {
    "image/jpeg": "jpg", "image/png": "png", "image/gif": "gif", "image/webp": "webp",
    "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov",
    "application/pdf": "pdf", "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
}

@router.post("")
async def upload_file(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="File type not allowed")

    contents = await file.read()

    if USE_CLOUDINARY:
        resource_type = "video" if file.content_type.startswith("video") else \
                        "image" if file.content_type.startswith("image") else "raw"
        try:
            result = cloudinary.uploader.upload(contents, resource_type=resource_type, folder="jobzmitra")
            return {"url": result["secure_url"]}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    else:
        ext = EXT_MAP.get(file.content_type, "bin")
        filename = f"{uuid.uuid4()}.{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, "wb") as f:
            f.write(contents)
        return {"url": f"/uploads/{filename}"}
