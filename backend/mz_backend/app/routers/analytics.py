from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app import models
from app.auth import get_current_admin
from app.database import get_db

router = APIRouter(prefix="/api/admin/analytics", tags=["Admin - Analytics"])


@router.get("/summary")
def get_summary(db: Session = Depends(get_db), _admin: models.AdminUser = Depends(get_current_admin)):
    total_requests = db.query(func.count(models.Request.id)).scalar() or 0
    total_customers = db.query(func.count(models.Customer.id)).scalar() or 0
    total_products = db.query(func.count(models.Product.id)).scalar() or 0

    by_status = dict(
        db.query(models.Request.status, func.count(models.Request.id)).group_by(models.Request.status).all()
    )
    by_status = {k.value if hasattr(k, "value") else k: v for k, v in by_status.items()}

    confirmed_value = (
        db.query(func.coalesce(func.sum(models.Quotation.total_amount), 0.0))
        .join(models.Request, models.Request.id == models.Quotation.request_id)
        .filter(models.Request.status.in_([models.RequestStatus.CONFIRMED, models.RequestStatus.COMPLETED]))
        .scalar()
    )

    since = datetime.utcnow() - timedelta(days=30)
    requests_last_30d = (
        db.query(func.count(models.Request.id)).filter(models.Request.submitted_at >= since).scalar() or 0
    )

    top_categories = (
        db.query(models.Category.name, func.count(models.Product.id))
        .join(models.Product, models.Product.category_id == models.Category.id)
        .group_by(models.Category.name)
        .order_by(func.count(models.Product.id).desc())
        .limit(5)
        .all()
    )

    return {
        "totalRequests": total_requests,
        "totalCustomers": total_customers,
        "totalProducts": total_products,
        "requestsByStatus": by_status,
        "confirmedQuotationValue": round(confirmed_value or 0, 2),
        "requestsLast30Days": requests_last_30d,
        "topCategories": [{"name": n, "productCount": c} for n, c in top_categories],
    }
