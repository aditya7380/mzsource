"""
Business logic layer. Mirrors the behaviour of the frontend's AppContext.tsx
(loginBuyer, createBuyerProfile, submitRequest, createQuotation, ...) but
backed by a real relational database instead of localStorage.
"""
from datetime import datetime
from typing import List, Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app import models, schemas


# ---------------------------------------------------------------------------
# ID generators
# ---------------------------------------------------------------------------

def generate_customer_id(db: Session) -> str:
    count = db.query(func.count(models.Customer.id)).scalar() or 0
    return f"MZ-CUS-{count + 1:06d}"


def generate_request_id(db: Session) -> str:
    year = datetime.utcnow().year
    count = db.query(func.count(models.Request.id)).scalar() or 0
    return f"REQ-MZ-{year}-{count + 1:06d}"


# ---------------------------------------------------------------------------
# Settings (singleton row)
# ---------------------------------------------------------------------------

def get_settings(db: Session) -> models.Settings:
    settings = db.query(models.Settings).filter(models.Settings.id == "default").first()
    if not settings:
        settings = models.Settings(id="default")
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


def update_settings(db: Session, data: schemas.SettingsUpdate) -> models.Settings:
    settings = get_settings(db)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(settings, field, value)
    db.commit()
    db.refresh(settings)
    return settings


# ---------------------------------------------------------------------------
# Categories / Subcategories
# ---------------------------------------------------------------------------

def list_categories(db: Session, active_only: bool = False) -> List[models.Category]:
    q = db.query(models.Category)
    if active_only:
        q = q.filter(models.Category.active == True)  # noqa: E712
    return q.all()


def get_category(db: Session, category_id: str) -> Optional[models.Category]:
    return db.query(models.Category).filter(models.Category.id == category_id).first()


def create_category(db: Session, data: schemas.CategoryCreate) -> models.Category:
    cat = models.Category(
        name=data.name, description=data.description, icon=data.icon,
        color=data.color, bg_color=data.bg_color, active=data.active,
    )
    db.add(cat)
    db.flush()
    for sc in data.subcategories:
        db.add(models.Subcategory(category_id=cat.id, name=sc.name, active=sc.active))
    db.commit()
    db.refresh(cat)
    return cat


def update_category(db: Session, category_id: str, data: schemas.CategoryUpdate) -> Optional[models.Category]:
    cat = get_category(db, category_id)
    if not cat:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(cat, field, value)
    db.commit()
    db.refresh(cat)
    return cat


def delete_category(db: Session, category_id: str) -> bool:
    cat = get_category(db, category_id)
    if not cat:
        return False
    db.delete(cat)
    db.commit()
    return True


def add_subcategory(db: Session, category_id: str, data: schemas.SubcategoryCreate) -> Optional[models.Subcategory]:
    cat = get_category(db, category_id)
    if not cat:
        return None
    sub = models.Subcategory(category_id=category_id, name=data.name, active=data.active)
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub


def update_subcategory(db: Session, subcategory_id: str, data: schemas.SubcategoryUpdate) -> Optional[models.Subcategory]:
    sub = db.query(models.Subcategory).filter(models.Subcategory.id == subcategory_id).first()
    if not sub:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(sub, field, value)
    db.commit()
    db.refresh(sub)
    return sub


# ---------------------------------------------------------------------------
# Products
# ---------------------------------------------------------------------------

def list_products(
    db: Session, category_id: Optional[str] = None, subcategory_id: Optional[str] = None,
    search: Optional[str] = None, active_only: bool = False,
    limit: int = 100, offset: int = 0,
) -> List[models.Product]:
    q = db.query(models.Product)
    if category_id:
        q = q.filter(models.Product.category_id == category_id)
    if subcategory_id:
        q = q.filter(models.Product.subcategory_id == subcategory_id)
    if search:
        like = f"%{search}%"
        q = q.filter(
            (models.Product.name.ilike(like)) |
            (models.Product.model_number.ilike(like)) |
            (models.Product.description.ilike(like))
        )
    if active_only:
        q = q.filter(models.Product.active == True)  # noqa: E712
    return q.order_by(models.Product.created_at.desc()).offset(offset).limit(limit).all()


