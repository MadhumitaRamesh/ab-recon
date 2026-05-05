import React from 'react';
import { Plus, Lock, CheckCircle2, Edit3, Trash2 } from 'lucide-react';

const Roles = () => {
  const roles = [
    { id: 1, name: 'Admin', count: 2, status: 'Active', permissions: 'Full Access' },
    { id: 2, name: 'Ops_Maker', count: 5, status: 'Active', permissions: 'Data Entry, Recon Run' },
  ];

  return (
    <div className="main-content">
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: '1', minWidth: '280px' }}>
          <h1 style={{ fontSize: 'clamp(20px, 4vw, 24px)', color: '#0F172A' }}>Security Roles</h1>
          <p style={{ color: '#64748B', fontSize: '14px', marginTop: '4px' }}>Define access levels and permission scopes.</p>
        </div>
        <button className="btn btn-primary" style={{ minWidth: '160px' }}>
          <Plus size={16} style={{ marginRight: '8px' }} /> New Role
        </button>
      </div>

      <div className="responsive-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Role</th>
              <th>Users</th>
              <th>Scope</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map(r => (
              <tr key={r.id}>
                <td style={{ fontWeight: '600' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Lock size={14} color="var(--primary)" /> {r.name}
                  </div>
                </td>
                <td>{r.count}</td>
                <td style={{ minWidth: '200px', fontSize: '13px', color: '#64748B' }}>{r.permissions}</td>
                <td><span className="status-pill status-success">{r.status}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <Edit3 size={16} color="#64748B" />
                    <Trash2 size={16} color="#DC2626" />
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

export default Roles;
