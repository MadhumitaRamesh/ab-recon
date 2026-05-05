import React from 'react';
import { ShieldCheck, User, Calendar, Filter, Download, ExternalLink } from 'lucide-react';

const AuditLog = () => {
  const logs = [
    { id: 1, timestamp: '2026-05-05 18:45:12', user: 'SS417022', role: 'Administrator', action: 'Update Permissions', entity: 'RBAC Policy', details: 'Assigned "Dashboard" to "Viewer" role' },
    { id: 2, timestamp: '2026-05-05 18:30:05', user: 'System-Cron', role: 'System', action: 'Execute Batch', entity: 'BBPS Daily', details: 'Auto-resolved 1,204 transactions' },
    { id: 3, timestamp: '2026-05-05 18:15:44', user: 'OP112233', role: 'Operator', action: 'Accept Suggestion', entity: 'Exception TXN-4122', details: 'Matched with BK-445 (94% confidence)' },
    { id: 4, timestamp: '2026-05-05 17:50:21', user: 'SS417022', role: 'Administrator', action: 'Create Master', entity: 'UPI Internal', details: 'New reconciliation master initialized' },
    { id: 5, timestamp: '2026-05-05 17:10:00', user: 'System-Auth', role: 'Security', action: 'Login Success', entity: 'User Session', details: 'Employee SS417022 authenticated from 10.0.4.12' },
  ];

  return (
    <div className="main-content">
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '24px', color: '#0F172A' }}>Immutable Audit Trail</h1>
          <p style={{ color: '#64748B', fontSize: '14px', marginTop: '4px' }}>Complete historical record of all administrative, operational and system events.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-outline"><Filter size={16} style={{ marginRight: '8px' }} /> Filter Logs</button>
          <button className="btn btn-primary"><Download size={16} style={{ marginRight: '8px' }} /> Export Audit (PDF)</button>
        </div>
      </div>

      <div className="card" style={{ padding: '0' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '180px' }}>Timestamp</th>
              <th style={{ width: '180px' }}>Identity</th>
              <th style={{ width: '150px' }}>Action Type</th>
              <th style={{ width: '200px' }}>Entity Target</th>
              <th>Operational Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td style={{ color: '#64748B', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={12} /> {log.timestamp}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ 
                      width: '28px', 
                      height: '28px', 
                      borderRadius: '4px', 
                      background: '#F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary)',
                      border: '1px solid #E2E8F0'
                    }}>
                      <User size={14} />
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '13px' }}>{log.user}</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>{log.role}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span style={{ 
                    padding: '4px 8px', 
                    background: '#F8FAFC', 
                    color: '#475569', 
                    borderRadius: '4px', 
                    fontSize: '11px',
                    fontWeight: '700',
                    border: '1px solid #E2E8F0'
                  }}>
                    {log.action}
                  </span>
                </td>
                <td style={{ fontWeight: '500', fontSize: '13px' }}>{log.entity}</td>
                <td style={{ fontSize: '13px', color: '#64748B' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {log.details}
                    <ExternalLink size={14} style={{ cursor: 'pointer', color: '#CBD5E1' }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLog;