def get_product(db: Session, product_id: str) -> Optional[models.Product]:
    return db.query(models.Product).filter(models.Product.id == product_id).first()


def create_product(db: Session, data: schemas.ProductCreate) -> models.Product:
    product = models.Product(**data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def update_product(db: Session, product_id: str, data: schemas.ProductUpdate) -> Optional[models.Product]:
    product = get_product(db, product_id)
    if not product:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: str) -> bool:
    product = get_product(db, product_id)
    if not product:
        return False
    db.delete(product)
    db.commit()
    return True


# ---------------------------------------------------------------------------
# Customers / addresses
# ---------------------------------------------------------------------------

def get_customer_by_mobile(db: Session, mobile: str) -> Optional[models.Customer]:
    return db.query(models.Customer).filter(models.Customer.mobile == mobile).first()


def get_customer(db: Session, customer_id: str) -> Optional[models.Customer]:
    return db.query(models.Customer).filter(models.Customer.id == customer_id).first()


def create_customer(db: Session, data: schemas.CustomerCreate) -> models.Customer:
    customer = models.Customer(
        id=generate_customer_id(db),
        full_name=data.full_name,
        mobile=data.mobile,
        customer_type=data.customer_type,
        business_name=data.business_name,
    )
    db.add(customer)
    db.flush()

    if data.address:
        addr = models.Address(customer_id=customer.id, is_default=True, **data.address.model_dump(exclude={"is_default"}))
        db.add(addr)

    db.add(models.Notification(
        title="Welcome to MZ Source!",
        message=f"Your profile has been created. Your Customer ID is {customer.id}.",
        type=models.NotificationType.success,
        is_admin=False,
        customer_id=customer.id,
    ))
    db.commit()
    db.refresh(customer)
    return customer


def update_customer(db: Session, customer_id: str, data: schemas.CustomerUpdate) -> Optional[models.Customer]:
    customer = get_customer(db, customer_id)
    if not customer:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(customer, field, value)
    db.commit()
    db.refresh(customer)
    return customer


def add_address(db: Session, customer_id: str, data: schemas.AddressCreate) -> Optional[models.Address]:
    customer = get_customer(db, customer_id)
    if not customer:
        return None
    if data.is_default:
        db.query(models.Address).filter(models.Address.customer_id == customer_id).update({"is_default": False})
    addr = models.Address(customer_id=customer_id, **data.model_dump())
    db.add(addr)
    db.commit()
    db.refresh(addr)
    return addr


def update_address(db: Session, address_id: str, data: schemas.AddressUpdate) -> Optional[models.Address]:
    addr = db.query(models.Address).filter(models.Address.id == address_id).first()
    if not addr:
        return None
    updates = data.model_dump(exclude_unset=True)
    if updates.get("is_default"):
        db.query(models.Address).filter(models.Address.customer_id == addr.customer_id).update({"is_default": False})
    for field, value in updates.items():
        setattr(addr, field, value)
    db.commit()
    db.refresh(addr)
    return addr


def delete_address(db: Session, address_id: str) -> bool:
    addr = db.query(models.Address).filter(models.Address.id == address_id).first()
    if not addr:
        return False
    db.delete(addr)
    db.commit()
    return True


def list_customers(db: Session, search: Optional[str] = None, limit: int = 100, offset: int = 0) -> List[models.Customer]:
    q = db.query(models.Customer)
    if search:
        like = f"%{search}%"
        q = q.filter((models.Customer.full_name.ilike(like)) | (models.Customer.mobile.ilike(like)) | (models.Customer.id.ilike(like)))
    return q.order_by(models.Customer.created_at.desc()).offset(offset).limit(limit).all()


# ---------------------------------------------------------------------------
# OTP
# ---------------------------------------------------------------------------

