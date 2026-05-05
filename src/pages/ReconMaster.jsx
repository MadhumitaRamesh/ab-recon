import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Database, Settings2, FileCode, Activity, Edit3, Trash2 } from 'lucide-react';

const ReconMaster = () => {
  const { masters, addMaster } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [newMaster, setNewMaster] = useState({ name: '', frequency: 'Daily', type: 'Automatic', sources: '2-Way', status: 'Active' });

  const handleAdd = (e) => {
    e.preventDefault();
    addMaster(newMaster);
    setShowForm(false);
    setNewMaster({ name: '', frequency: 'Daily', type: 'Automatic', sources: '2-Way', status: 'Active' });
  };

  return (
    <div className="main-content">
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '24px', color: '#0F172A' }}>Reconciliation Master Records</h1>
          <p style={{ color: '#64748B', fontSize: '14px', marginTop: '4px' }}>Define data sources, matching frequency, and processing modes for reconciliation products.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} style={{ marginRight: '8px' }} /> Create New Master
        </button>
      </div>

      {showForm && (
        <div className="card animate-fade-in" style={{ marginBottom: '32px', maxWidth: '800px', borderTop: '4px solid var(--primary)' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '24px' }}>New Reconciliation Product Configuration</h3>
          <form onSubmit={handleAdd}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
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
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn btn-primary">Initialize Master</button>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: '0' }}>
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
                <td><div style={{ display: 'flex', gap: '12px' }}><Edit3 size={16} color="#64748B" /><Trash2 size={16} color="#DC2626" /></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReconMaster;
