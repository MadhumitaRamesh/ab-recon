import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { API_URL } from '../config';
import { Plus, Database, Settings2, Edit3, Trash2, X, Info, Layers, Zap, Globe, Server, UserCheck } from 'lucide-react';

const ReconMaster = () => {
  const { masters, addMaster, updateMaster, deleteMaster, addNotification, searchQuery } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingMaster, setEditingMaster] = useState(null);
  
  const initialFormState = {
    name: '',
    frequency: 'Daily',
    matching_logic: '2-way',
    run_mode: 'Manual',
    source_config: [
      { id: 'A', name: 'Source A', type: 'Manual Upload', tableName: '', apiUrl: '', apiKey: '', sampleRequest: '', sampleResponse: '', apiMapping: [] },
      { id: 'B', name: 'Source B', type: 'Manual Upload', tableName: '', apiUrl: '', apiKey: '', sampleRequest: '', sampleResponse: '', apiMapping: [] }
    ],
    status: 'Active'
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleLogicChange = (logic) => {
    const count = parseInt(logic.split('-')[0]);
    const currentConfig = [...formData.source_config];
    let newConfig = [];

    for (let i = 0; i < count; i++) {
      const char = String.fromCharCode(65 + i);
      const existing = currentConfig.find(c => c.id === char);
      newConfig.push(existing || { id: char, name: `Source ${char}`, type: 'Manual Upload', tableName: '', apiUrl: '', apiKey: '', sampleRequest: '', sampleResponse: '', apiMapping: [] });
    }

    setFormData({ ...formData, matching_logic: logic, source_config: newConfig });
  };

  const updateSourceField = (id, field, value) => {
    setFormData(prev => {
      const newConfig = prev.source_config.map(c => 
        c.id === id ? { ...c, [field]: value } : c
      );
      return { ...prev, source_config: newConfig };
    });
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

  const filteredMasters = (masters || []).filter(m => 
    !searchQuery || m.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="main-content">
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: '1', minWidth: '280px' }}>
          <h1 style={{ fontSize: 'clamp(20px, 4vw, 24px)', color: '#0F172A', fontWeight: '800' }}>Reconciliation Master</h1>
          <p style={{ color: '#64748B', fontSize: '14px', marginTop: '4px' }}>Configure complex multi-way matching rules and ingestion modes.</p>
        </div>
        {!showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ width: 'auto', minWidth: '180px', height: '48px' }}>
            <Plus size={16} style={{ marginRight: '8px' }} /> Create New Master
          </button>
        )}
      </div>

      {showForm && (
        <div className="card" style={{ borderTop: '4px solid var(--primary)', marginBottom: '40px' }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                {formData.source_config.map((source) => (
                  <div key={source.id} style={{ padding: '24px', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div style={{ fontWeight: '900', fontSize: '12px', color: 'var(--primary)', letterSpacing: '1px' }}>SOURCE {source.id}</div>
                      <div style={{ padding: '6px', background: 'white', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                        {source.type === 'Manual Upload' ? <UserCheck size={14} color="#64748B" /> : source.type === 'Automatic' ? <Server size={14} color="#D97706" /> : <Globe size={14} color="#0284C7" />}
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label style={{ fontSize: '12px', color: '#64748B', fontWeight: '700', marginBottom: '8px', display: 'block' }}>Source Label</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={source.name} 
                        onChange={(e) => updateSourceField(source.id, 'name', e.target.value)}
                        placeholder={`e.g. ${source.id === 'A' ? 'Internal Ledger' : 'Bank Statement'}`}
                      />
                    </div>

                    {source.type === 'Manual Upload' && (
                      <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label style={{ fontSize: '12px', color: '#64748B', fontWeight: '700', marginBottom: '8px', display: 'block' }}>Sample File Template (.xlsx, .csv under 5MB)</label>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <input 
                            type="file" 
                            accept=".xlsx,.csv"
                            style={{ fontSize: '12px', flex: 1 }}
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (!file) return;
                              if (file.size > 5 * 1024 * 1024) {
                                addNotification({ title: 'File Too Large', message: 'Template must be under 5MB', type: 'error' });
                                return;
                              }
                              if (editingMaster) {
                                const formData = new FormData();
                                formData.append('file', file);
                                formData.append('sourceLabel', source.name);
                                try {
                                  const res = await fetch(`${API_URL}/recon-masters/${editingMaster.id}/sample-file`, {
                                    method: 'POST',
                                    body: formData
                                  });
                                  const result = await res.json();
                                  if (result.success) {
                                    updateSourceField(source.id, 'sampleTemplate', result.filename);
                                    addNotification({ title: 'Template Uploaded', message: `Format for ${source.name} saved.` });
                                  }
                                } catch (err) {
                                  addNotification({ title: 'Upload Failed', message: err.message, type: 'error' });
                                }
                              } else {
                                // For new masters, we'll just store the file in memory and warn
                                addNotification({ title: 'Save Master First', message: 'Please save the master before uploading templates.', type: 'info' });
                              }
                            }}
                          />
                          {source.sampleTemplate && (
                            <span style={{ fontSize: '11px', color: '#10B981', fontWeight: '700' }}>✓ Saved</span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="form-group">
                      <label style={{ fontSize: '12px', color: '#64748B', fontWeight: '700', marginBottom: '8px', display: 'block' }}>Ingestion Type</label>
                      <select 
                        className="form-control" 
                        value={source.type} 
                        onChange={(e) => updateSourceField(source.id, 'type', e.target.value)}
                      >
                        <option value="Manual Upload">Manual Upload</option>
                        <option value="Automatic">Automatic</option>
                        <option value="API-Based">API-Based</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ marginTop: '16px' }}>
                      <label style={{ fontSize: '11px', color: '#64748B', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Required Column Mapping</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px', padding: '12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                        <div>
                          <label style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '700', marginBottom: '4px', display: 'block' }}>Amount Column</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            style={{ fontSize: '11px', height: '32px' }}
                            value={source.mapping?.amount || 'amount'}
                            onChange={(e) => {
                              const m = source.mapping || { amount: 'amount', reference: 'reference_number' };
                              updateSourceField(source.id, 'mapping', { ...m, amount: e.target.value });
                            }}
                            placeholder="e.g. txn_amount"
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '700', marginBottom: '4px', display: 'block' }}>Reference Column</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            style={{ fontSize: '11px', height: '32px' }}
                            value={source.mapping?.reference || 'reference_number'}
                            onChange={(e) => {
                              const m = source.mapping || { amount: 'amount', reference: 'reference_number' };
                              updateSourceField(source.id, 'mapping', { ...m, reference: e.target.value });
                            }}
                            placeholder="e.g. utr_no"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Conditional Fields */}
                    {source.type === 'Automatic' && (
                      <div className="form-group" style={{ marginTop: '16px' }}>
                        <label style={{ fontSize: '12px', color: '#D97706', fontWeight: '800', marginBottom: '8px', display: 'block' }}>Internal Dataset / Table Name</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={source.tableName || ''} 
                          onChange={(e) => updateSourceField(source.id, 'tableName', e.target.value)}
                          placeholder="e.g. gl_transactions"
                          style={{ borderColor: '#FDE68A', background: '#FFFBEB', fontSize: '13px' }}
                          required
                        />
                      </div>
                    )}

                    {source.type === 'API-Based' && (
                      <div style={{ marginTop: '16px', display: 'grid', gap: '16px' }}>
                        <div className="form-group">
                          <label style={{ fontSize: '12px', color: '#0284C7', fontWeight: '800', marginBottom: '8px', display: 'block' }}>API Endpoint URL</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={source.apiUrl || ''} 
                            onChange={(e) => updateSourceField(source.id, 'apiUrl', e.target.value)}
                            placeholder="e.g. https://api.example.com/transactions"
                            style={{ borderColor: '#BAE6FD', background: '#F0F9FF', fontSize: '13px' }}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label style={{ fontSize: '12px', color: '#0284C7', fontWeight: '800', marginBottom: '8px', display: 'block' }}>API Key / Auth Token</label>
                          <input 
                            type="password" 
                            className="form-control" 
                            value={source.apiKey || ''} 
                            onChange={(e) => updateSourceField(source.id, 'apiKey', e.target.value)}
                            placeholder="Enter API key"
                            style={{ borderColor: '#BAE6FD', background: '#F0F9FF', fontSize: '13px' }}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label style={{ fontSize: '12px', color: '#0284C7', fontWeight: '800', marginBottom: '8px', display: 'block' }}>Sample Request</label>
                          <textarea 
                            className="form-control" 
                            value={source.sampleRequest || ''} 
                            onChange={(e) => updateSourceField(source.id, 'sampleRequest', e.target.value)}
                            placeholder='{ "date": "{{date}}", "product": "{{product}}", "limit": 1000 }'
                            style={{ borderColor: '#BAE6FD', background: '#F0F9FF', fontSize: '12px', height: '80px', fontFamily: 'monospace' }}
                          />
                        </div>

                        <div className="form-group">
                          <label style={{ fontSize: '12px', color: '#0284C7', fontWeight: '800', marginBottom: '8px', display: 'block' }}>Sample Response</label>
                          <textarea 
                            className="form-control" 
                            value={source.sampleResponse || ''} 
                            onChange={(e) => updateSourceField(source.id, 'sampleResponse', e.target.value)}
                            placeholder='{ "transactions": [ { "id": "123", "amount": 500.00, "date": "2024-05-12" } ] }'
                            style={{ borderColor: '#BAE6FD', background: '#F0F9FF', fontSize: '12px', height: '80px', fontFamily: 'monospace' }}
                          />
                        </div>

                        <div className="form-group">
                          <label style={{ fontSize: '12px', color: '#64748B', fontWeight: '800', marginBottom: '8px', display: 'block' }}>Table Insert (Informational)</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={formData.name ? `tbl_api_${formData.name.toLowerCase().replace(/\s+/g, '_')}_${source.id.toLowerCase()}` : 'N/A'} 
                            readOnly
                            style={{ background: '#F1F5F9', fontSize: '12px', color: '#64748B' }}
                          />
                        </div>

                        <div className="form-group">
                          <label style={{ fontSize: '11px', color: '#0284C7', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'block' }}>Field Mapping — API Response to Database</label>
                          <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '12px', padding: '16px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                              <thead>
                                <tr>
                                  <th style={{ textAlign: 'left', fontSize: '10px', color: '#0284C7', paddingBottom: '8px' }}>API Field Name</th>
                                  <th style={{ textAlign: 'left', fontSize: '10px', color: '#0284C7', paddingBottom: '8px' }}>Database Column</th>
                                  <th style={{ width: '40px' }}></th>
                                </tr>
                              </thead>
                              <tbody>
                                {(source.apiMapping || [
                                  { apiField: 'id', dbColumn: 'transaction_id' },
                                  { apiField: 'amount', dbColumn: 'transaction_amount' },
                                  { apiField: 'date', dbColumn: 'transaction_date' }
                                ]).map((mapping, idx) => (
                                  <tr key={idx}>
                                    <td style={{ paddingRight: '8px', paddingBottom: '8px' }}>
                                      <input 
                                        type="text" 
                                        className="form-control" 
                                        value={mapping.apiField} 
                                        onChange={(e) => {
                                          const newMap = [...(source.apiMapping || [
                                            { apiField: 'id', dbColumn: 'transaction_id' },
                                            { apiField: 'amount', dbColumn: 'transaction_amount' },
                                            { apiField: 'date', dbColumn: 'transaction_date' }
                                          ])];
                                          newMap[idx].apiField = e.target.value;
                                          updateSourceField(source.id, 'apiMapping', newMap);
                                        }}
                                        style={{ fontSize: '11px', height: '32px' }}
                                        placeholder="id"
                                      />
                                    </td>
                                    <td style={{ paddingRight: '8px', paddingBottom: '8px' }}>
                                      <input 
                                        type="text" 
                                        className="form-control" 
                                        value={mapping.dbColumn} 
                                        onChange={(e) => {
                                          const newMap = [...(source.apiMapping || [
                                            { apiField: 'id', dbColumn: 'transaction_id' },
                                            { apiField: 'amount', dbColumn: 'transaction_amount' },
                                            { apiField: 'date', dbColumn: 'transaction_date' }
                                          ])];
                                          newMap[idx].dbColumn = e.target.value;
                                          updateSourceField(source.id, 'apiMapping', newMap);
                                        }}
                                        style={{ fontSize: '11px', height: '32px' }}
                                        placeholder="transaction_id"
                                      />
                                    </td>
                                    <td style={{ paddingBottom: '8px' }}>
                                      <button 
                                        type="button" 
                                        onClick={() => {
                                          const newMap = [...(source.apiMapping || [
                                            { apiField: 'id', dbColumn: 'transaction_id' },
                                            { apiField: 'amount', dbColumn: 'transaction_amount' },
                                            { apiField: 'date', dbColumn: 'transaction_date' }
                                          ])].filter((_, i) => i !== idx);
                                          updateSourceField(source.id, 'apiMapping', newMap);
                                        }}
                                        style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                                      >
                                        <X size={14} />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            <button 
                              type="button" 
                              onClick={() => {
                                const newMap = [...(source.apiMapping || [
                                  { apiField: 'id', dbColumn: 'transaction_id' },
                                  { apiField: 'amount', dbColumn: 'transaction_amount' },
                                  { apiField: 'date', dbColumn: 'transaction_date' }
                                ]), { apiField: '', dbColumn: '' }];
                                updateSourceField(source.id, 'apiMapping', newMap);
                              }}
                              className="btn btn-outline" 
                              style={{ width: '100%', height: '32px', fontSize: '11px', marginTop: '8px', borderColor: '#BAE6FD', color: '#0284C7' }}
                            >
                              <Plus size={12} style={{ marginRight: '4px' }} /> Add Mapping Row
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid #F1F5F9', paddingTop: '24px' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: '1', height: '52px', fontWeight: '800' }}>
                {editingMaster ? 'Synchronize Updates' : 'Confirm Configuration'}
              </button>
              <button type="button" className="btn btn-outline" style={{ flex: '1', height: '52px' }} onClick={() => setShowForm(false)}>Discard</button>
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
              {filteredMasters.map(m => (
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
    </div>
  );
};

export default ReconMaster;
