CREATE TABLE admin_users (
	id VARCHAR NOT NULL, 
	username VARCHAR NOT NULL, 
	password_hash VARCHAR NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	UNIQUE (username)
);

CREATE TABLE categories (
	id VARCHAR NOT NULL, 
	name VARCHAR NOT NULL, 
	description TEXT, 
	icon VARCHAR, 
	color VARCHAR, 
	bg_color VARCHAR, 
	active BOOLEAN, 
	PRIMARY KEY (id)
);

CREATE TABLE customers (
	id VARCHAR NOT NULL, 
	full_name VARCHAR NOT NULL, 
	mobile VARCHAR NOT NULL, 
	customer_type customertype, 
	business_name VARCHAR, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id)
);

CREATE TABLE otp_codes (
	id VARCHAR NOT NULL, 
	mobile VARCHAR NOT NULL, 
	code VARCHAR NOT NULL, 
	expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	verified BOOLEAN, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id)
);

CREATE TABLE addresses (
	id VARCHAR NOT NULL, 
	customer_id VARCHAR NOT NULL, 
	label VARCHAR, 
	building VARCHAR, 
	street VARCHAR, 
	locality VARCHAR, 
	sector VARCHAR, 
	city VARCHAR, 
	district VARCHAR, 
	state VARCHAR, 
	pin_code VARCHAR, 
	landmark VARCHAR, 
	lat FLOAT, 
	lng FLOAT, 
	is_default BOOLEAN, 
	PRIMARY KEY (id), 
	FOREIGN KEY(customer_id) REFERENCES customers (id)
);

CREATE TABLE custom_product_requests (
	id VARCHAR NOT NULL, 
	customer_id VARCHAR NOT NULL, 
	customer_name VARCHAR NOT NULL, 
	product_name VARCHAR NOT NULL, 
	required_quantity VARCHAR, 
	description TEXT, 
	reference_image_url VARCHAR, 
	submitted_at TIMESTAMP WITHOUT TIME ZONE, 
	status customrequeststatus, 
	PRIMARY KEY (id), 
	FOREIGN KEY(customer_id) REFERENCES customers (id)
);

CREATE TABLE requests (
	id VARCHAR NOT NULL, 
	customer_id VARCHAR NOT NULL, 
	customer_name VARCHAR NOT NULL, 
	customer_mobile VARCHAR NOT NULL, 
	customer_type customertype NOT NULL, 
	business_name VARCHAR, 
	addr_label VARCHAR, 
	addr_building VARCHAR, 
	addr_street VARCHAR, 
	addr_locality VARCHAR, 
	addr_sector VARCHAR, 
	addr_city VARCHAR, 
	addr_district VARCHAR, 
	addr_state VARCHAR, 
	addr_pin_code VARCHAR, 
	addr_landmark VARCHAR, 
	addr_lat FLOAT, 
	addr_lng FLOAT, 
	status requeststatus, 
	submitted_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(customer_id) REFERENCES customers (id)
);

CREATE TABLE subcategories (
	id VARCHAR NOT NULL, 
	category_id VARCHAR NOT NULL, 
	name VARCHAR NOT NULL, 
	active BOOLEAN, 
	PRIMARY KEY (id), 
	FOREIGN KEY(category_id) REFERENCES categories (id)
);

CREATE TABLE notifications (
	id VARCHAR NOT NULL, 
	title VARCHAR NOT NULL, 
	message TEXT NOT NULL, 
	type notificationtype, 
	read BOOLEAN, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	request_id VARCHAR, 
	customer_id VARCHAR, 
	is_admin BOOLEAN, 
	PRIMARY KEY (id), 
	FOREIGN KEY(request_id) REFERENCES requests (id), 
	FOREIGN KEY(customer_id) REFERENCES customers (id)
);

CREATE TABLE private_notes (
	id VARCHAR NOT NULL, 
	request_id VARCHAR NOT NULL, 
	text TEXT NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(request_id) REFERENCES requests (id)
);

CREATE TABLE products (
	id VARCHAR NOT NULL, 
	name VARCHAR NOT NULL, 
	category_id VARCHAR NOT NULL, 
	subcategory_id VARCHAR, 
	model_number VARCHAR, 
	description TEXT, 
	specifications TEXT, 
	unit_type unittype, 
	availability availabilitystatus, 
	image_color VARCHAR, 
	image_url VARCHAR, 
	active BOOLEAN, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(category_id) REFERENCES categories (id), 
	FOREIGN KEY(subcategory_id) REFERENCES subcategories (id)
);

CREATE TABLE quotations (
	id VARCHAR NOT NULL, 
	request_id VARCHAR NOT NULL, 
	subtotal FLOAT, 
	other_charges FLOAT, 
	other_charges_note VARCHAR, 
	total_amount FLOAT, 
	validity_days INTEGER, 
	admin_message TEXT, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	UNIQUE (request_id), 
	FOREIGN KEY(request_id) REFERENCES requests (id)
);

CREATE TABLE status_history (
	id VARCHAR NOT NULL, 
	request_id VARCHAR NOT NULL, 
	status requeststatus NOT NULL, 
	note TEXT, 
	timestamp TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(request_id) REFERENCES requests (id)
);

CREATE TABLE supplier_info (
	id VARCHAR NOT NULL, 
	request_id VARCHAR NOT NULL, 
	supplier_name VARCHAR, 
	supplier_contact VARCHAR, 
	supplier_cost FLOAT, 
	transport_cost FLOAT, 
	packaging_cost FLOAT, 
	other_cost FLOAT, 
	margin FLOAT, 
	final_price FLOAT, 
	PRIMARY KEY (id), 
	UNIQUE (request_id), 
	FOREIGN KEY(request_id) REFERENCES requests (id)
);

CREATE TABLE quotation_items (
	id VARCHAR NOT NULL, 
	quotation_id VARCHAR NOT NULL, 
	product_id VARCHAR, 
	product_name VARCHAR NOT NULL, 
	quantity INTEGER NOT NULL, 
	unit_type VARCHAR, 
	unit_price FLOAT, 
	total FLOAT, 
	PRIMARY KEY (id), 
	FOREIGN KEY(quotation_id) REFERENCES quotations (id)
);

CREATE TABLE request_items (
	id VARCHAR NOT NULL, 
	request_id VARCHAR NOT NULL, 
	product_id VARCHAR, 
	product_name VARCHAR NOT NULL, 
	model_number VARCHAR, 
	quantity INTEGER NOT NULL, 
	unit_type unittype, 
	PRIMARY KEY (id), 
	FOREIGN KEY(request_id) REFERENCES requests (id), 
	FOREIGN KEY(product_id) REFERENCES products (id)
);
