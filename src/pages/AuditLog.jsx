import React from 'react';
import { ShieldCheck, User, Clock, Terminal, Filter, Download } from 'lucide-react';

const AuditLog = () => {
  const logs = [
    { id: 1, user: 'Admin_SS417', action: 'Update Permission', module: 'Module Access', detail: 'Changed BBPS role access for Ops_Maker', time: '10:45 AM', date: 'Today', type: 'Security' },
    { id: 2, user: 'Ops_MK_02', action: 'Manual Run', module: 'Run Recon', detail: 'Triggered DigiGold Daily batch', time: '09:30 AM', date: 'Today', type: 'System' },
    { id: 3, user: 'System', action: 'Cron Success', module: 'Scheduler', detail: 'Cash Back Daily completed successfully', time: '12:00 AM', date: 'Today', type: 'Auto' },
    { id: 4, user: 'Admin_SS417', action: 'Delete Master', module: 'Recon Master', detail: 'Removed deprecated DigiGold_v1', time: '04:15 PM', date: 'Yesterday', type: 'Config' },
    { id: 5, user: 'Ops_CH_01', action: 'Accept Match', module: 'Exceptions', detail: 'Resolved TXN-9902 manually', time: '02:00 PM', date: 'Yesterday', type: 'Operation' },
  ];

  const getTypeStyle = (type) => {
    switch(type) {
      case 'Security': return { color: '#DC2626', background: '#FEF2F2' };
      case 'System': return { color: '#2563EB', background: '#EFF6FF' };
      case 'Config': return { color: '#D97706', background: '#FFFBEB' };
      default: return { color: '#059669', background: '#ECFDF5' };
    }
  };

  return (
    <div className="main-content">
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', color: '#0F172A' }}>Immutable System Audit Log</h1>
          <p style={{ color: '#64748B', fontSize: '14px', marginTop: '4px' }}>Complete trail of user activities and automated system events for compliance.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn btn-outline"><Filter size={16} style={{ marginRight: '8px' }} /> Filter Logs</button>
          <button className="btn btn-primary"><Download size={16} style={{ marginRight: '8px' }} /> Download PDF</button>
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="responsive-table-container">
          <table className="data-table" style={{ minWidth: '900px' }}>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Identity</th>
                <th>Module</th>
                <th>Operation</th>
                <th>Log Detail</th>
                <th>Security Tag</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td style={{ color: '#64748B', fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={14} /> {log.date}, {log.time}
                    </div>
                  </td>
                  <td style={{ fontWeight: '600', color: '#334155' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <User size={14} color="var(--primary)" /> {log.user}
                    </div>
                  </td>
                  <td><span style={{ fontSize: '12px', fontWeight: '700', color: '#64748B' }}>{log.module.toUpperCase()}</span></td>
                  <td style={{ fontWeight: '500' }}>{log.action}</td>
                  <td style={{ color: '#475569', fontSize: '13px' }}>{log.detail}</td>
                  <td>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '12px', 
                      fontSize: '11px', 
                      fontWeight: '700',
                      ...getTypeStyle(log.type)
                    }}>
                      {log.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: '32px', padding: '24px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <ShieldCheck size={20} color="#059669" />
        </div>
        <div>
          <h4 style={{ fontSize: '14px', color: '#0F172A', fontWeight: '700' }}>Compliance Verification Passed</h4>
          <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>Audit log hashes are verified and immutable. Standard SOC2 compliance level maintained.</p>
        </div>
      </div>
    </div>
  );
};

export default AuditLog;
