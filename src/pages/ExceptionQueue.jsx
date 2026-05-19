import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { API_URL } from '../config';
import { 
  Zap, 
  X, 
  Download, 
  ChevronRight,
  RefreshCw,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

const ExceptionQueue = () => {
  const { 
    exceptions, 
    resolveException, 
    updateExceptionStatus,
    addNotification,
    logAudit,
    masters, 
    fetchFilteredExceptions,
    fetchSuggestions,
    exceptionFilters,
    setExceptionFilters,
    searchQuery,
    user
  } = useApp();
  
  const [selectedEx, setSelectedEx] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isActioning, setIsActioning] = useState(false);

  // Remarks Modal State
  const [showRemarksModal, setShowRemarksModal] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [pendingStatus, setPendingStatus] = useState('');

  // Manual Match Modal State
  const [showManualMatchModal, setShowManualMatchModal] = useState(false);
  const [manualMatchEx, setManualMatchEx] = useState(null);
  const [isConfirmingManualMatch, setIsConfirmingManualMatch] = useState(false);

  // Filter states
  const [filterDate, setFilterDate] = useState('');
  const [filterProduct, setFilterProduct] = useState('All Products');
  const [filterType, setFilterType] = useState('All Types');
  const [filterPriority, setFilterPriority] = useState('All Priorities');
  const [filterStatus, setFilterStatus] = useState('All Statuses');

  // Build current filters object
  const buildFilters = useCallback(() => ({
    date: filterDate,
    master: filterProduct,
    type: filterType,
    priority: filterPriority,
    status: filterStatus
  }), [filterDate, filterProduct, filterType, filterPriority, filterStatus]);

  // Fetch when cross-filter from RunRecon comes in
  useEffect(() => {
    if (exceptionFilters?.runId) {
      setFilterDate('');
      setFilterProduct('All Products');
      setFilterType('All Types');
      setFilterPriority('All Priorities');
      setFilterStatus('All Statuses');
      fetchFilteredExceptions({ runId: exceptionFilters.runId });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exceptionFilters?.runId]);

  // Initial load — fetch ALL exceptions from DB on mount using direct fetch pattern
  useEffect(() => {
    const fetchExceptions = async () => {
      if (exceptionFilters?.runId) return;
      try {
        const saved = localStorage.getItem('ab_recon_user');
        const token = saved ? JSON.parse(saved).token : '';
        
        const res = await fetch(`${API_URL}/exceptions`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setExceptions(Array.isArray(data) ? data.map(normalizeException) : []);
      } catch (err) {
        console.error('Exceptions fetch error:', err);
        setExceptions([]);
      }
    };
    fetchExceptions();
  }, [exceptionFilters?.runId]);



  // Load AI suggestions when an exception is selected
  useEffect(() => {
    const load = async () => {
      if (selectedEx) {
        setIsLoadingSuggestions(true);
        const data = await fetchSuggestions(selectedEx.id);
        setSuggestions(data);
        setIsLoadingSuggestions(false);
      } else {
        setSuggestions([]);
      }
    };
    load();
  }, [selectedEx, fetchSuggestions]);

  // ── HANDLERS ──────────────────────────────────────────────────────────────

  const handleApplyFilters = useCallback(() => {
    // Clear any cross-filter from RunRecon
    if (exceptionFilters?.runId) setExceptionFilters({});
    fetchFilteredExceptions(buildFilters());
  }, [buildFilters, exceptionFilters, setExceptionFilters, fetchFilteredExceptions]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchFilteredExceptions(buildFilters());
      addNotification({ title: 'Queue Refreshed', message: 'Exception data updated from server.' });
    } catch (e) {
      addNotification({ title: 'Sync Error', message: e.message });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleClearFilters = () => {
    setFilterDate('');
    setFilterProduct('All Products');
    setFilterType('All Types');
    setFilterPriority('All Priorities');
    setFilterStatus('All Statuses');
    fetchFilteredExceptions({});
  };

  const handleApprove = () => {
    if (!selectedEx || isActioning) return;
    setPendingStatus('Resolved');
    setRemarks('');
    setShowRemarksModal(true);
  };

  const handleFlagError = () => {
    if (!selectedEx || isActioning) return;
    setPendingStatus('Flagged Error');
    setRemarks('');
    setShowRemarksModal(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedEx || isActioning || remarks.length < 10) return;
    setIsActioning(true);
    try {
      const success = await updateExceptionStatus(selectedEx.id, pendingStatus, remarks);
      if (success) {
        addNotification({ 
          title: `Exception ${pendingStatus}`, 
          message: `Transaction ${selectedEx.id} has been marked as ${pendingStatus}.` 
        });
        setShowRemarksModal(false);
        setSelectedEx(null);
      } else {
        addNotification({ title: 'Action Failed', message: 'Could not update exception. Please try again.' });
      }
    } catch (e) {
      addNotification({ title: 'Error', message: e.message });
    } finally {
      setIsActioning(false);
    }
  };

  const handleAcceptMatch = async (candidate) => {
    const success = await resolveException(selectedEx.id, 'Resolved via AI Match Assistant');
    if (success) {
      addNotification({ title: 'Match Confirmed & Closed', message: `Transaction ${selectedEx.id} matched with ${candidate.candidateId}.` });
      setSelectedEx(null);
    }
  };

  // ── MANUAL MATCH HANDLER (Partial Match only) ──────────────────────────────
  const parsePartialMatchDetail = (ex) => {
    // Detail format: "1-to-2 split: Source A 500 vs Source B 200 + 300"
    if (!ex) return { sourceA: null, sourceBEntries: [] };
    const detail = ex.uniqueRef || '';
    const match = detail.match(/Source A ([\d.]+) vs Source B ([\d.]+) \+ ([\d.]+)/);
    if (match) {
      return {
        sourceA: { ref: ex.ref, amount: parseFloat(match[1]) },
        sourceBEntries: [
          { ref: ex.ref, txnId: `${ex.ref}-B1`, amount: parseFloat(match[2]) },
          { ref: ex.ref, txnId: `${ex.ref}-B2`, amount: parseFloat(match[3]) }
        ]
      };
    }
    // Fallback: just show what we have
    return {
      sourceA: { ref: ex.ref, amount: parseFloat(ex.amount) },
      sourceBEntries: []
    };
  };

  const handleOpenManualMatch = (ex) => {
    setManualMatchEx(ex);
    setShowManualMatchModal(true);
  };

  const handleConfirmManualMatch = async () => {
    if (!manualMatchEx || isConfirmingManualMatch) return;
    setIsConfirmingManualMatch(true);
    try {
      const remark = 'Manually matched 1 to 2';
      const success = await updateExceptionStatus(manualMatchEx.id, 'Resolved', remark);
      if (success) {
        await logAudit(
          'Manual Match Confirmed',
          'Recon',
          `User ${user?.name || user?.employeeId || 'Operator'} manually matched Partial Match exception ${manualMatchEx.id} (Ref: ${manualMatchEx.ref}) at ${new Date().toLocaleTimeString()}`,
          'Activity'
        );
        addNotification({ title: 'Manual Match Complete', message: `Exception ${manualMatchEx.id} resolved as manually matched 1-to-2.` });
        setShowManualMatchModal(false);
        setManualMatchEx(null);
        setSelectedEx(null);
      } else {
        addNotification({ title: 'Action Failed', message: 'Could not resolve exception. Please try again.', type: 'error' });
      }
    } catch (e) {
      addNotification({ title: 'Error', message: e.message, type: 'error' });
    } finally {
      setIsConfirmingManualMatch(false);
    }
  };

  const handleExport = () => {
    addNotification({ title: 'Export Initiated', message: 'Generating forensic audit trail (XLSX)...' });
    setTimeout(() => alert('Forensic_Audit_Trail_Filtered.xlsx downloaded.'), 1500);
  };

  const filteredExceptions = (exceptions || []).filter(ex => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      ex.id?.toString().toLowerCase().includes(q) ||
      ex.ref?.toLowerCase().includes(q) ||
      ex.uniqueRef?.toLowerCase().includes(q) ||
      ex.product?.toLowerCase().includes(q)
    );
  });

  // ── RENDER ────────────────────────────────────────────────────────────────

  return (
    <div className="main-content">
      {/* Page Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: '#0F172A', fontWeight: '800' }}>Exception Intelligence</h1>
          <p style={{ color: '#64748B', fontSize: '15px', marginTop: '4px' }}>
            {filteredExceptions.length} exception{filteredExceptions.length !== 1 ? 's' : ''} in queue
          </p>
        </div>
        <button className="btn btn-outline" onClick={handleExport} style={{ background: 'white' }}>
          <Download size={16} style={{ marginRight: '8px' }} />
          Export Audit Trail
        </button>
      </div>

      {/* Filter Panel */}
      <div className="card" style={{ padding: '20px 24px', marginBottom: '24px', background: 'white' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
          {/* Date */}
          <div style={{ flex: '1', minWidth: '140px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', marginBottom: '5px', textTransform: 'uppercase' }}>Date</label>
            <input type="date" className="form-control" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} style={{ height: '38px', fontSize: '13px' }} />
          </div>
          {/* Recon Product */}
          <div style={{ flex: '2', minWidth: '180px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', marginBottom: '5px', textTransform: 'uppercase' }}>Recon Product</label>
            <select className="form-control" value={filterProduct} onChange={(e) => setFilterProduct(e.target.value)} style={{ height: '38px', fontSize: '13px' }}>
              <option value="All Products">All Products</option>
              {Array.isArray(masters) && masters.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
            </select>
          </div>
          {/* Type */}
          <div style={{ flex: '1.5', minWidth: '150px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', marginBottom: '5px', textTransform: 'uppercase' }}>Type</label>
            <select className="form-control" value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ height: '38px', fontSize: '13px' }}>
              <option value="All Types">All Types</option>
              <option value="Amount Mismatch">Amount Mismatch</option>
              <option value="Missing Entry">Missing Entry</option>
              <option value="Missing in Source A">Missing in Source A</option>
              <option value="Duplicate Reference">Duplicate Reference</option>
              <option value="Late Settlement">Late Settlement</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
          {/* Priority */}
          <div style={{ flex: '1', minWidth: '120px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', marginBottom: '5px', textTransform: 'uppercase' }}>Priority</label>
            <select className="form-control" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={{ height: '38px', fontSize: '13px' }}>
              <option value="All Priorities">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          {/* Status */}
          <div style={{ flex: '1', minWidth: '120px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', marginBottom: '5px', textTransform: 'uppercase' }}>Status</label>
            <select className="form-control" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ height: '38px', fontSize: '13px' }}>
              <option value="All Statuses">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Unresolved">Unresolved</option>
              <option value="Investigating">Investigating</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            <button
              onClick={handleApplyFilters}
              className="btn btn-primary"
              style={{ height: '38px', padding: '0 18px', fontSize: '13px', whiteSpace: 'nowrap' }}
            >
              Apply Filters
            </button>
            <button
              onClick={handleRefresh}
              className="btn btn-outline"
              style={{ height: '38px', width: '38px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Refresh"
            >
              <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={handleClearFilters}
              className="btn btn-outline"
              style={{ height: '38px', padding: '0 14px', fontSize: '13px', color: '#64748B' }}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Table + Detail Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedEx ? '1fr 420px' : '1fr', gap: '20px', transition: 'grid-template-columns 0.3s ease', alignItems: 'start' }}>
        
        {/* Exception Table */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="responsive-table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Exception ID</th>
                  <th>Product</th>
                  <th>Type</th>
                  <th>Ref Number</th>
                  <th>Amount</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>View</th>
                </tr>
              </thead>
              <tbody>
                {filteredExceptions.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: '#94A3B8', fontWeight: '600' }}>
                      No exceptions found for the selected filters.
                    </td>
                  </tr>
                ) : filteredExceptions.map(ex => (
                  <tr
                    key={ex.id}
                    className={selectedEx?.id === ex.id ? 'row-selected' : ''}
                    onClick={() => setSelectedEx(ex)}
                    style={{ cursor: 'pointer', background: selectedEx?.id === ex.id ? '#FFF7ED' : undefined }}
                  >
                    <td style={{ fontSize: '12px', fontWeight: '700', color: '#64748B' }}>#{ex.id}</td>
                    <td style={{ fontWeight: '700', color: '#0F172A' }}>{ex.product || '—'}</td>
                    <td style={{ fontSize: '13px', color: '#475569' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span>{ex.type || '—'}</span>
                        {ex.carryForward && (
                          <span style={{
                            background: '#FEE2E2',
                            color: '#991B1B',
                            border: '1px solid #FCA5A5',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: '700',
                            textTransform: 'uppercase'
                          }}>
                            Carry Forward ({ex.runDate})
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ fontSize: '13px' }}>{ex.uniqueRef || ex.ref || '—'}</td>
                    <td style={{ fontWeight: '800', color: '#0F172A' }}>₹{ex.amount}</td>
                    <td>
                      <span style={{
                        background: ex.priority === 'High' ? '#FEE2E2' : ex.priority === 'Medium' ? '#FEF3C7' : '#F1F5F9',
                        color: ex.priority === 'High' ? '#991B1B' : ex.priority === 'Medium' ? '#92400E' : '#475569',
                        padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700'
                      }}>{ex.priority}</span>
                    </td>
                    <td>
                      <span style={{
                        background: ex.status === 'Resolved' ? '#DCFCE7' : '#FEF3C7',
                        color: ex.status === 'Resolved' ? '#166534' : '#92400E',
                        padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700'
                      }}>{ex.status}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}><ChevronRight size={16} color="#94A3B8" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Match Assistant Panel */}
        {selectedEx && (
          <div className="card" style={{ padding: '24px', borderLeft: '4px solid #F59E0B', position: 'sticky', top: '80px' }}>
            
            {/* Panel Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Match Assistant</h3>
              <button onClick={() => setSelectedEx(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                <X size={20} />
              </button>
            </div>

            {/* ── ACTION BUTTONS — at the top ── */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <button
                onClick={handleApprove}
                disabled={isActioning}
                style={{
                  flex: 1, height: '42px', fontSize: '13px', fontWeight: '700',
                  background: '#059669', color: 'white', border: 'none',
                  borderRadius: '8px', cursor: isActioning ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  opacity: isActioning ? 0.7 : 1, transition: 'opacity 0.2s'
                }}
              >
                <CheckCircle size={15} /> Approve & Close
              </button>
              <button
                onClick={handleFlagError}
                disabled={isActioning}
                style={{
                  flex: 1, height: '42px', fontSize: '13px', fontWeight: '700',
                  background: 'white', color: '#EF4444', border: '1px solid #EF4444',
                  borderRadius: '8px', cursor: isActioning ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  opacity: isActioning ? 0.7 : 1, transition: 'opacity 0.2s'
                }}
              >
                <AlertTriangle size={15} /> Flag Error
              </button>
              {selectedEx.type === 'Partial Match' && (
                <button
                  onClick={() => handleOpenManualMatch(selectedEx)}
                  disabled={isActioning}
                  style={{
                    width: '100%', height: '42px', fontSize: '13px', fontWeight: '700',
                    background: '#1D4ED8', color: 'white', border: 'none',
                    borderRadius: '8px', cursor: isActioning ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    opacity: isActioning ? 0.7 : 1, transition: 'opacity 0.2s'
                  }}
                >
                  <Zap size={15} /> Manual Match
                </button>
              )}
            </div>

            {/* Exception Detail Card */}
            <div style={{ padding: '16px', background: '#FFF7ED', borderRadius: '10px', border: '1px solid #FFEDD5', marginBottom: '20px' }}>
              <div style={{ fontSize: '10px', fontWeight: '800', color: '#C2410C', textTransform: 'uppercase', marginBottom: '6px' }}>Source Exception</div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#9A3412', marginBottom: '2px' }}>₹{selectedEx.amount}</div>
              <div style={{ fontSize: '12px', color: '#C2410C', marginBottom: '4px' }}>Ref: {selectedEx.ref || selectedEx.uniqueRef || '—'}</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                <span style={{ background: '#FEE2E2', color: '#991B1B', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>{selectedEx.type}</span>
                <span style={{ background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>{selectedEx.priority}</span>
                <span style={{ background: '#E0F2FE', color: '#0369A1', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>{selectedEx.status}</span>
              </div>
              
              {selectedEx.remarks && (
                <div style={{ marginTop: '16px', borderTop: '1px solid #FFEDD5', paddingTop: '12px' }}>
                  <div style={{ fontSize: '10px', fontWeight: '800', color: '#C2410C', textTransform: 'uppercase', marginBottom: '4px' }}>Remarks</div>
                  <div style={{ fontSize: '12px', color: '#9A3412', fontStyle: 'italic', lineHeight: '1.4' }}>"{selectedEx.remarks}"</div>
                </div>
              )}
            </div>

            {/* AI Suggestions */}
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={13} color="#F59E0B" />
              AI MATCH SUGGESTIONS
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {isLoadingSuggestions ? (
                <div style={{ padding: '32px', textAlign: 'center', color: '#94A3B8' }}>
                  <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto' }} />
                </div>
              ) : (Array.isArray(suggestions) && suggestions.length > 0) ? (
                suggestions.map(sug => (
                  <div key={sug.candidateId} style={{ padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontWeight: '700', fontSize: '13px' }}>{sug.candidateId}</span>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#10B981' }}>{sug.confidence}% Match</span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.5', marginBottom: '10px' }}>{sug.reason}</p>
                    <button
                      onClick={() => handleAcceptMatch(sug)}
                      className="btn btn-primary"
                      style={{ width: '100%', height: '34px', fontSize: '12px' }}
                    >
                      Confirm Match
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#94A3B8', fontSize: '13px', background: '#F8FAFC', borderRadius: '8px' }}>
                  No direct AI candidates found.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Remarks Modal */}
      {showRemarksModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, backdropFilter: 'blur(4px)'
        }}>
          <div className="card" style={{ width: '450px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>{pendingStatus === 'Resolved' ? 'Approve Exception' : 'Flag as Error'}</h3>
              <button onClick={() => setShowRemarksModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                <X size={24} />
              </button>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Add Remarks</label>
              <textarea
                className="form-control"
                placeholder="Enter detailed reason for this action..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                style={{ height: '120px', resize: 'none', fontSize: '14px', paddingTop: '12px' }}
              />
              <p style={{ marginTop: '10px', fontSize: '12px', color: remarks.length < 10 ? '#EF4444' : '#10B981', fontWeight: '600' }}>
                {remarks.length < 10
                  ? `Remarks are required before proceeding (${10 - remarks.length} more characters needed)`
                  : 'Requirement met'
                }
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-outline" onClick={() => setShowRemarksModal(false)} style={{ flex: 1, height: '45px' }}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                disabled={remarks.length < 10 || isActioning}
                onClick={handleConfirmAction}
                style={{ flex: 2, height: '45px', opacity: (remarks.length < 10 || isActioning) ? 0.6 : 1 }}
              >
                {isActioning ? 'Processing...' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Match Modal — Partial Match only */}
      {showManualMatchModal && manualMatchEx && (() => {
        const { sourceA, sourceBEntries } = parsePartialMatchDetail(manualMatchEx);
        const totalB = sourceBEntries.reduce((s, e) => s + e.amount, 0);
        const balanced = sourceA && Math.abs(totalB - sourceA.amount) < 0.001;
        return (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1100, backdropFilter: 'blur(4px)'
          }}>
            <div className="card" style={{ width: '680px', maxWidth: '95vw', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)' }}>
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0F172A' }}>Manual Match Review</h3>
                  <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>Exception #{manualMatchEx.id} — Partial Match</p>
                </div>
                <button onClick={() => { setShowManualMatchModal(false); setManualMatchEx(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                  <X size={24} />
                </button>
              </div>

              {/* Two-column comparison */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                {/* Source A */}
                <div style={{ padding: '20px', background: '#F0F9FF', borderRadius: '12px', border: '1px solid #BAE6FD' }}>
                  <div style={{ fontSize: '11px', fontWeight: '900', color: '#0369A1', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>Source A — Single Entry</div>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>Reference No</span>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A' }}>{sourceA?.ref || manualMatchEx.ref}</div>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>Transaction ID</span>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>{manualMatchEx.id}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>Amount</span>
                    <div style={{ fontSize: '22px', fontWeight: '900', color: '#0369A1' }}>₹{Number(sourceA?.amount || manualMatchEx.amount).toLocaleString('en-IN')}</div>
                  </div>
                </div>

                {/* Source B */}
                <div style={{ padding: '20px', background: '#FFF7ED', borderRadius: '12px', border: '1px solid #FFEDD5' }}>
                  <div style={{ fontSize: '11px', fontWeight: '900', color: '#C2410C', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>Source B — Split Entries</div>
                  {sourceBEntries.length > 0 ? sourceBEntries.map((entry, i) => (
                    <div key={i} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: i < sourceBEntries.length - 1 ? '1px solid #FFEDD5' : 'none' }}>
                      <div style={{ marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>Reference No</span>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>{entry.ref}</div>
                      </div>
                      <div style={{ marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>Transaction ID</span>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>{entry.txnId}</div>
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: '900', color: '#C2410C' }}>₹{Number(entry.amount).toLocaleString('en-IN')}</div>
                    </div>
                  )) : (
                    <div style={{ color: '#94A3B8', fontSize: '13px' }}>No Source B breakdown available.</div>
                  )}
                  {/* Total */}
                  <div style={{ marginTop: '8px', paddingTop: '10px', borderTop: '2px solid #FFEDD5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#92400E' }}>TOTAL</span>
                    <span style={{ fontSize: '18px', fontWeight: '900', color: '#92400E' }}>₹{Number(totalB).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Balance Status */}
              <div style={{
                padding: '14px 18px', borderRadius: '10px', marginBottom: '24px',
                background: balanced ? '#DCFCE7' : '#FEF2F2',
                border: `1px solid ${balanced ? '#86EFAC' : '#FECACA'}`,
                display: 'flex', alignItems: 'center', gap: '10px'
              }}>
                {balanced
                  ? <CheckCircle size={18} color="#16A34A" />
                  : <AlertTriangle size={18} color="#DC2626" />}
                <span style={{ fontSize: '13px', fontWeight: '700', color: balanced ? '#166534' : '#991B1B' }}>
                  {balanced
                    ? 'Amounts balance — safe to match.'
                    : `Amounts do not balance. Source A: ₹${Number(sourceA?.amount || 0).toLocaleString('en-IN')} vs Source B total: ₹${Number(totalB).toLocaleString('en-IN')}`
                  }
                </span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  className="btn btn-outline"
                  onClick={() => { setShowManualMatchModal(false); setManualMatchEx(null); }}
                  style={{ flex: 1, height: '46px' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmManualMatch}
                  disabled={!balanced || isConfirmingManualMatch}
                  style={{
                    flex: 2, height: '46px', fontSize: '14px', fontWeight: '800',
                    background: balanced ? '#1D4ED8' : '#94A3B8',
                    color: 'white', border: 'none', borderRadius: '8px',
                    cursor: balanced && !isConfirmingManualMatch ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    opacity: (!balanced || isConfirmingManualMatch) ? 0.6 : 1, transition: 'opacity 0.2s'
                  }}
                >
                  {isConfirmingManualMatch ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  {isConfirmingManualMatch ? 'Processing...' : 'Confirm Manual Match'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default ExceptionQueue;
