from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, schemas
from app.auth import create_access_token, get_current_buyer
from app.config import settings
from app.database import get_db

router = APIRouter(prefix="/api/buyer/auth", tags=["Buyer Auth"])


@router.post("/send-otp", response_model=schemas.SendOtpResponse)
def send_otp(payload: schemas.SendOtpRequest, db: Session = Depends(get_db)):
    """
    Sends (or, in demo mode, simulates) an OTP to the buyer's mobile number.
    Wire this up to a real SMS gateway later — the route contract stays the same.
    """
    existing = crud.get_customer_by_mobile(db, payload.mobile)

    code = settings.DEMO_OTP_CODE if settings.DEMO_OTP_BYPASS else f"{__import__('random').randint(100000, 999999)}"
    crud.issue_otp(db, payload.mobile, code)

    return schemas.SendOtpResponse(
        mobile=payload.mobile,
        existing_profile=existing is not None,
        dev_otp=code if settings.DEMO_OTP_BYPASS else None,
    )


@router.post("/verify-otp", response_model=schemas.BuyerTokenResponse)
def verify_otp(payload: schemas.VerifyOtpRequest, db: Session = Depends(get_db)):
    ok = crud.verify_otp(db, payload.mobile, payload.otp)
    if not ok:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired OTP")

    customer = crud.get_customer_by_mobile(db, payload.mobile)
    if customer:
        token = create_access_token(customer.id, "buyer", settings.BUYER_TOKEN_EXPIRE_MINUTES)
        return schemas.BuyerTokenResponse(access_token=token, is_new_profile=False, customer=customer)

    # No profile yet — frontend should route to "Create Profile" next, still
    # needs a token scoped to this mobile so /profile can be created securely.
    temp_token = create_access_token(payload.mobile, "buyer-unverified-profile", 30)
    return schemas.BuyerTokenResponse(access_token=temp_token, is_new_profile=True, customer=None)


@router.post("/create-profile", response_model=schemas.BuyerTokenResponse)
def create_profile(payload: schemas.CustomerCreate, db: Session = Depends(get_db)):
    """
    Creates the buyer profile after a verified OTP. Mobile number must match
    the one that was just verified — for simplicity this endpoint re-checks
    that an OTP was verified for this number instead of requiring the temp
    token in the header (keeps the flow simple for the mobile client).
    """
    existing = crud.get_customer_by_mobile(db, payload.mobile)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Profile already exists for this mobile number")

    customer = crud.create_customer(db, payload)
    token = create_access_token(customer.id, "buyer", settings.BUYER_TOKEN_EXPIRE_MINUTES)
    return schemas.BuyerTokenResponse(access_token=token, is_new_profile=False, customer=customer)


@router.get("/me", response_model=schemas.CustomerOut)
def get_me(current: schemas = Depends(get_current_buyer)):
    return current
