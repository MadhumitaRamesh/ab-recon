-- Additional Dummy Data for Full Coverage
USE ab_recon_db;

-- 1. Populating Permissions (Admin has all access)
INSERT IGNORE INTO permissions (module_name, role_name, is_allowed) VALUES 
('Dashboard', 'Admin', 1), ('Recon Masters', 'Admin', 1), ('Run Recon', 'Admin', 1),
('Run History', 'Admin', 1), ('Exception Queue', 'Admin', 1), ('AI Suggestions', 'Admin', 1),
('Reports', 'Admin', 1), ('Audit Log', 'Admin', 1), ('Users', 'Admin', 1),
('Roles', 'Admin', 1), ('Permissions', 'Admin', 1);

-- 2. Populating Permissions (Ops Maker)
INSERT IGNORE INTO permissions (module_name, role_name, is_allowed) VALUES 
('Dashboard', 'Ops_Maker', 1), ('Run Recon', 'Ops_Maker', 1), ('Run History', 'Ops_Maker', 1),
('Exception Queue', 'Ops_Maker', 1);

-- 3. Populating Exceptions
INSERT IGNORE INTO exceptions (id, amount, ref_no, type, age, priority, status) VALUES 
('TXN-4122', 15000.00, 'ABC123456789', 'Amount Mismatch', '48h', 'High', 'Unresolved'),
('TXN-4123', 2500.00, 'DEP-998877', 'Missing Entry', '24h', 'Medium', 'Pending Review'),
('TXN-4124', 50000.00, 'WD-554433', 'Duplicate', '5h', 'High', 'Investigating');

-- 4. Populating Notifications
INSERT IGNORE INTO notifications (title, message, time_label, is_read) VALUES 
('Recon Run Success', 'BBPS Daily run completed with 12 exceptions.', '2h ago', 0),
('Permission Update', 'Admin role modified module access grid.', '5h ago', 1);
