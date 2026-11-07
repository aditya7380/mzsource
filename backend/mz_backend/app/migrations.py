"""
Safe, backward-compatible, re-runnable database upgrades.

Nothing here deletes, drops, resets or recreates any table or row.

1. Schema upgrade  - adds products.product_type if the column does not exist yet.
                     (New tables are created by SQLAlchemy's create_all, which
                     never touches tables that already exist.)
2. Data upgrades   - one-time steps, recorded in the app_migrations table so each
                     runs once only. A later restart will NOT repeat a step, so
                     if you deliberately change something back it stays changed.
"""
from datetime import datetime

from sqlalchemy import inspect, text

HIDE_DISPOSABLE_CATEGORY = "2026_hide_disposable_products_category"


def run_schema_migrations(engine) -> None:
    insp = inspect(engine)
    if not insp.has_table("products"):
        return  # brand-new database: create_all already built the full, current schema
    columns = {c["name"] for c in insp.get_columns("products")}
    if "product_type" not in columns:
        with engine.begin() as conn:
            conn.execute(text(
                "ALTER TABLE products ADD COLUMN product_type VARCHAR(20) NOT NULL DEFAULT 'individual'"
            ))
        print("[migrate] added products.product_type (existing products default to 'individual')")


def run_data_migrations(engine) -> None:
    with engine.begin() as conn:
        already = conn.execute(
            text("SELECT 1 FROM app_migrations WHERE name = :n"), {"n": HIDE_DISPOSABLE_CATEGORY}
        ).first()
        if already:
            return
        # Hide (never delete) the retired category. Its products are NOT touched or reassigned.
        result = conn.execute(
            text(
                "UPDATE categories SET active = :off "
                "WHERE lower(name) IN ('disposable products', 'disposal products') AND active = :on"
            ),
            {"off": False, "on": True},
        )
        conn.execute(
            text("INSERT INTO app_migrations (name, applied_at) VALUES (:n, :t)"),
            {"n": HIDE_DISPOSABLE_CATEGORY, "t": datetime.utcnow()},
        )
        print(f"[migrate] hid retired category 'Disposable Products' ({result.rowcount} row updated; products left untouched)")
