-- Aditya Birla Reconciliation Platform - PostgreSQL Database Schema
-- Version: 1.0.0
-- Forensic Compliance: SOC2/SEBI Standards

-- 1. Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    level VARCHAR(20) NOT NULL
);

-- 2. Modules & Permissions Table
CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    module_name VARCHAR(50) NOT NULL,
    role_name VARCHAR(50) NOT NULL,
    is_allowed INT DEFAULT 0,
    CONSTRAINT unique_perm UNIQUE (module_name, role_name)
);

-- 3. Product Masters
CREATE TABLE IF NOT EXISTS masters (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    frequency VARCHAR(20),
    matching_logic VARCHAR(20),
    run_mode VARCHAR(20),
    source_config TEXT,
    status VARCHAR(20) DEFAULT 'Active'
);

-- 4. Reconciliation Run History
CREATE TABLE IF NOT EXISTS run_history (
    id VARCHAR(50) PRIMARY KEY,
    product VARCHAR(100),
    status VARCHAR(20),
    trigger_type VARCHAR(20),
    matched_count VARCHAR(20),
    exception_count VARCHAR(10),
    run_date DATE,
    run_time TIME,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    total_rows INT DEFAULT 0,
    valid_rows INT DEFAULT 0,
    file_name VARCHAR(255)
);

-- 5. Exception Queue
CREATE TABLE IF NOT EXISTS exceptions (
    id VARCHAR(50) PRIMARY KEY,
    amount DECIMAL(18, 2),
    ref_no VARCHAR(100),
    type VARCHAR(50),
    age VARCHAR(10),
    priority VARCHAR(20),
    status VARCHAR(50),
    remarks TEXT,
    recon_master_id INT REFERENCES masters(id) ON DELETE SET NULL,
    run_id VARCHAR(50) REFERENCES run_history(id) ON DELETE SET NULL,
    run_date DATE,
    source_type VARCHAR(50),
    unique_reference_number VARCHAR(100),
    assigned_role VARCHAR(50)
);

-- 6. Forensic Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_name VARCHAR(100),
    action VARCHAR(100),
    module VARCHAR(50),
    detail TEXT,
    log_time TIME,
    log_date DATE,
    type VARCHAR(20),
    forensic_hash VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. User Accounts
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    role_name VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Active',
    password_hash VARCHAR(255)
);

-- 8. System Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100),
    message TEXT,
    time_label VARCHAR(50),
    is_read INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. AI Insights & Suggestions
CREATE TABLE IF NOT EXISTS ai_suggestions (
    id VARCHAR(50) PRIMARY KEY,
    type VARCHAR(50),
    confidence INT,
    detail TEXT,
    recommended_action VARCHAR(100)
);

-- 10. Suggestions Table (For matching candidates)
CREATE TABLE IF NOT EXISTS suggestions (
    id SERIAL PRIMARY KEY,
    exception_id VARCHAR(50),
    candidate_id VARCHAR(50),
    confidence INT,
    reason TEXT
);

-- 11. Recon Results Table
CREATE TABLE IF NOT EXISTS recon_results (
    id SERIAL PRIMARY KEY,
    run_id VARCHAR(50),
    recon_master_id INT,
    reference_number VARCHAR(100),
    amount DECIMAL(18, 2),
    result_type VARCHAR(50),
    exception_type VARCHAR(50),
    status VARCHAR(50),
    transaction_date DATE
);

-- 12. Query Config Table
CREATE TABLE IF NOT EXISTS recon_query_config (
    id SERIAL PRIMARY KEY,
    recon_master_id INT NOT NULL,
    source_label VARCHAR(100) NOT NULL,
    custom_query_template TEXT,
    time_offset_minutes INT,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_master_source UNIQUE (recon_master_id, source_label)
);


-- POPULATE SEED DATA --

-- 1. Roles
INSERT INTO roles (name, description, level) VALUES 
('Admin', 'Complete oversight of platform security and configuration.', 'System'),
('Ops_Maker', 'Responsible for data ingestion and execution.', 'Operational'),
('Ops_Checker', 'Verification authority for results.', 'Operational'),
('CS_User', 'Customer Support - Read-only exceptions.', 'Functional'),
('FRM_User', 'Fraud Risk Management.', 'Functional'),
('BU_User', 'Business Unit - Analytical access.', 'Functional'),
('Auditor', 'Independent audit access.', 'Audit'),
('Compliance', 'Compliance monitoring.', 'Audit'),
('IT_Support', 'Technical infrastructure logs.', 'System'),
('Guest', 'Restricted trial access.', 'Limited')
ON CONFLICT (name) DO NOTHING;

