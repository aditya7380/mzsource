from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.auth import get_current_admin, get_current_buyer
from app.database import get_db

router = APIRouter(tags=["Notifications"])


@router.get("/api/buyer/notifications", response_model=List[schemas.NotificationOut])
def list_buyer_notifications(db: Session = Depends(get_db), current: models.Customer = Depends(get_current_buyer)):
    return crud.list_buyer_notifications(db, current.id)


@router.get("/api/buyer/notifications/unread-count")
def buyer_unread_count(db: Session = Depends(get_db), current: models.Customer = Depends(get_current_buyer)):
    return {"count": crud.unread_count(db, is_admin=False, customer_id=current.id)}


@router.post("/api/buyer/notifications/{notif_id}/read", response_model=schemas.NotificationOut)
def mark_buyer_notification_read(notif_id: str, db: Session = Depends(get_db), current: models.Customer = Depends(get_current_buyer)):
    n = db.query(models.Notification).filter(models.Notification.id == notif_id, models.Notification.customer_id == current.id).first()
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    return crud.mark_notification_read(db, notif_id)


@router.post("/api/buyer/notifications/read-all")
def mark_all_buyer_notifications_read(db: Session = Depends(get_db), current: models.Customer = Depends(get_current_buyer)):
    count = crud.mark_all_notifications_read(db, is_admin=False, customer_id=current.id)
    return {"updated": count}


@router.get("/api/admin/notifications", response_model=List[schemas.NotificationOut])
def list_admin_notifications(db: Session = Depends(get_db), _admin: models.AdminUser = Depends(get_current_admin)):
    return crud.list_admin_notifications(db)


@router.get("/api/admin/notifications/unread-count")
def admin_unread_count(db: Session = Depends(get_db), _admin: models.AdminUser = Depends(get_current_admin)):
    return {"count": crud.unread_count(db, is_admin=True)}


@router.post("/api/admin/notifications/{notif_id}/read", response_model=schemas.NotificationOut)
def mark_admin_notification_read(notif_id: str, db: Session = Depends(get_db), _admin: models.AdminUser = Depends(get_current_admin)):
    n = crud.mark_notification_read(db, notif_id)
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    return n


@router.post("/api/admin/notifications/read-all")
def mark_all_admin_notifications_read(db: Session = Depends(get_db), _admin: models.AdminUser = Depends(get_current_admin)):
    count = crud.mark_all_notifications_read(db, is_admin=True)
    return {"updated": count}
