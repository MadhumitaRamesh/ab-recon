import React from 'react';
import { UserPlus, User, Mail, Shield, Edit3, Trash2 } from 'lucide-react';

const Users = () => {
  const users = [
    { id: 1, name: 'Aditya Birla Admin', email: 'admin@adityabirla.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Suresh Kumar', email: 'suresh.k@adityabirla.com', role: 'Ops_Maker', status: 'Active' },
    { id: 3, name: 'Meera Nair', email: 'meera.n@adityabirla.com', role: 'Ops_Checker', status: 'Active' },
    { id: 4, name: 'Rahul Sharma', email: 'rahul.s@adityabirla.com', role: 'CS User', status: 'Inactive' },
  ];

  return (
    <div className="main-content">
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', color: '#0F172A' }}>User Management</h1>
          <p style={{ color: '#64748B', fontSize: '14px', marginTop: '4px' }}>Control system access by managing user accounts and assigning operational roles.</p>
        </div>
        <button className="btn btn-primary">
          <UserPlus size={16} style={{ marginRight: '8px' }} /> Add New User
        </button>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="responsive-table-container">
          <table className="data-table" style={{ minWidth: '800px' }}>
            <thead>
              <tr>
                <th>Identity</th>
                <th>Contact Email</th>
                <th>Assigned Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: '600' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={14} color="var(--primary)" />
                      </div>
                      {u.name}
                    </div>
                  </td>
                  <td style={{ color: '#64748B' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mail size={14} /> {u.email}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Shield size={14} color="#64748B" />
                      <span style={{ fontWeight: '600', fontSize: '13px' }}>{u.role}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${u.status === 'Active' ? 'status-success' : 'status-danger'}`}>
                      {u.status}
                    </span>
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

export default Users;