def issue_otp(db: Session, mobile: str, code: str, ttl_minutes: int = 10) -> models.OtpCode:
    from datetime import timedelta
    otp = models.OtpCode(mobile=mobile, code=code, expires_at=datetime.utcnow() + timedelta(minutes=ttl_minutes))
    db.add(otp)
    db.commit()
    db.refresh(otp)
    return otp


def verify_otp(db: Session, mobile: str, code: str) -> bool:
    otp = (
        db.query(models.OtpCode)
        .filter(models.OtpCode.mobile == mobile, models.OtpCode.code == code, models.OtpCode.verified == False)  # noqa: E712
        .order_by(models.OtpCode.created_at.desc())
        .first()
    )
    if not otp or otp.expires_at < datetime.utcnow():
        return False
    otp.verified = True
    db.commit()
    return True


# ---------------------------------------------------------------------------
# Requests
# ---------------------------------------------------------------------------

def submit_request(db: Session, customer: models.Customer, data: schemas.RequestSubmit) -> models.Request:
    now = datetime.utcnow()
    req = models.Request(
        id=generate_request_id(db),
        customer_id=customer.id,
        customer_name=customer.full_name,
        customer_mobile=data.alternative_mobile or customer.mobile,
        customer_type=customer.customer_type,
        business_name=customer.business_name,
        addr_label=data.delivery_address.label,
        addr_building=data.delivery_address.building,
        addr_street=data.delivery_address.street,
        addr_locality=data.delivery_address.locality,
        addr_sector=data.delivery_address.sector,
        addr_city=data.delivery_address.city,
        addr_district=data.delivery_address.district,
        addr_state=data.delivery_address.state,
        addr_pin_code=data.delivery_address.pin_code,
        addr_landmark=data.delivery_address.landmark,
        addr_lat=data.delivery_address.lat,
        addr_lng=data.delivery_address.lng,
        status=models.RequestStatus.PENDING,
        submitted_at=now,
    )
    db.add(req)
    db.flush()

    for item in data.items:
        product = get_product(db, item.product_id)
        if not product:
            continue
        db.add(models.RequestItem(
            request_id=req.id, product_id=product.id, product_name=product.name,
            model_number=product.model_number, quantity=item.quantity, unit_type=product.unit_type,
        ))

    db.add(models.StatusHistory(request_id=req.id, status=models.RequestStatus.PENDING, note="Request submitted by customer", timestamp=now))

    db.add(models.Notification(
        title="Request Submitted Successfully",
        message=f"Your request {req.id} has been submitted and is pending review.",
        type=models.NotificationType.success, request_id=req.id, customer_id=customer.id, is_admin=False,
    ))
    db.add(models.Notification(
        title="New Request Received",
        message=f"New request {req.id} from {customer.full_name} ({customer.customer_type.value}) is pending review.",
        type=models.NotificationType.info, request_id=req.id, is_admin=True,
    ))

    db.commit()
    db.refresh(req)
    return req


def list_requests(
    db: Session, customer_id: Optional[str] = None, status_filter: Optional[models.RequestStatus] = None,
    limit: int = 100, offset: int = 0,
) -> List[models.Request]:
    q = db.query(models.Request)
    if customer_id:
        q = q.filter(models.Request.customer_id == customer_id)
    if status_filter:
        q = q.filter(models.Request.status == status_filter)
    return q.order_by(models.Request.submitted_at.desc()).offset(offset).limit(limit).all()


def get_request(db: Session, request_id: str) -> Optional[models.Request]:
    return db.query(models.Request).filter(models.Request.id == request_id).first()


_STATUS_MESSAGES = {
    models.RequestStatus.SELECTED: "Your request has been selected. We are currently sourcing the products.",
    models.RequestStatus.REJECTED: "Unfortunately your request has been rejected. Please contact us for more information.",
    models.RequestStatus.CANCELLED: "Your request has been cancelled.",
    models.RequestStatus.COMPLETED: "Your request has been completed. Thank you for using MZ Source!",
}


