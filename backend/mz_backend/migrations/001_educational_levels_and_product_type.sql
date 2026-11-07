-- OPTIONAL. You do NOT need to run this file.
-- The backend performs exactly these steps by itself when it starts (see app/migrations.py),
-- safely and only once. It is provided for people who prefer to apply the upgrade by hand
-- or want to see exactly what changes. It is written to be re-runnable and never deletes data.

-- 1. Product type (every existing product becomes an 'individual' product)
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_type VARCHAR(20) NOT NULL DEFAULT 'individual';

CREATE TABLE IF NOT EXISTS educational_levels (
	id VARCHAR NOT NULL, 
	group_name VARCHAR NOT NULL, 
	group_order INTEGER NOT NULL, 
	name VARCHAR NOT NULL, 
	sort_order INTEGER NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT uq_educational_level_group_name UNIQUE (group_name, name)
);

CREATE TABLE IF NOT EXISTS product_educational_levels (
	product_id VARCHAR NOT NULL, 
	level_id VARCHAR NOT NULL, 
	PRIMARY KEY (product_id, level_id), 
	FOREIGN KEY(product_id) REFERENCES products (id) ON DELETE CASCADE, 
	FOREIGN KEY(level_id) REFERENCES educational_levels (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS app_migrations (
	name VARCHAR NOT NULL, 
	applied_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (name)
);

-- 2. The fixed educational levels (no duplicates possible: fixed ids)
INSERT INTO educational_levels (id, group_name, group_order, name, sort_order) VALUES ('early-ukg', 'Early Learning', 1, 'UKG', 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO educational_levels (id, group_name, group_order, name, sort_order) VALUES ('early-class-1-2', 'Early Learning', 1, 'Class 1–2', 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO educational_levels (id, group_name, group_order, name, sort_order) VALUES ('early-class-3-5', 'Early Learning', 1, 'Class 3–5', 3) ON CONFLICT (id) DO NOTHING;
INSERT INTO educational_levels (id, group_name, group_order, name, sort_order) VALUES ('middle-class-6-8', 'Middle School', 2, 'Class 6–8', 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO educational_levels (id, group_name, group_order, name, sort_order) VALUES ('secondary-class-9-10', 'Secondary School', 3, 'Class 9–10', 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO educational_levels (id, group_name, group_order, name, sort_order) VALUES ('senior-class-11-12', 'Senior Secondary', 4, 'Class 11–12', 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO educational_levels (id, group_name, group_order, name, sort_order) VALUES ('ug-diploma', 'Diploma and Undergraduate', 5, 'Diploma', 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO educational_levels (id, group_name, group_order, name, sort_order) VALUES ('ug-bsc', 'Diploma and Undergraduate', 5, 'B.Sc.', 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO educational_levels (id, group_name, group_order, name, sort_order) VALUES ('ug-btech-be', 'Diploma and Undergraduate', 5, 'B.Tech / B.E.', 3) ON CONFLICT (id) DO NOTHING;
INSERT INTO educational_levels (id, group_name, group_order, name, sort_order) VALUES ('ug-other', 'Diploma and Undergraduate', 5, 'Other Undergraduate Programmes', 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO educational_levels (id, group_name, group_order, name, sort_order) VALUES ('pg-msc', 'Postgraduate', 6, 'M.Sc.', 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO educational_levels (id, group_name, group_order, name, sort_order) VALUES ('pg-mtech-me', 'Postgraduate', 6, 'M.Tech / M.E.', 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO educational_levels (id, group_name, group_order, name, sort_order) VALUES ('pg-other', 'Postgraduate', 6, 'Other Postgraduate Programmes', 3) ON CONFLICT (id) DO NOTHING;
INSERT INTO educational_levels (id, group_name, group_order, name, sort_order) VALUES ('res-phd', 'Research and Advanced Projects', 7, 'PhD / Research Projects', 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO educational_levels (id, group_name, group_order, name, sort_order) VALUES ('res-prototyping', 'Research and Advanced Projects', 7, 'Advanced Prototyping', 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO educational_levels (id, group_name, group_order, name, sort_order) VALUES ('res-professional', 'Research and Advanced Projects', 7, 'Professional and Advanced Development', 3) ON CONFLICT (id) DO NOTHING;

-- 3. Hide (never delete) the retired category. Its products are NOT touched or reassigned.
UPDATE categories SET active = false WHERE lower(name) IN ('disposable products', 'disposal products')
  AND NOT EXISTS (SELECT 1 FROM app_migrations WHERE name = '2026_hide_disposable_products_category');
INSERT INTO app_migrations (name, applied_at) VALUES ('2026_hide_disposable_products_category', now()) ON CONFLICT (name) DO NOTHING;
