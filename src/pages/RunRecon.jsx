import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Play, Terminal, Cpu, Database, ShieldCheck, CheckCircle2, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

const RunRecon = () => {
  const { addNotification, logAudit, setRunHistory, masters, user } = useApp();
  const [selectedProduct, setSelectedProduct] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState(['> System Idle. Secure Socket Connection Active.']);
  const [engineStatus, setEngineStatus] = useState('STANDBY');
  const [stepIndex, setStepIndex] = useState(-1);
  const terminalRef = useRef(null);
  const finishTriggered = useRef(false);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  const sequence = [
    { msg: '> Verifying SFTP secure handshake...', delay: 600 },
    { msg: '> Handshake Success. Protocol: TLS 1.3', delay: 400 },
    { msg: `> Requesting data stream from master...`, delay: 800 },
    { msg: '> Internal Ledger: 4,220 entries ingested.', delay: 700 },
    { msg: '> External Statement: 4,218 entries ingested.', delay: 700 },
    { msg: '> Initializing AI Match Engine...', delay: 1000 },
    { msg: '> Processing mapping logic: [TXN_REF] -> [UTN_ID]', delay: 800 },
    { msg: '> Anomaly Detected: 2 records pending review.', delay: 600 },
    { msg: '> Syncing results to audit trail...', delay: 800 },
    { msg: '> BUILD SUCCESSFUL', delay: 500 },
    { msg: '> Recon Cycle Terminated. Exit Code: 0', delay: 300 }
  ];

  useEffect(() => {
    let timer;
    if (isRunning && stepIndex < sequence.length) {
      const delay = stepIndex === -1 ? 0 : sequence[stepIndex].delay;
      timer = setTimeout(() => {
        if (stepIndex === -1) {
          setTerminalLogs([`> Starting Recon Engine for [${selectedProduct || 'System'}]...`]);
          setStepIndex(0);
        } else {
          setTerminalLogs(prev => [...prev, sequence[stepIndex].msg]);
          setStepIndex(prev => prev + 1);
        }
      }, delay);
    } else if (isRunning && stepIndex === sequence.length && !finishTriggered.current) {
      finishTriggered.current = true;
      // Use a slight delay to ensure the last log is rendered before state transition
      setTimeout(() => {
        finalizeBuild();
      }, 500);
    }
    return () => clearTimeout(timer);
  }, [isRunning, stepIndex, selectedProduct]);

  const finalizeBuild = () => {
    try {
      const runId = `RUN-${Math.floor(Math.random() * 900) + 100}`;
      const newRun = { 
        id: runId, 
        product: selectedProduct || 'General Master', 
        status: 'Completed', 
        matched: '4,218', 
        exceptions: '2', 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2026' })
      };
      
      // Batch context updates safely
      setRunHistory(prev => Array.isArray(prev) ? [newRun, ...prev] : [newRun]);
      addNotification({ title: 'Build Success', message: `${selectedProduct} cycle verified.` });
      logAudit('Execution Success', 'Console', `Batch ${runId} finished successfully.`, 'Auto');
      
      setIsRunning(false);
      setIsFinished(true);
      setEngineStatus('COMPLETED');
    } catch (err) {
      console.error('Finalization Failure:', err);
      setIsRunning(false);
      setEngineStatus('ERROR');
    }
  };

  const startEngine = () => {
    if (!selectedProduct) {
      setTerminalLogs(prev => [...prev, '> ERROR: No Product Master selected.']);
      return;
    }
    finishTriggered.current = false;
    setIsFinished(false);
    setStepIndex(-1);
    setIsRunning(true);
    setEngineStatus('EXECUTING');
    logAudit('Manual Run Triggered', 'Console', `Engine initialized for ${selectedProduct}`, 'System');
  };

  if (!user) return null;

  return (
    <div className="main-content animate-reveal">
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '32px', color: '#0F172A', fontWeight: '800' }}>Recon Engine Console</h1>
          <p style={{ color: '#64748B', fontSize: '16px', marginTop: '6px' }}>Secure execution gateway for Aditya Birla Reconciliation Core.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ background: '#F8FAFC', padding: '12px 24px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isRunning ? 'var(--gold)' : isFinished ? '#10B981' : '#CBD5E1', boxShadow: isRunning ? '0 0 15px var(--gold)' : 'none' }}></div>
            <span style={{ fontSize: '14px', fontWeight: '900', color: '#1E293B' }}>ENGINE STATUS: {engineStatus}</span>
          </div>
        </div>
      </div>

      <div className="grid-2-1" style={{ gap: '32px' }}>
        <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px', color: '#1E293B' }}>
             <Database size={22} color="var(--primary)" /> CONFIGURATION
          </h3>
          
          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label className="form-label" style={{ fontWeight: '800', color: '#475569', fontSize: '12px', textTransform: 'uppercase', marginBottom: '12px', display: 'block' }}>Target Product Master</label>
            <select 
              className="form-control" 
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              style={{ height: '56px', borderRadius: '12px', fontSize: '15px' }}
              disabled={isRunning}
            >
              <option value="">-- Select Master --</option>
              {masters.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
              <option value="UPI Aggregator">UPI Aggregator</option>
              <option value="Cash Back Daily">Cash Back Daily</option>
            </select>
          </div>

          <div style={{ flex: 1 }}>
            {isFinished ? (
              <div style={{ padding: '24px', background: '#ECFDF5', borderRadius: '20px', textAlign: 'center', border: '2px solid #D1FAE5' }} className="animate-fade-in">
                <CheckCircle size={32} color="#10B981" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ color: '#064E3B', fontWeight: '900', fontSize: '16px', marginBottom: '4px' }}>BUILD SUCCESSFUL</h4>
                <p style={{ color: '#065F46', fontSize: '12px' }}>Archived to global repository.</p>
                <button 
                  onClick={() => setIsFinished(false)}
                  style={{ marginTop: '16px', background: '#059669', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}
                >
                  Reset Console
                </button>
              </div>
            ) : (
              <div style={{ padding: '24px', background: '#F8FAFC', borderRadius: '18px', border: '1px solid #E2E8F0', marginBottom: '32px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '900', color: '#1E293B', marginBottom: '16px' }}>System Pre-Check</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: '#475569' }}>
                    <CheckCircle2 size={14} color="#10B981" /> SFTP Gateway Online
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: '#475569' }}>
                    <CheckCircle2 size={14} color="#10B981" /> Forensic Vault Synced
                  </div>
                </div>
              </div>
            )}
          </div>

          {!isFinished && (
            <button 
              className="btn btn-primary" 
              onClick={startEngine}
              disabled={isRunning}
              style={{ width: '100%', height: '52px', fontSize: '15px', fontWeight: '900', borderRadius: '12px' }}
            >
              {isRunning ? (
                <><RefreshCw size={18} className="animate-spin" /> EXECUTING...</>
              ) : (
                <><Play size={18} fill="white" /> TRIGGER ENGINE</>
              )}
            </button>
          )}
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
                <Terminal size={18} color="#0F172A" />
              </div>
              <div>
                <span style={{ color: 'white', fontSize: '12px', fontWeight: '900', letterSpacing: '2px', display: 'block' }}>RECON CONSOLE V4.0</span>
              </div>
              <div style={{ flex: 1 }}></div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }}></div>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }}></div>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }}></div>
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
                lineHeight: '2.2'
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
        </div>
      </div>
    </div>
  );
};

export default RunRecon;
