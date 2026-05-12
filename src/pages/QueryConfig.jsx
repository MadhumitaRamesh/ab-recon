import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Settings, 
  Plus, 
  Trash2, 
  Database, 
  Clock, 
  Code, 
  Save, 
  X, 
  AlertCircle 
} from 'lucide-react';

const QueryConfig = () => {
  const { queryConfigs, saveQueryConfig, deleteQueryConfig, masters, addNotification, user, searchQuery } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  
  const [formData, setFormData] = useState({
    recon_master_id: '',
    source_label: '',
    custom_query_template: '',
    time_offset_minutes: 0
  });

  const isAdmin = user?.role === 'Admin';

  const handleOpenModal = (config = null) => {
    if (config) {
      setEditingConfig(config);
      setFormData({
        recon_master_id: config.recon_master_id,
        source_label: config.source_label,
        custom_query_template: config.custom_query_template,
        time_offset_minutes: config.time_offset_minutes
      });
    } else {
      setEditingConfig(null);
      setFormData({
        recon_master_id: masters[0]?.id || '',
        source_label: '',
        custom_query_template: 'SELECT * FROM table WHERE txn_date = \'{{date}}\'',
        time_offset_minutes: 0
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await saveQueryConfig(formData);
    if (success) {
      addNotification({ title: 'Config Saved', message: 'Query template updated successfully.' });
      setShowModal(false);
    } else {
      addNotification({ title: 'Error', message: 'Failed to save configuration.' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this query configuration?')) {
      const success = await deleteQueryConfig(id);
      if (success) {
        addNotification({ title: 'Config Deleted', message: 'Query template removed.' });
      }
    }
  };

  const filteredConfigs = (queryConfigs || []).filter(config => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const master = masters.find(m => m.id === config.recon_master_id);
    return (
      master?.name?.toLowerCase().includes(q) ||
      config.source_label?.toLowerCase().includes(q) ||
      config.custom_query_template?.toLowerCase().includes(q)
    );
  });

  if (!isAdmin) {
    return (
      <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <div style={{ textAlign: 'center' }}>
          <AlertCircle size={48} color="#EF4444" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A' }}>Access Denied</h2>
          <p style={{ color: '#64748B' }}>Only administrators can access query configuration settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: '#0F172A', fontWeight: '800' }}>Query Configuration</h1>
          <p style={{ color: '#64748B', fontSize: '15px', marginTop: '4px' }}>
            Manage custom SQL templates for reconciliation data retrieval.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={16} style={{ marginRight: '8px' }} />
          Add Custom Config
        </button>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Master Product</th>
              <th>Source</th>
              <th>Time Offset</th>
              <th>Last Updated</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredConfigs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '48px', color: '#94A3B8' }}>
                  No custom query configurations found.
                </td>
              </tr>
            ) : filteredConfigs.map(config => {
              const master = masters.find(m => m.id === config.recon_master_id);
              return (
                <tr key={config.id}>
                  <td>
                    <div style={{ fontWeight: '700', color: '#0F172A' }}>{master?.name || 'Unknown'}</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>ID: {config.recon_master_id}</div>
                  </td>
                  <td>
                    <span style={{ background: '#F1F5F9', color: '#475569', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' }}>
                      {config.source_label}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                      <Clock size={14} color="#64748B" />
                      {config.time_offset_minutes} mins
                    </div>
                  </td>
                  <td style={{ fontSize: '13px', color: '#64748B' }}>
                    {new Date(config.updated_at).toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => handleOpenModal(config)}>
                        Edit
                      </button>
                      <button className="btn btn-outline" style={{ padding: '6px 12px', color: '#EF4444', borderColor: '#EF4444' }} onClick={() => handleDelete(config.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, backdropFilter: 'blur(4px)'
        }}>
          <div className="card" style={{ width: '600px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800' }}>
                {editingConfig ? 'Edit Query Config' : 'New Query Config'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>
                    Recon Master
                  </label>
                  <select 
                    className="form-control" 
                    value={formData.recon_master_id} 
                    onChange={(e) => setFormData({...formData, recon_master_id: e.target.value})}
                    required
                  >
                    {masters.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>
                    Source Label
                  </label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Source A"
                    value={formData.source_label}
                    onChange={(e) => setFormData({...formData, source_label: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Time Offset (Minutes)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={formData.time_offset_minutes}
                    onChange={(e) => setFormData({...formData, time_offset_minutes: parseInt(e.target.value)})}
                    style={{ width: '120px' }}
                  />
                  <span style={{ fontSize: '13px', color: '#64748B' }}>
                    Use negative values (e.g. -30) to capture late-night transactions.
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>
                    SQL Query Template
                  </label>
                  <div style={{ fontSize: '11px', color: '#3B82F6', fontWeight: '700' }}>
                    Available: {'{{date}}'}, {'{{product}}'}, {'{{start_timestamp}}'}, {'{{end_timestamp}}'}
                  </div>
                </div>
                <textarea
                  className="form-control"
                  style={{ height: '180px', fontFamily: 'monospace', fontSize: '13px', paddingTop: '12px', lineHeight: '1.6' }}
                  value={formData.custom_query_template}
                  onChange={(e) => setFormData({...formData, custom_query_template: e.target.value})}
                  placeholder="SELECT * FROM my_table WHERE date = '{{date}}'"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                  <Save size={18} style={{ marginRight: '8px' }} />
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueryConfig;
