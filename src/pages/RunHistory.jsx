import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Download, Filter, Calendar, X, Eye, ChevronDown } from 'lucide-react';

const RunHistory = () => {
  const { addNotification } = useApp();
  const [selectedRun, setSelectedRun] = useState(null);
  const [dateFilter, setDateFilter] = useState('All Time');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  
  const historyData = [
    { id: 'RUN-1001', product: 'BBPS Daily', date: '2026-05-05', time: '14:20', matched: '4,210', exceptions: '12', status: 'Completed', details: 'Automated batch run for BBPS aggregator. All records ingested via SFTP.' },
    { id: 'RUN-1000', product: 'Cash Back', date: '2026-05-05', time: '13:05', matched: '0', exceptions: '0', status: 'Failed', details: 'Database connection timeout during ingestion phase.' },
    { id: 'RUN-0999', product: 'DigiGold API', date: '2026-05-04', time: '12:00', matched: '1,105', exceptions: '4', status: 'Completed', details: 'API-based reconciliation with DigiGold partner portal.' },
    { id: 'RUN-0998', product: 'UPI Internal', date: '2026-05-04', time: '11:45', matched: '8,442', exceptions: '56', status: 'Completed', details: 'High volume matching for internal UPI bridge.' },
    { id: 'RUN-0997', product: 'BBPS Daily', date: '2026-05-03', time: '14:15', matched: '4,198', exceptions: '15', status: 'Completed', details: 'Standard daily run. 3 manual overrides applied.' },
  ];

  const filteredHistory = historyData.filter(run => {
    if (dateFilter === 'All Time') return true;
    if (dateFilter === 'Today') return run.date === '2026-05-05';
    if (dateFilter === 'Yesterday') return run.date === '2026-05-04';
    if (dateFilter === 'Last 7 Days') {
      const runDate = new Date(run.date);
      const sevenDaysAgo = new Date('2026-05-05');
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return runDate >= sevenDaysAgo;
    }
    return true;
  });

  const handleExport = () => {
    addNotification({ title: 'Export Started', message: 'Generating CSV for historical run data...' });
    setTimeout(() => alert('Reconciliation_History_May_2026.csv downloaded.'), 1000);
  };

  return (
    <div className="main-content">
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: '1', minWidth: '280px' }}>
          <h1 style={{ fontSize: 'clamp(20px, 4vw, 24px)', color: '#0F172A' }}>Reconciliation Run History</h1>
          <p style={{ color: '#64748B', fontSize: '14px', marginTop: '4px' }}>Historical record of all reconciliation batches executed on the platform.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', width: '100%', maxWidth: 'fit-content' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '150px' }}>
            <button 
              className="btn btn-outline" 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              style={{ width: '100%', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} /> {dateFilter}
              </div>
              <ChevronDown size={14} />
            </button>
            {showFilterDropdown && (
              <div className="card animate-fade-in" style={{ position: 'absolute', top: '45px', right: 0, width: '100%', zIndex: 50, padding: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', marginBottom: 0 }}>
                {['Today', 'Yesterday', 'Last 7 Days', 'All Time'].map(opt => (
                  <button 
                    key={opt}
                    onClick={() => { setDateFilter(opt); setShowFilterDropdown(false); }}
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      textAlign: 'left', 
                      background: dateFilter === opt ? '#F1F5F9' : 'transparent',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="btn btn-primary" onClick={handleExport} style={{ flex: '1', minWidth: '150px' }}>
            <Download size={16} style={{ marginRight: '8px' }} /> Export
          </button>
        </div>
      </div>

      <div className="responsive-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Run ID</th>
              <th>Product</th>
              <th>Date</th>
              <th>Matched</th>
              <th>Exceptions</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.map(run => (
              <tr key={run.id}>
                <td style={{ fontWeight: '600', color: 'var(--primary)' }}>{run.id}</td>
                <td>{run.product}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{run.date}</td>
                <td>{run.matched}</td>
                <td style={{ color: run.exceptions !== '0' ? '#DC2626' : 'inherit', fontWeight: '600' }}>{run.exceptions}</td>
                <td><span className={`status-pill ${run.status === 'Completed' ? 'status-success' : 'status-danger'}`}>{run.status}</span></td>
                <td>
                  <button 
                    onClick={() => setSelectedRun(run)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: '600', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Eye size={14} /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedRun && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="card animate-fade-in" style={{ maxWidth: '600px', width: '100%', padding: '0', overflow: 'hidden', marginBottom: 0 }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
              <h3 style={{ fontSize: '16px' }}>Details: {selectedRun.id}</h3>
              <button onClick={() => setSelectedRun(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div><div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>PRODUCT</div><div style={{ fontSize: '14px', fontWeight: '600' }}>{selectedRun.product}</div></div>
                <div><div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>STATUS</div><span className={`status-pill ${selectedRun.status === 'Completed' ? 'status-success' : 'status-danger'}`}>{selectedRun.status}</span></div>
              </div>
              <div style={{ background: '#0F172A', color: '#94A3B8', padding: '16px', borderRadius: '6px', fontSize: '12px', lineHeight: '1.6' }}>
                {selectedRun.details}
              </div>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: '24px' }} onClick={() => setSelectedRun(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RunHistory;
