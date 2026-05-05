import React from 'react';
import { UserPlus, User, Mail, Shield, Edit3, Trash2 } from 'lucide-react';

const Users = () => {
  const users = [
    { id: 1, name: 'Admin', email: 'admin@ab.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Suresh K', email: 'suresh@ab.com', role: 'Ops_Maker', status: 'Active' },
    { id: 3, name: 'Meera N', email: 'meera@ab.com', role: 'Ops_Checker', status: 'Active' },
  ];

  return (
    <div className="main-content">
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: '1', minWidth: '280px' }}>
          <h1 style={{ fontSize: 'clamp(20px, 4vw, 24px)', color: '#0F172A' }}>User Management</h1>
          <p style={{ color: '#64748B', fontSize: '14px', marginTop: '4px' }}>Manage user accounts and roles.</p>
        </div>
        <button className="btn btn-primary" style={{ minWidth: '160px' }}>
          <UserPlus size={16} style={{ marginRight: '8px' }} /> Add User
        </button>
      </div>

      <div className="responsive-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Identity</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={{ fontWeight: '600' }}>{u.name}</td>
                <td style={{ color: '#64748B' }}>{u.email}</td>
                <td><span style={{ fontWeight: '600', fontSize: '13px' }}>{u.role}</span></td>
                <td><span className={`status-pill ${u.status === 'Active' ? 'status-success' : 'status-danger'}`}>{u.status}</span></td>
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

export default Users;
