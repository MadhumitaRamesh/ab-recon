import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Cpu, 
  Clock,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react';

const Dashboard = () => {
  const { setActivePage, addNotification, searchQuery } = useApp();
  const [isSyncing, setIsSyncing] = useState(false);

  const kpis = [
    { label: 'Total Recon Runs', value: '1,422', trend: '+12%', icon: TrendingUp, color: 'var(--primary)' },
    { label: 'Matching Accuracy', value: '96.8%', trend: '+0.4%', icon: CheckCircle2, color: '#059669' },
    { label: 'Pending Exceptions', value: '84', trend: '-12%', icon: AlertCircle, color: '#DC2626' },
    { label: 'Auto-Recon Efficiency', value: '78.2%', trend: '+5.1%', icon: Cpu, color: 'var(--gold)' },
  ];

  const recentRuns = [
    { id: 'RUN-992', product: 'BBPS Daily', status: 'Completed', matched: '4,210', exceptions: '12', time: '14:20' },
    { id: 'RUN-991', product: 'Cash Back', status: 'Failed', matched: '0', exceptions: '0', time: '13:05' },
    { id: 'RUN-990', product: 'DigiGold API', status: 'Completed', matched: '1,105', exceptions: '4', time: '12:00' },
    { id: 'RUN-989', product: 'UPI Internal', status: 'Completed', matched: '8,442', exceptions: '56', time: '11:45' },
  ];

  const filteredRuns = recentRuns.filter(run => 
    run.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
    run.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      addNotification({
        title: 'Data Sync Complete',
        message: 'Successfully synchronized 1,200 records from the core banking system.'
      });
    }, 2000);
  };

  return (
    <div className="main-content">
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', color: '#0F172A' }}>Operational Dashboard</h1>
          <p style={{ color: '#64748B', fontSize: '14px', marginTop: '4px' }}>Real-time summary of reconciliation performance and system health.</p>
        </div>
        <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '500' }}>
          Last updated: Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: '32px' }}>
        {kpis.map((kpi, i) => (
          <div key={i} className="card" style={{ padding: '24px', cursor: 'default' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ 
                background: `${kpi.color}10`, 
                color: kpi.color, 
                padding: '10px', 
                borderRadius: '10px' 
              }}>
                <kpi.icon size={22} />
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px', 
                fontSize: '13px', 
                fontWeight: '600',
                color: kpi.trend.startsWith('+') ? '#059669' : '#DC2626'
              }}>
                {kpi.trend.startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {kpi.trend}
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#0F172A' }}>{kpi.value}</div>
            <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', fontWeight: '500' }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2-1">
        <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <h3 style={{ fontSize: '16px' }}>Recent Reconciliation Runs</h3>
            <button 
              className="btn btn-outline" 
              style={{ height: '32px', fontSize: '12px', whiteSpace: 'nowrap' }}
              onClick={() => setActivePage('runs')}
            >
              View Full History
            </button>
          </div>
          <div style={{ minWidth: '600px' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Batch ID</th>
                  <th>Product Name</th>
                  <th>Status</th>
                  <th>Matched</th>
                  <th>Exceptions</th>
                  <th>Run Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredRuns.length > 0 ? filteredRuns.map(run => (
                  <tr key={run.id}>
                    <td style={{ fontWeight: '600', color: 'var(--primary)' }}>{run.id}</td>
                    <td>{run.product}</td>
                    <td>
                      <span className={`status-pill ${run.status === 'Completed' ? 'status-success' : 'status-danger'}`}>
                        {run.status}
                      </span>
                    </td>
                    <td style={{ fontWeight: '500' }}>{run.matched}</td>
                    <td style={{ color: run.exceptions !== '0' ? '#DC2626' : 'inherit', fontWeight: '600' }}>{run.exceptions}</td>
                    <td style={{ color: '#64748B' }}>{run.time}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                      No matching records found for "{searchQuery}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '16px', marginBottom: '20px' }}>System Health</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Clock size={16} color="#64748B" />
                <span style={{ fontSize: '14px', fontWeight: '500' }}>Ingestion Service</span>
              </div>
              <span className="status-pill status-success">Active</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Cpu size={16} color="#64748B" />
                <span style={{ fontSize: '14px', fontWeight: '500' }}>Intelligence Engine</span>
              </div>
              <span className="status-pill status-success">Active</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <AlertCircle size={16} color="#64748B" />
                <span style={{ fontSize: '14px', fontWeight: '500' }}>API Gateway</span>
              </div>
              <span className="status-pill status-warning">Latency High</span>
            </div>
          </div>
          
          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-light)' }}>
            <h4 style={{ fontSize: '13px', color: '#64748B', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.5px' }}>Quick Actions</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                className="btn btn-outline" 
                style={{ justifyContent: 'space-between', width: '100%' }}
                onClick={() => setActivePage('permissions')}
              >
                System Configuration <ExternalLink size={14} />
              </button>
              <button 
                className="btn btn-outline" 
                style={{ justifyContent: 'space-between', width: '100%', opacity: isSyncing ? 0.7 : 1 }}
                onClick={handleManualSync}
                disabled={isSyncing}
              >
                {isSyncing ? 'Synchronizing...' : 'Manual Data Sync'} 
                {isSyncing ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
