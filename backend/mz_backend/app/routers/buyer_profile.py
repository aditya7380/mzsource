from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.auth import get_current_buyer
from app.database import get_db

router = APIRouter(prefix="/api/buyer/profile", tags=["Buyer Profile"])


@router.get("", response_model=schemas.CustomerOut)
def get_profile(current: models.Customer = Depends(get_current_buyer)):
    return current


@router.patch("", response_model=schemas.CustomerOut)
def update_profile(payload: schemas.CustomerUpdate, db: Session = Depends(get_db), current: models.Customer = Depends(get_current_buyer)):
    return crud.update_customer(db, current.id, payload)


@router.get("/addresses", response_model=List[schemas.AddressOut])
def list_addresses(current: models.Customer = Depends(get_current_buyer)):
    return current.addresses


@router.post("/addresses", response_model=schemas.AddressOut, status_code=status.HTTP_201_CREATED)
def add_address(payload: schemas.AddressCreate, db: Session = Depends(get_db), current: models.Customer = Depends(get_current_buyer)):
    return crud.add_address(db, current.id, payload)


@router.patch("/addresses/{address_id}", response_model=schemas.AddressOut)
def update_address(address_id: str, payload: schemas.AddressUpdate, db: Session = Depends(get_db), current: models.Customer = Depends(get_current_buyer)):
    addr = db.query(models.Address).filter(models.Address.id == address_id, models.Address.customer_id == current.id).first()
    if not addr:
        raise HTTPException(status_code=404, detail="Address not found")
    return crud.update_address(db, address_id, payload)


@router.delete("/addresses/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_address(address_id: str, db: Session = Depends(get_db), current: models.Customer = Depends(get_current_buyer)):
    addr = db.query(models.Address).filter(models.Address.id == address_id, models.Address.customer_id == current.id).first()
    if not addr:
        raise HTTPException(status_code=404, detail="Address not found")
    crud.delete_address(db, address_id)
