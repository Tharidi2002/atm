-- ======================================================
-- ATM Security Database - Complete Setup Script
-- Database: atm
-- ======================================================

-- 1. Database එක create කරන්න
CREATE DATABASE IF NOT EXISTS `atm`;
USE `atm`;

-- ======================================================
-- 2. Tables Create කරන්න
-- ======================================================

-- 2.1 Users Table
CREATE TABLE `users` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `email` VARCHAR(100),
    `full_name` VARCHAR(100) NOT NULL,
    `role` ENUM('SUPER_ADMIN', 'BANK_ADMIN', 'BRANCH_ADMIN', 'BANK_USER') NOT NULL,
    `bank_id` BIGINT NULL,
    `branch_id` BIGINT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.2 Banks Table
CREATE TABLE `banks` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `bank_code` VARCHAR(50) NOT NULL UNIQUE,
    `bank_name` VARCHAR(100) NOT NULL,
    `address` TEXT,
    `contact_number` VARCHAR(20),
    `email` VARCHAR(100),
    `status` ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    `created_by` BIGINT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.3 Branches Table
CREATE TABLE `branches` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `branch_code` VARCHAR(50) NOT NULL UNIQUE,
    `branch_name` VARCHAR(100) NOT NULL,
    `bank_id` BIGINT NOT NULL,
    `address` TEXT,
    `contact_number` VARCHAR(20),
    `email` VARCHAR(100),
    `status` ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    `created_by` BIGINT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`bank_id`) REFERENCES `banks`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.4 ATM Machines Table
CREATE TABLE `atm_machines` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `atm_code` VARCHAR(50) NOT NULL UNIQUE,
    `bank_id` BIGINT NOT NULL,
    `branch_id` BIGINT NOT NULL,
    `location` VARCHAR(255) NOT NULL,
    `sim_number` VARCHAR(20) NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'MAINTENANCE') DEFAULT 'ACTIVE',
    `created_by` BIGINT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`bank_id`) REFERENCES `banks`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.5 Alert Logs Table
CREATE TABLE `alert_logs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `atm_id` BIGINT NOT NULL,
    `bank_id` BIGINT NOT NULL,
    `branch_id` BIGINT NOT NULL,
    `zone_number` INT DEFAULT 0,
    `zone_numbers` VARCHAR(100) DEFAULT '00',
    `alert_type` VARCHAR(255) NOT NULL,
    `raw_message` TEXT,
    `received_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `status` ENUM('PENDING', 'ACKNOWLEDGED', 'RESOLVED') DEFAULT 'PENDING',
    `acknowledged_by` BIGINT NULL,
    `resolved_by` BIGINT NULL,
    `acknowledged_at` TIMESTAMP NULL,
    `resolved_at` TIMESTAMP NULL,
    `notes` TEXT,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`atm_id`) REFERENCES `atm_machines`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`bank_id`) REFERENCES `banks`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`acknowledged_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`resolved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    INDEX `idx_bank_id` (`bank_id`),
    INDEX `idx_branch_id` (`branch_id`),
    INDEX `idx_received_at` (`received_at` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.6 ATM Zones Table
CREATE TABLE `atm_zones` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `atm_id` BIGINT NOT NULL,
    `zone_number` INT NOT NULL,
    `zone_name` VARCHAR(100) NOT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`atm_id`) REFERENCES `atm_machines`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================================
-- 3. Indexes for Performance
-- ======================================================

CREATE INDEX idx_users_bank_id ON users(bank_id);
CREATE INDEX idx_users_branch_id ON users(branch_id);
CREATE INDEX idx_branches_bank_id ON branches(bank_id);
CREATE INDEX idx_atm_machines_bank_id ON atm_machines(bank_id);
CREATE INDEX idx_atm_machines_branch_id ON atm_machines(branch_id);

-- ======================================================
-- 4. Views
-- ======================================================

-- 4.1 Recent Alerts View
CREATE OR REPLACE VIEW `v_recent_alerts` AS
SELECT 
    al.id,
    al.atm_id,
    al.bank_id,
    al.branch_id,
    am.atm_code,
    am.location,
    al.zone_number,
    al.zone_numbers,
    al.alert_type,
    al.raw_message,
    al.received_at,
    al.status,
    TIMESTAMPDIFF(MINUTE, al.received_at, NOW()) as minutes_ago
FROM alert_logs al
LEFT JOIN atm_machines am ON al.atm_id = am.id
ORDER BY al.received_at DESC
LIMIT 100;

-- 4.2 Alert Summary View
CREATE OR REPLACE VIEW `v_alert_summary` AS
SELECT 
    b.bank_name,
    br.branch_name,
    am.atm_code,
    COUNT(*) as total_alerts,
    SUM(CASE WHEN al.status = 'PENDING' THEN 1 ELSE 0 END) as pending_alerts,
    SUM(CASE WHEN al.status = 'RESOLVED' THEN 1 ELSE 0 END) as resolved_alerts,
    MAX(al.received_at) as last_alert_time
FROM alert_logs al
LEFT JOIN atm_machines am ON al.atm_id = am.id
LEFT JOIN banks b ON al.bank_id = b.id
LEFT JOIN branches br ON al.branch_id = br.id
GROUP BY b.bank_name, br.branch_name, am.atm_code;

-- ======================================================
-- 5. Stored Procedures
-- ======================================================

DELIMITER //

-- 5.1 Get Alerts by Branch
CREATE PROCEDURE `sp_get_branch_alerts`(IN p_branch_id BIGINT)
BEGIN
    SELECT 
        al.*,
        am.atm_code,
        am.location
    FROM alert_logs al
    LEFT JOIN atm_machines am ON al.atm_id = am.id
    WHERE al.branch_id = p_branch_id
    ORDER BY al.received_at DESC;
END //

-- 5.2 Update Alert Status
CREATE PROCEDURE `sp_resolve_alert`(
    IN p_alert_id BIGINT,
    IN p_user_id BIGINT
)
BEGIN
    UPDATE alert_logs 
    SET 
        status = 'RESOLVED',
        resolved_by = p_user_id,
        resolved_at = NOW()
    WHERE id = p_alert_id;
    
    SELECT * FROM alert_logs WHERE id = p_alert_id;
END //

DELIMITER ;

-- ======================================================
-- End of Script - No sample data inserted
-- ======================================================