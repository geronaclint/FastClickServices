-- PostgreSQL schema for SureServe

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(30) DEFAULT '',
  address TEXT DEFAULT NULL,
  role VARCHAR(20) DEFAULT 'buyer',
  subscription VARCHAR(50) DEFAULT 'Free',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ratings (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  item_type VARCHAR(20) NOT NULL, -- 'ticket' or 'service'
  item_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(item_type, item_id)
);

CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  provider_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  buyer_id INT NOT NULL,
  service_id INT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  ticket_type VARCHAR(100) NOT NULL,
  priority VARCHAR(20) DEFAULT 'Normal',
  contact_person VARCHAR(100) DEFAULT '',
  phone VARCHAR(30) DEFAULT '',
  description TEXT,
  preferred_date DATE DEFAULT NULL,
  status VARCHAR(20) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS service_requests (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  service_type VARCHAR(100) NOT NULL,
  priority VARCHAR(20) DEFAULT 'Normal',
  location TEXT NOT NULL,
  contact_person VARCHAR(100) DEFAULT '',
  phone VARCHAR(30) DEFAULT '',
  preferred_date DATE DEFAULT NULL,
  preferred_time VARCHAR(30) DEFAULT '',
  description TEXT,
  status VARCHAR(20) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add phone and address columns to users if they don't exist
-- (safe to run multiple times — PostgreSQL will raise a notice but not error with IF NOT EXISTS in newer versions)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone') THEN
    ALTER TABLE users ADD COLUMN phone VARCHAR(30) DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'address') THEN
    ALTER TABLE users ADD COLUMN address TEXT DEFAULT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'subscription') THEN
    ALTER TABLE users ADD COLUMN subscription VARCHAR(50) DEFAULT 'Free';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tickets' AND column_name = 'preferred_date') THEN
    ALTER TABLE tickets ADD COLUMN preferred_date DATE DEFAULT NULL;
  END IF;
END $$;
