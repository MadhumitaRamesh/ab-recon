import React, { useState } from 'react';
import { LogIn, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Artificial delay for 'authenticating'
    setTimeout(() => {
      const success = onLogin(employeeId);
      if (!success) {
        setError('Invalid Employee ID. Access Denied.');
      }
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'linear-gradient(135deg, #7B1113 0%, #1a1a1a 100%)',
      padding: '20px'
    }}>
      <div className="card animate-reveal" style={{ 
        maxWidth: '440px', 
        width: '100%', 
        padding: '48px', 
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            background: 'var(--primary)', 
            borderRadius: '20px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 10px 20px rgba(123, 17, 19, 0.3)'
          }}>
            <ShieldCheck size={40} color="white" />
          </div>
          <h1 style={{ fontSize: '28px', color: '#1E293B', fontWeight: '800' }}>AB Recon Platform</h1>
          <p style={{ color: '#64748B', fontSize: '15px', marginTop: '8px' }}>Enter your Employee ID to access your dashboard.</p>
        </div>

        {error && (
          <div style={{ 
            background: '#FEF2F2', 
            border: '1px solid #FCA5A5', 
            color: '#B91C1C', 
            padding: '12px 16px', 
            borderRadius: '12px', 
            marginBottom: '24px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" style={{ fontWeight: '700', color: '#475569' }}>Employee ID</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. ABC001"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
              required
              style={{ height: '52px', fontSize: '16px', borderRadius: '12px' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label className="form-label" style={{ fontWeight: '700', color: '#475569' }}>Access Password</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ height: '52px', fontSize: '16px', borderRadius: '12px' }}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={isLoading}
            style={{ 
              width: '100%', 
              height: '56px', 
              fontSize: '16px', 
              fontWeight: '800',
              borderRadius: '12px',
              display: 'flex',
              gap: '12px',
              boxShadow: '0 4px 12px rgba(123, 17, 19, 0.2)'
            }}
          >
            {isLoading ? 'Authenticating...' : (
              <>Access Dashboard <LogIn size={20} /></>
            )}
          </button>
        </form>

        <div style={{ marginTop: '40px', textAlign: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#64748B', fontSize: '13px', fontWeight: '600' }}>
            <Sparkles size={14} color="var(--gold)" /> AI-Powered Recon Intelligence
          </div>
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: '24px', color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: '600' }}>
        © 2026 Aditya Birla Capital. All rights reserved.
      </div>
    </div>
  );
};

export default Login;