def update_request_status(db: Session, request_id: str, status_: models.RequestStatus, note: Optional[str] = None) -> Optional[models.Request]:
    req = get_request(db, request_id)
    if not req:
        return None
    now = datetime.utcnow()
    req.status = status_
    db.add(models.StatusHistory(request_id=req.id, status=status_, note=note or "", timestamp=now))

    message = _STATUS_MESSAGES.get(status_)
    if message:
        notif_type = models.NotificationType.error if status_ in (models.RequestStatus.REJECTED, models.RequestStatus.CANCELLED) else models.NotificationType.success
        title = f"Request {status_.value.capitalize()}"
        db.add(models.Notification(
            title=title, message=message, type=notif_type,
            request_id=req.id, customer_id=req.customer_id, is_admin=False,
        ))

    db.commit()
    db.refresh(req)
    return req


def cancel_request(db: Session, request_id: str, customer_id: str) -> Optional[models.Request]:
    req = get_request(db, request_id)
    if not req or req.customer_id != customer_id:
        return None
    if req.status not in (models.RequestStatus.PENDING, models.RequestStatus.SELECTED, models.RequestStatus.CONFIRMED):
        return None
    return update_request_status(db, request_id, models.RequestStatus.CANCELLED, "Cancelled by customer")


def create_quotation(db: Session, request_id: str, data: schemas.QuotationCreate) -> Optional[models.Request]:
    req = get_request(db, request_id)
    if not req:
        return None
    now = datetime.utcnow()

    subtotal = sum(i.quantity * i.unit_price for i in data.items)
    total = subtotal + data.other_charges

    # Replace any existing quotation (admin may re-quote)
    if req.quotation:
        db.delete(req.quotation)
        db.flush()

    quotation = models.Quotation(
        request_id=req.id, subtotal=subtotal, other_charges=data.other_charges,
        other_charges_note=data.other_charges_note, total_amount=total,
        validity_days=data.validity_days, admin_message=data.admin_message, created_at=now,
    )
    db.add(quotation)
    db.flush()
    for item in data.items:
        db.add(models.QuotationItem(
            quotation_id=quotation.id, product_id=item.product_id, product_name=item.product_name,
            quantity=item.quantity, unit_type=item.unit_type, unit_price=item.unit_price,
            total=item.quantity * item.unit_price,
        ))

    if any([data.supplier_name, data.supplier_cost, data.transport_cost, data.packaging_cost, data.other_cost, data.margin]):
        if req.supplier_info:
            db.delete(req.supplier_info)
            db.flush()
        supplier_cost = data.supplier_cost or 0
        transport_cost = data.transport_cost or 0
        packaging_cost = data.packaging_cost or 0
        other_cost = data.other_cost or 0
        margin = data.margin or 0
        db.add(models.SupplierInfo(
            request_id=req.id, supplier_name=data.supplier_name or "", supplier_contact=data.supplier_contact or "",
            supplier_cost=supplier_cost, transport_cost=transport_cost, packaging_cost=packaging_cost,
            other_cost=other_cost, margin=margin,
            final_price=supplier_cost + transport_cost + packaging_cost + other_cost + margin,
        ))

    if data.private_note:
        db.add(models.PrivateNote(request_id=req.id, text=data.private_note, created_at=now))

    req.status = models.RequestStatus.SELECTED
    db.add(models.StatusHistory(request_id=req.id, status=models.RequestStatus.SELECTED, note="Quotation created and sent to customer", timestamp=now))

    db.add(models.Notification(
        title="Quotation Available",
        message=f"A quotation is available for your request {req.id}. Please review and confirm.",
        type=models.NotificationType.info, request_id=req.id, customer_id=req.customer_id, is_admin=False,
    ))

    db.commit()
    db.refresh(req)
    return req


