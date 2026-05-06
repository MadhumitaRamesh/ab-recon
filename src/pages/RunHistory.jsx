import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Download, Filter, Calendar, CheckCircle, XCircle, Clock, ChevronRight } from 'lucide-react';

const RunHistory = () => {
  const { runHistory, addNotification, searchQuery } = useApp();
  const [filterStatus, setFilterStatus] = useState('All');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const filteredHistory = (Array.isArray(runHistory) ? runHistory : []).filter(run => {
    if (!run || !run.product) return false;
    const matchesSearch = run.product.toLowerCase().includes(searchQuery.toLowerCase()) || run.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' || run.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleDownload = () => {
    addNotification({ title: 'Exporting History', message: 'Generating comprehensive execution report...' });
    setTimeout(() => alert('ABC_Recon_History_May_2026.xlsx downloaded.'), 1000);
  };

  return (
    <div className={`main-content ${isLoaded ? 'animate-reveal' : ''}`} style={{ opacity: isLoaded ? 1 : 0 }}>
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 32px)', color: '#0F172A', fontWeight: '800' }}>Reconciliation Run History</h1>
          <p style={{ color: '#64748B', fontSize: '16px', marginTop: '6px' }}>Detailed archive of all historical reconciliation cycles and their execution outcomes.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <select 
            className="form-control" 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ width: '180px', height: '52px' }}
          >
            <option value="All">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Failed">Failed</option>
            <option value="In-Progress">In-Progress</option>
          </select>
          <button className="btn btn-primary" onClick={handleDownload} style={{ height: '52px' }}>
            <Download size={18} style={{ marginRight: '10px' }} /> Export History
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="responsive-table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Batch ID</th>
                <th>Recon Product</th>
                <th>Status</th>
                <th>Records Matched</th>
                <th>Exceptions</th>
                <th>Execution Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map(run => (
                <tr key={run.id} className="hover-scale">
                  <td style={{ fontWeight: '800', color: 'var(--primary)' }}>{run.id}</td>
                  <td style={{ fontWeight: '700', color: '#1E293B' }}>{run.product}</td>
                  <td>
                    <span className={`status-pill ${run.status === 'Completed' ? 'status-success' : run.status === 'Failed' ? 'status-danger' : 'status-info'}`}>
                      {run.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ fontWeight: '600' }}>{run.matched}</td>
                  <td style={{ fontWeight: '800', color: parseInt(run.exceptions) > 0 ? '#DC2626' : '#059669' }}>
                    {run.exceptions}
                  </td>
                  <td style={{ color: '#64748B', fontSize: '13px' }}>
                    <div style={{ fontWeight: '700', color: '#1E293B' }}>{run.date}</div>
                    <div>{run.time}</div>
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

export default RunHistory;
