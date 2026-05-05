import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Play, RotateCcw, CheckCircle2, Loader2 } from 'lucide-react';

const RunRecon = () => {
  const { masters } = useApp();
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [log, setLog] = useState([]);

  const handleStart = () => {
    if (!selectedProduct) return;
    setIsRunning(true);
    setProgress(0);
    setLog(['Initializing reconciliation engine...', 'Connecting to data sources...']);
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 15) + 5;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setIsRunning(false);
        setLog(prev => [...prev, 'Data ingestion complete.', 'Applying matching heuristics...', 'Intelligence engine classified exceptions.', 'Process completed successfully.']);
      }
      setProgress(currentProgress);
      if (currentProgress > 40 && currentProgress < 50) setLog(prev => [...prev, `Fetching records for ${selectedProduct}...`]);
    }, 400);
  };

  return (
    <div className="main-content">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', color: '#0F172A' }}>Reconciliation Execution</h1>
        <p style={{ color: '#64748B', fontSize: '14px', marginTop: '4px' }}>Trigger manual batches and monitor real-time processing logs.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }} className="run-grid">
        <div className="card">
          <h3 style={{ fontSize: '16px', marginBottom: '24px' }}>Configuration</h3>
          <div className="form-group">
            <label className="form-label">Reconciliation Master</label>
            <select className="form-control" value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} disabled={isRunning}>
              <option value="">Select a product...</option>
              {masters.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
          </div>
          
          <div className="form-group" style={{ marginTop: '24px' }}>
            <label className="form-label">Processing Options</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: 'var(--primary)' }} /> Enable AI Suggestion Engine
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: 'var(--primary)' }} /> Auto-reconcile High Confidence Matches (&gt;90%)
              </label>
            </div>
          </div>

          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-light)' }}>
            <button className="btn btn-primary" style={{ width: '100%', height: '44px' }} onClick={handleStart} disabled={isRunning || !selectedProduct}>
              {isRunning ? <Loader2 size={18} className="animate-spin" style={{ marginRight: '8px' }} /> : <Play size={18} style={{ marginRight: '8px' }} />}
              {isRunning ? 'Processing...' : 'Trigger Batch Now'}
            </button>
          </div>
        </div>

        <div className="card" style={{ background: '#0F172A', border: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', color: 'white' }}>System Console</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isRunning ? '#10B981' : '#64748B' }}></span>
              <span style={{ fontSize: '12px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: '700' }}>{isRunning ? 'Engine Online' : 'Idle'}</span>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: '#94A3B8' }}>Execution Progress</span>
              <span style={{ fontSize: '13px', color: 'white', fontWeight: '700' }}>{progress}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#1E293B', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s ease' }}></div>
            </div>
          </div>

          <div style={{ height: '300px', overflowY: 'auto', background: '#020617', borderRadius: '6px', padding: '16px', fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.6', color: '#CBD5E1', border: '1px solid #1E293B' }}>
            {log.length === 0 && <div style={{ color: '#475569' }}>Waiting for batch trigger...</div>}
            {log.map((line, i) => (
              <div key={i} style={{ marginBottom: '4px' }}>
                <span style={{ color: '#64748B' }}>[{new Date().toLocaleTimeString()}]</span> {line}
              </div>
            ))}
            {progress === 100 && (
              <div style={{ marginTop: '12px', padding: '12px', background: '#065F4633', border: '1px solid #05966966', borderRadius: '4px', color: '#34D399' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
                  <CheckCircle2 size={16} /> BATCH SUCCESSFUL
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RunRecon;
