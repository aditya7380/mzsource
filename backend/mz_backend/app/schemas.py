"""
Pydantic (v2) schemas — the JSON contract between this API and the React
frontend. Field names use camelCase aliases so the existing TypeScript
interfaces in src/app/data/mockData.ts can be reused almost verbatim.
"""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models import (
    AvailabilityStatus, CustomerType, CustomRequestStatus, NotificationType,
    RequestStatus, UnitType,
)


def to_camel(s: str) -> str:
    parts = s.split("_")
    return parts[0] + "".join(p.title() for p in parts[1:])


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)


# ---------------------------------------------------------------------------
# Category / Subcategory
# ---------------------------------------------------------------------------

class SubcategoryBase(CamelModel):
    name: str
    active: bool = True


class SubcategoryCreate(SubcategoryBase):
    pass


class SubcategoryUpdate(CamelModel):
    name: Optional[str] = None
    active: Optional[bool] = None


class SubcategoryOut(SubcategoryBase):
    id: str
    category_id: str


class CategoryBase(CamelModel):
    name: str
    description: str = ""
    icon: str = ""
    color: str = "#155EEF"
    bg_color: str = "#EEF4FF"
    active: bool = True


class CategoryCreate(CategoryBase):
    subcategories: List[SubcategoryCreate] = Field(default_factory=list)


