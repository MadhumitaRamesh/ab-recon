import React from 'react';
import { Shield, Plus, Lock, CheckCircle2, Edit3, Trash2 } from 'lucide-react';

const Roles = () => {
  const roles = [
    { id: 1, name: 'Admin', count: 2, status: 'Active', permissions: 'Full Access' },
    { id: 2, name: 'Ops_Maker', count: 5, status: 'Active', permissions: 'Data Entry, Recon Run' },
    { id: 3, name: 'Ops_Checker', count: 3, status: 'Active', permissions: 'Approvals, Exceptions' },
    { id: 4, name: 'CS User', count: 12, status: 'Active', permissions: 'View Reports' },
  ];

  return (
    <div className="main-content">
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', color: '#0F172A' }}>Security Roles</h1>
          <p style={{ color: '#64748B', fontSize: '14px', marginTop: '4px' }}>Define access levels and permission scopes for different organizational units.</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={16} style={{ marginRight: '8px' }} /> Create New Role
        </button>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="responsive-table-container">
          <table className="data-table" style={{ minWidth: '800px' }}>
            <thead>
              <tr>
                <th>Security Role</th>
                <th>Users Assigned</th>
                <th>Permission Scope</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: '600' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FFF1F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Lock size={14} color="var(--primary)" />
                      </div>
                      {r.name}
                    </div>
                  </td>
                  <td style={{ fontWeight: '500' }}>{r.count} Users</td>
                  <td style={{ color: '#64748B', fontSize: '13px' }}>{r.permissions}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={14} color="#059669" />
                      <span className="status-pill status-success">{r.status}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <Edit3 size={16} color="#64748B" style={{ cursor: 'pointer' }} />
                      <Trash2 size={16} color="#DC2626" style={{ cursor: 'pointer' }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Roles;
