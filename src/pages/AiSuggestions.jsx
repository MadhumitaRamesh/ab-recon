import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Zap, CheckCircle2, MessageSquare, Sparkles, ArrowRight, ShieldCheck, Send, X } from 'lucide-react';

const AiSuggestions = () => {
  const { addNotification } = useApp();
  const [suggestions, setSuggestions] = useState([
    { id: 'AI-201', type: 'Pattern Match', confidence: 98, detail: 'Recurring ₹5,000 mismatch detected in UPI logs. Likely bank service charge misclassification.', action: 'Bulk Resolve' },
    { id: 'AI-202', type: 'Anomaly Detection', confidence: 85, detail: 'Transaction TXN-8821 shows 48h settlement lag. Potential API timeout at partner gateway.', action: 'Flag for Review' },
    { id: 'AI-203', type: 'Predictive Mapping', confidence: 92, detail: 'Automated mapping suggested for 45 "Missing Entry" records based on historical BBPS patterns.', action: 'Apply Mapping' },
  ]);

  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: 'Hello! I am your ABC Reconciliation Co-Pilot. I have identified 3 new anomaly patterns today. How can I assist you?' }
  ]);
  const [userInput, setUserInput] = useState('');
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleAction = (id, action) => {
    setSuggestions(suggestions.filter(s => s.id !== id));
    addNotification({ title: 'AI Action Executed', message: `${action} successful for ${id}.` });
  };

  const handleIgnore = (id) => {
    setSuggestions(suggestions.filter(s => s.id !== id));
    addNotification({ title: 'Insight Ignored', message: `Suggestion ${id} has been archived.` });
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const newMsgs = [...chatMessages, { role: 'user', text: userInput }];
    setChatMessages(newMsgs);
    setUserInput('');

    setTimeout(() => {
      let response = "I'm analyzing the data sources now. Please wait...";
      if (userInput.toLowerCase().includes('mismatch')) response = "The ₹5,000 mismatch pattern is recurring in the BBPS Daily batch. It appears to be a rounding difference in service tax.";
      setChatMessages([...newMsgs, { role: 'ai', text: response }]);
    }, 8000); // 8s to simulate 'thinking'
  };

  return (
    <div className="main-content">
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: '1', minWidth: '280px' }}>
          <h1 style={{ fontSize: 'clamp(20px, 4vw, 24px)', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles color="var(--gold)" fill="var(--gold)" size={24} /> AI Intelligence Assistant
          </h1>
          <p style={{ color: '#64748B', fontSize: '14px', marginTop: '4px' }}>Machine learning driven insights and automated resolution recommendations.</p>
        </div>
        <div style={{ background: '#F0F9FF', padding: '10px 16px', borderRadius: '10px', border: '1px solid #BAE6FD', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={18} color="#0369A1" />
          <div style={{ fontSize: '12px', color: '#0369A1', fontWeight: '700' }}>AI Core: Operational</div>
        </div>
      </div>

      <div className="grid-2-1">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '16px', color: '#475569', marginBottom: '4px' }}>Active Suggestions</h3>
          {suggestions.map(s => (
            <div key={s.id} className="card animate-fade-in" style={{ borderLeft: `4px solid ${s.confidence > 90 ? '#059669' : 'var(--gold)'}`, padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Zap size={18} color="var(--gold)" />
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>{s.type.toUpperCase()}</div>
                    <div style={{ fontWeight: '700', fontSize: '15px' }}>{s.id}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: s.confidence > 90 ? '#059669' : 'var(--gold)' }}>{s.confidence}%</div>
                  <div style={{ fontSize: '10px', color: '#64748B', fontWeight: '700' }}>CONFIDENCE</div>
                </div>
              </div>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', marginBottom: '20px' }}>{s.detail}</p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={() => handleAction(s.id, s.action)} style={{ flex: 1 }}>{s.action}</button>
                <button className="btn btn-outline" onClick={() => handleIgnore(s.id)} style={{ flex: 1 }}>Ignore</button>
              </div>
            </div>
          ))}
          {suggestions.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
              <CheckCircle2 size={48} color="#059669" style={{ marginBottom: '16px', opacity: 0.5 }} />
              <h3>All Insights Addressed</h3>
              <p style={{ color: '#64748B' }}>No further suggestions for the current dataset.</p>
            </div>
          )}
        </div>

        <div style={{ minWidth: '0' }}>
          <div className="card" style={{ background: '#0F172A', color: 'white', border: 'none', display: 'flex', flexDirection: 'column', height: '480px' }}>
            <div style={{ padding: '0 0 16px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MessageSquare size={18} color="var(--gold)" />
              <h3 style={{ color: 'white', fontSize: '16px' }}>ABC AI Co-Pilot</h3>
            </div>
            
            <div style={{ flex: 1, padding: '16px 0', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {chatMessages.map((msg, i) => (
                <div key={i} style={{ 
                  alignSelf: msg.role === 'ai' ? 'flex-start' : 'flex-end',
                  maxWidth: '85%',
                  background: msg.role === 'ai' ? 'rgba(255,255,255,0.05)' : 'var(--primary)',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  lineHeight: '1.5'
                }}>
                  {msg.text}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleChatSubmit} style={{ position: 'relative', marginTop: '12px' }}>
              <input 
                type="text" 
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ask AI assistant..." 
                style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '10px 40px 10px 12px', borderRadius: '8px', color: 'white', fontSize: '13px' }}
              />
              <button type="submit" style={{ position: 'absolute', right: '8px', top: '8px', background: 'transparent', border: 'none', color: 'var(--gold)', cursor: 'pointer' }}>
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiSuggestions;