class CategoryUpdate(CamelModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    bg_color: Optional[str] = None
    active: Optional[bool] = None


class CategoryOut(CategoryBase):
    id: str
    subcategories: List[SubcategoryOut] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Product
# ---------------------------------------------------------------------------

class ProductBase(CamelModel):
    name: str
    category_id: str
    subcategory_id: Optional[str] = None
    model_number: str = ""
    description: str = ""
    specifications: str = ""
    unit_type: UnitType = UnitType.Piece
    availability: AvailabilityStatus = AvailabilityStatus.In_Stock
    image_color: str = "#EEF4FF"
    image_url: Optional[str] = None
    active: bool = True


class ProductCreate(ProductBase):
    pass


class ProductUpdate(CamelModel):
    name: Optional[str] = None
    category_id: Optional[str] = None
    subcategory_id: Optional[str] = None
    model_number: Optional[str] = None
    description: Optional[str] = None
    specifications: Optional[str] = None
    unit_type: Optional[UnitType] = None
    availability: Optional[AvailabilityStatus] = None
    image_color: Optional[str] = None
    image_url: Optional[str] = None
    active: Optional[bool] = None


class ProductOut(ProductBase):
    id: str
    created_at: datetime


# ---------------------------------------------------------------------------
# Address
# ---------------------------------------------------------------------------

class AddressBase(CamelModel):
    label: str = "Default"
    building: str = ""
    street: str = ""
    locality: str = ""
    sector: str = ""
    city: str = ""
    district: str = ""
    state: str = ""
    pin_code: str = ""
    landmark: str = ""
    lat: Optional[float] = None
    lng: Optional[float] = None
    is_default: bool = False


class AddressCreate(AddressBase):
    pass


class AddressUpdate(CamelModel):
    label: Optional[str] = None
    building: Optional[str] = None
    street: Optional[str] = None
    locality: Optional[str] = None
    sector: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    pin_code: Optional[str] = None
    landmark: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    is_default: Optional[bool] = None


class AddressOut(AddressBase):
    id: str
    customer_id: str


# ---------------------------------------------------------------------------
# Customer / buyer profile
# ---------------------------------------------------------------------------

class CustomerBase(CamelModel):
    full_name: str
    mobile: str
    customer_type: CustomerType = CustomerType.Individual
    business_name: str = ""


class CustomerCreate(CustomerBase):
    address: Optional[AddressCreate] = None


class CustomerUpdate(CamelModel):
    full_name: Optional[str] = None
    customer_type: Optional[CustomerType] = None
    business_name: Optional[str] = None


class CustomerOut(CustomerBase):
    id: str
    created_at: datetime
    addresses: List[AddressOut] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Settings
# ---------------------------------------------------------------------------

class SettingsPublicOut(CamelModel):
    """Subset safe to expose to unauthenticated / buyer callers."""
    business_name: str
    tagline: str
    phone: str
    email: str
    operating_area: str


class SettingsOut(SettingsPublicOut):
    address: str


class SettingsUpdate(CamelModel):
    business_name: Optional[str] = None
    tagline: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    operating_area: Optional[str] = None


# ---------------------------------------------------------------------------
# Buyer / Admin auth
# ---------------------------------------------------------------------------

class SendOtpRequest(CamelModel):
    mobile: str = Field(..., min_length=6, max_length=15)


class SendOtpResponse(CamelModel):
    mobile: str
    existing_profile: bool
    dev_otp: Optional[str] = None  # only populated in DEMO_OTP_BYPASS mode, for convenience


class VerifyOtpRequest(CamelModel):
    mobile: str
    otp: str


class BuyerTokenResponse(CamelModel):
    access_token: str
    token_type: str = "bearer"
    is_new_profile: bool
    customer: Optional[CustomerOut] = None


class AdminLoginRequest(CamelModel):
    username: str
    password: str


class AdminTokenResponse(CamelModel):
    access_token: str
    token_type: str = "bearer"


# ---------------------------------------------------------------------------
# Cart (server-side mirror, optional — the client may also keep it locally)
# ---------------------------------------------------------------------------

class CartItemIn(CamelModel):
    product_id: str
    quantity: int = Field(..., gt=0)


class CartItemOut(CamelModel):
    product_id: str
    quantity: int
    product: Optional[ProductOut] = None


# ---------------------------------------------------------------------------
# Requests
# ---------------------------------------------------------------------------

class RequestItemIn(CamelModel):
    product_id: str
    quantity: int = Field(..., gt=0)


class RequestItemOut(CamelModel):
    product_id: Optional[str] = None
    product_name: str
    model_number: str = ""
    quantity: int
    unit_type: UnitType


class StatusHistoryOut(CamelModel):
    status: RequestStatus
    timestamp: datetime
    note: str = ""


class QuotationItemIn(CamelModel):
    product_id: Optional[str] = None
    product_name: str
    quantity: int
    unit_type: str = "Piece"
    unit_price: float = Field(..., ge=0)


class QuotationItemOut(QuotationItemIn):
    total: float


class QuotationCreate(CamelModel):
    items: List[QuotationItemIn]
    other_charges: float = 0
    other_charges_note: str = ""
    validity_days: int = 7
    admin_message: str = ""
    # Private, admin-only sourcing figures — never returned to buyers
    supplier_name: Optional[str] = None
    supplier_contact: Optional[str] = None
    supplier_cost: Optional[float] = None
    transport_cost: Optional[float] = None
    packaging_cost: Optional[float] = None
    other_cost: Optional[float] = None
    margin: Optional[float] = None
    private_note: Optional[str] = None


class QuotationOut(CamelModel):
    items: List[QuotationItemOut]
    subtotal: float
    other_charges: float
    other_charges_note: str
    total_amount: float
    validity_days: int
    admin_message: str
    created_at: datetime


class SupplierInfoOut(CamelModel):
    """Admin-only view — attach only on admin-authenticated responses."""
    supplier_name: str
    supplier_contact: str
    supplier_cost: float
    transport_cost: float
    packaging_cost: float
    other_cost: float
    margin: float
    final_price: float


class PrivateNoteIn(CamelModel):
    text: str = Field(..., min_length=1)


class PrivateNoteOut(CamelModel):
    id: str
    text: str
    created_at: datetime


class AddressSnapshot(CamelModel):
    """Address as captured on a request at submission time."""
    label: str = ""
    building: str = ""
    street: str = ""
    locality: str = ""
    sector: str = ""
    city: str = ""
    district: str = ""
    state: str = ""
    pin_code: str = ""
    landmark: str = ""
    lat: Optional[float] = None
    lng: Optional[float] = None


class RequestSubmit(CamelModel):
    items: List[RequestItemIn]
    delivery_address: AddressSnapshot
    alternative_mobile: Optional[str] = None


class RequestOut(CamelModel):
    id: str
    customer_id: str
    customer_name: str
    customer_mobile: str
    customer_type: CustomerType
    business_name: str = ""
    delivery_address: AddressSnapshot
    items: List[RequestItemOut]
    status: RequestStatus
    status_history: List[StatusHistoryOut]
    submitted_at: datetime
    quotation: Optional[QuotationOut] = None
    # Admin-only fields — populated only when serialising for an admin caller
    supplier_info: Optional[SupplierInfoOut] = None
    private_notes: Optional[List[PrivateNoteOut]] = None


class RequestStatusUpdate(CamelModel):
    status: RequestStatus
    note: Optional[str] = None


# ---------------------------------------------------------------------------
# Notifications
# ---------------------------------------------------------------------------

class NotificationOut(CamelModel):
    id: str
    title: str
    message: str
    type: NotificationType
    read: bool
    created_at: datetime
    request_id: Optional[str] = None
    is_admin: bool


# ---------------------------------------------------------------------------
# Custom product requests ("Request a Product")
# ---------------------------------------------------------------------------

class CustomProductRequestCreate(CamelModel):
    product_name: str
    required_quantity: str = ""
    description: str = ""
    reference_image_url: Optional[str] = None


class CustomProductRequestOut(CamelModel):
    id: str
    customer_id: str
    customer_name: str
    product_name: str
    required_quantity: str
    description: str
    reference_image_url: Optional[str] = None
    submitted_at: datetime
    status: CustomRequestStatus


class CustomProductRequestStatusUpdate(CamelModel):
    status: CustomRequestStatus
