import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Clock, User, Filter, Download, ShieldCheck, ChevronDown, CheckCircle } from 'lucide-react';

const AuditLog = () => {
  const { auditLogs, addNotification } = useApp();
  const [filterType, setFilterType] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const filteredLogs = auditLogs.filter(log => 
    filterType === 'All' || log.type === filterType
  );

  const handleExport = () => {
    addNotification({ title: 'Exporting Audit Log', message: 'Generating immutable log report (CSV)...' });
    setTimeout(() => alert('ABC_System_Audit_Log_May_2026.csv downloaded.'), 1000);
  };

  const getTypeStyle = (type) => {
    switch(type) {
      case 'Security': return { color: '#DC2626', background: '#FEF2F2' };
      case 'System': return { color: '#2563EB', background: '#EFF6FF' };
      default: return { color: '#059669', background: '#ECFDF5' };
    }
  };

  return (
    <div className={`main-content ${isLoaded ? 'animate-reveal' : ''}`} style={{ opacity: isLoaded ? 1 : 0 }}>
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 32px)', color: '#0F172A', fontWeight: '800' }}>Immutable System Audit Log</h1>
          <p style={{ color: '#64748B', fontSize: '16px', marginTop: '6px' }}>Comprehensive forensic trail of user activities and automated system events.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <button className="btn btn-outline" onClick={() => setShowFilters(!showFilters)} style={{ height: '52px', minWidth: '160px', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={18} /> {filterType}
              </div>
              <ChevronDown size={14} />
            </button>
            {showFilters && (
              <div className="card animate-fade-in" style={{ position: 'absolute', top: '60px', right: 0, width: '200px', zIndex: 100, padding: '8px', marginBottom: 0 }}>
                {['All', 'Security', 'System', 'Auto'].map(type => (
                  <button 
                    key={type} 
                    onClick={() => { setFilterType(type); setShowFilters(false); }}
                    style={{ width: '100%', padding: '12px', textAlign: 'left', background: filterType === type ? '#F1F5F9' : 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="btn btn-primary" onClick={handleExport} style={{ height: '52px' }}>
            <Download size={18} style={{ marginRight: '10px' }} /> Export Audit Trail
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
        {['All', 'Security', 'System', 'Auto'].map(type => (
          <button 
            key={type}
            onClick={() => setFilterType(type)}
            style={{ 
              padding: '10px 20px', 
              borderRadius: '20px', 
              fontSize: '13px', 
              fontWeight: '700', 
              border: 'none',
              cursor: 'pointer',
              background: filterType === type ? 'var(--primary)' : 'white',
              color: filterType === type ? 'white' : '#64748B',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.2s ease'
            }}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="responsive-table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Identity</th>
                <th>Operation</th>
                <th>Detail</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover-scale" style={{ transition: 'background 0.2s ease' }}>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '13px', color: '#64748B', fontWeight: '500' }}>
                    <div style={{ fontWeight: '700', color: '#1E293B' }}>{log.date}</div>
                    <div>{log.time}</div>
                  </td>
                  <td style={{ fontWeight: '700', color: '#1E293B' }}>{log.user}</td>
                  <td style={{ fontWeight: '600' }}>{log.action}</td>
                  <td style={{ color: '#475569', minWidth: '250px' }}>{log.detail}</td>
                  <td>
                    <span style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', ...getTypeStyle(log.type) }}>
                      {log.type.toUpperCase()}
                    </span>
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

export default AuditLog;
