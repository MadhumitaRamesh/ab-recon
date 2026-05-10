import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Cpu, 
  Clock,
  RefreshCw,
  ArrowRight,
  Calendar,
  CheckCircle,
  XCircle,
  BarChart2,
  Layers
} from 'lucide-react';

const getLocalDate = () => {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
};

const Dashboard = () => {
  const { setActivePage, addNotification, fetchFilteredHistory, runHistory, exceptions, masters } = useApp();
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getLocalDate());

  const allRuns = Array.isArray(runHistory) ? runHistory : [];
  const allExceptions = Array.isArray(exceptions) ? exceptions : [];

  // --- PLATFORM-WIDE KPI CALCULATIONS (synced with Run Recon + Exceptions) ---
  const kpiTotalRuns = allRuns.length;

  const kpiTotalMatched = useMemo(() => allRuns.reduce((sum, r) => {
    const val = typeof r.matched === 'string' ? parseInt(r.matched.replace(/,/g, '')) : (r.matched || 0);
    return sum + (isNaN(val) ? 0 : val);
  }, 0), [allRuns]);

  const kpiTotalExcInRuns = useMemo(() => allRuns.reduce((sum, r) => {
    const val = typeof r.exceptions === 'string' ? parseInt(r.exceptions.replace(/,/g, '')) : (r.exceptions || 0);
    return sum + (isNaN(val) ? 0 : val);
  }, 0), [allRuns]);

  // Matching accuracy: matched / (matched + exceptions from run_history)
  const kpiMatchAccuracy = useMemo(() => {
    const total = kpiTotalMatched + kpiTotalExcInRuns;
    return total > 0 ? ((kpiTotalMatched / total) * 100).toFixed(1) + '%' : '—';
  }, [kpiTotalMatched, kpiTotalExcInRuns]);

  // Pending exceptions: from exceptions table, not Resolved/Closed
  const kpiPendingExceptions = useMemo(() =>
    allExceptions.filter(e => e.status && !['Resolved', 'Closed'].includes(e.status)).length
  , [allExceptions]);

  // Auto-recon efficiency: % of Automatic/Cron runs that Completed
  const kpiAutoEfficiency = useMemo(() => {
    const autoRuns = allRuns.filter(r => r.triggerType && ['Automatic', 'Auto', 'Scheduled'].some(t => r.triggerType.includes(t)));
    const autoCompleted = autoRuns.filter(r => r.status === 'Completed').length;
    return autoRuns.length > 0 ? ((autoCompleted / autoRuns.length) * 100).toFixed(1) + '%' : '—';
  }, [allRuns]);

  const kpis = [
    { label: 'Total Recon Runs', value: kpiTotalRuns.toString(), sub: `${allRuns.filter(r => r.status === 'Completed').length} completed · ${allRuns.filter(r => r.status === 'Failed').length} failed`, icon: TrendingUp, color: 'var(--primary)' },
    { label: 'Matching Accuracy', value: kpiMatchAccuracy, sub: `${kpiTotalMatched.toLocaleString('en-IN')} records matched`, icon: CheckCircle2, color: '#059669' },
    { label: 'Pending Exceptions', value: kpiPendingExceptions.toString(), sub: `${allExceptions.length} total · ${allExceptions.filter(e => e.status === 'Resolved').length} resolved`, icon: AlertCircle, color: '#DC2626' },
    { label: 'Auto-Recon Efficiency', value: kpiAutoEfficiency, sub: 'of automated runs completed', icon: Cpu, color: 'var(--gold)' },
  ];

  // --- DAILY SUMMARY (date-filtered, for the table below) ---
  const dailyRuns = useMemo(() =>
    allRuns.filter(run => run && run.rawDate === selectedDate)
  , [allRuns, selectedDate]);

  const summary = useMemo(() => {
    const map = {};
    dailyRuns.forEach(run => {
      if (!map[run.product]) {
        map[run.product] = { product: run.product, totalMatched: 0, totalExceptions: 0, runs: 0, statuses: [] };
      }
      map[run.product].totalMatched += typeof run.matched === 'string'
        ? parseInt(run.matched.replace(/,/g, '')) || 0
        : (run.matched || 0);
      map[run.product].totalExceptions += typeof run.exceptions === 'string'
        ? parseInt(run.exceptions.replace(/,/g, '')) || 0
        : (run.exceptions || 0);
      map[run.product].runs += 1;
      map[run.product].statuses.push(run.status);
    });
    return Object.values(map);
  }, [dailyRuns]);

  const handleDateChange = async (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    await fetchFilteredHistory({ date });
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await fetchFilteredHistory({ date: selectedDate });
    setTimeout(() => {
      setIsSyncing(false);
      addNotification({ title: 'Dashboard Refreshed', message: `Loaded latest reconciliation data for ${selectedDate}.` });
    }, 800);
  };

  const getOverallStatus = (statuses) => {
    if (statuses.every(s => s === 'Completed')) return 'Completed';
    if (statuses.some(s => s === 'Failed')) return 'Failed';
    return 'Partial';
  };

  return (
    <div className="main-content">
      {/* Header */}
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 32px)', color: '#0F172A', fontWeight: '800' }}>Operational Dashboard</h1>
          <p style={{ color: '#64748B', fontSize: '16px', marginTop: '6px' }}>Consolidated reconciliation summary for your selected date.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <button className="btn btn-outline" onClick={handleManualSync} disabled={isSyncing} style={{ height: '52px' }}>
            <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} style={{ marginRight: '10px' }} /> Sync
          </button>
          <button className="btn btn-primary" onClick={() => setActivePage('runs')} style={{ height: '52px' }}>
            Run New Recon <ArrowRight size={18} style={{ marginLeft: '10px' }} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-4" style={{ marginBottom: '40px' }}>
        {kpis.map((kpi, i) => (
          <div key={i} className="card hover-scale" style={{ padding: '32px', marginBottom: 0, borderBottom: `4px solid ${kpi.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ background: `${kpi.color}15`, color: kpi.color, padding: '12px', borderRadius: '12px' }}>
                <kpi.icon size={24} />
              </div>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#0F172A' }}>{kpi.value}</div>
            <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{kpi.label}</div>
            <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid-2-1">
        {/* Consolidated Summary */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BarChart2 size={18} color="var(--primary)" />
                Daily Reconciliation Summary
              </h3>
              <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>Consolidated view — one row per product</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={16} color="#64748B" />
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                style={{ border: '1px solid var(--border-light)', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', fontWeight: '600', color: '#1E293B', outline: 'none', cursor: 'pointer' }}
              />
              <button className="btn btn-outline" style={{ height: '36px', fontSize: '12px' }} onClick={() => setActivePage('runs')}>View All</button>
            </div>
          </div>

          {summary.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#94A3B8' }}>
              <Calendar size={40} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
              <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '6px' }}>No recons found for this date</div>
              <div style={{ fontSize: '13px' }}>Select a different date or trigger a new reconciliation run.</div>
            </div>
          ) : (
            <div className="responsive-table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product / Master</th>
                    <th style={{ textAlign: 'center' }}>Runs</th>
                    <th style={{ textAlign: 'right' }}>Matched</th>
                    <th style={{ textAlign: 'right' }}>Exceptions</th>
                    <th style={{ textAlign: 'center' }}>Match Rate</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.map((row, i) => {
                    const total = row.totalMatched + row.totalExceptions;
                    const matchRate = total > 0 ? ((row.totalMatched / total) * 100).toFixed(1) : '—';
                    const overallStatus = getOverallStatus(row.statuses);
                    return (
                      <tr key={i} className="hover-scale" style={{ cursor: 'pointer' }} onClick={() => setActivePage('runs')}>
                        <td>
                          <div style={{ fontWeight: '800', color: '#0F172A' }}>{row.product}</div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ background: '#F1F5F9', borderRadius: '20px', padding: '3px 10px', fontSize: '12px', fontWeight: '700', color: '#475569' }}>{row.runs}</span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: '800', color: '#059669', fontSize: '15px' }}>
                          {row.totalMatched.toLocaleString('en-IN')}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: '800', color: row.totalExceptions > 0 ? '#DC2626' : '#059669', fontSize: '15px' }}>
                          {row.totalExceptions.toLocaleString('en-IN')}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '60px', height: '6px', borderRadius: '3px', background: '#E2E8F0', overflow: 'hidden' }}>
                              <div style={{ width: `${matchRate}%`, height: '100%', background: parseFloat(matchRate) >= 95 ? '#059669' : parseFloat(matchRate) >= 80 ? '#F59E0B' : '#DC2626', borderRadius: '3px', transition: 'width 0.5s ease' }} />
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>{matchRate}%</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {overallStatus === 'Completed' ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#DCFCE7', color: '#166534', borderRadius: '20px', padding: '4px 10px', fontSize: '11px', fontWeight: '700' }}>
                              <CheckCircle size={12} /> Completed
                            </span>
                          ) : overallStatus === 'Failed' ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#FEE2E2', color: '#991B1B', borderRadius: '20px', padding: '4px 10px', fontSize: '11px', fontWeight: '700' }}>
                              <XCircle size={12} /> Failed
                            </span>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#FEF3C7', color: '#92400E', borderRadius: '20px', padding: '4px 10px', fontSize: '11px', fontWeight: '700' }}>
                              Partial
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* System Health */}
        <div className="card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px' }}>System Health</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {[
              { label: 'Ingestion Service', status: 'Active', icon: Clock, bg: '#ECFDF5', color: '#059669', pill: 'status-success' },
              { label: 'AI Match Engine', status: 'Active', icon: Cpu, bg: '#ECFDF5', color: '#059669', pill: 'status-success' },
              { label: 'API Gateway', status: 'High Latency', icon: AlertCircle, bg: '#FFFBEB', color: '#D97706', pill: 'status-warning' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ background: item.bg, padding: '10px', borderRadius: '10px' }}><item.icon size={18} color={item.color} /></div>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: '#1E293B' }}>{item.label}</span>
                </div>
                <span className={`status-pill ${item.pill}`}>{item.status}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '1px solid var(--border-light)', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '24px', lineHeight: '1.5' }}>
              All systems are currently monitored by the ABC Recon Intelligence Core.
            </p>
            <button className="btn btn-outline" style={{ width: '100%', height: '52px' }} onClick={() => setActivePage('audit')}>View System Logs</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
