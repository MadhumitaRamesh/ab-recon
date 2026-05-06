import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { UserPlus, Search, Edit3, Trash2, Filter, X, Mail, Shield, CheckCircle } from 'lucide-react';

const Users = () => {
  const { users, setUsers, addNotification } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Ops_Maker', status: 'Active' });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'All' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleAddUser = (e) => {
    e.preventDefault();
    const id = Date.now();
    setUsers([...users, { ...newUser, id }]);
    addNotification({ title: 'User Created', message: `Identity ${newUser.name} has been added to the platform.` });
    setShowForm(false);
    setNewUser({ name: '', email: '', role: 'Ops_Maker', status: 'Active' });
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to revoke access for ${name}?`)) {
      setUsers(users.filter(u => u.id !== id));
      addNotification({ title: 'Access Revoked', message: `User ${name} has been removed from the system.` });
    }
  };

  return (
    <div className={`main-content ${isLoaded ? 'animate-reveal' : ''}`} style={{ opacity: isLoaded ? 1 : 0 }}>
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 32px)', color: '#0F172A', fontWeight: '800' }}>User Management</h1>
          <p style={{ color: '#64748B', fontSize: '16px', marginTop: '6px' }}>Manage administrative and operational identities for ABC Reconciliation.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ height: '52px', minWidth: '200px' }}>
          <UserPlus size={18} style={{ marginRight: '10px' }} /> Add New User
        </button>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: '#94A3B8' }} />
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search by name, employee ID or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '50px', height: '52px' }}
          />
        </div>
        <select 
          className="form-control" 
          value={filterRole} 
          onChange={(e) => setFilterRole(e.target.value)}
          style={{ width: '200px', height: '52px' }}
        >
          <option value="All">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="Ops_Maker">Ops Maker</option>
          <option value="Ops_Checker">Ops Checker</option>
        </select>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="card animate-reveal" style={{ maxWidth: '500px', width: '100%', padding: '0', marginBottom: 0 }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Create User Identity</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <form onSubmit={handleAddUser} style={{ padding: '32px' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-control" value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-control" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">System Role</label>
                <select className="form-control" value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})}>
                  <option value="Ops_Maker">Ops Maker</option>
                  <option value="Ops_Checker">Ops Checker</option>
                  <option value="Admin">Admin</option>
                  <option value="CS User">CS User</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Confirm Creation</button>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="responsive-table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Identity</th>
                <th>Contact</th>
                <th>Module Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Shield size={18} color="var(--primary)" />
                      </div>
                      <div style={{ fontWeight: '800', color: '#1E293B' }}>{u.name}</div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mail size={14} color="#94A3B8" /> {u.email}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: '700', fontSize: '13px', background: '#F8FAFC', padding: '6px 12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill ${u.status === 'Active' ? 'status-success' : 'status-danger'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <Edit3 size={18} color="#64748B" style={{ cursor: 'pointer' }} />
                      <Trash2 size={18} color="#DC2626" style={{ cursor: 'pointer' }} onClick={() => handleDelete(u.id, u.name)} />
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
