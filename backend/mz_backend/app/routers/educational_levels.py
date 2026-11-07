from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud, schemas
from app.database import get_db

router = APIRouter(prefix="/api/educational-levels", tags=["Educational Levels"])


@router.get("", response_model=List[schemas.EducationalLevelOut])
def list_educational_levels(db: Session = Depends(get_db)):
    """Public, read-only. The classification is fixed (see app/educational_levels.py)."""
    return crud.list_educational_levels(db)
