import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Play, CheckCircle2, AlertCircle, RefreshCw, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

const RunRecon = () => {
  const { addNotification, logAudit, setRunHistory } = useApp();
  const [running, setRunning] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('BBPS Daily');
  const [progress, setProgress] = useState(0);

  const products = [
    { name: 'BBPS Daily', records: '4,222' },
    { name: 'DigiGold API', records: '1,109' },
    { name: 'Cash Back Batch', records: '5,000' },
    { name: 'UPI_Aggregator', records: '12,450' }
  ];

  const handleRun = () => {
    setRunning(true);
    setProgress(0);
    logAudit('Manual Run Started', 'Execution', `Triggered reconciliation for ${selectedProduct}`, 'System');
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setRunning(false);
          const newRun = { 
            id: `RUN-${Math.floor(Math.random() * 900) + 100}`, 
            product: selectedProduct, 
            status: 'Completed', 
            matched: Math.floor(Math.random() * 4000 + 1000).toLocaleString(), 
            exceptions: Math.floor(Math.random() * 15).toString(), 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2026' })
          };
          setRunHistory(prevHistory => [newRun, ...prevHistory]);
          addNotification({ title: 'Reconciliation Success', message: `${selectedProduct} cycle completed with ${newRun.exceptions} exceptions.` });
          logAudit('Run Completed', 'Execution', `${selectedProduct} batch success. Matched: ${newRun.matched}, Exceptions: ${newRun.exceptions}`, 'Auto');
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <div className="main-content animate-reveal">
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', color: '#0F172A', fontWeight: '800' }}>Execute Reconciliation</h1>
        <p style={{ color: '#64748B', fontSize: '16px', marginTop: '6px' }}>Trigger manual or scheduled reconciliation cycles for product masters.</p>
      </div>

      <div className="grid-2-1">
        <div className="card" style={{ padding: '40px' }}>
          <div style={{ marginBottom: '32px' }}>
            <label className="form-label" style={{ fontSize: '14px', fontWeight: '800', color: '#475569', marginBottom: '12px', display: 'block' }}>SELECT PRODUCT MASTER</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {products.map(p => (
                <button 
                  key={p.name}
                  onClick={() => setSelectedProduct(p.name)}
                  style={{ 
                    padding: '20px', 
                    borderRadius: '16px', 
                    border: `2px solid ${selectedProduct === p.name ? 'var(--primary)' : '#F1F5F9'}`,
                    background: selectedProduct === p.name ? '#FFF1F2' : 'white',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontWeight: '800', color: selectedProduct === p.name ? 'var(--primary)' : '#1E293B', marginBottom: '4px' }}>{p.name}</div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>{p.records} pending records</div>
                </button>
              ))}
            </div>
          </div>

          {running ? (
            <div style={{ background: '#F8FAFC', padding: '40px', borderRadius: '24px', textAlign: 'center' }}>
              <RefreshCw size={48} color="var(--primary)" className="animate-spin" style={{ marginBottom: '24px' }} />
              <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '12px' }}>Processing {selectedProduct}...</h3>
              <div style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s ease' }}></div>
              </div>
              <div style={{ fontSize: '14px', color: '#64748B', fontWeight: '700' }}>{progress}% Complete</div>
            </div>
          ) : (
            <button 
              className="btn btn-primary" 
              onClick={handleRun}
              style={{ width: '100%', height: '72px', fontSize: '18px', fontWeight: '800', borderRadius: '20px' }}
            >
              Start Reconciliation Cycle <ArrowRight size={22} style={{ marginLeft: '12px' }} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ padding: '32px', background: '#0F172A', color: 'white', border: 'none' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={20} color="var(--gold)" /> Scheduled Tasks
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700' }}>BBPS Auto-Cron</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Every night at 00:00</div>
                </div>
                <div style={{ color: '#22C55E', fontSize: '12px', fontWeight: '800' }}>ACTIVE</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700' }}>DigiGold Bridge</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Every 4 hours</div>
                </div>
                <div style={{ color: '#22C55E', fontSize: '12px', fontWeight: '800' }}>ACTIVE</div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '32px', background: '#ECFDF5', border: '1px solid #D1FAE5' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <ShieldCheck size={24} color="#059669" />
              <div style={{ fontSize: '14px', color: '#065F46', fontWeight: '700' }}>Security standards met: All execution cycles are logged and cryptographically hashed for audit compliance.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RunRecon;
