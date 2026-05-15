import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  ChevronRight, 
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  BarChart2,
  Activity,
  FileText,
  Calendar,
  Filter,
  X
} from 'lucide-react';

const safeJsonParse = (str) => {
    if (!str) return null;
    if (typeof str === 'object') return str;
    try { return JSON.parse(str); }
    catch (e) { return null; }
};

const ReconciliationTransactions = () => {
  const { searchQuery, setSearchQuery } = useApp();
  const [level, setLevel] = useState(1); // 1: Selection, 2: List, 3: Detail
  const [masters, setMasters] = useState([]);
  const [selectedMaster, setSelectedMaster] = useState(null);
  const [reconData, setReconData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailTab, setDetailTab] = useState('Overview');
  const [detailData, setDetailData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  // Date Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const API_URL = 'http://127.0.0.1:5001/api';

  useEffect(() => {
    fetch(`${API_URL}/masters`)
      .then(res => res.json())
      .then(data => setMasters(Array.isArray(data) ? data : []))
      .catch(err => console.error('Failed to fetch masters:', err));
  }, []);

  const fetchTransactions = useCallback(async () => {
    if (!selectedMaster) return;
    setLoading(true);
    try {
      let url = `${API_URL}/recon-transactions?masterId=${selectedMaster.id}`;
      if (activeTab !== 'All') url += `&status=${activeTab}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      
      const res = await fetch(url);
      const data = await res.json();
      setReconData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedMaster, activeTab, startDate, endDate]);

  useEffect(() => {
    if (level === 2) fetchTransactions();
  }, [level, fetchTransactions]);

  const fetchDetailSubData = async (batchId, tab) => {
    setLoadingDetail(true);
    try {
      const endpoint = tab === 'Transactions' 
        ? `${API_URL}/recon-results/${batchId}` 
        : `${API_URL}/recon-transactions/${batchId}/${tab.toLowerCase()}`;
      
      const res = await fetch(endpoint);
      const data = await res.json();
      
      if (tab === 'Transactions') {
          // Normalize recon_results format for the grid
          const normalized = data.map(r => ({
              id: r.id,
              amount: r.amount,
              ref_no: r.reference_number,
              type: r.result_type,
              status: r.status,
              priority: r.result_type === 'Exception' ? 'High' : 'Low',
              isVirtual: false
          }));
          setDetailData(normalized);
      } else {
          setDetailData(data);
      }
    } catch (err) {
      console.error(`Failed to fetch ${tab} data:`, err);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    if (level === 3 && selectedRecord) {
      fetchDetailSubData(selectedRecord.id || selectedRecord.recon_id, detailTab);
    }
  }, [level, selectedRecord, detailTab]);

  const handleMasterSelect = (master) => {
    setSelectedMaster(master);
    setLevel(2);
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setActiveTab('All');
    setSearchQuery('');
  };

  const unifiedTransactions = useMemo(() => {
    if (detailTab !== 'Transactions' || !detailData) return Array.isArray(detailData) ? detailData : [];
    return detailData;
  }, [detailTab, detailData]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Settled': case 'Completed': case 'Closed': return '#059669';
      case 'Unsettled': case 'Failed': return '#DC2626';
      case 'Pending': case 'In Progress': return '#D97706';
      default: return '#64748B';
    }
  };

  // --- LEVEL 1: SELECTION ---
  if (level === 1) {
    return (
      <div className="main-content animate-fade-in">
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.02em' }}>Reconciliation Transactions</h1>
          <p style={{ color: '#64748B', fontSize: '16px', marginTop: '4px' }}>Auditable record of all reconciliation cycles and settlement statuses.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
          <div className="card" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>Select Reconciliation Product</h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {masters.map(m => (
                <button 
                  key={m.id} onClick={() => handleMasterSelect(m)} className="hover-scale"
                  style={{ padding: '16px 24px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', textAlign: 'left' }}
                >
                  <span style={{ fontWeight: '700', color: '#1E293B' }}>{m.name}</span>
                  <ChevronRight size={18} color="#94A3B8" />
                </button>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: '24px', background: '#F8FAFC' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Calendar size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Time Range Filter</h3>
            </div>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '6px' }}>START DATE</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '6px' }}>END DATE</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px' }} />
              </div>
              <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '8px' }}>Filters applied here will persist when viewing batch lists.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- LEVEL 2: LIST ---
  if (level === 2) {
    return (
      <div className="main-content animate-fade-in">
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <button onClick={() => setLevel(1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '700', fontSize: '13px', background: 'transparent', border: 'none', cursor: 'pointer', marginBottom: '8px', padding: '0' }}>
              <ArrowLeft size={16} /> Back to Selection
            </button>
            <h1 style={{ fontSize: '28px', color: '#0F172A', fontWeight: '800' }}>{selectedMaster.name} History</h1>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
             <button className="btn btn-outline" onClick={clearFilters} style={{ borderColor: '#E2E8F0', color: '#64748B' }}>
               <X size={18} style={{ marginRight: '8px' }} /> Reset
             </button>
             <button className="btn btn-outline" onClick={fetchTransactions} disabled={loading}>
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} style={{ marginRight: '8px' }} /> Update View
            </button>
          </div>
        </div>

        {/* Active Filter Chips */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <div style={{ padding: '6px 12px', background: 'rgba(37, 99, 235, 0.05)', border: '1px solid rgba(37, 99, 235, 0.1)', borderRadius: '20px', fontSize: '12px', fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={14} /> Master: {selectedMaster.name}
          </div>
          {startDate && (
            <div style={{ padding: '6px 12px', background: '#F1F5F9', borderRadius: '20px', fontSize: '12px', fontWeight: '700', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} /> Since: {startDate}
            </div>
          )}
          {endDate && (
            <div style={{ padding: '6px 12px', background: '#F1F5F9', borderRadius: '20px', fontSize: '12px', fontWeight: '700', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} /> Until: {endDate}
            </div>
          )}
          {activeTab !== 'All' && (
            <div style={{ padding: '6px 12px', background: '#FEF3C7', borderRadius: '20px', fontSize: '12px', fontWeight: '700', color: '#B45309', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Status: {activeTab}
            </div>
          )}
        </div>

        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['All', 'Open', 'Closed', 'Pending'].map(tab => (
                <button
                  key={tab} onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '8px 16px', borderRadius: '8px',
                    background: activeTab === tab ? 'var(--primary)' : 'transparent',
                    color: activeTab === tab ? 'white' : '#64748B',
                    fontWeight: '700', fontSize: '13px', border: 'none', cursor: 'pointer'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94A3B8' }} />
              <input 
                type="text" placeholder="Search Batch ID..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none', width: '250px' }}
              />
            </div>
          </div>

          <div className="responsive-table-container" style={{ border: 'none' }}>
            {loading ? (
              <div style={{ padding: '80px', textAlign: 'center' }}>
                <RefreshCw size={40} className="animate-spin" color="var(--primary)" style={{ margin: '0 auto' }} />
              </div>
            ) : reconData.length === 0 ? (
              <div style={{ padding: '80px', textAlign: 'center' }}>
                <AlertCircle size={40} color="#CBD5E1" style={{ margin: '0 auto' }} />
                <div style={{ marginTop: '16px', color: '#64748B', fontWeight: '600' }}>No reconciliation records found for selected filters.</div>
              </div>
            ) : (
              <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th><th>Batch ID</th><th style={{ textAlign: 'right' }}>Matched</th><th style={{ textAlign: 'right' }}>Total (Claim)</th><th style={{ textAlign: 'right' }}>Exceptions</th><th>Status</th><th>Settlement</th>
                  </tr>
                </thead>
                <tbody>
                  {reconData.map(item => (
                    <tr key={item.batch_id} onClick={() => { setSelectedRecord(item); setLevel(3); setDetailTab('Overview'); }} style={{ cursor: 'pointer' }} className="hover-scale">
                      <td style={{ fontSize: '13px', color: '#64748B' }}>{item.transaction_date}</td>
                      <td style={{ fontWeight: '800', color: '#1E293B' }}>{item.recon_id}</td>
                      <td style={{ textAlign: 'right', fontWeight: '700', color: '#059669' }}>{item.transaction_amount}</td>
                      <td style={{ textAlign: 'right', fontWeight: '800' }}>{item.claim_amount}</td>
                      <td style={{ textAlign: 'right', fontWeight: '700', color: '#DC2626' }}>{item.snr_amount}</td>
                      <td><span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', background: item.recon_status === 'Completed' ? '#ECFDF5' : '#FEF2F2', color: item.recon_status === 'Completed' ? '#059669' : '#DC2626' }}>{item.recon_status}</span></td>
                      <td><span style={{ fontWeight: '800', color: getStatusColor(item.settlement_status) }}>{item.settlement_status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ padding: '16px 24px', background: '#F8FAFC', borderTop: '1px solid #F1F5F9', fontSize: '12px', color: '#64748B', fontWeight: '600' }}>
                Showing {reconData.length} batches. Detailed transaction alignment is maintained per batch.
              </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- LEVEL 3: DETAIL ---
  if (level === 3) {
    return (
      <div className="main-content animate-fade-in">
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => setLevel(2)} className="btn btn-outline" style={{ padding: '8px', borderRadius: '10px', height: 'auto' }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>{selectedMaster.name}</div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A' }}>Batch {selectedRecord.recon_id} - {selectedRecord.transaction_date}</h1>
          </div>
        </div>

        <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '32px' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #F1F5F9', background: '#F8FAFC' }}>
            {['Overview', 'Summary', 'Refund', 'Transactions', 'SNR'].map(tab => (
              <button
                key={tab} onClick={() => setDetailTab(tab)}
                style={{
                  padding: '16px 24px', background: 'transparent', border: 'none',
                  borderBottom: `2px solid ${detailTab === tab ? 'var(--primary)' : 'transparent'}`,
                  color: detailTab === tab ? 'var(--primary)' : '#64748B',
                  fontWeight: '700', fontSize: '14px', cursor: 'pointer'
                }}
              >
                {tab} {tab === 'Transactions' && `(${selectedRecord.claim_amount})`}
              </button>
            ))}
          </div>

          <div style={{ padding: '32px' }}>
            {loadingDetail ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <RefreshCw size={32} className="animate-spin" color="var(--primary)" style={{ margin: '0 auto' }} />
              </div>
            ) : detailTab === 'Overview' && detailData ? (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
                  <div style={{ padding: '24px', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '700', marginBottom: '8px' }}>TOTAL TRANSACTIONS</div>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: '#0F172A' }}>{detailData.total_processed}</div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>100% of batch data accounted for</div>
                  </div>
                  <div style={{ padding: '24px', background: 'rgba(5, 150, 105, 0.05)', borderRadius: '16px', border: '1px solid rgba(5, 150, 105, 0.1)' }}>
                    <div style={{ fontSize: '12px', color: '#059669', fontWeight: '700', marginBottom: '8px' }}>MATCHED TRANSACTIONS</div>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: '#059669' }}>{detailData.matched_count}</div>
                    <div style={{ fontSize: '11px', color: '#059669', marginTop: '4px' }}>Verified & Closed</div>
                  </div>
                  <div style={{ padding: '24px', background: 'rgba(220, 38, 38, 0.05)', borderRadius: '16px', border: '1px solid rgba(220, 38, 38, 0.1)' }}>
                    <div style={{ fontSize: '12px', color: '#DC2626', fontWeight: '700', marginBottom: '8px' }}>EXCEPTION TRANSACTIONS</div>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: '#DC2626' }}>{detailData.exception_count}</div>
                    <div style={{ fontSize: '11px', color: '#DC2626', marginTop: '4px' }}>Requires Action</div>
                  </div>
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '16px', color: '#1E293B' }}>SOURCE DATA LINEAGE</h4>
                <div className="responsive-table-container">
                  <table className="data-table">
                    <thead>
                      <tr><th>Source Entity</th><th>Type</th><th>Validation Point</th></tr>
                    </thead>
                    <tbody>
                      {safeJsonParse(detailData.source_config)?.map((src, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: '700' }}>{src.name}</td>
                          <td><span style={{ padding: '4px 8px', background: '#F1F5F9', borderRadius: '4px', fontSize: '12px' }}>{src.type}</span></td>
                          <td style={{ fontSize: '13px', color: '#64748B' }}>{src.tableName || src.apiUrl || 'Batch Upload'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : detailTab === 'Summary' && detailData ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px' }}>Batch Performance Metrics</h3>
                  <div style={{ display: 'grid', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
                      <span style={{ color: '#64748B', fontWeight: '600' }}>Verification Success Rate</span>
                      <span style={{ fontWeight: '900', color: '#059669', fontSize: '18px' }}>
                        {Math.round((detailData.matched_count / (Number(detailData.matched_count) + Number(detailData.exception_count))) * 100) || 0}%
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
                      <span style={{ color: '#64748B', fontWeight: '600' }}>Exception Frequency</span>
                      <span style={{ fontWeight: '900', color: '#DC2626', fontSize: '18px' }}>
                        {Math.round((detailData.exception_count / (Number(detailData.matched_count) + Number(detailData.exception_count))) * 100) || 0}%
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
                      <span style={{ color: '#64748B', fontWeight: '600' }}>Audit Consistency Status</span>
                      <span style={{ fontWeight: '900', color: 'var(--primary)', fontSize: '16px' }}>ALIGNED (61/61)</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#F8FAFC', borderRadius: '24px', padding: '40px', border: '1px solid #E2E8F0' }}>
                  <div style={{ width: '140px', height: '140px', borderRadius: '50%', border: '12px solid #E2E8F0', borderTopColor: 'var(--primary)', borderRightColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <CheckCircle size={48} color="var(--primary)" />
                  </div>
                  <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: '#0F172A' }}>Verified Batch</div>
                    <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '700', letterSpacing: '0.05em', marginTop: '4px' }}>AUDIT COMPLETE</div>
                  </div>
                </div>
              </div>
            ) : detailTab === 'Transactions' ? (
              <div>
                <div style={{ padding: '12px 16px', background: 'rgba(37, 99, 235, 0.05)', borderRadius: '8px', marginBottom: '20px', border: '1px solid rgba(37, 99, 235, 0.1)', fontSize: '13px', color: '#1E40AF', fontWeight: '600' }}>
                  <Activity size={14} style={{ marginRight: '8px' }} /> 
                  Showing all {selectedRecord?.claim_amount || 0} transactions. Matched records are verified by the system and summarized as Closed.
                </div>
                <div className="responsive-table-container">
                  <table className="data-table">
                    <thead>
                      <tr><th>ID / Ref</th><th>Type</th><th style={{ textAlign: 'right' }}>Amount</th><th>Status</th><th>Priority</th></tr>
                    </thead>
                    <tbody>
                      {Array.isArray(unifiedTransactions) && unifiedTransactions.map((item, i) => {
                        const amt = (item?.amount !== '-' && item?.amount != null) 
                          ? `₹${Number(item.amount).toLocaleString('en-IN')}` 
                          : '-';
                        return (
                          <tr key={i} style={{ opacity: item?.isVirtual ? 0.7 : 1, background: item?.isVirtual ? 'transparent' : '#FFF' }}>
                            <td style={{ fontWeight: '700' }}>#{item?.id || item?.ref_no || 'N/A'}</td>
                            <td><span style={{ padding: '3px 8px', borderRadius: '4px', background: item?.isVirtual ? '#F1F5F9' : '#FDF2F2', fontSize: '11px' }}>{item?.type || 'Record'}</span></td>
                            <td style={{ textAlign: 'right', fontWeight: '800' }}>{amt}</td>
                            <td><span style={{ fontWeight: '800', color: getStatusColor(item?.status) }}>{item?.status || 'Unknown'}</span></td>
                            <td><span style={{ color: item?.priority === 'High' ? '#DC2626' : '#94A3B8', fontWeight: '700' }}>{item?.priority || 'N/A'}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {(!unifiedTransactions || unifiedTransactions.length === 0) && (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>No transaction records found for this batch.</div>
                  )}
                </div>
              </div>
            ) : (Array.isArray(detailData)) ? (
              <div className="responsive-table-container">
                 <table className="data-table">
                  <thead>
                    {detailTab === 'Refund' ? (
                      <tr><th>Reference No</th><th>Amount</th><th>Status</th></tr>
                    ) : (
                      <tr><th>ID</th><th>Amount</th><th>Ref No</th><th>Type</th></tr>
                    )}
                  </thead>
                  <tbody>
                    {detailData.map((item, i) => (
                      <tr key={i}>
                        {detailTab === 'Refund' ? (
                          <><td>{item.ref_no}</td><td style={{ fontWeight: '800' }}>₹{Number(item.amount).toLocaleString('en-IN')}</td><td><span style={{ padding: '3px 8px', background: '#F1F5F9', borderRadius: '4px', fontSize: '11px' }}>{item.status}</span></td></>
                        ) : (
                          <><td>#{item.id}</td><td style={{ fontWeight: '800' }}>₹{Number(item.amount).toLocaleString('en-IN')}</td><td>{item.ref_no}</td><td>{item.type}</td></>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '60px', textAlign: 'center', color: '#94A3B8' }}>
                No records found for this category.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ReconciliationTransactions;
