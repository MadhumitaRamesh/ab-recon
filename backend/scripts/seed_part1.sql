USE ab_recon_db;
DELETE FROM suggestions;
DELETE FROM exceptions;
DELETE FROM audit_logs;
DELETE FROM run_history;
DELETE FROM masters;

INSERT INTO masters (name, frequency, matching_logic, run_mode, source_config, status) VALUES
('Cash Back Daily','Daily','2-way','Automatic','[{"id":"A","name":"CB Transactions","type":"Automatic","tableName":"cb_transactions","dateColumn":"transaction_date","productColumn":"product_type"},{"id":"B","name":"CB Settlements","type":"Automatic","tableName":"cb_settlements","dateColumn":"settlement_date","productColumn":"product_code"}]','Active'),
('BBPS Bill Payments','Daily','2-way','API-Based','[{"id":"A","name":"BBPS API","type":"API-Based","apiUrl":"https://api.bbps.internal/transactions","apiKey":"BBPS-KEY-2026-DEMO"},{"id":"B","name":"BBPS Ledger","type":"Automatic","tableName":"bbps_ledger","dateColumn":"ledger_date","productColumn":"product_name"}]','Active'),
('DigiGold Weekly','Weekly','3-way','Manual','[{"id":"A","name":"Bank Statement","type":"Manual Upload"},{"id":"B","name":"Gold Vault Records","type":"Manual Upload"},{"id":"C","name":"DigiGold API","type":"API-Based","apiUrl":"https://api.digigold.internal/holdings","apiKey":"DG-KEY-2026-DEMO"}]','Active'),
('UPI Settlement','Daily','2-way','Automatic','[{"id":"A","name":"UPI Transactions","type":"Automatic","tableName":"upi_transactions","dateColumn":"txn_date","productColumn":"product_type"},{"id":"B","name":"NPCI API","type":"API-Based","apiUrl":"https://api.npci.internal/upi","apiKey":"UPI-KEY-2026-DEMO"}]','Active'),
('PPI Wallet Reconciliation','Monthly','1-way','Manual','[{"id":"A","name":"Wallet Transaction Dump","type":"Manual Upload"}]','Active'),
('Mutual Fund NAV Check','Daily','3-way','Automatic','[{"id":"A","name":"MF NAV Records","type":"Automatic","tableName":"mf_nav_records","dateColumn":"nav_date","productColumn":"fund_type"},{"id":"B","name":"AMFI API","type":"API-Based","apiUrl":"https://api.amfi.internal/nav","apiKey":"MF-KEY-2026-DEMO"},{"id":"C","name":"MF Settlements","type":"Automatic","tableName":"mf_settlements","dateColumn":"settlement_date","productColumn":"fund_code"}]','Active');

SELECT id, name FROM masters;
