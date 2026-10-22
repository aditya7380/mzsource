from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app import models

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

buyer_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/buyer/auth/verify-otp", auto_error=False)
admin_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/admin/auth/login", auto_error=False)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(subject: str, role: str, expires_minutes: int) -> str:
    expire = datetime.utcnow() + timedelta(minutes=expires_minutes)
    payload = {"sub": subject, "role": role, "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")


def get_current_buyer(
    token: Optional[str] = Depends(buyer_oauth2_scheme),
    db: Session = Depends(get_db),
) -> models.Customer:
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    payload = decode_token(token)
    if payload.get("role") != "buyer":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Buyer token required")
    customer = db.query(models.Customer).filter(models.Customer.id == payload["sub"]).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Customer not found")
    return customer


def get_current_admin(
    token: Optional[str] = Depends(admin_oauth2_scheme),
    db: Session = Depends(get_db),
) -> models.AdminUser:
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    payload = decode_token(token)
    if payload.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin token required")
    admin = db.query(models.AdminUser).filter(models.AdminUser.id == payload["sub"]).first()
    if not admin:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Admin not found")
    return admin
