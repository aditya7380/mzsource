from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.auth import get_current_admin, get_current_buyer
from app.database import get_db

router = APIRouter(tags=["Custom Product Requests"])


@router.post("/api/buyer/custom-requests", response_model=schemas.CustomProductRequestOut, status_code=status.HTTP_201_CREATED)
def submit_custom_request(payload: schemas.CustomProductRequestCreate, db: Session = Depends(get_db), current: models.Customer = Depends(get_current_buyer)):
    return crud.submit_custom_product_request(db, current, payload)


@router.get("/api/buyer/custom-requests", response_model=List[schemas.CustomProductRequestOut])
def list_my_custom_requests(db: Session = Depends(get_db), current: models.Customer = Depends(get_current_buyer)):
    return crud.list_custom_product_requests(db, customer_id=current.id)


@router.get("/api/admin/custom-requests", response_model=List[schemas.CustomProductRequestOut])
def list_all_custom_requests(db: Session = Depends(get_db), _admin: models.AdminUser = Depends(get_current_admin)):
    return crud.list_custom_product_requests(db)


@router.patch("/api/admin/custom-requests/{cpr_id}/status", response_model=schemas.CustomProductRequestOut)
def update_custom_request_status(cpr_id: str, payload: schemas.CustomProductRequestStatusUpdate, db: Session = Depends(get_db), _admin: models.AdminUser = Depends(get_current_admin)):
    cpr = crud.update_custom_product_request_status(db, cpr_id, payload.status)
    if not cpr:
        raise HTTPException(status_code=404, detail="Custom product request not found")
    return cpr
