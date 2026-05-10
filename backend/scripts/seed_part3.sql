USE ab_recon_db;
SET @cb=(SELECT id FROM masters WHERE name='Cash Back Daily');
SET @bbps=(SELECT id FROM masters WHERE name='BBPS Bill Payments');
SET @dg=(SELECT id FROM masters WHERE name='DigiGold Weekly');
SET @upi=(SELECT id FROM masters WHERE name='UPI Settlement');
SET @ppi=(SELECT id FROM masters WHERE name='PPI Wallet Reconciliation');
SET @mf=(SELECT id FROM masters WHERE name='Mutual Fund NAV Check');

INSERT INTO exceptions (id,amount,ref_no,type,age,priority,status,recon_master_id,run_id,run_date,source_type,unique_reference_number,assigned_role) VALUES
('EX-3001',15420.50,'CB-TXN-88291','Amount Mismatch','26d','High','Pending',@cb,'RUN-1001','2026-04-14','Automatic','UID-CB-001','Operations'),
('EX-3002',3200.00,'CB-TXN-88305','Missing Entry','26d','Medium','Under Review',@cb,'RUN-1001','2026-04-14','Automatic','UID-CB-002','Operations'),
('EX-3003',48750.00,'BBPS-REF-22441','Amount Mismatch','25d','High','Pending',@bbps,'RUN-1002','2026-04-15','API-Based','UID-BBPS-001','Operations'),
('EX-3004',7650.00,'BBPS-REF-22498','Timing Difference','25d','Low','Resolved',@bbps,'RUN-1002','2026-04-15','API-Based','UID-BBPS-002','Operations'),
('EX-3005',22300.00,'UPI-TXN-55612','Duplicate','24d','High','Pending',@upi,'RUN-1003','2026-04-16','Automatic','UID-UPI-001','Operations'),
('EX-3006',9100.00,'UPI-TXN-55634','Missing Entry','24d','Medium','Under Review',@upi,'RUN-1003','2026-04-16','Automatic','UID-UPI-002','Operations'),
('EX-3007',5500.00,'UPI-TXN-55691','Reversal','24d','Low','Resolved',@upi,'RUN-1003','2026-04-16','Automatic','UID-UPI-003','Operations'),
('EX-3008',18900.00,'CB-TXN-89001','Amount Mismatch','19d','High','Pending',@cb,'RUN-1005','2026-04-21','Automatic','UID-CB-003','Operations'),
('EX-3009',4350.00,'CB-TXN-89022','Unclassified','19d','Low','Under Review',@cb,'RUN-1005','2026-04-21','Automatic','UID-CB-004','Operations'),
('EX-3010',31200.00,'DG-REF-10091','Amount Mismatch','18d','High','Pending',@dg,'RUN-1006','2026-04-22','Manual Upload','UID-DG-001','Operations'),
('EX-3011',6780.00,'DG-REF-10104','Timing Difference','18d','Medium','Resolved',@dg,'RUN-1006','2026-04-22','Manual Upload','UID-DG-002','Operations'),
('EX-3012',12500.00,'BBPS-REF-23101','Duplicate','17d','Medium','Pending',@bbps,'RUN-1007','2026-04-23','API-Based','UID-BBPS-003','Operations'),
('EX-3013',44200.00,'BBPS-REF-23145','Missing Entry','17d','High','Under Review',@bbps,'RUN-1007','2026-04-23','API-Based','UID-BBPS-004','Operations'),
('EX-3014',8900.00,'CB-TXN-89890','Reversal','15d','Low','Resolved',@cb,'RUN-1009','2026-04-25','Automatic','UID-CB-005','Operations'),
('EX-3015',27600.00,'CB-TXN-89910','Amount Mismatch','15d','High','Pending',@cb,'RUN-1009','2026-04-25','Automatic','UID-CB-006','Operations'),
('EX-3016',3100.00,'MF-NAV-5501','Timing Difference','12d','Low','Under Review',@mf,'RUN-1010','2026-04-28','Automatic','UID-MF-001','Operations'),
('EX-3017',19800.00,'PPI-WLT-8801','Missing Entry','11d','Medium','Pending',@ppi,'RUN-1011','2026-04-29','Manual Upload','UID-PPI-001','Operations'),
('EX-3018',5250.00,'BBPS-REF-23890','Unclassified','10d','Low','Resolved',@bbps,'RUN-1012','2026-04-30','API-Based','UID-BBPS-005','Operations'),
('EX-3019',36000.00,'UPI-TXN-56901','Amount Mismatch','8d','High','Pending',@upi,'RUN-1013','2026-05-02','Automatic','UID-UPI-004','Operations'),
('EX-3020',11100.00,'UPI-TXN-56934','Duplicate','8d','Medium','Under Review',@upi,'RUN-1013','2026-05-02','Automatic','UID-UPI-005','Operations'),
('EX-3021',2800.00,'DG-REF-10780','Missing Entry','4d','Low','Pending',@dg,'RUN-1015','2026-05-06','Manual Upload','UID-DG-003','Operations'),
('EX-3022',49100.00,'MF-NAV-5890','Amount Mismatch','4d','High','Under Review',@mf,'RUN-1016','2026-05-06','Automatic','UID-MF-002','Operations'),
('EX-3023',8400.00,'BBPS-REF-24501','Reversal','3d','Medium','Pending',@bbps,'RUN-1017','2026-05-07','API-Based','UID-BBPS-006','Operations'),
('EX-3024',17300.00,'CB-TXN-91001','Timing Difference','1d','Low','Pending',@cb,'RUN-1019','2026-05-09','Automatic','UID-CB-007','Operations'),
('EX-3025',23450.00,'UPI-TXN-57800','Amount Mismatch','1d','High','Under Review',@upi,'RUN-1019','2026-05-09','Automatic','UID-UPI-006','Operations');

SELECT COUNT(*) as exceptions_count FROM exceptions;
