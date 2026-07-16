CREATE DATABASE IF NOT EXISTS sureserve_db;
USE sureserve_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(30) DEFAULT '',
  address TEXT DEFAULT NULL,
  role ENUM('buyer', 'provider', 'admin') DEFAULT 'buyer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
  id INT AUTO_INCREMENT PRIMARY KEY,
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
  id INT AUTO_INCREMENT PRIMARY KEY,
  buyer_id INT NOT NULL,
  service_id INT NOT NULL,
  status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  ticket_type VARCHAR(100) NOT NULL,
  priority ENUM('Low', 'Normal', 'High', 'Urgent') DEFAULT 'Normal',
  contact_person VARCHAR(100) DEFAULT '',
  phone VARCHAR(30) DEFAULT '',
  description TEXT,
  status ENUM('Pending', 'Processing', 'Finished', 'Cancelled') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS service_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  service_type VARCHAR(100) NOT NULL,
  priority ENUM('Low', 'Normal', 'High') DEFAULT 'Normal',
  location TEXT NOT NULL,
  contact_person VARCHAR(100) DEFAULT '',
  phone VARCHAR(30) DEFAULT '',
  preferred_date DATE DEFAULT NULL,
  preferred_time VARCHAR(30) DEFAULT '',
  description TEXT,
  status ENUM('Pending', 'Processing', 'Finished', 'Cancelled') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed a default provider/admin account for seller portal
INSERT IGNORE INTO users (id, full_name, email, password, role)
VALUES (1, 'TechKing Store', 'seller@techking.com',
        '$2b$12$LJ3m4ys3GZ9RqFzKJ7KzXOQJ5E0v5z5y5z5y5z5y5z5y5z5y5z5y5',
        'provider');
