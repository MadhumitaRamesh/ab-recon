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
    exceptionFilters, 
    setExceptionFilters,
    fetchSuggestions
  } = useApp();
  
  const [selectedEx, setSelectedEx] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [localSearch, setLocalSearch] = useState('');

  // Fetch suggestions when an exception is selected
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
  
  // Advanced filters
  const [masterFilter, setMasterFilter] = useState(exceptionFilters.masterId || 'All');
  const [runIdFilter, setRunIdFilter] = useState(exceptionFilters.runId || '');
  const [typeFilter, setTypeFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Sync local filters with context filters (for deep linking)
  useEffect(() => {
    if (exceptionFilters.runId) setRunIdFilter(exceptionFilters.runId);
    if (exceptionFilters.masterId) setMasterFilter(exceptionFilters.masterId);
  }, [exceptionFilters]);

  const filteredExceptions = (exceptions || []).filter(ex => {
    const matchesSearch = String(ex.id).toLowerCase().includes(localSearch.toLowerCase()) || 
                         String(ex.ref).toLowerCase().includes(localSearch.toLowerCase());
    const matchesMaster = masterFilter === 'All' || String(ex.masterId) === String(masterFilter);
    const matchesRun = !runIdFilter || String(ex.runId).toLowerCase().includes(runIdFilter.toLowerCase());
    const matchesType = typeFilter === 'All' || ex.type === typeFilter;
    const matchesPriority = priorityFilter === 'All' || ex.priority === priorityFilter;
    
    return matchesSearch && matchesMaster && matchesRun && matchesType && matchesPriority;
  });

  const handleAcceptMatch = async (candidate) => {
    const success = await resolveException(selectedEx.id, candidate.id);
    if (success) {
      addNotification({ title: 'Exception Resolved', message: `Transaction ${selectedEx.id} has been matched and closed.` });
      setSelectedEx(null);
    }
  };

  const clearFilters = () => {
    setMasterFilter('All');
    setRunIdFilter('');
    setTypeFilter('All');
    setPriorityFilter('All');
    setExceptionFilters({ runId: '', masterId: '' });
  };

  return (
    <div className="main-content">
      {/* Header Section */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: '#0F172A', fontWeight: '800' }}>Exception Intelligence</h1>
          <p style={{ color: '#64748B', fontSize: '15px', marginTop: '4px' }}>Derived from reconciliation runs. Traceable, auditable, and actionable.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-outline" style={{ background: 'white' }}>
            <Download size={16} style={{ marginRight: '8px' }} /> Export Audit List
          </button>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Filter size={16} color="var(--primary)" />
          <span style={{ fontSize: '12px', fontWeight: '900', color: '#475569', letterSpacing: '0.5px' }}>FORENSIC FILTERS</span>
          {(masterFilter !== 'All' || runIdFilter || typeFilter !== 'All' || priorityFilter !== 'All') && (
            <button onClick={clearFilters} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>CLEAR ALL</button>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '10px' }}>Recon Product</label>
            <select className="form-control" value={masterFilter} onChange={(e) => setMasterFilter(e.target.value)} style={{ height: '38px', fontSize: '13px' }}>
              <option value="All">All Products</option>
              {masters?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '10px' }}>Execution Run ID</label>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94A3B8' }} />
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. RUN-123" 
                value={runIdFilter} 
                onChange={(e) => setRunIdFilter(e.target.value)} 
                style={{ height: '38px', paddingLeft: '34px', fontSize: '13px' }} 
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '10px' }}>Exception Type</label>
            <select className="form-control" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ height: '38px', fontSize: '13px' }}>
              <option value="All">All Types</option>
              <option value="Amount Mismatch">Amount Mismatch</option>
              <option value="Duplicate Reference">Duplicate Reference</option>
              <option value="Missing Side-B">Missing Side-B</option>
              <option value="Invalid Date">Invalid Date</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '10px' }}>Priority Status</label>
            <select className="form-control" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} style={{ height: '38px', fontSize: '13px' }}>
              <option value="All">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedEx ? '1fr 380px' : '1fr', gap: '24px', transition: 'all 0.3s ease' }}>
        {/* Main List */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="responsive-table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Exception ID</th>
                  <th>Logged Date</th>
                  <th>Product & Run</th>
                  <th>Ref Number</th>
                  <th>Amount (INR)</th>
                  <th>Type</th>
                  <th>Priority</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredExceptions.map(ex => (
                  <tr 
                    key={ex.id} 
                    onClick={() => setSelectedEx(ex)} 
                    style={{ 
                      cursor: 'pointer', 
                      background: selectedEx?.id === ex.id ? 'rgba(123, 17, 19, 0.03)' : 'transparent',
                      borderLeft: selectedEx?.id === ex.id ? '4px solid var(--primary)' : '4px solid transparent'
                    }}
                  >
                    <td>
                      <div style={{ fontWeight: '700', color: '#1E293B', fontSize: '13px' }}>{ex.id}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#64748B' }}>{ex.runDate}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary)' }}>{ex.product}</div>
                      <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Layers size={10} /> {ex.runId}
                      </div>
                    </td>
                    <td><code style={{ background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>{ex.ref}</code></td>
                    <td style={{ fontWeight: '900', color: '#1E293B' }}>{ex.amount}</td>
                    <td>
                      <span style={{ fontSize: '11px', fontWeight: '700', padding: '4px 8px', borderRadius: '6px', background: '#F1F5F9', color: '#475569' }}>
                        {ex.type}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${ex.priority === 'High' ? 'status-danger' : ex.priority === 'Medium' ? 'status-warning' : 'status-info'}`} style={{ fontSize: '10px' }}>
                        {ex.priority}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-outline" style={{ padding: '6px', borderRadius: '6px', height: 'auto' }}>
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredExceptions.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>
                      <ShieldAlert size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                      <div style={{ fontWeight: '700' }}>No traceable exceptions found.</div>
                      <p style={{ fontSize: '12px' }}>Try adjusting your forensic filters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Intelligence Side Panel */}
        {selectedEx && (
          <div className="animate-reveal" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card" style={{ borderTop: '4px solid var(--gold)', position: 'sticky', top: '88px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '8px', background: '#FFFBEB', borderRadius: '8px' }}>
                    <Zap size={18} color="#D97706" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: '800' }}>Match Assistant</h3>
                    <p style={{ fontSize: '11px', color: '#64748B' }}>AI-Powered Forensic Mapping</p>
                  </div>
                </div>
                <button onClick={() => setSelectedEx(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={20} /></button>
              </div>

              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '24px' }}>
                <div style={{ fontSize: '11px', fontWeight: '900', color: '#94A3B8', marginBottom: '12px', textTransform: 'uppercase' }}>Exception Detail</div>
                <div style={{ display: 'grid', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#64748B' }}>Ref Number:</span>
                    <span style={{ fontWeight: '700' }}>{selectedEx.ref}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#64748B' }}>Amount:</span>
                    <span style={{ fontWeight: '700' }}>₹ {selectedEx.amount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#64748B' }}>Run Link:</span>
                    <span style={{ fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {selectedEx.runId} <ArrowUpRight size={12} />
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '12px', fontWeight: '900', color: '#475569', marginBottom: '16px' }}>CANDIDATE MATCHES</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {isLoadingSuggestions ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#94A3B8', fontSize: '12px' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px' }} />
                    Analyzing patterns...
                  </div>
                ) : suggestions.length > 0 ? (
                  suggestions.map((sug, i) => (
                    <div key={i} className="js-hover-trigger" style={{ padding: '16px', border: '1px solid #E2E8F0', borderRadius: '12px', transition: 'all 0.2s ease', background: 'white' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '800', fontSize: '13px', color: '#1E293B' }}>{sug.candidateId}</span>
                        <span style={{ fontSize: '10px', background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontWeight: '900' }}>{sug.confidence}% MATCH</span>
                      </div>
                      <p style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.5', marginBottom: '16px' }}>{sug.reason}</p>
                      <button 
                        className="btn btn-primary" 
                        onClick={() => handleAcceptMatch(sug)} 
                        style={{ width: '100%', height: '36px', fontSize: '12px', fontWeight: '800', borderRadius: '8px' }}
                      >
                        Accept & Clear Exception
                      </button>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#94A3B8', fontSize: '12px' }}>
                    No candidates found for this exception.
                  </div>
                )}
              </div>

              <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #F1F5F9', textAlign: 'center' }}>
                <button style={{ background: 'transparent', border: 'none', color: '#64748B', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 auto' }}>
                  <ExternalLink size={14} /> Open Forensic Investigator
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExceptionQueue;