-- 2. Permissions
INSERT INTO permissions (module_name, role_name, is_allowed) VALUES 
('Dashboard', 'Admin', 1), ('Recon Masters', 'Admin', 1), ('Run Recon', 'Admin', 1),
('Run History', 'Admin', 1), ('Exception Queue', 'Admin', 1), ('AI Suggestions', 'Admin', 1),
('Reports', 'Admin', 1), ('Audit Log', 'Admin', 1), ('Users', 'Admin', 1),
('Roles', 'Admin', 1), ('Permissions', 'Admin', 1),
('Dashboard', 'Ops_Maker', 1), ('Run Recon', 'Ops_Maker', 1), ('Run History', 'Ops_Maker', 1),
('Exception Queue', 'Ops_Maker', 1), ('AI Suggestions', 'Ops_Maker', 1),
('Dashboard', 'Ops_Checker', 1), ('Exception Queue', 'Ops_Checker', 1), ('Reports', 'Ops_Checker', 1),
('Dashboard', 'CS_User', 1), ('Exception Queue', 'CS_User', 1),
('Dashboard', 'BU_User', 1), ('Exception Queue', 'BU_User', 1)
ON CONFLICT ON CONSTRAINT unique_perm DO NOTHING;

-- 3. Users (Seeding default hashed password 'password123')
INSERT INTO users (name, employee_id, role_name, status, password_hash) VALUES 
('Aditya Birla', 'ABC001', 'Admin', 'Active', '$2b$10$v8Y9X0BPen8id.Jwh3KLdOLtD0Oi61pgph6XYeTKg7FHnISSy75Hm'),
('Rajesh Kumar', 'ABC002', 'Ops_Maker', 'Active', '$2b$10$v8Y9X0BPen8id.Jwh3KLdOLtD0Oi61pgph6XYeTKg7FHnISSy75Hm'),
('Sneha Sharma', 'ABC003', 'Ops_Checker', 'Active', '$2b$10$v8Y9X0BPen8id.Jwh3KLdOLtD0Oi61pgph6XYeTKg7FHnISSy75Hm')
ON CONFLICT (employee_id) DO NOTHING;

-- 4. Recon Masters
INSERT INTO masters (name, frequency, matching_logic, run_mode, source_config, status) VALUES 
('Cash Back Daily Automatic', 'Daily', '2-Way', 'Automatic', '[{"id": 1, "name": "Wallet DB", "type": "Automatic", "tableName": "wallet_txns"}, {"id": 2, "name": "Marketing Ledger", "type": "Automatic", "tableName": "marketing_ledger"}]', 'Active'),
('BBPS Daily Automatic', 'Daily', '3-Way', 'Automatic', '[{"id": 1, "name": "NPCI Report", "type": "Automatic", "tableName": "npci_bbps_txns"}, {"id": 2, "name": "Internal Biller DB", "type": "Automatic", "tableName": "biller_logs"}, {"id": 3, "name": "Settlement File", "type": "Manual Upload"}]', 'Active'),
('DigiGold Weekly Manual', 'Weekly', '2-Way', 'Manual', '[{"id": 1, "name": "MMTC PAMP Statement", "type": "Manual Upload"}, {"id": 2, "name": "Internal Gold Ledger", "type": "Manual Upload"}]', 'Active'),
('UPI Settlement Daily API', 'Daily', '2-Way', 'API-Based', '[{"id": 1, "name": "UPI Gateway API", "type": "API-Based", "apiUrl": "https://api.upi-gateway.com/v1/settlements"}, {"id": 2, "name": "Bank Nodal Account", "type": "Automatic", "tableName": "bank_nodal_txns"}]', 'Active')
ON CONFLICT (name) DO NOTHING;

-- 5. System Notifications
INSERT INTO notifications (title, message, time_label, is_read) VALUES 
('Recon Run Success', 'BBPS Daily run completed with 12 exceptions.', '2h ago', 0),
('Permission Update', 'Admin role modified module access grid.', '5h ago', 1);
