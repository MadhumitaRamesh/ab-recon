import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Zap, CheckCircle2, MessageSquare, Sparkles, Send, ShieldCheck, X } from 'lucide-react';

const AiSuggestions = () => {
  const { addNotification, aiSuggestions, setAiSuggestions } = useApp();
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: 'Hello! I am your ABC Reconciliation Co-Pilot. I have identified 3 new anomaly patterns today in the BBPS and UPI modules. How can I help you resolve them?' }
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
    setAiSuggestions(aiSuggestions.filter(s => s.id !== id));
    addNotification({ title: 'AI Action Executed', message: `${action} successful for ${id}.` });
  };

  const handleIgnore = (id) => {
    setAiSuggestions(aiSuggestions.filter(s => s.id !== id));
    addNotification({ title: 'Insight Ignored', message: `Suggestion ${id} archived.` });
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const newMsgs = [...chatMessages, { role: 'user', text: userInput }];
    setChatMessages(newMsgs);
    const input = userInput.toLowerCase();
    setUserInput('');

    // Dynamic response logic
    setTimeout(() => {
      let response = "I'm analyzing the reconciliation logs for more details on that. Could you provide a Transaction ID or the module name?";
      
      if (input.includes('mismatch') || input.includes('₹5,000') || input.includes('5000')) {
        response = "The ₹5,000 mismatch is a recurring pattern in the 'UPI_Aggregator' logs. It stems from a rounding mismatch between the partner bank's service tax calculation and our internal bridge. I recommend 'Bulk Resolve' to apply the correction.";
      } else if (input.includes('status') || input.includes('health')) {
        response = "Current system health is optimal. Processing efficiency is at 99.4%, and AI matching latency is below 200ms. All SFTP ingestion services are active.";
      } else if (input.includes('patterns') || input.includes('suggestion')) {
        response = "I have flagged 3 patterns: a 'Service Tax Rounding' mismatch in UPI, an 'API Timeout' anomaly in DigiGold, and a 'Missing Entry' predictive map for BBPS. Which one shall we investigate?";
      } else if (input.includes('bbps')) {
        response = "For BBPS, I have suggested automated mapping for 45 records. This is based on high-confidence historical matches from the last 90 days of settlement cycles.";
      } else if (input.includes('thank') || input.includes('thanks') || input.includes('ok')) {
        response = "You're welcome! I am constantly monitoring the reconciliation streams for new anomalies. Let me know if you need anything else.";
      } else if (input.includes('hello') || input.includes('hi')) {
        response = "Hello! Ready to assist with anomaly resolution. You can ask me about specific patterns, system health, or module-specific insights.";
      }

      setChatMessages(prev => [...prev, { role: 'ai', text: response }]);
    }, 1000);
  };

  return (
    <div className="main-content animate-fade-in">
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 32px)', color: '#0F172A', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Sparkles color="var(--gold)" fill="var(--gold)" size={28} /> AI Intelligence Assistant
          </h1>
          <p style={{ color: '#64748B', fontSize: '16px', marginTop: '6px' }}>Advanced anomaly detection and automated resolution engine for Aditya Birla Capital.</p>
        </div>
        <div style={{ background: '#F0F9FF', padding: '12px 24px', borderRadius: '16px', border: '1px solid #BAE6FD', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldCheck size={20} color="#0369A1" />
          <div style={{ fontSize: '14px', color: '#0369A1', fontWeight: '700' }}>AI Core: Operational</div>
        </div>
      </div>

      <div className="grid-2-1">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h3 style={{ fontSize: '18px', color: '#1E293B', fontWeight: '800' }}>Intelligent Insights</h3>
          {aiSuggestions.map(s => (
            <div key={s.id} className="card hover-scale" style={{ borderLeft: `6px solid ${s.confidence > 90 ? '#059669' : 'var(--gold)'}`, padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#F8FAFC', padding: '10px', borderRadius: '12px' }}>
                    <Zap size={22} color="var(--gold)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '800', letterSpacing: '0.5px' }}>{s.type.toUpperCase()}</div>
                    <div style={{ fontWeight: '800', fontSize: '16px', color: '#0F172A' }}>{s.id}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: s.confidence > 90 ? '#059669' : 'var(--gold)' }}>{s.confidence}%</div>
                  <div style={{ fontSize: '10px', color: '#64748B', fontWeight: '800' }}>CONFIDENCE</div>
                </div>
              </div>
              <p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.6', marginBottom: '28px' }}>{s.detail}</p>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={() => handleAction(s.id, s.action)} style={{ flex: 2 }}>{s.action}</button>
                <button className="btn btn-outline" onClick={() => handleIgnore(s.id)} style={{ flex: 1 }}>Ignore</button>
              </div>
            </div>
          ))}
          {aiSuggestions.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '80px 40px' }}>
              <CheckCircle2 size={56} color="#059669" style={{ marginBottom: '24px', opacity: 0.4 }} />
              <h3 style={{ fontSize: '20px' }}>All Insights Resolved</h3>
              <p style={{ color: '#64748B', fontSize: '15px' }}>The AI engine has no pending suggestions for the current reconciliation stream.</p>
            </div>
          )}
        </div>

        <div style={{ minWidth: '0' }}>
          <div className="card" style={{ background: '#0F172A', color: 'white', border: 'none', display: 'flex', flexDirection: 'column', height: '520px', padding: '32px' }}>
            <div style={{ padding: '0 0 20px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <MessageSquare size={20} color="var(--gold)" />
              <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '800' }}>ABC AI Co-Pilot</h3>
            </div>
            
            <div style={{ flex: 1, padding: '24px 0', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {chatMessages.map((msg, i) => (
                <div key={i} style={{ 
                  alignSelf: msg.role === 'ai' ? 'flex-start' : 'flex-end',
                  maxWidth: '85%',
                  background: msg.role === 'ai' ? 'rgba(255,255,255,0.05)' : 'var(--primary)',
                  padding: '14px 18px',
                  borderRadius: '16px',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  boxShadow: msg.role === 'user' ? '0 4px 12px rgba(123, 17, 19, 0.2)' : 'none'
                }}>
                  {msg.text}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleChatSubmit} style={{ position: 'relative', marginTop: '20px' }}>
              <input 
                type="text" 
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ask Co-Pilot about patterns..." 
                style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '14px 50px 14px 16px', borderRadius: '12px', color: 'white', fontSize: '14px' }}
              />
              <button type="submit" style={{ position: 'absolute', right: '12px', top: '10px', background: 'transparent', border: 'none', color: 'var(--gold)', cursor: 'pointer' }}>
                <Send size={22} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiSuggestions;
