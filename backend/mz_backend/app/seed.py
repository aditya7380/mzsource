"""
Creates all tables (if they don't exist yet) and seeds:
  - the single Admin user (from .env ADMIN_USERNAME/ADMIN_PASSWORD)
  - default platform Settings row (business name, admin contact phone, etc.)
  - the exact categories + subcategories + 20 products from the Figma
    reference design (figma_seed_data.json), so the seeded catalogue matches
    the approved UI/UX exactly (same names, model numbers, colors, icons)
  - a demo buyer (9999999999) so the OTP demo flow has something to log into

Safe to run multiple times — it only inserts what's missing.
"""
import json
from pathlib import Path

from app.auth import hash_password
from app.config import settings as app_settings
from app.database import Base, SessionLocal, engine
from app import models

DATA_FILE = Path(__file__).parent / "figma_seed_data.json"


def load_figma_data():
    with open(DATA_FILE) as f:
        return json.load(f)


def run():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        data = load_figma_data()

        # --- Admin user -----------------------------------------------------
        if not db.query(models.AdminUser).filter(models.AdminUser.username == app_settings.ADMIN_USERNAME).first():
            db.add(models.AdminUser(username=app_settings.ADMIN_USERNAME, password_hash=hash_password(app_settings.ADMIN_PASSWORD)))
            db.commit()
            print(f"[seed] created admin user '{app_settings.ADMIN_USERNAME}'")

        # --- Settings (singleton) -------------------------------------------
        if not db.query(models.Settings).filter(models.Settings.id == "default").first():
            db.add(models.Settings(
                id="default",
                business_name="MZ Source",
                tagline="Local Products. Easy Requests.",
                phone="+91 9876543210",
                email="contact@mzsource.in",
                address="Aizawl, Mizoram, India — 796001",
                operating_area="Mizoram, India",
            ))
            db.commit()
            print("[seed] created default settings row")

        # --- Categories + Subcategories (exact Figma reference data) --------
        # Maps the Figma mock's local ids (e.g. 'cat-1', 'sub-1-2') to the
        # real DB-generated ids, so products below can be linked correctly.
        figma_cat_id_map: dict[str, str] = {}
        figma_sub_id_map: dict[str, str] = {}

        for cat_data in data["categories"]:
            existing = db.query(models.Category).filter(models.Category.name == cat_data["name"]).first()
            if existing:
                figma_cat_id_map[cat_data["id"]] = existing.id
                for sub in existing.subcategories:
                    matching = next((s for s in cat_data["subcategories"] if s["name"] == sub.name), None)
                    if matching:
                        figma_sub_id_map[matching["id"]] = sub.id
                continue

            cat = models.Category(
                name=cat_data["name"], description=cat_data["description"], icon=cat_data["icon"],
                color=cat_data["color"], bg_color=cat_data["bgColor"], active=True,
            )
            db.add(cat)
            db.flush()
            figma_cat_id_map[cat_data["id"]] = cat.id

            for sub_data in cat_data["subcategories"]:
                sub = models.Subcategory(category_id=cat.id, name=sub_data["name"], active=True)
                db.add(sub)
                db.flush()
                figma_sub_id_map[sub_data["id"]] = sub.id

            print(f"[seed] created category '{cat.name}' with {len(cat_data['subcategories'])} subcategories")
        db.commit()

        # --- Products (exact Figma reference data, 20 products) -------------
        unit_type_map = {u.value: u for u in models.UnitType}
        availability_map = {a.value: a for a in models.AvailabilityStatus}

        created_count = 0
        for p in data["products"]:
            if db.query(models.Product).filter(models.Product.model_number == p["modelNumber"]).first():
                continue
            db.add(models.Product(
                name=p["name"],
                category_id=figma_cat_id_map[p["categoryId"]],
                subcategory_id=figma_sub_id_map.get(p["subcategoryId"]),
                model_number=p["modelNumber"],
                description=p["description"],
                specifications=p["specifications"],
                unit_type=unit_type_map.get(p["unitType"], models.UnitType.Piece),
                availability=availability_map.get(p["availability"], models.AvailabilityStatus.In_Stock),
                image_color=p["imageColor"],
                active=True,
            ))
            created_count += 1
        db.commit()
        print(f"[seed] product catalogue ready ({db.query(models.Product).count()} products, {created_count} newly created)")

        # --- Demo buyer -----------------------------------------------------
        if not db.query(models.Customer).filter(models.Customer.mobile == "9999999999").first():
            from app import crud, schemas
            demo = crud.create_customer(db, schemas.CustomerCreate(
                full_name="Lalthansanga Sailo", mobile="9999999999", customer_type=models.CustomerType.Shopkeeper,
                business_name="Sailo Electronics & Gifts", address=schemas.AddressCreate(
                    label="Shop", building="Sailo Complex, Ground Floor", street="Zarkawt Road", locality="Zarkawt",
                    city="Aizawl", district="Aizawl", state="Mizoram", pin_code="796001",
                    landmark="Near Zarkawt Market", is_default=True,
                ),
            ))
            print(f"[seed] created demo buyer {demo.id} (mobile 9999999999)")
    finally:
        db.close()


if __name__ == "__main__":
    run()
