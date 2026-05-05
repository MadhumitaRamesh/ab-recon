import React from 'react';
import { Clock, User, Filter, Download, ShieldCheck } from 'lucide-react';

const AuditLog = () => {
  const logs = [
    { id: 1, user: 'Admin_SS417', action: 'Update Permission', module: 'Access', detail: 'Changed BBPS role access', time: '10:45 AM', date: 'Today', type: 'Security' },
    { id: 2, user: 'Ops_MK_02', action: 'Manual Run', module: 'Run Recon', detail: 'Triggered DigiGold Daily', time: '09:30 AM', date: 'Today', type: 'System' },
    { id: 3, user: 'System', action: 'Cron Success', module: 'Scheduler', detail: 'Cash Back Daily successful', time: '12:00 AM', date: 'Today', type: 'Auto' },
  ];

  const getTypeStyle = (type) => {
    switch(type) {
      case 'Security': return { color: '#DC2626', background: '#FEF2F2' };
      case 'System': return { color: '#2563EB', background: '#EFF6FF' };
      default: return { color: '#059669', background: '#ECFDF5' };
    }
  };

  return (
    <div className="main-content">
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: '1', minWidth: '280px' }}>
          <h1 style={{ fontSize: 'clamp(20px, 4vw, 24px)', color: '#0F172A' }}>Immutable System Audit Log</h1>
          <p style={{ color: '#64748B', fontSize: '14px', marginTop: '4px' }}>Complete trail of user activities and system events.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', width: '100%', maxWidth: 'fit-content' }}>
          <button className="btn btn-outline" style={{ flex: 1 }}><Filter size={16} /></button>
          <button className="btn btn-primary" style={{ flex: 1 }}><Download size={16} /></button>
        </div>
      </div>

      <div className="responsive-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Identity</th>
              <th>Operation</th>
              <th>Detail</th>
              <th>Tag</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td style={{ whiteSpace: 'nowrap', fontSize: '12px', color: '#64748B' }}>{log.date}, {log.time}</td>
                <td style={{ fontWeight: '600' }}>{log.user}</td>
                <td>{log.action}</td>
                <td style={{ minWidth: '200px' }}>{log.detail}</td>
                <td>
                  <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: '700', ...getTypeStyle(log.type) }}>
                    {log.type}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '24px', padding: '20px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <ShieldCheck size={20} color="#059669" />
        <div style={{ flex: 1, minWidth: '200px' }}>
          <h4 style={{ fontSize: '14px', color: '#0F172A', fontWeight: '700' }}>Compliance Verified</h4>
          <p style={{ fontSize: '13px', color: '#64748B' }}>Audit log hashes are immutable. SOC2 compliant.</p>
        </div>
      </div>
    </div>
  );
};

export default AuditLog;
