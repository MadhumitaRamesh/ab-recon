import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Play, 
  Terminal, 
  Database, 
  RefreshCw, 
  CheckCircle, 
  FileUp, 
  Search, 
  Filter, 
  Calendar,
  Clock,
  Activity,
  History,
  ArrowRight,
  AlertCircle,
  Link,
  Table as TableIcon
} from 'lucide-react';

const RunRecon = () => {
  const { addNotification, logAudit, runHistory, setRunHistory, masters, user } = useApp();
  const [selectedMasterId, setSelectedMasterId] = useState('');
  const [runDate, setRunDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState(['> System Standby. Waiting for execution trigger...']);
  const [stepIndex, setStepIndex] = useState(-1);
  const [fileSelections, setFileSelections] = useState({}); // { sourceId: fileName }
  const terminalRef = useRef(null);
  const finishTriggered = useRef(false);

  // Filter states for history
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const selectedMaster = masters.find(m => m.id === parseInt(selectedMasterId));

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  // Reset file selections when master changes
  useEffect(() => {
    setFileSelections({});
  }, [selectedMasterId]);

  const manualSources = selectedMaster?.source_config?.filter(s => s.type === 'Manual Upload') || [];
  const missingFiles = manualSources.filter(s => !fileSelections[s.id]);
  const canExecute = selectedMaster && missingFiles.length === 0;

  const sequence = [
    { msg: '> Validating secure handshake with ingestion gateway...', delay: 500 },
    { msg: '> Handshake Success. Protocol: TLS 1.3 | AES-256', delay: 300 },
    { msg: '> Checking file integrity and checksums...', delay: 600 },
    { msg: '> Data stream initialized. Mapping logic: [TXN_REF] -> [UTN_ID]', delay: 800 },
    { msg: '> Parallel match processing started (Worker Threads: 8)...', delay: 1000 },
    { msg: '> Pattern analysis complete. 0.05% variance detected.', delay: 700 },
    { msg: '> Syncing results to forensic vault...', delay: 600 },
    { msg: '> BUILD SUCCESSFUL. Recon Cycle Terminated.', delay: 400 }
  ];

  useEffect(() => {
    let timer;
    if (isRunning && stepIndex < sequence.length) {
      const delay = stepIndex === -1 ? 0 : sequence[stepIndex].delay;
      timer = setTimeout(() => {
        if (stepIndex === -1) {
          setTerminalLogs([`> Initializing Recon Engine for [${selectedMaster?.name}]...`]);
          setStepIndex(0);
        } else {
          setTerminalLogs(prev => [...prev, sequence[stepIndex].msg]);
          setStepIndex(prev => prev + 1);
        }
      }, delay);
    } else if (isRunning && stepIndex === sequence.length && !finishTriggered.current) {
      finishTriggered.current = true;
      setTimeout(() => finalizeRun(), 500);
    }
    return () => clearTimeout(timer);
  }, [isRunning, stepIndex]);

  const finalizeRun = async () => {
    const runId = `RUN-${Math.floor(Math.random() * 900) + 100}`;
    const now = new Date();
    const startTime = new Date(now.getTime() - 45000).toLocaleTimeString('en-GB', { hour12: false });
    const endTime = now.toLocaleTimeString('en-GB', { hour12: false });
    
    const newRun = { 
      id: runId, 
      product: selectedMaster?.name || 'Master', 
      status: 'Completed', 
      triggerType: selectedMaster?.run_mode || 'Manual',
      matched: '4,218', 
      exceptions: Math.floor(Math.random() * 5).toString(), 
      rawTime: endTime,
      startTime: startTime,
      endTime: endTime,
      rawDate: runDate
    };
    
    await setRunHistory(newRun);
    addNotification({ title: 'Recon Success', message: `${selectedMaster?.name} cycle completed.` });
    logAudit('Manual Run Success', 'Engine', `Cycle ${runId} for ${selectedMaster?.name} verified.`, 'Operations');
    
    setIsRunning(false);
    setIsFinished(true);
  };

  const startEngine = () => {
    if (!canExecute) return;
    finishTriggered.current = false;
    setIsFinished(false);
    setStepIndex(-1);
    setIsRunning(true);
    logAudit('Execution Triggered', 'Engine', `Manual trigger for ${selectedMaster.name} on ${runDate}`, 'System');
  };

  const filteredHistory = runHistory.filter(r => {
    const matchesSearch = r.product.toLowerCase().includes(filterText.toLowerCase()) || r.id.toLowerCase().includes(filterText.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleFileChange = (sourceId, fileName) => {
    setFileSelections(prev => ({ ...prev, [sourceId]: fileName }));
  };

  return (
    <div className="main-content">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', color: '#0F172A', fontWeight: '800' }}>Operational Hub</h1>
        <p style={{ color: '#64748B', fontSize: '15px', marginTop: '4px' }}>Unified gateway for reconciliation execution and historical auditing.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '48px' }}>
        {/* EXECUTION PANEL */}
        <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', borderTop: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <div style={{ padding: '8px', background: 'var(--primary-light)', borderRadius: '10px' }}>
              <Activity size={20} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Trigger Reconciliation</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#64748B' }}>Product Master</label>
              <select 
                className="form-control" 
                value={selectedMasterId} 
                onChange={(e) => setSelectedMasterId(e.target.value)}
                disabled={isRunning}
              >
                <option value="">-- Select Configuration --</option>
                {masters.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#64748B' }}>Run Date</label>
              <input 
                type="date" 
                className="form-control" 
                value={runDate} 
                onChange={(e) => setRunDate(e.target.value)}
                disabled={isRunning}
              />
            </div>
          </div>

          {selectedMaster && (
            <div className="animate-reveal" style={{ flex: 1, padding: '24px', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0', marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: '900', color: 'var(--primary)' }}>INGESTION MATRIX</span>
                <span style={{ fontSize: '11px', fontWeight: '700', background: '#E2E8F0', padding: '2px 8px', borderRadius: '4px' }}>{selectedMaster.run_mode.toUpperCase()}</span>
              </div>
              
              <div style={{ display: 'grid', gap: '12px' }}>
                {selectedMaster.source_config.map(source => (
                  <div key={source.id}>
                    {source.type === 'Manual Upload' ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'white', borderRadius: '12px', border: fileSelections[source.id] ? '1px solid #10B981' : '1px solid #E2E8F0' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '800' }}>Upload File — {source.name}</div>
                          <div style={{ fontSize: '11px', color: fileSelections[source.id] ? '#10B981' : '#94A3B8', fontWeight: '600' }}>
                            {fileSelections[source.id] ? `✓ ${fileSelections[source.id]}` : 'CSV/XLSX required'}
                          </div>
                        </div>
                        <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontSize: '12px', fontWeight: '800', padding: '8px 12px', background: 'var(--primary-light)', borderRadius: '8px' }}>
                          <FileUp size={16} /> Choose
                          <input 
                            type="file" 
                            style={{ display: 'none' }} 
                            disabled={isRunning} 
                            onChange={(e) => handleFileChange(source.id, e.target.files[0]?.name)}
                          />
                        </label>
                      </div>
                    ) : source.type === 'Automatic' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#FFFBEB', borderRadius: '12px', border: '1px solid #FDE68A' }}>
                        <TableIcon size={20} color="#D97706" />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '800', color: '#92400E' }}>Source {source.id}: Automatic Ingestion</div>
                          <div style={{ fontSize: '11px', color: '#B45309' }}>Fetching from internal dataset: <strong>{source.tableName}</strong></div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#F0F9FF', borderRadius: '12px', border: '1px solid #BAE6FD' }}>
                        <Globe size={20} color="#0284C7" />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '800', color: '#075985' }}>Source {source.id}: API Bridge</div>
                          <div style={{ fontSize: '11px', color: '#0369A1' }}>Fetch via Endpoint: <strong>{source.apiUrl}</strong></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!canExecute && selectedMaster && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#DC2626', background: '#FEF2F2', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '12px', fontWeight: '700' }}>
              <AlertCircle size={16} />
              Missing data source: {missingFiles.map(s => s.name).join(', ')}
            </div>
          )}

          <button 
            className="btn btn-primary" 
            onClick={startEngine} 
            disabled={!canExecute || isRunning}
            style={{ width: '100%', height: '54px', fontSize: '15px', fontWeight: '900', borderRadius: '12px', boxShadow: canExecute && !isRunning ? '0 10px 15px -3px rgba(243, 112, 33, 0.3)' : 'none' }}
          >
            {isRunning ? (
              <><RefreshCw size={18} className="animate-spin" /> EXECUTING...</>
            ) : (
              <><Play size={18} fill="white" /> TRIGGER ENGINE</>
            )}
          </button>
        </div>

        {/* TERMINAL PANEL */}
        <div style={{ 
          background: '#0F172A', 
          borderRadius: '24px', 
          padding: '24px', 
          display: 'flex',
          flexDirection: 'column',
          border: '6px solid #1E293B',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          height: '100%'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Terminal size={16} color="var(--gold)" />
              <span style={{ color: 'white', fontSize: '11px', fontWeight: '900', letterSpacing: '1px' }}>RECON CONSOLE V2.4</span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }}></div>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }}></div>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }}></div>
            </div>
          </div>
          
          <div 
            ref={terminalRef}
            style={{ 
              flex: 1, 
              overflowY: 'auto', 
              fontFamily: '"Fira Code", monospace', 
              fontSize: '13px', 
              color: '#94A3B8', 
              lineHeight: '1.8',
              padding: '10px'
            }}
          >
            {terminalLogs.map((log, i) => (
              <div key={i} style={{ 
                color: log.includes('SUCCESS') ? '#10B981' : log.includes('ERROR') ? '#EF4444' : log.includes('Starting') || log.includes('Initializing') ? 'white' : '#94A3B8'
              }}>
                {log}
              </div>
            ))}
            {isRunning && <div className="animate-pulse" style={{ display: 'inline-block', width: '8px', height: '16px', background: 'var(--gold)', verticalAlign: 'middle', marginLeft: '6px' }}></div>}
          </div>
        </div>
      </div>

      {/* HISTORY TABLE */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '24px 32px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', background: '#F0F9FF', borderRadius: '8px' }}>
              <History size={18} color="#0284C7" />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Execution Run History</h3>
          </div>
          <div style={{ display: 'flex', gap: '12px', flex: '1', justifyContent: 'flex-end', minWidth: '300px' }}>
            <div style={{ position: 'relative', maxWidth: '300px', width: '100%' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '14px', color: '#94A3B8' }} />
              <input 
                type="text" 
                placeholder="Search runs..." 
                className="form-control" 
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                style={{ height: '40px', paddingLeft: '36px', fontSize: '13px' }} 
              />
            </div>
            <select 
              className="form-control" 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ height: '40px', width: '130px', fontSize: '13px' }}
            >
              <option value="All">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>

        <div className="responsive-table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Batch ID</th>
                <th>Recon Product</th>
                <th>Trigger</th>
                <th>Run Date</th>
                <th>Status</th>
                <th>Matched</th>
                <th>Exceptions</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map(run => (
                <tr key={run.id}>
                  <td style={{ fontSize: '12px', color: '#64748B', fontWeight: '700' }}>#{run.id}</td>
                  <td><div style={{ fontWeight: '700' }}>{run.product}</div></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: run.triggerType === 'Manual' ? '#64748B' : 'var(--primary)' }}>
                      {run.triggerType === 'Manual' ? <Clock size={12} /> : <Zap size={12} />}
                      {run.triggerType === 'Manual' ? 'Manual' : 'Scheduled'}
                    </div>
                  </td>
                  <td><div style={{ fontSize: '13px', fontWeight: '600' }}>{run.date}</div></td>
                  <td><span className={`status-pill ${run.status === 'Completed' ? 'status-success' : 'status-danger'}`}>{run.status}</span></td>
                  <td><span style={{ fontWeight: '800', color: '#10B981' }}>{run.matched}</span></td>
                  <td><span style={{ fontWeight: '800', color: run.exceptions > 0 ? '#DC2626' : '#64748B' }}>{run.exceptions}</span></td>
                  <td><div style={{ fontSize: '12px', fontWeight: '600', color: '#64748B' }}>{run.startTime}</div></td>
                  <td><div style={{ fontSize: '12px', fontWeight: '600', color: '#64748B' }}>{run.endTime}</div></td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-outline" style={{ height: '32px', padding: '0 12px', fontSize: '11px', fontWeight: '800' }}>View Details</button>
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

export default RunRecon;
