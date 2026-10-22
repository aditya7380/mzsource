from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.auth import get_current_admin, get_current_buyer
from app.database import get_db
from app.serializers import serialize_request

router = APIRouter(tags=["Requests"])


# ---------------------------------------------------------------------------
# Buyer-facing
# ---------------------------------------------------------------------------

@router.post("/api/buyer/requests", response_model=schemas.RequestOut, status_code=status.HTTP_201_CREATED)
def submit_request(
    payload: schemas.RequestSubmit,
    db: Session = Depends(get_db),
    current: models.Customer = Depends(get_current_buyer),
):
    if not payload.items:
        raise HTTPException(status_code=400, detail="Request must include at least one item")
    for item in payload.items:
        product = crud.get_product(db, item.product_id)
        if not product or not product.active:
            raise HTTPException(status_code=400, detail=f"Product {item.product_id} is not available")
    req = crud.submit_request(db, current, payload)
    return serialize_request(req, as_admin=False)


@router.get("/api/buyer/requests", response_model=List[schemas.RequestOut])
def list_my_requests(
    status_filter: Optional[models.RequestStatus] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current: models.Customer = Depends(get_current_buyer),
):
    reqs = crud.list_requests(db, customer_id=current.id, status_filter=status_filter)
    return [serialize_request(r, as_admin=False) for r in reqs]


@router.get("/api/buyer/requests/{request_id}", response_model=schemas.RequestOut)
def get_my_request(request_id: str, db: Session = Depends(get_db), current: models.Customer = Depends(get_current_buyer)):
    req = crud.get_request(db, request_id)
    if not req or req.customer_id != current.id:
        raise HTTPException(status_code=404, detail="Request not found")
    return serialize_request(req, as_admin=False)


@router.post("/api/buyer/requests/{request_id}/cancel", response_model=schemas.RequestOut)
def cancel_my_request(request_id: str, db: Session = Depends(get_db), current: models.Customer = Depends(get_current_buyer)):
    req = crud.cancel_request(db, request_id, current.id)
    if not req:
        raise HTTPException(status_code=400, detail="Request cannot be cancelled")
    return serialize_request(req, as_admin=False)


@router.post("/api/buyer/requests/{request_id}/confirm-quotation", response_model=schemas.RequestOut)
def confirm_quotation(request_id: str, db: Session = Depends(get_db), current: models.Customer = Depends(get_current_buyer)):
    req = crud.confirm_quotation(db, request_id, current.id)
    if not req:
        raise HTTPException(status_code=400, detail="No quotation available to confirm, or request not found")
    return serialize_request(req, as_admin=False)


# ---------------------------------------------------------------------------
# Admin-facing
# ---------------------------------------------------------------------------

@router.get("/api/admin/requests", response_model=List[schemas.RequestOut])
def list_all_requests(
    status_filter: Optional[models.RequestStatus] = Query(None, alias="status"),
    limit: int = Query(100, le=500), offset: int = 0,
    db: Session = Depends(get_db), _admin: models.AdminUser = Depends(get_current_admin),
):
    reqs = crud.list_requests(db, status_filter=status_filter, limit=limit, offset=offset)
    return [serialize_request(r, as_admin=True) for r in reqs]


@router.get("/api/admin/requests/{request_id}", response_model=schemas.RequestOut)
def get_request_admin(request_id: str, db: Session = Depends(get_db), _admin: models.AdminUser = Depends(get_current_admin)):
    req = crud.get_request(db, request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    return serialize_request(req, as_admin=True)


@router.patch("/api/admin/requests/{request_id}/status", response_model=schemas.RequestOut)
def update_status(request_id: str, payload: schemas.RequestStatusUpdate, db: Session = Depends(get_db), _admin: models.AdminUser = Depends(get_current_admin)):
    req = crud.update_request_status(db, request_id, payload.status, payload.note)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    return serialize_request(req, as_admin=True)


@router.post("/api/admin/requests/{request_id}/quotation", response_model=schemas.RequestOut)
def create_quotation(request_id: str, payload: schemas.QuotationCreate, db: Session = Depends(get_db), _admin: models.AdminUser = Depends(get_current_admin)):
    if not payload.items:
        raise HTTPException(status_code=400, detail="Quotation must include at least one item")
    req = crud.create_quotation(db, request_id, payload)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    return serialize_request(req, as_admin=True)


@router.post("/api/admin/requests/{request_id}/notes", response_model=schemas.PrivateNoteOut, status_code=status.HTTP_201_CREATED)
def add_private_note(request_id: str, payload: schemas.PrivateNoteIn, db: Session = Depends(get_db), _admin: models.AdminUser = Depends(get_current_admin)):
    note = crud.add_private_note(db, request_id, payload.text)
    if not note:
        raise HTTPException(status_code=404, detail="Request not found")
    return note
