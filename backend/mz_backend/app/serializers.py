"""
Converts ORM objects into response schemas. Centralised here so the
buyer/admin privacy rule (never leak supplier info, margins, or private
notes to a buyer) is enforced in exactly one place.
"""
from typing import Optional

from app import models, schemas


def serialize_address_snapshot(req: models.Request) -> schemas.AddressSnapshot:
    return schemas.AddressSnapshot(
        label=req.addr_label, building=req.addr_building, street=req.addr_street,
        locality=req.addr_locality, sector=req.addr_sector, city=req.addr_city,
        district=req.addr_district, state=req.addr_state, pin_code=req.addr_pin_code,
        landmark=req.addr_landmark, lat=req.addr_lat, lng=req.addr_lng,
    )


def serialize_quotation(q: Optional[models.Quotation]) -> Optional[schemas.QuotationOut]:
    if not q:
        return None
    return schemas.QuotationOut(
        items=[
            schemas.QuotationItemOut(
                product_id=i.product_id, product_name=i.product_name, quantity=i.quantity,
                unit_type=i.unit_type, unit_price=i.unit_price, total=i.total,
            ) for i in q.items
        ],
        subtotal=q.subtotal, other_charges=q.other_charges, other_charges_note=q.other_charges_note,
        total_amount=q.total_amount, validity_days=q.validity_days, admin_message=q.admin_message,
        created_at=q.created_at,
    )


def serialize_request(req: models.Request, *, as_admin: bool = False) -> schemas.RequestOut:
    out = schemas.RequestOut(
        id=req.id, customer_id=req.customer_id, customer_name=req.customer_name,
        customer_mobile=req.customer_mobile, customer_type=req.customer_type,
        business_name=req.business_name or "",
        delivery_address=serialize_address_snapshot(req),
        items=[
            schemas.RequestItemOut(
                product_id=i.product_id, product_name=i.product_name, model_number=i.model_number,
                quantity=i.quantity, unit_type=i.unit_type,
            ) for i in req.items
        ],
        status=req.status,
        status_history=[
            schemas.StatusHistoryOut(status=h.status, timestamp=h.timestamp, note=h.note)
            for h in sorted(req.status_history, key=lambda h: h.timestamp)
        ],
        submitted_at=req.submitted_at,
        quotation=serialize_quotation(req.quotation),
    )
    if as_admin:
        if req.supplier_info:
            si = req.supplier_info
            out.supplier_info = schemas.SupplierInfoOut(
                supplier_name=si.supplier_name, supplier_contact=si.supplier_contact,
                supplier_cost=si.supplier_cost, transport_cost=si.transport_cost,
                packaging_cost=si.packaging_cost, other_cost=si.other_cost,
                margin=si.margin, final_price=si.final_price,
            )
        out.private_notes = [
            schemas.PrivateNoteOut(id=n.id, text=n.text, created_at=n.created_at)
            for n in sorted(req.private_notes, key=lambda n: n.created_at)
        ]
    return out
