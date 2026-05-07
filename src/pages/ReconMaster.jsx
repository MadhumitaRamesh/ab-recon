import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Database, Settings2, FileCode, Edit3, Trash2, X } from 'lucide-react';

const ReconMaster = () => {
  const { masters, setMasters, addMaster, addNotification } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingMaster, setEditingMaster] = useState(null);
  const [newMaster, setNewMaster] = useState({ name: '', frequency: 'Daily', type: 'Automatic', sources: '2-Way', status: 'Active' });

  const handleAdd = async (e) => {
    e.preventDefault();
    if (editingMaster) {
      const updatedMasters = masters.map(m => m.id === editingMaster.id ? { ...newMaster, id: m.id } : m);
      setMasters(updatedMasters);
      addNotification({ title: 'Master Updated', message: `Product ${newMaster.name} updated.` });
    } else {
      const success = await addMaster(newMaster);
      if (success) {
        addNotification({ title: 'Master Created', message: `Product ${newMaster.name} created.` });
      }
    }
    setShowForm(false);
    setEditingMaster(null);
    setNewMaster({ name: '', frequency: 'Daily', type: 'Automatic', sources: '2-Way', status: 'Active' });
  };

  const handleEdit = (master) => {
    setEditingMaster(master);
    setNewMaster({ ...master });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete ${name}?`)) {
      setMasters(masters.filter(m => m.id !== id));
      addNotification({ title: 'Master Deleted', message: `Product ${name} removed.` });
    }
  };

  return (
    <div className="main-content">
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: '1', minWidth: '280px' }}>
          <h1 style={{ fontSize: 'clamp(20px, 4vw, 24px)', color: '#0F172A' }}>Reconciliation Master Records</h1>
          <p style={{ color: '#64748B', fontSize: '14px', marginTop: '4px' }}>Define data sources, frequency, and processing modes.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ width: 'auto', minWidth: '180px' }}>
          <Plus size={16} style={{ marginRight: '8px' }} /> Create New Master
        </button>
      </div>

      {showForm && (
        <div className="card animate-fade-in" style={{ borderTop: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px' }}>{editingMaster ? 'Update' : 'New'} Configuration</h3>
            <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
          </div>
          <form onSubmit={handleAdd}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input type="text" className="form-control" value={newMaster.name} onChange={(e) => setNewMaster({...newMaster, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Frequency</label>
                <select className="form-control" value={newMaster.frequency} onChange={(e) => setNewMaster({...newMaster, frequency: e.target.value})}>
                  <option>Daily</option><option>Weekly</option><option>Monthly</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-control" value={newMaster.type} onChange={(e) => setNewMaster({...newMaster, type: e.target.value})}>
                  <option>Automatic</option><option>Manual</option><option>API-based</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Matching</label>
                <select className="form-control" value={newMaster.sources} onChange={(e) => setNewMaster({...newMaster, sources: e.target.value})}>
                  <option>1-Way</option><option>2-Way</option><option>3-Way</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: '1' }}>{editingMaster ? 'Save' : 'Create'}</button>
              <button type="button" className="btn btn-outline" style={{ flex: '1' }} onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="responsive-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Product</th>
              <th>Type</th>
              <th>Logic</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {masters.map(m => (
              <tr key={m.id}>
                <td style={{ fontSize: '12px', color: '#64748B' }}>M-00{m.id}</td>
                <td style={{ fontWeight: '600' }}>{m.name}</td>
                <td>{m.type}</td>
                <td>{m.sources}</td>
                <td><span className={`status-pill ${m.status === 'Active' ? 'status-success' : 'status-danger'}`}>{m.status}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <Edit3 size={16} color="#64748B" style={{ cursor: 'pointer' }} onClick={() => handleEdit(m)} />
                    <Trash2 size={16} color="#DC2626" style={{ cursor: 'pointer' }} onClick={() => handleDelete(m.id, m.name)} />
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

export default ReconMaster;
