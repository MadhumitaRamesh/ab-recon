import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Filter, 
  Download, 
  Search, 
  MoreHorizontal, 
  Zap,
  Clock,
  ArrowRight,
  X,
  ShieldAlert
} from 'lucide-react';

const ExceptionQueue = () => {
  const { exceptions, setExceptions, addNotification } = useApp();
  const [selectedEx, setSelectedEx] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');

  // Matching Logic Generator based on selected transaction
  const getSuggestions = (txn) => {
    if (!txn) return [];
    return [
      { id: 'SUG-01', candidateId: `BK-${txn.id.split('-')[1]}`, amount: txn.amount, confidence: 94, reason: `Exact amount match, fuzzy reference match for ${txn.ref}` },
      { id: 'SUG-02', candidateId: `BK-882`, amount: (parseFloat(txn.amount.replace(/,/g, '')) - 5).toFixed(2), confidence: 82, reason: 'High reference similarity, small variance (₹5)' },
      { id: 'SUG-03', candidateId: `BK-110`, confidence: 45, reason: 'Amount match only, different reference pattern' },
    ];
  };

  const filteredExceptions = exceptions.filter(ex => {
    const matchesSearch = ex.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ex.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ex.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'All' || ex.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleAcceptMatch = (candidate) => {
    const updated = exceptions.filter(ex => ex.id !== selectedEx.id);
    setExceptions(updated);
    addNotification({
      title: 'Match Accepted',
      message: `Transaction ${selectedEx.id} matched with ${candidate.candidateId} successfully.`
    });
    setSelectedEx(null);
  };

  const handleReject = () => {
    if (window.confirm("Mark this transaction for manual investigation?")) {
      const updated = exceptions.map(ex => 
        ex.id === selectedEx.id ? { ...ex, status: 'In Investigation', priority: 'High' } : ex
      );
      setExceptions(updated);
      addNotification({ title: 'Transaction Rejected', message: `TXN ${selectedEx.id} moved to high-priority investigation.` });
      setSelectedEx(null);
    }
  };

  const handleExport = () => {
    addNotification({ title: 'Exporting Exceptions', message: 'Preparing exception report for download...' });
    setTimeout(() => alert('Exception_Queue_Report.csv downloaded.'), 1000);
  };

  return (
    <div className="main-content">
      <div style={{ display: 'flex', gap: '24px', flexDirection: 'row', flexWrap: 'wrap' }} className="exception-container">
        <div style={{ flex: '1', minWidth: '300px' }}>
          <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '24px', color: '#0F172A' }}>Exception Intelligence Queue</h1>
              <p style={{ color: '#64748B', fontSize: '14px', marginTop: '4px' }}>Classified unmatched records requiring manual intervention or approval.</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <select 
                  className="btn btn-outline" 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)}
                  style={{ appearance: 'auto', paddingRight: '10px' }}
                >
                  <option value="All">All Types</option>
                  <option value="Amount Mismatch">Amount Mismatch</option>
                  <option value="Missing Entry">Missing Entry</option>
                  <option value="Duplicate">Duplicate</option>
                </select>
              </div>
              <button className="btn btn-outline" onClick={handleExport}><Download size={16} style={{ marginRight: '8px' }} /> Export</button>
            </div>
          </div>

          <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={14} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94A3B8' }} />
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search by ID, Reference or Type..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ height: '34px', fontSize: '13px', paddingLeft: '34px', background: '#F8FAFC' }}
                />
              </div>
            </div>
            <div style={{ minWidth: '700px' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Amount (₹)</th>
                    <th>Type</th>
                    <th>Priority</th>
                    <th>Age</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExceptions.length > 0 ? filteredExceptions.map(ex => (
                    <tr 
                      key={ex.id} 
                      onClick={() => setSelectedEx(ex)}
                      style={{ 
                        cursor: 'pointer',
                        background: selectedEx?.id === ex.id ? '#F1F5F9' : 'inherit'
                      }}
                    >
                      <td style={{ fontWeight: '600', color: 'var(--primary)' }}>{ex.id}</td>
                      <td style={{ fontWeight: '600' }}>{ex.amount}</td>
                      <td>{ex.type}</td>
                      <td>
                        <span style={{ 
                          fontSize: '11px', 
                          fontWeight: '700',
                          color: ex.priority === 'High' ? '#DC2626' : ex.priority === 'Medium' ? '#D97706' : '#059669'
                        }}>
                          {ex.priority}
                        </span>
                      </td>
                      <td style={{ color: '#64748B' }}><div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {ex.age}</div></td>
                      <td><span className="status-pill status-info" style={{ background: '#F1F5F9', color: '#475569' }}>{ex.status}</span></td>
                      <td><MoreHorizontal size={16} color="#94A3B8" /></td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>No exceptions found matching filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {selectedEx && (
          <div className="card animate-fade-in side-panel" style={{ 
            flex: '0.4', 
            minWidth: '320px',
            padding: '0', 
            height: 'fit-content', 
            position: 'sticky', 
            top: '88px',
            zIndex: 10
          }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Zap size={18} color="var(--gold)" />
                <h3 style={{ fontSize: '16px' }}>Match Suggestions</h3>
              </div>
              <button onClick={() => setSelectedEx(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '24px' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>Source Exception</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '700', fontSize: '15px' }}>{selectedEx.id}</span>
                  <span style={{ fontWeight: '800', fontSize: '15px', color: 'var(--primary)' }}>₹{selectedEx.amount}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Ref: {selectedEx.ref}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {getSuggestions(selectedEx).map((sug, i) => (
                  <div key={i} style={{ 
                    padding: '16px', 
                    borderRadius: '8px', 
                    border: '1px solid #E2E8F0',
                    background: 'white',
                    boxShadow: i === 0 ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '700' }}>{sug.candidateId}</div>
                      <div style={{ 
                        fontSize: '10px', 
                        fontWeight: '800', 
                        padding: '2px 8px', 
                        borderRadius: '10px',
                        background: sug.confidence > 90 ? '#DCFCE7' : '#FEF9C3',
                        color: sug.confidence > 90 ? '#166534' : '#854D0E'
                      }}>
                        {sug.confidence}% MATCH
                      </div>
                    </div>
                    <p style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.5', marginBottom: '16px' }}>{sug.reason}</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="btn btn-primary" 
                        style={{ flex: 1, height: '32px', fontSize: '11px' }}
                        onClick={() => handleAcceptMatch(sug)}
                      >
                        Accept Match
                      </button>
                      <button 
                        className="btn btn-outline" 
                        style={{ flex: 1, height: '32px', fontSize: '11px' }}
                        onClick={() => alert(`Initiating workflow for candidate ${sug.candidateId}...`)}
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                className="btn btn-outline" 
                style={{ width: '100%', marginTop: '24px', borderColor: '#DC2626', color: '#DC2626', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={handleReject}
              >
                <ShieldAlert size={14} /> Reject & Mark for Investigation
              </button>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 1200px) {
          .exception-container { flex-direction: column !important; }
          .side-panel { position: static !important; width: 100% !important; margin-top: 24px; }
        }
      `}} />
    </div>
  );
};

export default ExceptionQueue;
