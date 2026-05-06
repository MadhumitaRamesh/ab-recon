import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FileText, Download, TrendingUp, AlertTriangle, CheckCircle, BarChart2, Calendar, ShieldCheck } from 'lucide-react';

const Reports = () => {
  const { addNotification } = useApp();
  const [reportType, setReportType] = useState('Settlement Report');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const getReportData = (type) => {
    switch (type) {
      case 'Exception Ageing Analysis':
        return {
          stats: [
            { label: '0-24 Hours', value: '412', trend: '-5%', color: '#059669' },
            { label: '24-48 Hours', value: '528', trend: '+12%', color: '#D97706' },
            { label: '48+ Hours', value: '300', trend: '+2%', color: '#DC2626' },
          ],
          chart: [40, 50, 60, 70, 80, 90, 100]
        };
      case 'Product-wise Summary':
        return {
          stats: [
            { label: 'BBPS Daily', value: '98.2%', trend: 'High', color: '#059669' },
            { label: 'UPI Internal', value: '94.5%', trend: 'Med', color: '#D97706' },
            { label: 'DigiGold', value: '99.1%', trend: 'High', color: '#059669' },
          ],
          chart: [90, 85, 95, 80, 99, 92, 94]
        };
      case 'Compliance Audit Log':
        return {
          stats: [
            { label: 'Auth Success', value: '2.1k', trend: 'Secure', color: '#059669' },
            { label: 'Policy Violation', value: '0', trend: 'Safe', color: '#059669' },
            { label: 'Admin Changes', value: '14', trend: 'Audit', color: '#D97706' },
          ],
          chart: [10, 15, 8, 20, 12, 18, 14]
        };
      default:
        return {
          stats: [
            { label: 'Total Volume', value: '4.2M', trend: '+12%', color: '#2563EB' },
            { label: 'Match Rate', value: '99.4%', trend: '+0.2%', color: '#059669' },
            { label: 'Pending Exceptions', value: '1,240', trend: '-15%', color: '#DC2626' },
          ],
          chart: [65, 80, 45, 90, 70, 85, 100]
        };
    }
  };

  const data = getReportData(reportType);

  const handleExcelExport = () => {
    addNotification({ title: 'Exporting Excel', message: `Compiling raw transaction data for ${reportType}...` });
    setTimeout(() => alert(`${reportType.replace(' ', '_')}_Raw_Data.xlsx downloaded.`), 1000);
  };

  const handlePDFExport = () => {
    addNotification({ title: 'Generating PDF', message: `Formatting executive visual summary for ${reportType}...` });
    setTimeout(() => alert(`${reportType.replace(' ', '_')}_Executive_Summary.pdf generated.`), 1000);
  };

  return (
    <div className={`main-content ${isLoaded ? 'animate-reveal' : ''}`} style={{ opacity: isLoaded ? 1 : 0 }}>
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 32px)', color: '#0F172A', fontWeight: '800' }}>Intelligence & Reporting</h1>
          <p style={{ color: '#64748B', fontSize: '16px', marginTop: '6px' }}>Dynamic analytics for settlement performance and compliance monitoring.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <button className="btn btn-outline" onClick={handleExcelExport} style={{ height: '52px' }}>
            <Download size={18} style={{ marginRight: '10px' }} /> Download Excel (Raw)
          </button>
          <button className="btn btn-primary" onClick={handlePDFExport} style={{ height: '52px' }}>
            <FileText size={18} style={{ marginRight: '10px' }} /> Export PDF (Summary)
          </button>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: '40px' }}>
        {data.stats.map((s, i) => (
          <div key={i} className="card hover-scale" style={{ padding: '32px', marginBottom: 0, borderBottom: `4px solid ${s.color}` }}>
            <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '800', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#0F172A' }}>{s.value}</div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: s.trend.startsWith('+') || s.trend === 'High' || s.trend === 'Secure' ? '#059669' : '#DC2626', background: s.trend.startsWith('+') || s.trend === 'High' || s.trend === 'Secure' ? '#ECFDF5' : '#FEF2F2', padding: '4px 10px', borderRadius: '20px' }}>
                {s.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2-1">
        <div className="card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800' }}>{reportType} Visual Trend</h3>
            <div style={{ display: 'flex', gap: '16px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748B', fontWeight: '600' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)' }}></div> Target
              </span>
            </div>
          </div>
          
          <div style={{ height: '240px', width: '100%', position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: '32px' }}>
            {data.chart.map((val, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40%', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '180px' }}>
                  <div style={{ height: `${val}%`, width: '100%', background: 'var(--primary)', borderRadius: '6px 6px 0 0', position: 'relative', transition: 'height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                    <div style={{ position: 'absolute', top: '-24px', left: '50%', transform: 'translateX(-50%)', fontSize: '11px', fontWeight: '800', color: 'var(--primary)' }}>{val}</div>
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>{['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7'][i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '28px' }}>Select Analytical Report</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['Settlement Report', 'Exception Ageing Analysis', 'Product-wise Summary', 'Compliance Audit Log'].map(report => (
              <button 
                key={report}
                onClick={() => setReportType(report)}
                className="hover-scale"
                style={{ 
                  width: '100%', 
                  padding: '18px', 
                  borderRadius: '16px', 
                  border: `2px solid ${reportType === report ? 'var(--primary)' : '#F1F5F9'}`,
                  background: reportType === report ? '#FFF1F2' : 'white',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ padding: '10px', borderRadius: '10px', background: reportType === report ? 'var(--primary)' : '#F8FAFC', color: reportType === report ? 'white' : '#94A3B8' }}>
                  <BarChart2 size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: reportType === report ? 'var(--primary)' : '#1E293B' }}>{report}</div>
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px', fontWeight: '600' }}>Generated: 06 May 2026</div>
                </div>
              </button>
            ))}
          </div>

          <div style={{ marginTop: '32px', padding: '20px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <ShieldCheck size={24} color="#059669" />
            <p style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.4', fontWeight: '500' }}>All reports are SOC2 compliant and immutable. Audit trails are recorded for every export.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
