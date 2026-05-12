import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Plus, Edit3, Trash2, CheckCircle, X, Save, ShieldAlert } from 'lucide-react';

const Roles = () => {
  const { roles, setRoles, addRole, updateRole, deleteRole, addNotification, searchQuery } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', level: 'Operational' });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', level: 'Operational' });
    setShowForm(true);
  };

  const handleOpenEdit = (role) => {
    setEditingId(role.id);
    setFormData({ name: role.name, description: role.description || '', level: role.level || 'Operational' });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const success = await updateRole(editingId, formData);
        if (success) {
          addNotification({ title: 'Role Updated', message: `The '${formData.name}' role definition has been modified.` });
        } else {
          addNotification({ title: 'System Error', message: 'Failed to save role changes. Please check permissions.', type: 'danger' });
        }
      } else {
        const success = await addRole(formData);
        if (success) {
          addNotification({ title: 'Role Created', message: `New role '${formData.name}' successfully added.` });
        }
      }
      setShowForm(false);
    } catch (err) {
      addNotification({ title: 'Critical Error', message: err.message, type: 'danger' });
    }
  };

  const handleDelete = async (id, name) => {
    if (name === 'Admin') {
      alert('The Admin role is a system requirement and cannot be deleted.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete the '${name}' role? This may affect user access.`)) {
      const success = await deleteRole(id, name);
      if (success) {
        addNotification({ title: 'Role Deleted', message: `The '${name}' role has been permanently removed.` });
      }
    }
  };

  const filteredRoles = roles.filter(role => 
    !searchQuery || role.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`main-content ${isLoaded ? 'animate-reveal' : ''}`} style={{ opacity: isLoaded ? 1 : 0 }}>
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 32px)', color: '#0F172A', fontWeight: '800' }}>RBAC Hierarchy</h1>
          <p style={{ color: '#64748B', fontSize: '16px', marginTop: '6px' }}>Define and manage system roles and their hierarchical authority levels.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd} style={{ height: '52px', minWidth: '220px' }}>
          <Plus size={18} style={{ marginRight: '10px' }} /> Create New Role
        </button>
      </div>

      <div className="grid-4" style={{ marginBottom: '40px' }}>
        {filteredRoles.map((role) => (
          <div key={role.id} className="card hover-scale" style={{ padding: '32px', marginBottom: 0, borderTop: `4px solid ${role.name === 'Admin' ? 'var(--primary)' : 'var(--gold)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '12px' }}>
                <Shield size={24} color={role.name === 'Admin' ? 'var(--primary)' : 'var(--gold)'} />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => handleOpenEdit(role)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}><Edit3 size={18} /></button>
                <button onClick={() => handleDelete(role.id, role.name)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#DC2626' }}><Trash2 size={18} /></button>
              </div>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>{role.name.replace('_', ' ')}</h3>
            <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.5', marginBottom: '24px' }}>{role.description || 'Full access to reconciliation modules and identity management.'}</p>
            <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)', background: '#FFF1F2', padding: '4px 12px', borderRadius: '20px', display: 'inline-block' }}>
              LEVEL: {role.level || 'System'}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="card animate-reveal" style={{ maxWidth: '500px', width: '100%', padding: '0', marginBottom: 0 }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>{editingId ? 'Modify Role Definition' : 'Define New System Role'}</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
              <div className="form-group">
                <label className="form-label">Role Name</label>
                <input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required placeholder="e.g. Compliance_Auditor" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" style={{ height: '100px', resize: 'none' }} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Describe the responsibilities of this role..." required />
              </div>
              <div className="form-group">
                <label className="form-label">Authority Level</label>
                <select className="form-control" value={formData.level} onChange={(e) => setFormData({...formData, level: e.target.value})}>
                  <option value="System">System (L1)</option>
                  <option value="Administrative">Administrative (L2)</option>
                  <option value="Operational">Operational (L3)</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingId ? <><Save size={18} style={{ marginRight: '8px' }} /> Save Changes</> : 'Confirm Creation'}
                </button>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card" style={{ background: '#F8FAFC', border: '1px dashed #CBD5E1', padding: '32px', display: 'flex', gap: '24px', alignItems: 'center' }}>
        <div style={{ background: '#E2E8F0', padding: '12px', borderRadius: '50%' }}>
          <ShieldAlert size={24} color="#64748B" />
        </div>
        <div>
          <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#1E293B' }}>Role Dependency Note</h4>
          <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.6' }}>Modifying existing roles will instantly update module access for all users assigned to that role. Use caution when downgrading authority levels.</p>
        </div>
      </div>
    </div>
  );
};

export default Roles;