def confirm_quotation(db: Session, request_id: str, customer_id: str) -> Optional[models.Request]:
    req = get_request(db, request_id)
    if not req or req.customer_id != customer_id or not req.quotation:
        return None
    now = datetime.utcnow()
    req.status = models.RequestStatus.CONFIRMED
    db.add(models.StatusHistory(request_id=req.id, status=models.RequestStatus.CONFIRMED, note="Customer confirmed the quotation", timestamp=now))
    db.add(models.Notification(
        title="Quotation Confirmed",
        message=f"Customer confirmed quotation for request {req.id}.",
        type=models.NotificationType.success, request_id=req.id, is_admin=True,
    ))
    db.commit()
    db.refresh(req)
    return req


def add_private_note(db: Session, request_id: str, text: str) -> Optional[models.PrivateNote]:
    req = get_request(db, request_id)
    if not req:
        return None
    note = models.PrivateNote(request_id=request_id, text=text, created_at=datetime.utcnow())
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


# ---------------------------------------------------------------------------
# Notifications
# ---------------------------------------------------------------------------

def list_buyer_notifications(db: Session, customer_id: str) -> List[models.Notification]:
    return (
        db.query(models.Notification)
        .filter(models.Notification.is_admin == False, models.Notification.customer_id == customer_id)  # noqa: E712
        .order_by(models.Notification.created_at.desc())
        .all()
    )


def list_admin_notifications(db: Session) -> List[models.Notification]:
    return (
        db.query(models.Notification)
        .filter(models.Notification.is_admin == True)  # noqa: E712
        .order_by(models.Notification.created_at.desc())
        .all()
    )


def mark_notification_read(db: Session, notif_id: str) -> Optional[models.Notification]:
    n = db.query(models.Notification).filter(models.Notification.id == notif_id).first()
    if not n:
        return None
    n.read = True
    db.commit()
    db.refresh(n)
    return n


def mark_all_notifications_read(db: Session, is_admin: bool, customer_id: Optional[str] = None) -> int:
    q = db.query(models.Notification).filter(models.Notification.is_admin == is_admin)
    if not is_admin and customer_id:
        q = q.filter(models.Notification.customer_id == customer_id)
    count = q.update({"read": True})
    db.commit()
    return count


def unread_count(db: Session, is_admin: bool, customer_id: Optional[str] = None) -> int:
    q = db.query(func.count(models.Notification.id)).filter(models.Notification.is_admin == is_admin, models.Notification.read == False)  # noqa: E712
    if not is_admin and customer_id:
        q = q.filter(models.Notification.customer_id == customer_id)
    return q.scalar() or 0


# ---------------------------------------------------------------------------
# Custom product requests
# ---------------------------------------------------------------------------

def submit_custom_product_request(db: Session, customer: models.Customer, data: schemas.CustomProductRequestCreate) -> models.CustomProductRequest:
    now = datetime.utcnow()
    cpr = models.CustomProductRequest(
        customer_id=customer.id, customer_name=customer.full_name,
        product_name=data.product_name, required_quantity=data.required_quantity,
        description=data.description, reference_image_url=data.reference_image_url,
        submitted_at=now, status=models.CustomRequestStatus.new,
    )
    db.add(cpr)
    db.add(models.Notification(
        title="Custom Product Request",
        message=f"{customer.full_name} submitted a custom product request for: {data.product_name}",
        type=models.NotificationType.info, is_admin=True,
    ))
    db.commit()
    db.refresh(cpr)
    return cpr


def list_custom_product_requests(db: Session, customer_id: Optional[str] = None) -> List[models.CustomProductRequest]:
    q = db.query(models.CustomProductRequest)
    if customer_id:
        q = q.filter(models.CustomProductRequest.customer_id == customer_id)
    return q.order_by(models.CustomProductRequest.submitted_at.desc()).all()


def update_custom_product_request_status(db: Session, cpr_id: str, status_: models.CustomRequestStatus) -> Optional[models.CustomProductRequest]:
    cpr = db.query(models.CustomProductRequest).filter(models.CustomProductRequest.id == cpr_id).first()
    if not cpr:
        return None
    cpr.status = status_
    db.commit()
    db.refresh(cpr)
    return cpr
