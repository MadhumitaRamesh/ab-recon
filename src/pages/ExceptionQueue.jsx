import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, MoreHorizontal, Zap, Clock, X, ShieldAlert, Filter, Download } from 'lucide-react';

const ExceptionQueue = () => {
  const { exceptions, setExceptions, addNotification } = useApp();
  const [selectedEx, setSelectedEx] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');

  const getSuggestions = (txn) => {
    if (!txn) return [];
    return [
      { id: 'SUG-01', candidateId: `BK-${txn.id.split('-')[1]}`, amount: txn.amount, confidence: 94, reason: `Exact amount match.` },
      { id: 'SUG-02', candidateId: `BK-882`, amount: '14,995.00', confidence: 82, reason: 'Small variance.' },
    ];
  };

  const filteredExceptions = exceptions.filter(ex => {
    const matchesSearch = ex.id.toLowerCase().includes(searchQuery.toLowerCase()) || ex.ref.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'All' || ex.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleAcceptMatch = (candidate) => {
    setExceptions(exceptions.filter(ex => ex.id !== selectedEx.id));
    addNotification({ title: 'Match Accepted', message: `TXN ${selectedEx.id} matched.` });
    setSelectedEx(null);
  };

  return (
    <div className="main-content">
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: '1', minWidth: '280px' }}>
          <h1 style={{ fontSize: 'clamp(20px, 4vw, 24px)', color: '#0F172A' }}>Exception Intelligence Queue</h1>
          <p style={{ color: '#64748B', fontSize: '14px', marginTop: '4px' }}>Classified unmatched records requiring manual intervention.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', width: '100%', maxWidth: 'fit-content' }}>
          <select className="btn btn-outline" value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ flex: 1, minWidth: '140px' }}>
            <option value="All">All Types</option>
            <option value="Amount Mismatch">Mismatch</option>
            <option value="Duplicate">Duplicate</option>
          </select>
          <button className="btn btn-outline" style={{ flex: 1, minWidth: '100px' }}><Download size={16} /></button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexDirection: 'column' }}>
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94A3B8' }} />
              <input type="text" className="form-control" placeholder="Search ID or Ref..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ paddingLeft: '34px', height: '34px' }} />
            </div>
          </div>
          <div className="responsive-table-container" style={{ border: 'none', marginBottom: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Priority</th>
                  <th>Age</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExceptions.map(ex => (
                  <tr key={ex.id} onClick={() => setSelectedEx(ex)} style={{ cursor: 'pointer', background: selectedEx?.id === ex.id ? '#F1F5F9' : 'transparent' }}>
                    <td style={{ fontWeight: '600', color: 'var(--primary)' }}>{ex.id}</td>
                    <td style={{ fontWeight: '600' }}>{ex.amount}</td>
                    <td>{ex.type}</td>
                    <td><span style={{ color: ex.priority === 'High' ? '#DC2626' : '#D97706', fontWeight: '700', fontSize: '11px' }}>{ex.priority}</span></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{ex.age}</td>
                    <td><MoreHorizontal size={16} color="#94A3B8" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedEx && (
          <div className="card animate-fade-in" style={{ borderTop: '4px solid var(--gold)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={18} color="var(--gold)" />
                <h3 style={{ fontSize: '16px' }}>Suggestions: {selectedEx.id}</h3>
              </div>
              <button onClick={() => setSelectedEx(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {getSuggestions(selectedEx).map((sug, i) => (
                <div key={i} style={{ padding: '16px', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '700', fontSize: '13px' }}>{sug.candidateId}</span>
                    <span style={{ fontSize: '10px', background: '#DCFCE7', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>{sug.confidence}%</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '12px' }}>{sug.reason}</p>
                  <button className="btn btn-primary" onClick={() => handleAcceptMatch(sug)} style={{ width: '100%', height: '32px', fontSize: '11px' }}>Accept</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExceptionQueue;
