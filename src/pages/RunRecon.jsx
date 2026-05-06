import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Play, CheckCircle2, AlertCircle, RefreshCw, Clock, ArrowRight, ShieldCheck, Database } from 'lucide-react';

const RunRecon = () => {
  const { addNotification, logAudit, setRunHistory, masters } = useApp();
  const [runningId, setRunningId] = useState(null);

  const handleRun = (master) => {
    setRunningId(master.id);
    logAudit('Manual Run Started', 'Execution', `Triggered reconciliation for ${master.name}`, 'System');
    
    setTimeout(() => {
      setRunningId(null);
      const newRun = { 
        id: `RUN-${Math.floor(Math.random() * 900) + 100}`, 
        product: master.name, 
        status: 'Completed', 
        matched: Math.floor(Math.random() * 4000 + 1000).toLocaleString(), 
        exceptions: Math.floor(Math.random() * 15).toString(), 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2026' })
      };
      setRunHistory(prevHistory => [newRun, ...prevHistory]);
      addNotification({ title: 'Reconciliation Success', message: `${master.name} cycle completed with ${newRun.exceptions} exceptions.` });
      logAudit('Run Completed', 'Execution', `${master.name} batch success. Matched: ${newRun.matched}, Exceptions: ${newRun.exceptions}`, 'Auto');
    }, 2000);
  };

  return (
    <div className="main-content animate-reveal">
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '32px', color: '#0F172A', fontWeight: '800' }}>Execute Reconciliation</h1>
          <p style={{ color: '#64748B', fontSize: '16px', marginTop: '6px' }}>Trigger manual reconciliation cycles for registered product masters.</p>
        </div>
        <div style={{ background: '#F8FAFC', padding: '12px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Database size={18} color="var(--primary)" />
          <span style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B' }}>Systems: <span style={{ color: '#059669' }}>Connected</span></span>
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="responsive-table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Master</th>
                <th>Recon Type</th>
                <th>Data Sources</th>
                <th>Frequency</th>
                <th>Last Run Status</th>
                <th style={{ textAlign: 'center' }}>Operations</th>
              </tr>
            </thead>
            <tbody>
              {masters.map(master => (
                <tr key={master.id} className="hover-scale">
                  <td style={{ fontWeight: '800', color: '#1E293B' }}>{master.name}</td>
                  <td><span style={{ background: '#F1F5F9', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' }}>{master.type}</span></td>
                  <td style={{ color: '#64748B', fontWeight: '600' }}>{master.sources}</td>
                  <td style={{ fontWeight: '600' }}>{master.frequency}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#059669' }}></div>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#059669' }}>Healthy</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {runningId === master.id ? (
                      <button className="btn btn-primary" disabled style={{ padding: '8px 20px', fontSize: '12px', opacity: 0.8 }}>
                        <RefreshCw size={14} className="animate-spin" style={{ marginRight: '8px' }} /> Running...
                      </button>
                    ) : (
                      <button 
                        className="btn btn-primary" 
                        onClick={() => handleRun(master)}
                        style={{ padding: '8px 20px', fontSize: '12px' }}
                      >
                        <Play size={14} style={{ marginRight: '8px' }} /> Run Now
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid-2-1" style={{ marginTop: '32px' }}>
        <div className="card" style={{ padding: '32px', background: '#0F172A', color: 'white', border: 'none' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={20} color="var(--gold)" /> Scheduled Schedulers (Cron)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
              <div style={{ fontSize: '14px', fontWeight: '700' }}>BBPS Auto-Cron</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Every night at 00:00 (SOC2 Compliant)</div>
            </div>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
              <div style={{ fontSize: '14px', fontWeight: '700' }}>DigiGold Bridge</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Interval: 4 Hours (API Active)</div>
            </div>
          </div>
        </div>
        <div className="card" style={{ padding: '24px', background: '#ECFDF5', border: '1px solid #D1FAE5', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <ShieldCheck size={32} color="#059669" />
          <p style={{ fontSize: '14px', color: '#065F46', fontWeight: '700', lineHeight: '1.5' }}>Execution Shield Active: All manual triggers are forensically logged with unique transaction hashes.</p>
        </div>
      </div>
    </div>
  );
};

export default RunRecon;
