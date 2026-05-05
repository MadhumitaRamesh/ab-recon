import React, { useState } from 'react';
import { 
  Filter, 
  Download, 
  Search, 
  MoreHorizontal, 
  Zap,
  Clock,
  ArrowRight,
  X
} from 'lucide-react';

const ExceptionQueue = () => {
  const [selectedEx, setSelectedEx] = useState(null);
  
  const exceptions = [
    { id: 'TXN-4122', amount: '15,000.00', ref: 'ABC123456789', type: 'Amount Mismatch', age: '48h', priority: 'High', status: 'Unresolved' },
    { id: 'TXN-4123', amount: '2,500.00', ref: 'DEP-998877', type: 'Missing Entry', age: '24h', priority: 'Medium', status: 'Pending Review' },
    { id: 'TXN-4124', amount: '50,000.00', ref: 'WD-554433', type: 'Duplicate', age: '5h', priority: 'High', status: 'Investigating' },
    { id: 'TXN-4125', amount: '125.50', ref: 'REF-001', type: 'Timing Difference', age: '72h', priority: 'Low', status: 'Unresolved' },
    { id: 'TXN-4126', amount: '4,200.00', ref: 'TR-112233', type: 'Reversal', age: '1h', priority: 'Medium', status: 'Unresolved' },
  ];

  const suggestions = [
    { id: 'SUG-01', candidateId: 'BK-445', amount: '15,000.00', confidence: 94, reason: 'Exact amount, fuzzy reference match (ABC-1234)' },
    { id: 'SUG-02', candidateId: 'BK-882', amount: '14,995.00', confidence: 82, reason: 'High reference similarity, small variance (₹5)' },
    { id: 'SUG-03', candidateId: 'BK-110', confidence: 45, reason: 'Amount match only, different reference pattern' },
  ];

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
              <button className="btn btn-outline"><Filter size={16} style={{ marginRight: '8px' }} /> Filters</button>
              <button className="btn btn-outline"><Download size={16} style={{ marginRight: '8px' }} /> Export</button>
            </div>
          </div>

          <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={14} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94A3B8' }} />
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search exceptions..." 
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
                  {exceptions.map(ex => (
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
                  ))}
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
                {suggestions.map((sug, i) => (
                  <div key={i} style={{ 
                    padding: '16px', 
                    borderRadius: '8px', 
                    border: '1px solid #E2E8F0',
                    background: 'white',
                    boxShadow: i === 0 ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '700' }}>{sug.candidateId || 'Manual Match Candidate'}</div>
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
                      <button className="btn btn-primary" style={{ flex: 1, height: '32px', fontSize: '11px' }}>Accept Match</button>
                      <button className="btn btn-outline" style={{ flex: 1, height: '32px', fontSize: '11px' }}>Review</button>
                    </div>
                  </div>
                ))}
              </div>

              <button className="btn btn-outline" style={{ width: '100%', marginTop: '24px', borderColor: 'var(--primary)', color: 'var(--primary)', fontSize: '12px' }}>
                Manual Override & Match <ArrowRight size={14} style={{ marginLeft: '8px' }} />
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
