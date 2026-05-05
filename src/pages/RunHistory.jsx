import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FileText, Download, Filter, Calendar, X, Eye } from 'lucide-react';

const RunHistory = () => {
  const { addNotification } = useApp();
  const [selectedRun, setSelectedRun] = useState(null);
  
  const history = [
    { id: 'RUN-1001', product: 'BBPS Daily', date: '05 May 2026', time: '14:20', matched: '4,210', exceptions: '12', status: 'Completed', details: 'Automated batch run for BBPS aggregator. All records ingested via SFTP. No latency issues reported.' },
    { id: 'RUN-1000', product: 'Cash Back', date: '05 May 2026', time: '13:05', matched: '0', exceptions: '0', status: 'Failed', details: 'Database connection timeout during ingestion phase. Retry scheduled for 18:00.' },
    { id: 'RUN-0999', product: 'DigiGold API', date: '04 May 2026', time: '12:00', matched: '1,105', exceptions: '4', status: 'Completed', details: 'API-based reconciliation with DigiGold partner portal. Token-based auth used.' },
    { id: 'RUN-0998', product: 'UPI Internal', date: '04 May 2026', time: '11:45', matched: '8,442', exceptions: '56', status: 'Completed', details: 'High volume matching for internal UPI bridge. Exceptions primarily due to late-night transaction lags.' },
    { id: 'RUN-0997', product: 'BBPS Daily', date: '03 May 2026', time: '14:15', matched: '4,198', exceptions: '15', status: 'Completed', details: 'Standard daily run. 3 manual overrides applied.' },
  ];

  const handleExport = () => {
    addNotification({ title: 'Export Started', message: 'Generating CSV for historical run data...' });
    setTimeout(() => {
      alert('Reconciliation_History_May_2026.csv has been downloaded.');
    }, 1500);
  };

  const handleDateFilter = () => {
    const date = window.prompt("Enter start date (YYYY-MM-DD) for filtering:");
    if (date) {
      alert(`Filtering history for records after ${date}.`);
    }
  };

  return (
    <div className="main-content">
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', color: '#0F172A' }}>Reconciliation Run History</h1>
          <p style={{ color: '#64748B', fontSize: '14px', marginTop: '4px' }}>Historical record of all reconciliation batches executed on the platform.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-outline" onClick={handleDateFilter}><Filter size={16} style={{ marginRight: '8px' }} /> Date Range</button>
          <button className="btn btn-primary" onClick={handleExport}><Download size={16} style={{ marginRight: '8px' }} /> Export History</button>
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
        <div style={{ minWidth: '800px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Run ID</th>
                <th>Product Name</th>
                <th>Execution Date</th>
                <th>Matched</th>
                <th>Exceptions</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.map(run => (
                <tr key={run.id}>
                  <td style={{ fontWeight: '600', color: 'var(--primary)' }}>{run.id}</td>
                  <td>{run.product}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                      <Calendar size={14} color="#64748B" />
                      {run.date} <span style={{ color: '#94A3B8' }}>• {run.time}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: '500' }}>{run.matched}</td>
                  <td style={{ color: run.exceptions !== '0' ? '#DC2626' : 'inherit', fontWeight: '600' }}>{run.exceptions}</td>
                  <td>
                    <span className={`status-pill ${run.status === 'Completed' ? 'status-success' : 'status-danger'}`}>
                      {run.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => setSelectedRun(run)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: '600', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Eye size={14} /> View Logs
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRun && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card animate-fade-in" style={{ maxWidth: '600px', width: '100%', padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
              <h3 style={{ fontSize: '16px' }}>Run Execution Details: {selectedRun.id}</h3>
              <button onClick={() => setSelectedRun(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div><div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>PRODUCT</div><div style={{ fontSize: '14px', fontWeight: '600' }}>{selectedRun.product}</div></div>
                <div><div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>STATUS</div><span className={`status-pill ${selectedRun.status === 'Completed' ? 'status-success' : 'status-danger'}`}>{selectedRun.status}</span></div>
                <div><div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>MATCHED</div><div style={{ fontSize: '14px', fontWeight: '600' }}>{selectedRun.matched}</div></div>
                <div><div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>EXCEPTIONS</div><div style={{ fontSize: '14px', fontWeight: '600', color: '#DC2626' }}>{selectedRun.exceptions}</div></div>
              </div>
              <div style={{ background: '#0F172A', color: '#94A3B8', padding: '16px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.6' }}>
                <div style={{ color: 'var(--primary)', marginBottom: '8px' }}>// Execution Log Summary</div>
                {selectedRun.details}
              </div>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: '24px' }} onClick={() => setSelectedRun(null)}>Close Log View</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RunHistory;
