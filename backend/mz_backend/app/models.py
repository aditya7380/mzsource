"""
SQLAlchemy models for the MZ Source platform.

These map 1:1 onto the entities already used by the existing frontend
(src/app/data/mockData.ts + AppContext.tsx) so the React app can be pointed
at this API with minimal changes: Category/Subcategory, Product, Customer/
Address, Request/RequestItem/StatusHistory/Quotation/SupplierInfo/
PrivateNote, Notification, CustomProductRequest, AdminUser, OtpCode.
"""
import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean, Column, DateTime, Enum, Float, ForeignKey, Integer, String, Text
)
from sqlalchemy.orm import relationship

from app.database import Base


def uid() -> str:
    return uuid.uuid4().hex


# ---------------------------------------------------------------------------
# Enums (kept as plain strings in the DB for portability, validated in Pydantic)
# ---------------------------------------------------------------------------

class CustomerType(str, enum.Enum):
    Student = "Student"
    Teacher = "Teacher"
    Shopkeeper = "Shopkeeper"
    School_College = "School/College"
    Business = "Business"
    Individual = "Individual"
    Other = "Other"


class UnitType(str, enum.Enum):
    Piece = "Piece"
    Pack = "Pack"
    Set = "Set"
    Box = "Box"
    Pair = "Pair"
    Roll = "Roll"
    Packet = "Packet"
    Dozen = "Dozen"
    Kilogram = "Kilogram"


class AvailabilityStatus(str, enum.Enum):
    In_Stock = "In Stock"
    Limited_Stock = "Limited Stock"
    Out_of_Stock = "Out of Stock"
    On_Request = "On Request"


class RequestStatus(str, enum.Enum):
    PENDING = "PENDING"
    SELECTED = "SELECTED"
    CONFIRMED = "CONFIRMED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"


class NotificationType(str, enum.Enum):
    info = "info"
    success = "success"
    warning = "warning"
    error = "error"


class CustomRequestStatus(str, enum.Enum):
    new = "new"
    reviewed = "reviewed"


# ---------------------------------------------------------------------------
# Catalogue
# ---------------------------------------------------------------------------

class Category(Base):
    __tablename__ = "categories"

    id = Column(String, primary_key=True, default=lambda: f"cat-{uid()}")
    name = Column(String, nullable=False)
    description = Column(Text, default="")
    icon = Column(String, default="")
    color = Column(String, default="#155EEF")
    bg_color = Column(String, default="#EEF4FF")
    active = Column(Boolean, default=True)

    subcategories = relationship("Subcategory", back_populates="category", cascade="all, delete-orphan")
    products = relationship("Product", back_populates="category")


class Subcategory(Base):
    __tablename__ = "subcategories"

    id = Column(String, primary_key=True, default=lambda: f"subcat-{uid()}")
    category_id = Column(String, ForeignKey("categories.id"), nullable=False)
    name = Column(String, nullable=False)
    active = Column(Boolean, default=True)

    category = relationship("Category", back_populates="subcategories")


class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, default=lambda: f"prod-{uid()}")
    name = Column(String, nullable=False, index=True)
    category_id = Column(String, ForeignKey("categories.id"), nullable=False)
    subcategory_id = Column(String, ForeignKey("subcategories.id"), nullable=True)
    model_number = Column(String, default="")
    description = Column(Text, default="")
    specifications = Column(Text, default="")
    unit_type = Column(Enum(UnitType), default=UnitType.Piece)
    availability = Column(Enum(AvailabilityStatus), default=AvailabilityStatus.In_Stock)
    image_color = Column(String, default="#EEF4FF")
    image_url = Column(String, nullable=True)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    category = relationship("Category", back_populates="products")
    subcategory = relationship("Subcategory")


# ---------------------------------------------------------------------------
# Buyer / customer
# ---------------------------------------------------------------------------

