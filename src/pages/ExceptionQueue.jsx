import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  MoreHorizontal, 
  Zap, 
  Clock, 
  X, 
  ShieldAlert, 
  Filter, 
  Download, 
  ExternalLink,
  ChevronRight,
  Database,
  Calendar,
  Layers,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';

const ExceptionQueue = () => {
  const { 
    exceptions, 
    resolveException, 
    addNotification, 
    masters, 
    fetchFilteredExceptions,
    fetchSuggestions,
    exceptionFilters,
    setExceptionFilters,
    fetchAll
  } = useApp();
  
  const [selectedEx, setSelectedEx] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Filter states
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterProduct, setFilterProduct] = useState('All Products');
  const [filterType, setFilterType] = useState('All Types');
  const [filterPriority, setFilterPriority] = useState('All Priorities');
  const [filterStatus, setFilterStatus] = useState('All Statuses');

  // When the global exceptionFilters context changes (e.g. user clicks "View Exceptions" from RunRecon),
  // update local date filter to match and refresh exceptions with that runId filter.
  useEffect(() => {
    if (exceptionFilters?.runId) {
      // Reset all local filters and fetch for that specific runId
      setFilterDate('');
      setFilterProduct('All Products');
      setFilterType('All Types');
      setFilterPriority('All Priorities');
      setFilterStatus('All Statuses');
      fetchFilteredExceptions({ runId: exceptionFilters.runId });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exceptionFilters?.runId]);

  useEffect(() => {
    // Only run the standard date-based filter if no runId cross-filter is active
    if (exceptionFilters?.runId) return;
    fetchFilteredExceptions({
        date: filterDate,
        master: filterProduct,
        type: filterType,
        priority: filterPriority,
        status: filterStatus
    });
  }, [filterDate, filterProduct, filterType, filterPriority, filterStatus, fetchFilteredExceptions]);

  useEffect(() => {
    const loadSuggestions = async () => {
      if (selectedEx) {
        setIsLoadingSuggestions(true);
        const data = await fetchSuggestions(selectedEx.id);
        setSuggestions(data);
        setIsLoadingSuggestions(false);
      } else {
        setSuggestions([]);
      }
    };
    loadSuggestions();
  }, [selectedEx]);
  
  const handleAcceptMatch = async (candidate) => {
    const success = await resolveException(selectedEx.id, candidate.id);
    if (success) {
      addNotification({ title: 'Exception Resolved', message: `Transaction ${selectedEx.id} has been matched and closed.` });
      setSelectedEx(null);
    }
  };

  const handleExport = () => {
    addNotification({ title: 'Export Initiated', message: 'Generating forensic audit trail for the current filter set (XLSX)...' });
    setTimeout(() => {
      alert('Forensic_Audit_Trail_Filtered.xlsx has been downloaded.');
    }, 1500);
  };

  const clearFilters = () => {
    setFilterDate('');
    setFilterProduct('All Products');
    setFilterType('All Types');
    setFilterPriority('All Priorities');
    setFilterStatus('All Statuses');
  };

  const filteredExceptions = exceptions || [];

  return (
    <div className="main-content">
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: '#0F172A', fontWeight: '800' }}>Exception Intelligence</h1>
          <p style={{ color: '#64748B', fontSize: '15px', marginTop: '4px' }}>Forensic queue driven by dynamic reconciliation engine.</p>
        </div>
        <button className="btn btn-outline" onClick={handleExport} style={{ background: 'white' }}>
          <Download size={16} style={{ marginRight: '8px' }} />
          Export Audit Trail
        </button>
      </div>

      <div className="card" style={{ padding: '24px', marginBottom: '32px', background: 'white' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
          <div style={{ flex: '1', minWidth: '150px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', marginBottom: '6px', textTransform: 'uppercase' }}>Exception Date</label>
            <input type="date" className="form-control" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} style={{ height: '40px', fontSize: '13px' }} />
          </div>
          <div style={{ flex: '1.5', minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', marginBottom: '6px', textTransform: 'uppercase' }}>Recon Product</label>
            <select className="form-control" value={filterProduct} onChange={(e) => setFilterProduct(e.target.value)} style={{ height: '40px', fontSize: '13px' }}>
              <option value="All Products">All Products</option>
              {masters.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
            </select>
          </div>
          <div style={{ flex: '1.2', minWidth: '150px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', marginBottom: '6px', textTransform: 'uppercase' }}>Type</label>
            <select className="form-control" value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ height: '40px', fontSize: '13px' }}>
              <option value="All Types">All Types</option>
              <option value="Amount Mismatch">Amount Mismatch</option>
              <option value="Missing Entry">Missing Entry</option>
              <option value="Duplicate">Duplicate</option>
              <option value="Late Settlement">Late Settlement</option>
            </select>
          </div>
          <div style={{ flex: '1', minWidth: '130px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', marginBottom: '6px', textTransform: 'uppercase' }}>Priority</label>
            <select className="form-control" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={{ height: '40px', fontSize: '13px' }}>
              <option value="All Priorities">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div style={{ flex: '1', minWidth: '130px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', marginBottom: '6px', textTransform: 'uppercase' }}>Status</label>
            <select className="form-control" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ height: '40px', fontSize: '13px' }}>
              <option value="All Statuses">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
          <button 
            onClick={async () => {
              try {
                await fetchAll();
                addNotification({ title: 'Queue Updated', message: 'Exception intelligence refreshed.' });
              } catch (e) {
                addNotification({ title: 'Sync Error', message: e.message, type: 'danger' });
              }
            }}
            className="btn btn-outline" style={{ height: '40px', padding: '0 15px', position: 'relative', zIndex: 10, cursor: 'pointer' }}><RefreshCw size={16} /></button>
          <button 
            onClick={clearFilters}
            className="btn btn-outline" style={{ height: '40px', padding: '0 15px', color: '#64748B' }}>Clear</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedEx ? '1fr 400px' : '1fr', gap: '24px', transition: 'all 0.3s ease' }}>
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="responsive-table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Exception ID</th>
                  <th>Product</th>
                  <th>Ref Number</th>
                  <th>Amount</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredExceptions.map(ex => (
                  <tr key={ex.id} className={selectedEx?.id === ex.id ? 'row-selected' : ''} onClick={() => setSelectedEx(ex)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontSize: '12px', fontWeight: '700', color: '#64748B' }}>#{ex.id}</td>
                    <td style={{ fontWeight: '700' }}>{ex.product}</td>
                    <td style={{ fontSize: '13px' }}>{ex.uniqueRef || ex.ref}</td>
                    <td style={{ fontWeight: '800', color: '#0F172A' }}>₹{ex.amount}</td>
                    <td><span className={`priority-badge priority-${ex.priority.toLowerCase()}`}>{ex.priority}</span></td>
                    <td><span className="status-pill status-warning">{ex.status}</span></td>
                    <td style={{ textAlign: 'right' }}><ChevronRight size={16} color="#94A3B8" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedEx && (
          <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', borderLeft: '4px solid #F59E0B' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Match Assistant</h3>
              <button onClick={() => setSelectedEx(null)} className="btn-icon"><X size={20} /></button>
            </div>
            
            <div style={{ padding: '20px', background: '#FFF7ED', borderRadius: '12px', border: '1px solid #FFEDD5', marginBottom: '32px' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#C2410C', textTransform: 'uppercase', marginBottom: '8px' }}>Source Exception</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#9A3412', marginBottom: '4px' }}>₹{selectedEx.amount}</div>
              <div style={{ fontSize: '13px', color: '#C2410C' }}>Ref: {selectedEx.ref}</div>
            </div>

            <div style={{ fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={14} color="#F59E0B" />
              AI MATCH SUGGESTIONS
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {isLoadingSuggestions ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}><RefreshCw className="animate-spin" /></div>
              ) : suggestions.length > 0 ? (
                suggestions.map(sug => (
                  <div key={sug.candidateId} className="suggestion-card" style={{ padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '700', fontSize: '14px' }}>{sug.candidateId}</span>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#10B981' }}>{sug.confidence}% Match</span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.5', marginBottom: '12px' }}>{sug.reason}</p>
                    <button onClick={() => handleAcceptMatch(sug)} className="btn btn-primary" style={{ width: '100%', height: '36px', fontSize: '12px' }}>Confirm Match</button>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '24px', color: '#94A3B8', fontSize: '13px' }}>No direct candidates found.</div>
              )}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '32px', borderTop: '1px solid #F1F5F9', display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => resolveException(selectedEx.id)}
                className="btn btn-primary" 
                style={{ flex: 1, height: '44px', fontSize: '12px', background: '#10B981', borderColor: '#10B981' }}
              >
                Approve & Close
              </button>
              <button 
                onClick={() => {
                  addNotification({ title: 'Exception Flagged', message: `Transaction ${selectedEx.id} sent for senior review.`, type: 'warning' });
                  setSelectedEx(null);
                }}
                className="btn btn-outline" 
                style={{ flex: 1, height: '44px', fontSize: '12px', color: '#EF4444', borderColor: '#EF4444' }}
              >
                Flag Error
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExceptionQueue;
