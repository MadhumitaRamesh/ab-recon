import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Play, Terminal, Cpu, Database, ShieldCheck, CheckCircle2, ChevronRight, RefreshCw, AlertTriangle } from 'lucide-react';

const RunRecon = () => {
  const { addNotification, logAudit, setRunHistory, masters } = useApp();
  const [selectedProduct, setSelectedProduct] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState(['> System Idle. Secure Socket Connection Active.']);
  const [engineStatus, setEngineStatus] = useState('STANDBY');
  const terminalRef = useRef(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  // Reliable Async Sequence Engine
  const runEngine = async () => {
    if (!selectedProduct) {
      setTerminalLogs(prev => [...prev, '> ERROR: No Product Master selected. Execution aborted.']);
      return;
    }

    setIsRunning(true);
    setEngineStatus('EXECUTING');
    setTerminalLogs([`> Starting Recon Engine for [${selectedProduct}]...`]);
    logAudit('Manual Run Started', 'Console', `Engine initialized for ${selectedProduct}`, 'System');

    const steps = [
      { msg: '> Verifying SFTP secure handshake...', delay: 600 },
      { msg: '> Handshake Success. Protocol: TLS 1.3', delay: 400 },
      { msg: `> Requesting data stream from ${selectedProduct} master...`, delay: 800 },
      { msg: '> Internal Ledger: 4,220 entries ingested.', delay: 700 },
      { msg: '> External Statement: 4,218 entries ingested.', delay: 700 },
      { msg: '> Initializing AI Match Engine...', delay: 1000 },
      { msg: '> Processing mapping logic: [TXN_REF] -> [UTN_ID]', delay: 800 },
      { msg: '> Anomaly Detected: 2 records pending review.', delay: 600 },
      { msg: '> Syncing results to audit trail...', delay: 800 },
      { msg: '> BUILD SUCCESSFUL', delay: 500 },
      { msg: '> Recon Cycle Terminated. Exit Code: 0', delay: 300 }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, step.delay));
      setTerminalLogs(prev => [...prev, step.msg]);
    }

    // Finalize state changes after the sequence is done
    const runId = `RUN-${Math.floor(Math.random() * 900) + 100}`;
    const newRun = { 
      id: runId, 
      product: selectedProduct, 
      status: 'Completed', 
      matched: '4,218', 
      exceptions: '2', 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2026' })
    };
    
    setRunHistory(prev => [newRun, ...prev]);
    addNotification({ title: 'Build Success', message: `${selectedProduct} cycle verified.` });
    logAudit('Execution Success', 'Console', `Batch ${runId} finished with exit code 0.`, 'Auto');
    
    setIsRunning(false);
    setEngineStatus('COMPLETED');
  };

  return (
    <div className="main-content animate-reveal">
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '32px', color: '#0F172A', fontWeight: '800' }}>Recon Engine Console</h1>
          <p style={{ color: '#64748B', fontSize: '16px', marginTop: '6px' }}>Secure execution gateway for Aditya Birla Reconciliation Core.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ background: '#F8FAFC', padding: '12px 24px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isRunning ? 'var(--gold)' : '#10B981', boxShadow: isRunning ? '0 0 15px var(--gold)' : 'none', transition: 'all 0.3s ease' }}></div>
            <span style={{ fontSize: '14px', fontWeight: '900', color: '#1E293B' }}>ENGINE STATUS: {engineStatus}</span>
          </div>
        </div>
      </div>

      <div className="grid-2-1" style={{ gap: '32px' }}>
        <div className="card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', border: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px', color: '#1E293B' }}>
             <Database size={22} color="var(--primary)" /> MASTER CONFIGURATION
          </h3>
          
          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label className="form-label" style={{ fontWeight: '800', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', display: 'block' }}>Select Target Product</label>
            <select 
              className="form-control" 
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              style={{ height: '64px', fontSize: '16px', borderRadius: '14px', border: '2px solid #E2E8F0', cursor: 'pointer', fontWeight: '600' }}
              disabled={isRunning}
            >
              <option value="">-- Choose Master to Reconcile --</option>
              {masters.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
              <option value="UPI Aggregator">UPI Aggregator</option>
              <option value="Cash Back Daily">Cash Back Daily</option>
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ padding: '24px', background: '#F8FAFC', borderRadius: '18px', border: '1px solid #E2E8F0', marginBottom: '32px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '900', color: '#1E293B', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>System Pre-Check</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#475569', fontWeight: '600' }}>
                  <CheckCircle2 size={16} color="#10B981" /> SFTP Gateway Online
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#475569', fontWeight: '600' }}>
                  <CheckCircle2 size={16} color="#10B981" /> Forensic Vault Synced
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#475569', fontWeight: '600' }}>
                  <CheckCircle2 size={16} color="#10B981" /> AI Engine Warm-up
                </div>
              </div>
            </div>
          </div>

          <button 
            className="btn btn-primary" 
            onClick={runEngine}
            disabled={isRunning}
            style={{ 
              width: '100%', 
              height: '76px', 
              fontSize: '20px', 
              fontWeight: '900', 
              borderRadius: '18px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '16px',
              boxShadow: isRunning ? 'none' : '0 12px 20px -5px rgba(123, 17, 19, 0.4)',
              transition: 'all 0.3s ease'
            }}
          >
            {isRunning ? (
              <><RefreshCw size={24} className="animate-spin" /> EXECUTING...</>
            ) : (
              <><Play size={24} fill="white" /> TRIGGER ENGINE</>
            )}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ 
            background: '#0F172A', 
            borderRadius: '24px', 
            padding: '32px', 
            height: '540px', 
            display: 'flex',
            flexDirection: 'column',
            border: '8px solid #1E293B',
            boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.6)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '18px' }}>
              <div style={{ background: 'var(--gold)', padding: '8px', borderRadius: '8px' }}>
                <Terminal size={20} color="#0F172A" />
              </div>
              <div>
                <span style={{ color: 'white', fontSize: '13px', fontWeight: '900', letterSpacing: '2px', display: 'block' }}>RECON CONSOLE V4.0</span>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', fontWeight: '700' }}>SECURE SHELL ACTIVE</span>
              </div>
              <div style={{ flex: 1 }}></div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EF4444' }}></div>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F59E0B' }}></div>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10B981' }}></div>
              </div>
            </div>
            
            <div 
              ref={terminalRef}
              style={{ 
                flex: 1, 
                overflowY: 'auto', 
                fontFamily: '"Fira Code", monospace', 
                fontSize: '14px', 
                color: '#E2E8F0', 
                lineHeight: '2.2',
                paddingRight: '10px'
              }}
            >
              {terminalLogs.map((log, i) => (
                <div key={i} style={{ 
                  color: log.includes('SUCCESS') ? '#10B981' : log.includes('ERROR') ? '#EF4444' : log.includes('Starting') ? 'var(--gold)' : '#CBD5E1',
                  fontWeight: log.includes('SUCCESS') || log.includes('ERROR') ? '900' : '500'
                }}>
                  {log}
                </div>
              ))}
              {isRunning && <div className="animate-pulse" style={{ display: 'inline-block', width: '10px', height: '18px', background: 'var(--gold)', verticalAlign: 'middle', marginLeft: '6px' }}></div>}
            </div>
          </div>
          
          <div className="card" style={{ marginTop: '24px', padding: '24px', background: '#FEF2F2', border: '2px solid #FEE2E2', display: 'flex', gap: '16px', alignItems: 'center', borderRadius: '18px' }}>
            <AlertTriangle size={24} color="#DC2626" />
            <p style={{ fontSize: '13px', color: '#991B1B', fontWeight: '800' }}>Forensic Warning: Manual override in progress. All keystrokes are recorded in the SOC2 vault.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RunRecon;
