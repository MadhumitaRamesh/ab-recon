import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Database, Settings2, FileCode, Edit3, Trash2, X } from 'lucide-react';

const ReconMaster = () => {
  const { masters, setMasters, addMaster, addNotification } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingMaster, setEditingMaster] = useState(null);
  const [newMaster, setNewMaster] = useState({ name: '', frequency: 'Daily', type: 'Automatic', sources: '2-Way', status: 'Active' });

  const handleAdd = (e) => {
    e.preventDefault();
    if (editingMaster) {
      // Corrected: Updating existing master in the context
      const updatedMasters = masters.map(m => m.id === editingMaster.id ? { ...newMaster, id: m.id } : m);
      setMasters(updatedMasters);
      addNotification({ title: 'Master Updated', message: `Product ${newMaster.name} has been updated successfully.` });
    } else {
      addMaster(newMaster);
      addNotification({ title: 'Master Created', message: `New product ${newMaster.name} initialized.` });
    }
    setShowForm(false);
    setEditingMaster(null);
    setNewMaster({ name: '', frequency: 'Daily', type: 'Automatic', sources: '2-Way', status: 'Active' });
  };

  const handleEdit = (master) => {
    setEditingMaster(master);
    setNewMaster({ ...master });
    setShowForm(true);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      // Corrected: Updating context state for deletion
      const remainingMasters = masters.filter(m => m.id !== id);
      setMasters(remainingMasters);
      addNotification({ title: 'Master Deleted', message: `Product ${name} removed from system.` });
    }
  };

  return (
    <div className="main-content">
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', color: '#0F172A' }}>Reconciliation Master Records</h1>
          <p style={{ color: '#64748B', fontSize: '14px', marginTop: '4px' }}>Define data sources, matching frequency, and processing modes for reconciliation products.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditingMaster(null); setNewMaster({ name: '', frequency: 'Daily', type: 'Automatic', sources: '2-Way', status: 'Active' }); }}>
          <Plus size={16} style={{ marginRight: '8px' }} /> Create New Master
        </button>
      </div>

      {showForm && (
        <div className="card animate-fade-in" style={{ marginBottom: '32px', maxWidth: '800px', borderTop: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px' }}>{editingMaster ? 'Update' : 'New'} Reconciliation Product Configuration</h3>
            <button onClick={() => { setShowForm(false); setEditingMaster(null); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}>
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleAdd}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '24px' }}>
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input type="text" className="form-control" placeholder="e.g. BBPS Settlement" value={newMaster.name} onChange={(e) => setNewMaster({...newMaster, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Update Frequency</label>
                <select className="form-control" value={newMaster.frequency} onChange={(e) => setNewMaster({...newMaster, frequency: e.target.value})}>
                  <option>Daily</option><option>Weekly</option><option>Monthly</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Processing Methodology</label>
                <select className="form-control" value={newMaster.type} onChange={(e) => setNewMaster({...newMaster, type: e.target.value})}>
                  <option>Automatic</option><option>Manual</option><option>API-based</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Matching Logic</label>
                <select className="form-control" value={newMaster.sources} onChange={(e) => setNewMaster({...newMaster, sources: e.target.value})}>
                  <option>1-Way</option><option>2-Way</option><option>3-Way</option><option>4-Way</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: '1 1 auto', minWidth: '150px' }}>
                {editingMaster ? 'Save Changes' : 'Initialize Master'}
              </button>
              <button type="button" className="btn btn-outline" style={{ flex: '1 1 auto', minWidth: '150px' }} onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
        <div style={{ minWidth: '800px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Product Configuration</th>
                <th>Processing</th>
                <th>Structure</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {masters.map(m => (
                <tr key={m.id}>
                  <td style={{ color: '#64748B', fontWeight: '500', fontSize: '12px' }}>M-00{m.id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Database size={14} color="var(--primary)" />
                      <div>
                        <div style={{ fontWeight: '600' }}>{m.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>Freq: {m.frequency}</div>
                      </div>
                    </div>
                  </td>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Settings2 size={14} color="#64748B" /><span>{m.type}</span></div></td>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FileCode size={14} color="#64748B" /><span>{m.sources}</span></div></td>
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
    </div>
  );
};

export default ReconMaster;
