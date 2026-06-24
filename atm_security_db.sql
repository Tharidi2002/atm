-- *. ප්‍රොජෙක්ට් එකට අලුත් Database එකක් සෑදීම
CREATE DATABASE atm_security_db;
USE atm_security_db;

-- 1. ATM යන්ත්‍ර වගුව (BIGINT සමඟ)
CREATE TABLE atm_machines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    atm_code VARCHAR(50) UNIQUE NOT NULL,
    location VARCHAR(255) NOT NULL,
    sim_number VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE'
);

-- 2. කලාප (Zones) වගුව (BIGINT සමඟ)
CREATE TABLE atm_zones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    atm_id BIGINT,
    zone_number INT NOT NULL,
    zone_name VARCHAR(100) NOT NULL,
    FOREIGN KEY (atm_id) REFERENCES atm_machines(id) ON DELETE CASCADE
);

-- 3. අනතුරු ඇඟවීම් (Alert Logs) වගුව (BIGINT සමඟ)
CREATE TABLE alert_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    atm_id BIGINT,
    zone_number INT,
    alert_type VARCHAR(100) NOT NULL,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'PENDING',
    FOREIGN KEY (atm_id) REFERENCES atm_machines(id) ON DELETE CASCADE
);

INSERT INTO atm_machines (atm_code, location, sim_number, status) 
VALUES ('ATM-MAIN-01', 'Colombo 03', '0772032675', 'ACTIVE');

