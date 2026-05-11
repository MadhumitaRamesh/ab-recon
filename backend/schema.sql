-- Aditya Birla Reconciliation Platform - Database Schema
-- Version: 1.0.0
-- Forensic Compliance: SOC2/SEBI Standards

CREATE DATABASE IF NOT EXISTS ab_recon_db;
USE ab_recon_db;

-- 1. Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    level VARCHAR(20) NOT NULL
);

-- 2. Modules & Permissions Table
CREATE TABLE IF NOT EXISTS permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    module_name VARCHAR(50) NOT NULL,
    role_name VARCHAR(50) NOT NULL,
    is_allowed BOOLEAN DEFAULT FALSE,
    UNIQUE KEY unique_perm (module_name, role_name)
);

-- 3. Product Masters
CREATE TABLE IF NOT EXISTS masters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    frequency VARCHAR(20),
    type VARCHAR(20),
    sources VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Active'
);

-- 4. Exception Queue
CREATE TABLE IF NOT EXISTS exceptions (
    id VARCHAR(20) PRIMARY KEY,
    amount DECIMAL(18, 2),
    ref_no VARCHAR(100),
    type VARCHAR(50),
    age VARCHAR(10),
    priority VARCHAR(20),
    status VARCHAR(50),
    remarks TEXT
);

-- 5. Forensic Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(100),
    action VARCHAR(100),
    module VARCHAR(50),
    detail TEXT,
    log_time TIME,
    log_date DATE,
    type VARCHAR(20),
    forensic_hash VARCHAR(64)
);

-- 6. Reconciliation Run History
CREATE TABLE IF NOT EXISTS run_history (
    id VARCHAR(20) PRIMARY KEY,
    product VARCHAR(100),
    status VARCHAR(20),
    matched_count VARCHAR(20),
    exception_count VARCHAR(10),
    run_time TIME,
    run_date DATE
);

-- 7. User Accounts
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    role_name VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Active'
);

-- 8. System Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100),
    message TEXT,
    time_label VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. AI Insights & Suggestions
CREATE TABLE IF NOT EXISTS ai_suggestions (
    id VARCHAR(20) PRIMARY KEY,
    type VARCHAR(50),
    confidence INT,
    detail TEXT,
    recommended_action VARCHAR(100)
);

-- POPULATE DUMMY DATA --

-- Roles
INSERT INTO roles (name, description, level) VALUES 
('Admin', 'Complete oversight of platform security and configuration.', 'System'),
('Ops_Maker', 'Responsible for data ingestion and execution.', 'Operational'),
('Ops_Checker', 'Verification authority for results.', 'Operational'),
('CS User', 'Read-only access for reports.', 'Support'),
('BU_User', 'Business unit specific view.', 'Business');

-- Users
INSERT INTO users (name, employee_id, role_name, status) VALUES 
('Admin User', 'ABC001', 'Admin', 'Active'),
('Suresh K', 'ABC002', 'Ops_Maker', 'Active'),
('Meera N', 'ABC003', 'Ops_Checker', 'Active');

-- Product Masters
INSERT INTO masters (name, frequency, type, sources, status) VALUES 
('Cash Back', 'Daily', 'Automatic', '2-Way', 'Active'),
('BBPS', 'Daily', 'Manual', '3-Way', 'Active'),
('DigiGold', 'Weekly', 'API-based', '2-Way', 'Active');

-- Run History
INSERT INTO run_history (id, product, status, matched_count, exception_count, run_time, run_date) VALUES 
('RUN-992', 'BBPS Daily', 'Completed', '4,210', '12', '14:20:00', '2026-05-06'),
('RUN-991', 'Cash Back', 'Failed', '0', '0', '13:05:00', '2026-05-06');

-- Audit Logs
INSERT INTO audit_logs (user_name, action, module, detail, log_time, log_date, type, forensic_hash) VALUES 
('Admin User', 'Update Permission', 'Access', 'Changed BBPS role access matrix', '10:45:00', '2026-05-06', 'Security', '8d8a7f6e5d4c'),
('Ops Maker', 'Manual Run', 'Run Recon', 'Triggered DigiGold Daily API', '09:30:00', '2026-05-06', 'System', '1a2b3c4d5e6f');

-- AI Suggestions
INSERT INTO ai_suggestions (id, type, confidence, detail, recommended_action) VALUES 
('AI-201', 'Pattern Match', 98, 'Recurring ₹5,000 mismatch detected in UPI logs.', 'Bulk Resolve'),
('AI-202', 'Anomaly Detection', 85, 'Transaction TXN-8821 shows 48h settlement lag.', 'Flag for Review');

-- Exceptions
INSERT INTO exceptions (id, amount, ref_no, type, age, priority, status) VALUES 
('TXN-4122', 15000.00, 'ABC123456789', 'Amount Mismatch', '48h', 'High', 'Unresolved'),
('TXN-4123', 2500.00, 'DEP-998877', 'Missing Entry', '24h', 'Medium', 'Pending Review'),
('TXN-4124', 50000.00, 'UPI-776655', 'Duplicate', '72h', 'High', 'Unresolved'),
('TXN-4125', 1240.50, 'BBPS-223344', 'Variance', '12h', 'Low', 'Investigating'),
('TXN-4126', 8900.00, 'CASH-112233', 'Source Mismatch', '36h', 'Medium', 'Unresolved');
