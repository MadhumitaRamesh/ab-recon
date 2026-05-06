import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FileText, Download, TrendingUp, AlertTriangle, CheckCircle, BarChart2, Filter, ChevronDown } from 'lucide-react';

const Reports = () => {
  const { addNotification } = useApp();
  const [reportType, setReportType] = useState('Settlement Report');

  const handleDownload = (format) => {
    addNotification({ title: 'Generating Report', message: `Exporting ${reportType} in ${format} format...` });
    setTimeout(() => {
      alert(`${reportType.replace(' ', '_')}_May_2026.${format === 'Excel' ? 'xlsx' : 'pdf'} has been downloaded to your system.`);
    }, 1500);
  };

  const stats = [
    { label: 'Total Volume', value: '4.2M', trend: '+12%', color: '#2563EB' },
    { label: 'Match Rate', value: '99.4%', trend: '+0.2%', color: '#059669' },
    { label: 'Pending Exceptions', value: '1,240', trend: '-15%', color: '#DC2626' },
  ];

  return (
    <div className="main-content">
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: '1', minWidth: '280px' }}>
          <h1 style={{ fontSize: 'clamp(20px, 4vw, 24px)', color: '#0F172A' }}>Operational Intelligence Reports</h1>
          <p style={{ color: '#64748B', fontSize: '14px', marginTop: '4px' }}>Analyze reconciliation performance, settlement trends, and exception ageing.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn btn-outline" onClick={() => handleDownload('Excel')}><Download size={16} style={{ marginRight: '8px' }} /> Download Excel</button>
          <button className="btn btn-primary" onClick={() => handleDownload('PDF')}><FileText size={16} style={{ marginRight: '8px' }} /> Export PDF</button>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: '32px' }}>
        {stats.map((s, i) => (
          <div key={i} className="card" style={{ padding: '24px', marginBottom: 0 }}>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', marginBottom: '8px', textTransform: 'uppercase' }}>{s.label}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#1E293B' }}>{s.value}</div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: s.trend.startsWith('+') ? '#059669' : '#DC2626', background: s.trend.startsWith('+') ? '#ECFDF5' : '#FEF2F2', padding: '2px 8px', borderRadius: '10px' }}>
                {s.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2-1">
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px' }}>Performance Analytics</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748B' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></div> Matched</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748B' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E2E8F0' }}></div> Exceptions</span>
            </div>
          </div>
          
          <div style={{ height: '240px', width: '100%', position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: '32px' }}>
            {[65, 80, 45, 90, 70, 85, 100].map((val, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '50%', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '180px' }}>
                  <div style={{ height: `${val}%`, width: '100%', background: 'var(--primary)', borderRadius: '4px 4px 0 0', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '-22px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', fontWeight: '700', color: 'var(--primary)' }}>{val}%</div>
                  </div>
                </div>
                <span style={{ fontSize: '10px', color: '#64748B', fontWeight: '600' }}>{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'][i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '20px' }}>Report Selection</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {['Settlement Report', 'Exception Ageing Analysis', 'Product-wise Summary', 'Compliance Audit Log'].map(report => (
              <button 
                key={report}
                onClick={() => setReportType(report)}
                style={{ 
                  width: '100%', 
                  padding: '14px', 
                  borderRadius: '10px', 
                  border: `2px solid ${reportType === report ? 'var(--primary)' : '#F1F5F9'}`,
                  background: reportType === report ? '#FFF1F2' : 'white',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ padding: '6px', borderRadius: '6px', background: reportType === report ? 'var(--primary)' : '#F8FAFC', color: reportType === report ? 'white' : '#94A3B8' }}>
                  <BarChart2 size={16} />
                </div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: reportType === report ? 'var(--primary)' : '#1E293B' }}>{report}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
