from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.auth import get_current_admin
from app.database import get_db

router = APIRouter(prefix="/api/products", tags=["Products"])


@router.get("", response_model=List[schemas.ProductOut])
def list_products(
    category_id: Optional[str] = None,
    subcategory_id: Optional[str] = None,
    search: Optional[str] = Query(None, description="Matches name, model number, or description"),
    active_only: bool = True,
    limit: int = Query(100, le=500),
    offset: int = 0,
    db: Session = Depends(get_db),
):
    return crud.list_products(
        db, category_id=category_id, subcategory_id=subcategory_id, search=search,
        active_only=active_only, limit=limit, offset=offset,
    )


@router.get("/{product_id}", response_model=schemas.ProductOut)
def get_product(product_id: str, db: Session = Depends(get_db)):
    product = crud.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("", response_model=schemas.ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(payload: schemas.ProductCreate, db: Session = Depends(get_db), _admin: models.AdminUser = Depends(get_current_admin)):
    if not crud.get_category(db, payload.category_id):
        raise HTTPException(status_code=400, detail="Invalid categoryId")
    return crud.create_product(db, payload)


@router.patch("/{product_id}", response_model=schemas.ProductOut)
def update_product(product_id: str, payload: schemas.ProductUpdate, db: Session = Depends(get_db), _admin: models.AdminUser = Depends(get_current_admin)):
    product = crud.update_product(db, product_id, payload)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: str, db: Session = Depends(get_db), _admin: models.AdminUser = Depends(get_current_admin)):
    if not crud.delete_product(db, product_id):
        raise HTTPException(status_code=404, detail="Product not found")
