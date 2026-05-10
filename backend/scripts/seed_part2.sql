USE ab_recon_db;
SET @cb=(SELECT id FROM masters WHERE name='Cash Back Daily');
SET @bbps=(SELECT id FROM masters WHERE name='BBPS Bill Payments');
SET @dg=(SELECT id FROM masters WHERE name='DigiGold Weekly');
SET @upi=(SELECT id FROM masters WHERE name='UPI Settlement');
SET @ppi=(SELECT id FROM masters WHERE name='PPI Wallet Reconciliation');
SET @mf=(SELECT id FROM masters WHERE name='Mutual Fund NAV Check');

INSERT INTO run_history (id,product,status,trigger_type,matched_count,exception_count,run_date,run_time,start_time,end_time) VALUES
('RUN-1001','Cash Back Daily','Completed','Cron','3421','5','2026-04-14','06:30:00','06:28:00','06:31:00'),
('RUN-1002','BBPS Bill Payments','Completed','Cron','1876','3','2026-04-15','07:00:00','06:58:00','07:02:00'),
('RUN-1003','UPI Settlement','Completed','Cron','4512','7','2026-04-16','06:45:00','06:43:00','06:47:00'),
('RUN-1004','Mutual Fund NAV Check','Failed','Cron','0','0','2026-04-17','07:15:00','07:14:00','07:15:00'),
('RUN-1005','Cash Back Daily','Completed','Cron','2987','4','2026-04-21','06:30:00','06:28:00','06:32:00'),
('RUN-1006','DigiGold Weekly','Completed','Manual','1243','2','2026-04-22','10:00:00','09:58:00','10:05:00'),
('RUN-1007','BBPS Bill Payments','Completed','API','2105','6','2026-04-23','07:00:00','06:59:00','07:03:00'),
('RUN-1008','UPI Settlement','Failed','Cron','0','0','2026-04-24','06:45:00','06:44:00','06:45:00'),
('RUN-1009','Cash Back Daily','Completed','Cron','3654','8','2026-04-25','06:30:00','06:28:00','06:33:00'),
('RUN-1010','Mutual Fund NAV Check','Completed','Cron','978','1','2026-04-28','07:15:00','07:13:00','07:18:00'),
('RUN-1011','PPI Wallet Reconciliation','Completed','Manual','687','12','2026-04-29','11:00:00','10:55:00','11:20:00'),
('RUN-1012','BBPS Bill Payments','Completed','Cron','1934','4','2026-04-30','07:00:00','06:58:00','07:02:00'),
('RUN-1013','UPI Settlement','Completed','Cron','4890','9','2026-05-02','06:45:00','06:43:00','06:48:00'),
('RUN-1014','Cash Back Daily','Failed','Cron','0','0','2026-05-05','06:30:00','06:29:00','06:30:00'),
('RUN-1015','DigiGold Weekly','Completed','Manual','1102','3','2026-05-06','10:00:00','09:57:00','10:08:00'),
('RUN-1016','Mutual Fund NAV Check','Completed','Cron','1456','2','2026-05-06','07:15:00','07:13:00','07:19:00'),
('RUN-1017','BBPS Bill Payments','Completed','API','2278','5','2026-05-07','07:00:00','06:58:00','07:03:00'),
('RUN-1018','UPI Settlement','In Progress','Cron','0','0','2026-05-08','06:45:00','06:44:00','06:45:00'),
('RUN-1019','Cash Back Daily','Completed','Cron','3102','6','2026-05-09','06:30:00','06:28:00','06:33:00'),
('RUN-1020','Mutual Fund NAV Check','In Progress','Cron','0','0','2026-05-10','07:15:00','07:14:00','07:15:00');

SELECT COUNT(*) as run_history_count FROM run_history;
