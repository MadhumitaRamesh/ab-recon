import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Database, Settings2, FileCode, Edit3, Trash2, X, Info, Layers, Zap } from 'lucide-react';

const ReconMaster = () => {
  const { masters, setMasters, addMaster, updateMaster, deleteMaster, addNotification } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingMaster, setEditingMaster] = useState(null);
  
  const initialFormState = {
    name: '',
    frequency: 'Daily',
    matching_logic: '2-way',
    run_mode: 'Manual',
    source_config: [
      { id: 'A', name: 'Source A', type: 'Manual Upload' },
      { id: 'B', name: 'Source B', type: 'Manual Upload' }
    ],
    status: 'Active'
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleLogicChange = (logic) => {
    const count = parseInt(logic.split('-')[0]);
    const currentConfig = [...formData.source_config];
    let newConfig = [];

    for (let i = 0; i < count; i++) {
      const char = String.fromCharCode(65 + i); // A, B, C, D
      const existing = currentConfig.find(c => c.id === char);
      newConfig.push(existing || { id: char, name: `Source ${char}`, type: 'Manual Upload' });
    }

    setFormData({ ...formData, matching_logic: logic, source_config: newConfig });
  };

  const updateSourceType = (id, type) => {
    const newConfig = formData.source_config.map(c => 
      c.id === id ? { ...c, type } : c
    );
    setFormData({ ...formData, source_config: newConfig });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (editingMaster) {
      const success = await updateMaster(editingMaster.id, formData);
      if (success) {
        addNotification({ title: 'Master Updated', message: `Product ${formData.name} configurations synchronized.` });
      }
    } else {
      const success = await addMaster(formData);
      if (success) {
        addNotification({ title: 'Master Created', message: `New recon product ${formData.name} defined successfully.` });
      }
    }
    setShowForm(false);
    setEditingMaster(null);
    setFormData(initialFormState);
  };

  const handleEdit = (m) => {
    setEditingMaster(m);
    setFormData({ ...m });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="main-content">
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: '1', minWidth: '280px' }}>
          <h1 style={{ fontSize: 'clamp(20px, 4vw, 24px)', color: '#0F172A', fontWeight: '800' }}>Reconciliation Master</h1>
          <p style={{ color: '#64748B', fontSize: '14px', marginTop: '4px' }}>Configure complex multi-way matching rules and ingestion modes.</p>
        </div>
        {!showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ width: 'auto', minWidth: '180px', height: '48px' }}>
            <Plus size={18} style={{ marginRight: '8px' }} /> Create New Master
          </button>
        )}
      </div>

      {showForm && (
        <div className="card animate-reveal" style={{ borderTop: '4px solid var(--primary)', marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', background: 'var(--primary-light)', borderRadius: '8px' }}>
                <Settings2 size={20} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>{editingMaster ? 'Modify' : 'Configure'} Master Record</h3>
            </div>
            <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={24} /></button>
          </div>

          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
              <div className="form-group">
                <label className="form-label">Platform Name</label>
                <input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. UPI Settlement" required />
              </div>
              <div className="form-group">
                <label className="form-label">Processing Frequency</label>
                <select className="form-control" value={formData.frequency} onChange={(e) => setFormData({...formData, frequency: e.target.value})}>
                  <option>Daily</option><option>Weekly</option><option>Monthly</option><option>On-Demand</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Matching Logic</label>
                <select className="form-control" value={formData.matching_logic} onChange={(e) => handleLogicChange(e.target.value)}>
                  <option value="1-way">1-Way (Internal Validation)</option>
                  <option value="2-way">2-Way (Classic)</option>
                  <option value="3-way">3-Way (Standard)</option>
                  <option value="4-way">4-Way (Complex)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Primary Run Mode</label>
                <select className="form-control" value={formData.run_mode} onChange={(e) => setFormData({...formData, run_mode: e.target.value})}>
                  <option>Manual</option>
                  <option>Automatic (Cron)</option>
                  <option>API-driven</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ fontSize: '14px', color: '#1E293B', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={16} color="var(--primary)" /> Per-Source Data Configuration
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {formData.source_config.map((source) => (
                  <div key={source.id} style={{ padding: '20px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontWeight: '800', fontSize: '12px', color: 'var(--primary)', marginBottom: '12px' }}>SOURCE {source.id}</div>
                    <div className="form-group">
                      <label style={{ fontSize: '12px', color: '#64748B', display: 'block', marginBottom: '6px' }}>Source Label</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={source.name} 
                        onChange={(e) => {
                          const newConfig = formData.source_config.map(c => c.id === source.id ? { ...c, name: e.target.value } : c);
                          setFormData({ ...formData, source_config: newConfig });
                        }}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '12px', color: '#64748B', display: 'block', marginBottom: '6px' }}>Ingestion Type</label>
                      <select 
                        className="form-control" 
                        value={source.type} 
                        onChange={(e) => updateSourceType(source.id, e.target.value)}
                      >
                        <option>Manual Upload</option>
                        <option>Direct Database</option>
                        <option>SFTP Pull</option>
                        <option>API Fetch</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid #F1F5F9', paddingTop: '24px' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: '1', height: '48px' }}>
                {editingMaster ? 'Synchronize Updates' : 'Confirm Configuration'}
              </button>
              <button type="button" className="btn btn-outline" style={{ flex: '1', height: '48px' }} onClick={() => setShowForm(false)}>Discard</button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="responsive-table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Configuration Name</th>
                <th>Logic</th>
                <th>Primary Mode</th>
                <th>Frequency</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {masters.map(m => (
                <tr key={m.id} className="hover-scale">
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Database size={18} color="var(--primary)" />
                      </div>
                      <div style={{ fontWeight: '700', color: '#1E293B' }}>{m.name}</div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: '800', fontSize: '11px', background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '6px' }}>
                      {m.matching_logic?.toUpperCase() || '2-WAY'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                      {m.run_mode === 'Automatic (Cron)' ? <Zap size={14} color="#D97706" /> : <Edit3 size={14} color="#64748B" />}
                      {m.run_mode}
                    </div>
                  </td>
                  <td>{m.frequency}</td>
                  <td><span className={`status-pill ${m.status === 'Active' ? 'status-success' : 'status-danger'}`}>{m.status}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleEdit(m)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                        <Edit3 size={18} />
                      </button>
                      <button onClick={() => deleteMaster(m.id, m.name)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#DC2626' }}>
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

      <div className="card" style={{ marginTop: '32px', padding: '24px', background: '#F0F9FF', border: '1px solid #BAE6FD', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Info size={24} color="#0284C7" />
        <p style={{ fontSize: '14px', color: '#0369A1', fontWeight: '600' }}>Master configurations directly dictate the ingestion workflow. Changing the matching logic will automatically update the number of required data sources in the 'Run Reconciliation' module.</p>
      </div>
    </div>
  );
};

export default ReconMaster;
