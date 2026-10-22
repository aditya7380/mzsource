from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import create_access_token, get_current_admin, verify_password
from app.config import settings
from app.database import get_db

router = APIRouter(prefix="/api/admin/auth", tags=["Admin Auth"])


@router.post("/login", response_model=schemas.AdminTokenResponse)
def login(payload: schemas.AdminLoginRequest, db: Session = Depends(get_db)):
    admin = db.query(models.AdminUser).filter(models.AdminUser.username == payload.username).first()
    if not admin or not verify_password(payload.password, admin.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
    token = create_access_token(admin.id, "admin", settings.ADMIN_TOKEN_EXPIRE_MINUTES)
    return schemas.AdminTokenResponse(access_token=token)


@router.get("/me")
def get_me(current: models.AdminUser = Depends(get_current_admin)):
    return {"id": current.id, "username": current.username}
