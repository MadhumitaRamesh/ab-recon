import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Zap, CheckCircle2, MessageSquare, Sparkles, Send, ShieldCheck, X } from 'lucide-react';

const AiSuggestions = () => {
  const { addNotification, aiSuggestions, setAiSuggestions } = useApp();
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: 'Hello! I am your ABC Reconciliation Co-Pilot. I have identified 3 new anomaly patterns today. How can I assist you with the resolution?' }
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
    addNotification({ title: 'Insight Ignored', message: `Suggestion ${id} has been archived and removed from your view.` });
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const newMsgs = [...chatMessages, { role: 'user', text: userInput }];
    setChatMessages(newMsgs);
    const currentInput = userInput;
    setUserInput('');

    // Faster and more robust response logic
    setTimeout(() => {
      let response = "I'm currently cross-referencing your request with our historical settlement datasets. Could you specify which reconciliation master you are interested in?";
      
      const input = currentInput.toLowerCase();
      if (input.includes('mismatch')) {
        response = "The ₹5,000 mismatch is concentrated in the BBPS Daily batch. It appears to be a systemic rounding difference in service tax calculations across 12 UPI transactions.";
      } else if (input.includes('status')) {
        response = "The AI Core is operational. We are currently processing 4.2M records with an accuracy rate of 99.4%.";
      } else if (input.includes('patterns') || input.includes('suggestion')) {
        response = "I have identified patterns including pattern matching for UPI mismatches and predictive mapping for missing entries in the BBPS module.";
      } else if (input.includes('hello') || input.includes('hi')) {
        response = "Hello! I am ready to help you analyze exceptions or explain the logic behind my suggestions.";
      }

      setChatMessages(prev => [...prev, { role: 'ai', text: response }]);
    }, 1000); // 1s delay for better UX
  };

  return (
    <div className="main-content">
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: '1', minWidth: '280px' }}>
          <h1 style={{ fontSize: 'clamp(20px, 4vw, 24px)', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles color="var(--gold)" fill="var(--gold)" size={24} /> AI Intelligence Assistant
          </h1>
          <p style={{ color: '#64748B', fontSize: '14px', marginTop: '4px' }}>SRS-Compliant anomaly detection and automated resolution engine.</p>
        </div>
        <div style={{ background: '#F0F9FF', padding: '10px 16px', borderRadius: '10px', border: '1px solid #BAE6FD', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={18} color="#0369A1" />
          <div style={{ fontSize: '12px', color: '#0369A1', fontWeight: '700' }}>AI Core: Operational</div>
        </div>
      </div>

      <div className="grid-2-1">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '16px', color: '#475569', marginBottom: '4px' }}>Active Intelligence Insights</h3>
          {aiSuggestions.map(s => (
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
                <button className="btn btn-outline" onClick={() => handleIgnore(s.id)} style={{ flex: 1 }}>Ignore Suggestion</button>
              </div>
            </div>
          ))}
          {aiSuggestions.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
              <CheckCircle2 size={48} color="#059669" style={{ marginBottom: '16px', opacity: 0.5 }} />
              <h3>All Insights Addressed</h3>
              <p style={{ color: '#64748B' }}>The AI engine has no pending suggestions for the current reconciliation cycle.</p>
            </div>
          )}
        </div>

        <div style={{ minWidth: '0' }}>
          <div className="card" style={{ background: '#0F172A', color: 'white', border: 'none', display: 'flex', flexDirection: 'column', height: '500px' }}>
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
                placeholder="Ask about mismatches or patterns..." 
                style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '10px 45px 10px 12px', borderRadius: '8px', color: 'white', fontSize: '13px' }}
              />
              <button type="submit" style={{ position: 'absolute', right: '10px', top: '8px', background: 'transparent', border: 'none', color: 'var(--gold)', cursor: 'pointer' }}>
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
