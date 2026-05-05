import React from 'react';
import { useApp } from '../context/AppContext';
import { FileText, Download, Filter, Calendar } from 'lucide-react';

const RunHistory = () => {
  const history = [
    { id: 'RUN-1001', product: 'BBPS Daily', date: '05 May 2026', time: '14:20', matched: '4,210', exceptions: '12', status: 'Completed' },
    { id: 'RUN-1000', product: 'Cash Back', date: '05 May 2026', time: '13:05', matched: '0', exceptions: '0', status: 'Failed' },
    { id: 'RUN-0999', product: 'DigiGold API', date: '04 May 2026', time: '12:00', matched: '1,105', exceptions: '4', status: 'Completed' },
    { id: 'RUN-0998', product: 'UPI Internal', date: '04 May 2026', time: '11:45', matched: '8,442', exceptions: '56', status: 'Completed' },
    { id: 'RUN-0997', product: 'BBPS Daily', date: '03 May 2026', time: '14:15', matched: '4,198', exceptions: '15', status: 'Completed' },
  ];

  return (
    <div className="main-content">
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', color: '#0F172A' }}>Reconciliation Run History</h1>
          <p style={{ color: '#64748B', fontSize: '14px', marginTop: '4px' }}>Historical record of all reconciliation batches executed on the platform.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-outline"><Filter size={16} style={{ marginRight: '8px' }} /> Date Range</button>
          <button className="btn btn-primary"><Download size={16} style={{ marginRight: '8px' }} /> Export History</button>
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
                    <button style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}>
                      View Logs
                    </button>
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
