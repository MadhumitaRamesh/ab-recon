import React from 'react';
import { UserPlus, Mail, Shield, MoreVertical, Search, Filter } from 'lucide-react';

const Users = () => {
  const users = [
    { id: 'SS417022', name: 'Madhumita Ramesh', role: 'Administrator', status: 'Active', lastLogin: 'Today, 10:45 AM' },
    { id: 'OP112233', name: 'Rajesh Kumar', role: 'Operator', status: 'Active', lastLogin: 'Yesterday, 04:20 PM' },
    { id: 'AP554433', name: 'Sneha Gupta', role: 'Approver', status: 'Active', lastLogin: '02 May, 09:15 AM' },
    { id: 'VW887766', name: 'Amit Singh', role: 'Viewer', status: 'Inactive', lastLogin: '28 Apr, 11:30 AM' },
    { id: 'SS417025', name: 'Vikram Mehta', role: 'Administrator', status: 'Active', lastLogin: 'Today, 18:00 PM' },
  ];

  return (
    <div className="main-content">
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '24px', color: '#0F172A' }}>Employee Management</h1>
          <p style={{ color: '#64748B', fontSize: '14px', marginTop: '4px' }}>Configure user access, assign roles, and monitor system entry logs.</p>
        </div>
        <button className="btn btn-primary">
          <UserPlus size={16} style={{ marginRight: '8px' }} /> Add New User
        </button>
      </div>

      <div className="card" style={{ padding: '0' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', gap: '16px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94A3B8' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search users by name, ID or role..." 
              style={{ height: '34px', fontSize: '13px', paddingLeft: '34px', background: '#F8FAFC' }}
            />
          </div>
          <button className="btn btn-outline" style={{ height: '34px' }}><Filter size={14} style={{ marginRight: '8px' }} /> Filters</button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Employee Details</th>
              <th>System Role</th>
              <th>Last Active</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '36px', 
                      height: '36px', 
                      borderRadius: '50%', 
                      background: '#F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary)',
                      fontWeight: '700',
                      fontSize: '12px',
                      border: '1px solid #E2E8F0'
                    }}>
                      {u.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '14px' }}>{u.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>ID: {u.id}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Shield size={14} color="var(--primary)" />
                    <span style={{ fontSize: '13px', fontWeight: '500' }}>{u.role}</span>
                  </div>
                </td>
                <td style={{ color: '#64748B', fontSize: '13px' }}>{u.lastLogin}</td>
                <td>
                  <span className={`status-pill ${u.status === 'Active' ? 'status-success' : 'status-danger'}`}>
                    {u.status}
                  </span>
                </td>
                <td>
                  <button style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><MoreVertical size={16} /></button>
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
