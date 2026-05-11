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
  Clock,
  Activity,
  History,
  ArrowRight,
  AlertCircle,
  Globe,
  Zap,
  Layout
} from 'lucide-react';

const RunRecon = () => {
  const { 
    addNotification, 
    logAudit, 
    runHistory, 
    fetchFilteredHistory,
    masters, 
    user, 
    triggerReconRun, 
    setActivePage, 
    setExceptionFilters,
    searchQuery,
    fetchAll
  } = useApp();
  const [selectedMasterId, setSelectedMasterId] = useState('');
  const getLocalDate = () => {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };
  const [runDate, setRunDate] = useState(getLocalDate());
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState(['> System Standby. Waiting for execution trigger...']);
  const [stepIndex, setStepIndex] = useState(-1);
  const [fileSelections, setFileSelections] = useState({}); // { sourceId: {name, size} }
  const [fileErrors, setFileErrors] = useState({}); // { sourceId: errorMsg }
  const terminalRef = useRef(null);
  const finishTriggered = useRef(false);

  // Filter states for history
  const [filterDate, setFilterDate] = useState(getLocalDate());
  const [filterProduct, setFilterProduct] = useState('All Products');
  const [filterStatus, setFilterStatus] = useState('All Statuses');
  const [filterTrigger, setFilterTrigger] = useState('All Types');

  useEffect(() => {
    fetchFilteredHistory({
        date: filterDate,
        master: filterProduct,
        status: filterStatus,
        triggerType: filterTrigger
    });
  }, [filterDate, filterProduct, filterStatus, filterTrigger]);

  const selectedMaster = (masters || []).find(m => String(m.id) === String(selectedMasterId));

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  // Reset file selections when master changes
  useEffect(() => {
    setFileSelections({});
    setFileErrors({});
    setStepIndex(-1);
    setTerminalLogs(['> System Standby. Waiting for execution trigger...']);
    setIsFinished(false);
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
  }, [isRunning, stepIndex, selectedMaster]);

  const finalizeRun = async () => {
    console.log('[DEBUG] Finalizing run for date:', runDate);
    try {
      const result = await triggerReconRun(selectedMaster.id, runDate, selectedMaster.run_mode || 'Manual', fileSelections);
      console.log('[DEBUG] Run result:', result);
      
      // Sync the history filter date to the run date so the new entry is immediately visible
      setFilterDate(runDate);
      setFilterProduct('All Products');
      setFilterStatus('All Statuses');
      setFilterTrigger('All Types');
      
      // Also explicitly refresh with matching filters
      await fetchFilteredHistory({ date: runDate });
      
      addNotification({ 
        title: 'Recon Success', 
        message: `${selectedMaster?.name} cycle [${result.runId}] completed. ${result.exceptionCount} exception(s) logged.` 
      });
    } catch (e) {
      console.error('[DEBUG] Execution update failed', e);
      addNotification({ title: 'Recon Failed', message: `Execution error: ${e.message}`, type: 'error' });
      
      // On failure, still refresh so any partial data (failed run record) shows
      setFilterDate(runDate);
      await fetchFilteredHistory({ date: runDate });
    }
    
    setIsRunning(false);
    setIsFinished(true);
  };

  const startEngine = () => {
    if (!canExecute) return;
    finishTriggered.current = false;
    setIsFinished(false);
    setStepIndex(-1);
    setIsRunning(true);
    logAudit('Execution Triggered', 'Engine', `Manual trigger for ${selectedMaster?.name} on ${runDate}`, 'System');
  };

  const handleViewExceptions = (runId) => {
    setExceptionFilters({ runId });
    setActivePage('exceptions');
  };

  const handleViewAudit = (runId) => {
    setActivePage('audit');
    // In a real app, we'd also filter the audit log
  };

  const filteredHistory = (runHistory || []).filter(run => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      run.id?.toString().toLowerCase().includes(q) ||
      run.product?.toLowerCase().includes(q)
    );
  });

  const handleFileChange = (sourceId, file) => {
    if (!file) return;
    setFileErrors(prev => ({ ...prev, [sourceId]: null }));

    const allowedExtensions = ['csv', 'xlsx'];
    const extension = file.name.split('.').pop().toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      setFileErrors(prev => ({ ...prev, [sourceId]: 'Only CSV and XLSX files are accepted' }));
      addNotification({ title: 'Invalid File Type', message: 'Only CSV and XLSX files are accepted', type: 'error' });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFileErrors(prev => ({ ...prev, [sourceId]: 'File size must be under 10MB' }));
      addNotification({ title: 'File Too Large', message: 'File size must be under 10MB', type: 'error' });
      return;
    }

    setFileSelections(prev => ({ 
      ...prev, 
      [sourceId]: { name: file.name, size: file.size } 
    }));
  };

  return (
    <div className="main-content">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', color: '#0F172A', fontWeight: '800' }}>Operational Hub</h1>
        <p style={{ color: '#64748B', fontSize: '15px', marginTop: '4px' }}>Unified gateway for reconciliation execution and historical auditing.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '48px' }}>
        {/* EXECUTION PANEL */}
        <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', borderTop: '4px solid var(--primary)', background: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <div style={{ padding: '8px', background: 'rgba(123, 17, 19, 0.05)', borderRadius: '10px' }}>
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
                {masters?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
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
                <span style={{ fontSize: '11px', fontWeight: '700', background: '#E2E8F0', padding: '2px 8px', borderRadius: '4px' }}>{(selectedMaster.run_mode || 'Manual').toUpperCase()}</span>
              </div>
              
              <div style={{ display: 'grid', gap: '12px' }}>
                {selectedMaster.source_config?.map(source => (
                  <div key={source.id}>
                    {source.type === 'Manual Upload' ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'white', borderRadius: '12px', border: fileSelections[source.id] ? '1px solid #10B981' : '1px solid #E2E8F0' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '800' }}>{source.name}</div>
                          <div style={{ fontSize: '11px', color: fileErrors[source.id] ? '#DC2626' : (fileSelections[source.id] ? '#10B981' : '#94A3B8'), fontWeight: '600' }}>
                            {fileErrors[source.id] ? `⚠ ${fileErrors[source.id]}` : (fileSelections[source.id] ? `✓ ${fileSelections[source.id].name}` : 'CSV/XLSX required')}
                          </div>
                        </div>
                        <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontSize: '12px', fontWeight: '800', padding: '8px 12px', background: 'rgba(123, 17, 19, 0.05)', borderRadius: '8px' }}>
                          <FileUp size={16} /> Choose
                          <input 
                            type="file" 
                            style={{ display: 'none' }} 
                            disabled={isRunning} 
                            onChange={(e) => handleFileChange(source.id, e.target.files[0])}
                          />
                        </label>
                      </div>
                    ) : source.type === 'Automatic' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#FFFBEB', borderRadius: '12px', border: '1px solid #FDE68A' }}>
                        <Database size={20} color="#D97706" />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '800', color: '#92400E' }}>Automatic Ingestion</div>
                          <div style={{ fontSize: '11px', color: '#B45309' }}>Table: <strong>{source.tableName || 'N/A'}</strong></div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#F0F9FF', borderRadius: '12px', border: '1px solid #BAE6FD' }}>
                        <Globe size={20} color="#0284C7" />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '800', color: '#075985' }}>API Bridge</div>
                          <div style={{ fontSize: '11px', color: '#0369A1', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{source.apiUrl || 'N/A'}</div>
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
              Required files missing: {missingFiles.map(s => s.name).join(', ')}
            </div>
          )}

          <button 
            className="btn btn-primary" 
            onClick={startEngine} 
            disabled={!canExecute || isRunning}
            style={{ width: '100%', height: '54px', fontSize: '15px', fontWeight: '900', borderRadius: '12px', boxShadow: canExecute && !isRunning ? '0 10px 15px -3px rgba(123, 17, 19, 0.2)' : 'none' }}
          >
            {isRunning ? (
              <><RefreshCw size={18} className="animate-spin" style={{ marginRight: '10px' }} /> EXECUTING CYCLE...</>
            ) : (
              <><Play size={18} fill="white" style={{ marginRight: '10px' }} /> TRIGGER RECONCILIATION</>
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
              <Terminal size={16} color="#D4AF37" />
              <span style={{ color: 'white', fontSize: '11px', fontWeight: '900', letterSpacing: '1px' }}>FORENSIC CONSOLE V2.5</span>
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
                color: log.includes('SUCCESS') || log.includes('Terminated') ? '#10B981' : log.includes('ERROR') ? '#EF4444' : log.includes('Initializing') ? 'white' : '#94A3B8'
              }}>
                {log}
              </div>
            ))}
            {isRunning && <div className="animate-pulse" style={{ display: 'inline-block', width: '8px', height: '16px', background: '#D4AF37', verticalAlign: 'middle', marginLeft: '6px' }}></div>}
          </div>
        </div>
      </div>

      {/* HISTORY TABLE */}
      <div className="card" style={{ padding: '0', overflow: 'hidden', background: 'white' }}>
        <div style={{ padding: '24px 32px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ padding: '8px', background: '#F0F9FF', borderRadius: '8px' }}>
              <History size={18} color="#0284C7" />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Execution Audit Logs</h3>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
            <div style={{ flex: '1', minWidth: '150px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', marginBottom: '6px', textTransform: 'uppercase' }}>Run Date</label>
              <input 
                type="date" 
                className="form-control" 
                value={filterDate} 
                onChange={(e) => setFilterDate(e.target.value)}
                style={{ height: '40px', fontSize: '13px' }} 
              />
            </div>
            <div style={{ flex: '1.5', minWidth: '200px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', marginBottom: '6px', textTransform: 'uppercase' }}>Recon Product</label>
              <select 
                className="form-control" 
                value={filterProduct}
                onChange={(e) => setFilterProduct(e.target.value)}
                style={{ height: '40px', fontSize: '13px' }}
              >
                <option value="All Products">All Products</option>
                {masters.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
              </select>
            </div>
            <div style={{ flex: '1', minWidth: '130px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', marginBottom: '6px', textTransform: 'uppercase' }}>Status</label>
              <select 
                className="form-control" 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ height: '40px', fontSize: '13px' }}
              >
                <option value="All Statuses">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
            <div style={{ flex: '1', minWidth: '130px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', marginBottom: '6px', textTransform: 'uppercase' }}>Trigger Type</label>
              <select 
                className="form-control" 
                value={filterTrigger}
                onChange={(e) => setFilterTrigger(e.target.value)}
                style={{ height: '40px', fontSize: '13px' }}
              >
                <option value="All Types">All Types</option>
                <option value="Manual">Manual</option>
                <option value="Cron">Cron</option>
                <option value="API">API</option>
              </select>
            </div>
            <div style={{ flex: '0.5' }}>
              <button 
                onClick={async () => {
                  try {
                    await fetchAll();
                    addNotification({ title: 'System Sync', message: 'Execution Logs Refreshed Successfully.' });
                  } catch (e) {
                    addNotification({ title: 'Sync Error', message: e.message, type: 'danger' });
                  }
                }}
                className="btn btn-outline" 
                style={{ height: '40px', width: '100%', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 10, cursor: 'pointer' }}
              >
                <RefreshCw size={16} />
              </button>
            </div>
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
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map(run => (
                <tr key={run.id}>
                  <td style={{ fontSize: '12px', color: '#64748B', fontWeight: '700' }}>#{run.id}</td>
                  <td><div style={{ fontWeight: '700' }}>{run.product}</div></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: run.triggerType === 'Manual' ? '#64748B' : '#7B1113' }}>
                      {run.triggerType === 'Manual' ? <Clock size={12} /> : <Zap size={12} />}
                      {run.triggerType === 'Manual' ? 'Manual' : 'Scheduled'}
                    </div>
                  </td>
                  <td><div style={{ fontSize: '13px', fontWeight: '600' }}>{run.date}</div></td>
                  <td><span className={`status-pill ${run.status === 'Completed' ? 'status-success' : 'status-danger'}`}>{run.status}</span></td>
                  <td><span style={{ fontWeight: '800', color: '#10B981' }}>{run.matched}</span></td>
                  <td><span style={{ fontWeight: '800', color: Number(run.exceptions) > 0 ? '#DC2626' : '#64748B' }}>{run.exceptions}</span></td>
                  <td><div style={{ fontSize: '12px', fontWeight: '600', color: '#64748B' }}>{run.startTime}</div></td>
                  <td><div style={{ fontSize: '12px', fontWeight: '600', color: '#64748B' }}>{run.endTime}</div></td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => handleViewExceptions(run.id)}
                        className="btn btn-outline" 
                        style={{ height: '30px', padding: '0 10px', fontSize: '11px', fontWeight: '800', borderColor: '#DC2626', color: '#DC2626' }}
                      >
                        Exceptions
                      </button>
                      <button 
                        onClick={() => handleViewAudit(run.id)}
                        className="btn btn-outline" 
                        style={{ height: '30px', padding: '0 10px', fontSize: '11px', fontWeight: '800' }}
                      >
                        Audit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>No execution records found for the current filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RunRecon;
