from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import (
    admin_auth, admin_customers, analytics, buyer_auth, buyer_profile,
    categories, custom_requests, notifications, products, requests, settings,
)
from app.seed import run as seed_run


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_run()
    yield


app = FastAPI(
    title="MZ Source API",
    description="Backend for the MZ Source request-based product sourcing platform.",
    version="1.0.0",
    lifespan=lifespan,
)

# Allow the mobile app / dev server to call the API. Tighten this to your
# real app origin(s) before going to production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(buyer_auth.router)
app.include_router(admin_auth.router)
app.include_router(categories.router)
app.include_router(products.router)
app.include_router(buyer_profile.router)
app.include_router(admin_customers.router)
app.include_router(requests.router)
app.include_router(notifications.router)
app.include_router(custom_requests.router)
app.include_router(analytics.router)
app.include_router(settings.router)


@app.get("/", tags=["Health"])
def health():
    return {"status": "ok", "service": "MZ Source API"}