class Customer(Base):
    __tablename__ = "customers"

    id = Column(String, primary_key=True)  # e.g. MZ-CUS-000124, assigned in CRUD
    full_name = Column(String, nullable=False)
    mobile = Column(String, nullable=False, unique=True, index=True)
    customer_type = Column(Enum(CustomerType), default=CustomerType.Individual)
    business_name = Column(String, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    addresses = relationship("Address", back_populates="customer", cascade="all, delete-orphan")
    requests = relationship("Request", back_populates="customer")


class Address(Base):
    __tablename__ = "addresses"

    id = Column(String, primary_key=True, default=lambda: f"addr-{uid()}")
    customer_id = Column(String, ForeignKey("customers.id"), nullable=False)
    label = Column(String, default="Default")
    building = Column(String, default="")
    street = Column(String, default="")
    locality = Column(String, default="")
    sector = Column(String, default="")
    city = Column(String, default="")
    district = Column(String, default="")
    state = Column(String, default="")
    pin_code = Column(String, default="")
    landmark = Column(String, default="")
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    is_default = Column(Boolean, default=False)

    customer = relationship("Customer", back_populates="addresses")


# ---------------------------------------------------------------------------
# Requests / quotations
# ---------------------------------------------------------------------------

class Request(Base):
    __tablename__ = "requests"

    id = Column(String, primary_key=True)  # e.g. REQ-MZ-2026-000001, assigned in CRUD

    customer_id = Column(String, ForeignKey("customers.id"), nullable=False)
    # Snapshot fields captured at submission time (business rule: a request must
    # keep the buyer info as it was *then*, even if the profile changes later).
    customer_name = Column(String, nullable=False)
    customer_mobile = Column(String, nullable=False)
    customer_type = Column(Enum(CustomerType), nullable=False)
    business_name = Column(String, default="")

    # Delivery address snapshot (denormalised on purpose, same reasoning as above)
    addr_label = Column(String, default="")
    addr_building = Column(String, default="")
    addr_street = Column(String, default="")
    addr_locality = Column(String, default="")
    addr_sector = Column(String, default="")
    addr_city = Column(String, default="")
    addr_district = Column(String, default="")
    addr_state = Column(String, default="")
    addr_pin_code = Column(String, default="")
    addr_landmark = Column(String, default="")
    addr_lat = Column(Float, nullable=True)
    addr_lng = Column(Float, nullable=True)

    status = Column(Enum(RequestStatus), default=RequestStatus.PENDING, index=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    customer = relationship("Customer", back_populates="requests")
    items = relationship("RequestItem", back_populates="request", cascade="all, delete-orphan")
    status_history = relationship("StatusHistory", back_populates="request", cascade="all, delete-orphan")
    quotation = relationship("Quotation", back_populates="request", uselist=False, cascade="all, delete-orphan")
    supplier_info = relationship("SupplierInfo", back_populates="request", uselist=False, cascade="all, delete-orphan")
    private_notes = relationship("PrivateNote", back_populates="request", cascade="all, delete-orphan")


class RequestItem(Base):
    __tablename__ = "request_items"

    id = Column(String, primary_key=True, default=lambda: f"ritem-{uid()}")
    request_id = Column(String, ForeignKey("requests.id"), nullable=False)
    product_id = Column(String, ForeignKey("products.id"), nullable=True)
    product_name = Column(String, nullable=False)
    model_number = Column(String, default="")
    quantity = Column(Integer, nullable=False)
    unit_type = Column(Enum(UnitType), default=UnitType.Piece)

    request = relationship("Request", back_populates="items")


class StatusHistory(Base):
    __tablename__ = "status_history"

    id = Column(String, primary_key=True, default=lambda: f"sh-{uid()}")
    request_id = Column(String, ForeignKey("requests.id"), nullable=False)
    status = Column(Enum(RequestStatus), nullable=False)
    note = Column(Text, default="")
    timestamp = Column(DateTime, default=datetime.utcnow)

    request = relationship("Request", back_populates="status_history")


class Quotation(Base):
    __tablename__ = "quotations"

    id = Column(String, primary_key=True, default=lambda: f"quote-{uid()}")
    request_id = Column(String, ForeignKey("requests.id"), nullable=False, unique=True)
    subtotal = Column(Float, default=0)
    other_charges = Column(Float, default=0)
    other_charges_note = Column(String, default="")
    total_amount = Column(Float, default=0)
    validity_days = Column(Integer, default=7)
    admin_message = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    request = relationship("Request", back_populates="quotation")
    items = relationship("QuotationItem", back_populates="quotation", cascade="all, delete-orphan")


class QuotationItem(Base):
    __tablename__ = "quotation_items"

    id = Column(String, primary_key=True, default=lambda: f"qitem-{uid()}")
    quotation_id = Column(String, ForeignKey("quotations.id"), nullable=False)
    product_id = Column(String, nullable=True)
    product_name = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_type = Column(String, default="Piece")
    unit_price = Column(Float, default=0)
    total = Column(Float, default=0)

    quotation = relationship("Quotation", back_populates="items")


class SupplierInfo(Base):
    """Strictly Admin-only. Never serialise this to a buyer-facing response."""
    __tablename__ = "supplier_info"

    id = Column(String, primary_key=True, default=lambda: f"supp-{uid()}")
    request_id = Column(String, ForeignKey("requests.id"), nullable=False, unique=True)
    supplier_name = Column(String, default="")
    supplier_contact = Column(String, default="")
    supplier_cost = Column(Float, default=0)
    transport_cost = Column(Float, default=0)
    packaging_cost = Column(Float, default=0)
    other_cost = Column(Float, default=0)
    margin = Column(Float, default=0)
    final_price = Column(Float, default=0)

    request = relationship("Request", back_populates="supplier_info")


class PrivateNote(Base):
    """Strictly Admin-only. Never serialise this to a buyer-facing response."""
    __tablename__ = "private_notes"

    id = Column(String, primary_key=True, default=lambda: f"note-{uid()}")
    request_id = Column(String, ForeignKey("requests.id"), nullable=False)
    text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    request = relationship("Request", back_populates="private_notes")


# ---------------------------------------------------------------------------
# Notifications / custom product requests
# ---------------------------------------------------------------------------

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=lambda: f"notif-{uid()}")
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(Enum(NotificationType), default=NotificationType.info)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    request_id = Column(String, ForeignKey("requests.id"), nullable=True)
    customer_id = Column(String, ForeignKey("customers.id"), nullable=True)  # who it's for, if buyer-facing
    is_admin = Column(Boolean, default=False)


class CustomProductRequest(Base):
    __tablename__ = "custom_product_requests"

    id = Column(String, primary_key=True, default=lambda: f"cpr-{uid()}")
    customer_id = Column(String, ForeignKey("customers.id"), nullable=False)
    customer_name = Column(String, nullable=False)
    product_name = Column(String, nullable=False)
    required_quantity = Column(String, default="")
    description = Column(Text, default="")
    reference_image_url = Column(String, nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    status = Column(Enum(CustomRequestStatus), default=CustomRequestStatus.new)


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(String, primary_key=True, default=lambda: f"admin-{uid()}")
    username = Column(String, nullable=False, unique=True)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Settings(Base):
    """
    Singleton settings row (id is always 'default'). Holds platform/business
    info the buyer app needs to display (e.g. admin contact phone for the
    "Call Support" action) plus admin-editable business info shown in the
    Admin Settings screen.
    """
    __tablename__ = "settings"

    id = Column(String, primary_key=True, default="default")
    business_name = Column(String, default="MZ Source")
    tagline = Column(String, default="Local Products. Easy Requests.")
    phone = Column(String, default="+91 9876543210")
    email = Column(String, default="contact@mzsource.in")
    address = Column(String, default="Aizawl, Mizoram, India — 796001")
    operating_area = Column(String, default="Mizoram, India")


class OtpCode(Base):
    """Short-lived OTP codes for buyer mobile-number verification."""
    __tablename__ = "otp_codes"

    id = Column(String, primary_key=True, default=lambda: f"otp-{uid()}")
    mobile = Column(String, nullable=False, index=True)
    code = Column(String, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
