from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.auth import get_current_admin
from app.database import get_db

router = APIRouter(prefix="/api/admin/customers", tags=["Admin - Customers"])


@router.get("", response_model=List[schemas.CustomerOut])
def list_customers(
    search: Optional[str] = None, limit: int = Query(100, le=500), offset: int = 0,
    db: Session = Depends(get_db), _admin: models.AdminUser = Depends(get_current_admin),
):
    return crud.list_customers(db, search=search, limit=limit, offset=offset)


@router.get("/{customer_id}", response_model=schemas.CustomerOut)
def get_customer(customer_id: str, db: Session = Depends(get_db), _admin: models.AdminUser = Depends(get_current_admin)):
    customer = crud.get_customer(db, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.get("/{customer_id}/requests", response_model=List[schemas.RequestOut])
def get_customer_requests(customer_id: str, db: Session = Depends(get_db), _admin: models.AdminUser = Depends(get_current_admin)):
    from app.serializers import serialize_request
    reqs = crud.list_requests(db, customer_id=customer_id)
    return [serialize_request(r, as_admin=True) for r in reqs]
