import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { UserPlus, Search, Edit3, Trash2, X, Hash, Shield, CheckCircle, Save } from 'lucide-react';

const Users = () => {
  const { users, setUsers, addUser, updateUser, deleteUser, addNotification } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [formData, setFormData] = useState({ name: '', employeeId: '', role: 'Ops_Maker', status: 'Active', password: '' });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'All' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ name: '', employeeId: '', role: 'Ops_Maker', status: 'Active', password: '' });
    setShowForm(true);
  };

  const handleOpenEdit = (user) => {
    setEditingId(user.id);
    setFormData({ name: user.name, employeeId: user.employeeId, role: user.role, status: user.status, password: '' });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      const success = await updateUser(editingId, formData);
      if (success) {
        addNotification({ title: 'Profile Updated', message: `Identity ${formData.name} (${formData.employeeId}) has been modified.` });
      }
    } else {
      const success = await addUser(formData);
      if (success) {
        addNotification({ title: 'User Created', message: `Identity ${formData.name} has been added to the platform.` });
      }
    }
    setShowForm(false);
  };

  const handleDelete = async (id, name, employeeId) => {
    if (window.confirm(`Are you sure you want to revoke access for ${name}?`)) {
      const success = await deleteUser(id, name, employeeId);
      if (success) {
        addNotification({ title: 'Access Revoked', message: `User ${name} removed from system.` });
      }
    }
  };

  return (
    <div className={`main-content ${isLoaded ? 'animate-reveal' : ''}`} style={{ opacity: isLoaded ? 1 : 0 }}>
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 32px)', color: '#0F172A', fontWeight: '800' }}>Identity Management</h1>
          <p style={{ color: '#64748B', fontSize: '16px', marginTop: '6px' }}>Manage and provision employee access for the AB Recon platform.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd} style={{ height: '52px', minWidth: '220px' }}>
          <UserPlus size={18} style={{ marginRight: '10px' }} /> Provision New User
        </button>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: '#94A3B8' }} />
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search by name or employee ID..." 
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
          <option value="CS User">CS User</option>
        </select>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="card animate-reveal" style={{ maxWidth: '500px', width: '100%', padding: '0', marginBottom: 0 }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>{editingId ? 'Modify Identity' : 'Provision Identity'}</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Employee ID</label>
                <input type="text" className="form-control" value={formData.employeeId} onChange={(e) => setFormData({...formData, employeeId: e.target.value.toUpperCase()})} required placeholder="e.g. ABC001" />
              </div>
              <div className="form-group">
                <label className="form-label">Assigned Role</label>
                <select className="form-control" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                  <option value="Ops_Maker">Ops Maker</option>
                  <option value="Ops_Checker">Ops Checker</option>
                  <option value="Admin">Admin</option>
                  <option value="CS User">CS User</option>
                </select>
              </div>
              {!editingId && (
                <div className="form-group">
                  <label className="form-label">Initial Access Password</label>
                  <input type="password" placeholder="••••••••" className="form-control" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                </div>
              )}
              <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingId ? <><Save size={18} style={{ marginRight: '8px' }} /> Save Changes</> : 'Confirm Provisioning'}
                </button>
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
                <th>Employee Identity</th>
                <th>Employee ID</th>
                <th>System Role</th>
                <th>Status</th>
                <th>Operations</th>
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
                    <div style={{ fontSize: '13px', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
                      <Hash size={14} color="#94A3B8" /> {u.employeeId}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: '700', fontSize: '13px', background: '#F8FAFC', padding: '6px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', color: 'var(--primary)' }}>
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill ${u.status === 'Active' ? 'status-success' : 'status-danger'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <button onClick={() => handleOpenEdit(u)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                        <Edit3 size={18} />
                      </button>
                      <button onClick={() => handleDelete(u.id, u.name, u.employeeId)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#DC2626' }}>
                        <Trash2 size={18} />
                      </button>
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
