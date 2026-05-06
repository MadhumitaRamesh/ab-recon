import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Cpu, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  ArrowRight
} from 'lucide-react';

const Dashboard = () => {
  const { setActivePage, addNotification, searchQuery, runHistory } = useApp();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const kpis = [
    { label: 'Total Recon Runs', value: runHistory.length.toString(), trend: '+12%', icon: TrendingUp, color: 'var(--primary)' },
    { label: 'Matching Accuracy', value: '96.8%', trend: '+0.4%', icon: CheckCircle2, color: '#059669' },
    { label: 'Pending Exceptions', value: '84', trend: '-12%', icon: AlertCircle, color: '#DC2626' },
    { label: 'Auto-Recon Efficiency', value: '78.2%', trend: '+5.1%', icon: Cpu, color: 'var(--gold)' },
  ];

  const filteredRuns = runHistory.filter(run => 
    run.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
    run.id.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 4); // Show only top 4 on dashboard

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      addNotification({
        title: 'Data Sync Complete',
        message: 'Successfully synchronized latest records from the core banking system.'
      });
    }, 2000);
  };

  return (
    <div className={`main-content ${isLoaded ? 'animate-reveal' : ''}`} style={{ opacity: isLoaded ? 1 : 0 }}>
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 32px)', color: '#0F172A', fontWeight: '800' }}>Operational Dashboard</h1>
          <p style={{ color: '#64748B', fontSize: '16px', marginTop: '6px' }}>Real-time summary of reconciliation performance and system health.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <button className="btn btn-outline" onClick={handleManualSync} disabled={isSyncing} style={{ height: '52px' }}>
            <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} style={{ marginRight: '10px' }} /> Manual Sync
          </button>
          <button className="btn btn-primary" onClick={() => setActivePage('runs')} style={{ height: '52px' }}>
            Run New Recon <ArrowRight size={18} style={{ marginLeft: '10px' }} />
          </button>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: '40px' }}>
        {kpis.map((kpi, i) => (
          <div key={i} className="card hover-scale" style={{ padding: '32px', marginBottom: 0, borderBottom: `4px solid ${kpi.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ background: `${kpi.color}10`, color: kpi.color, padding: '12px', borderRadius: '12px' }}>
                <kpi.icon size={24} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '800', color: kpi.trend.startsWith('+') ? '#059669' : '#DC2626' }}>
                {kpi.trend}
              </div>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#0F172A' }}>{kpi.value}</div>
            <div style={{ fontSize: '13px', color: '#64748B', marginTop: '6px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2-1">
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Recent Reconciliation Runs</h3>
            <button className="btn btn-outline" style={{ height: '36px', fontSize: '12px' }} onClick={() => setActivePage('history')}>View All</button>
          </div>
          <div className="responsive-table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Batch ID</th>
                  <th>Product</th>
                  <th>Status</th>
                  <th>Exceptions</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredRuns.map(run => (
                  <tr key={run.id} className="hover-scale">
                    <td style={{ fontWeight: '800', color: 'var(--primary)' }}>{run.id}</td>
                    <td style={{ fontWeight: '700' }}>{run.product}</td>
                    <td>
                      <span className={`status-pill ${run.status === 'Completed' ? 'status-success' : 'status-danger'}`}>
                        {run.status}
                      </span>
                    </td>
                    <td style={{ fontWeight: '800', color: parseInt(run.exceptions) > 0 ? '#DC2626' : '#059669' }}>{run.exceptions}</td>
                    <td style={{ color: '#64748B', fontSize: '13px' }}>{run.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px' }}>System Health</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ background: '#ECFDF5', padding: '10px', borderRadius: '10px' }}><Clock size={18} color="#059669" /></div>
                <span style={{ fontSize: '15px', fontWeight: '700', color: '#1E293B' }}>Ingestion Service</span>
              </div>
              <span className="status-pill status-success">Active</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ background: '#ECFDF5', padding: '10px', borderRadius: '10px' }}><Cpu size={18} color="#059669" /></div>
                <span style={{ fontSize: '15px', fontWeight: '700', color: '#1E293B' }}>AI Match Engine</span>
              </div>
              <span className="status-pill status-success">Active</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ background: '#FFFBEB', padding: '10px', borderRadius: '10px' }}><AlertCircle size={18} color="#D97706" /></div>
                <span style={{ fontSize: '15px', fontWeight: '700', color: '#1E293B' }}>API Gateway</span>
              </div>
              <span className="status-pill status-warning">High Latency</span>
            </div>
          </div>
          
          <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '1px solid var(--border-light)', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '24px', lineHeight: '1.5' }}>All systems are currently being monitored by the AB Recon Intelligence Core.</p>
            <button className="btn btn-outline" style={{ width: '100%', height: '52px' }} onClick={() => setActivePage('audit')}>View System Logs</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
