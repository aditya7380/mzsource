from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.auth import get_current_admin
from app.database import get_db

router = APIRouter(tags=["Settings"])


@router.get("/api/settings/public", response_model=schemas.SettingsPublicOut)
def get_public_settings(db: Session = Depends(get_db)):
    """
    No auth required — the buyer app calls this to show business info and
    a 'Call Support' number on the Profile screen before/without login.
    """
    return crud.get_settings(db)


@router.get("/api/admin/settings", response_model=schemas.SettingsOut)
def get_admin_settings(db: Session = Depends(get_db), _admin: models.AdminUser = Depends(get_current_admin)):
    return crud.get_settings(db)


@router.patch("/api/admin/settings", response_model=schemas.SettingsOut)
def update_admin_settings(payload: schemas.SettingsUpdate, db: Session = Depends(get_db), _admin: models.AdminUser = Depends(get_current_admin)):
    return crud.update_settings(db, payload)
