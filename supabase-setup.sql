-- Supabase Schema and Seed Data for StayGrid

-- 1. Create Tables

CREATE TABLE properties (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('pg', 'hostel')),
  gender VARCHAR(50) NOT NULL CHECK (gender IN ('boys', 'girls', 'coed')),
  city VARCHAR(100) NOT NULL,
  area VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  rating DECIMAL(3, 1),
  reviews INTEGER DEFAULT 0,
  description TEXT,
  phone VARCHAR(20),
  whatsapp VARCHAR(20),
  featured BOOLEAN DEFAULT false,
  established INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE property_prices (
  property_id INTEGER PRIMARY KEY REFERENCES properties(id) ON DELETE CASCADE,
  single INTEGER,
  double INTEGER,
  triple INTEGER
);

CREATE TABLE property_amenities (
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  amenity VARCHAR(50) NOT NULL,
  PRIMARY KEY (property_id, amenity)
);

CREATE TABLE property_images (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE property_rules (
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  rule TEXT NOT NULL,
  PRIMARY KEY (property_id, rule)
);

CREATE TABLE testimonials (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  city VARCHAR(100),
  property VARCHAR(100),
  rating INTEGER,
  text TEXT NOT NULL,
  avatar VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE enquiries (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20) NOT NULL,
  subject VARCHAR(100),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Insert Seed Data (Sample Properties)

INSERT INTO properties (id, name, slug, type, gender, city, area, address, rating, reviews, description, phone, whatsapp, featured, established) VALUES
(1, 'Sterling Boys PG', 'sterling-boys-pg', 'pg', 'boys', 'Greater Noida', 'Knowledge Park III', 'Plot 45, Knowledge Park III, Near Sharda University', 4.8, 124, 'Premium boys PG with top-notch facilities and food.', '+919876543210', '+919876543210', true, 2019),
(2, 'Aurora Girls Hostel', 'aurora-girls-hostel', 'hostel', 'girls', 'Greater Noida', 'Pari Chowk', 'Block B, Pari Chowk, Greater Noida', 4.5, 89, 'Safe and secure hostel for girls with 24/7 security.', '+919876543211', '+919876543211', true, 2021);

-- Note: In a real migration, you would insert all 12 properties here.

INSERT INTO property_prices (property_id, single, double, triple) VALUES
(1, 10000, 7500, 5500),
(2, 9000, 6500, 5000);

INSERT INTO property_amenities (property_id, amenity) VALUES
(1, 'wifi'), (1, 'ac'), (1, 'food'), (1, 'laundry'), (1, 'power-backup'), (1, 'security'), (1, 'cleaning'),
(2, 'wifi'), (2, 'ac'), (2, 'food'), (2, 'security'), (2, 'cleaning');

INSERT INTO property_images (property_id, url, sort_order) VALUES
(1, '/images/pg_room_boys_1.jpg', 1), (1, '/images/premium_pg_room.jpg', 2), (1, '/images/pg_building_exterior.jpg', 3),
(2, '/images/pg_room_girls_1.jpg', 1), (2, '/images/hostel_exterior.jpg', 2);

INSERT INTO testimonials (name, city, property, rating, text, avatar) VALUES
('Rahul Kumar', 'Greater Noida', 'Sterling Boys PG', 5, 'Great place to stay. The food is amazing.', 'RK'),
('Priya Sharma', 'Greater Noida', 'Aurora Girls Hostel', 4, 'Very safe and comfortable.', 'PS');
