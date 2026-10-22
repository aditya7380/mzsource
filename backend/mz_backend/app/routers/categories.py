from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.auth import get_current_admin
from app.database import get_db

router = APIRouter(prefix="/api/categories", tags=["Categories"])


@router.get("", response_model=List[schemas.CategoryOut])
def list_categories(active_only: bool = False, db: Session = Depends(get_db)):
    return crud.list_categories(db, active_only=active_only)


@router.get("/{category_id}", response_model=schemas.CategoryOut)
def get_category(category_id: str, db: Session = Depends(get_db)):
    cat = crud.get_category(db, category_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    return cat


@router.post("", response_model=schemas.CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(payload: schemas.CategoryCreate, db: Session = Depends(get_db), _admin: models.AdminUser = Depends(get_current_admin)):
    return crud.create_category(db, payload)


@router.patch("/{category_id}", response_model=schemas.CategoryOut)
def update_category(category_id: str, payload: schemas.CategoryUpdate, db: Session = Depends(get_db), _admin: models.AdminUser = Depends(get_current_admin)):
    cat = crud.update_category(db, category_id, payload)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    return cat


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: str, db: Session = Depends(get_db), _admin: models.AdminUser = Depends(get_current_admin)):
    if not crud.delete_category(db, category_id):
        raise HTTPException(status_code=404, detail="Category not found")


@router.post("/{category_id}/subcategories", response_model=schemas.SubcategoryOut, status_code=status.HTTP_201_CREATED)
def add_subcategory(category_id: str, payload: schemas.SubcategoryCreate, db: Session = Depends(get_db), _admin: models.AdminUser = Depends(get_current_admin)):
    sub = crud.add_subcategory(db, category_id, payload)
    if not sub:
        raise HTTPException(status_code=404, detail="Category not found")
    return sub


@router.patch("/subcategories/{subcategory_id}", response_model=schemas.SubcategoryOut)
def update_subcategory(subcategory_id: str, payload: schemas.SubcategoryUpdate, db: Session = Depends(get_db), _admin: models.AdminUser = Depends(get_current_admin)):
    sub = crud.update_subcategory(db, subcategory_id, payload)
    if not sub:
        raise HTTPException(status_code=404, detail="Subcategory not found")
    return sub
