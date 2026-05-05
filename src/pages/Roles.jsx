import React, { useState } from 'react';
import { Shield, Plus, Edit3, Trash2, CheckCircle2, XCircle } from 'lucide-react';

const Roles = () => {
  const [roles, setRoles] = useState([
    { id: 1, name: 'Administrator', status: 'Active', description: 'Full system access, including configuration and user management.' },
    { id: 2, name: 'Operator', status: 'Active', description: 'Operations maker. Can trigger runs and review exceptions.' },
    { id: 3, name: 'Approver', status: 'Active', description: 'Operations checker. Can approve manual matches and bulk actions.' },
    { id: 4, name: 'Business Viewer', status: 'Active', description: 'Read-only access to dashboards and business reports.' },
    { id: 5, name: 'Audit User', status: 'Inactive', description: 'Restricted access to audit logs and system activity.' },
  ]);

  return (
    <div className="main-content">
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '24px', color: '#0F172A' }}>Role Definitions</h1>
          <p style={{ color: '#64748B', fontSize: '14px', marginTop: '4px' }}>Manage system roles and their high-level operational descriptions.</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={16} style={{ marginRight: '8px' }} /> Create New Role
        </button>
      </div>

      <div className="card" style={{ padding: '0' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '250px' }}>Role Name</th>
              <th>Description</th>
              <th style={{ width: '150px' }}>Status</th>
              <th style={{ width: '150px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map(role => (
              <tr key={role.id}>
                <td style={{ fontWeight: '700', color: 'var(--primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Shield size={16} />
                    {role.name}
                  </div>
                </td>
                <td style={{ color: '#64748B', fontSize: '13px', lineHeight: '1.5' }}>{role.description}</td>
                <td>
                  <span className={`status-pill ${role.status === 'Active' ? 'status-success' : 'status-danger'}`}>
                    {role.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <button style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}><Edit3 size={16} /></button>
                    {role.name !== 'Administrator' && (
                      <button style={{ background: 'transparent', border: 'none', color: '#DC2626', cursor: 'pointer' }}><Trash2 size={16} /></button>
                    )}
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
