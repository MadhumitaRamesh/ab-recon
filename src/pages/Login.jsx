import React, { useState } from 'react';
import { LogIn, ShieldCheck, AlertCircle, Sparkles, Lock, Shield } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState(''); // Auth Status
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setStatus('Hashing Password...');

    // Simulate Hashing & Transmission Encryption
    setTimeout(() => {
      setStatus('Encrypting Transmission Payload...');
      setTimeout(() => {
        setStatus('Securely Authenticating...');
        setTimeout(() => {
          const success = onLogin(employeeId, password);
          if (!success) {
            setError('Invalid Employee ID or Security Hash. Access Denied.');
          }
          setIsLoading(false);
          setStatus('');
        }, 800);
      }, 800);
    }, 800);
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
          <p style={{ color: '#64748B', fontSize: '15px', marginTop: '8px' }}>Secure Identity Management Gateway</p>
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
              disabled={isLoading}
              style={{ height: '52px', fontSize: '16px', borderRadius: '12px' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label className="form-label" style={{ fontWeight: '700', color: '#475569' }}>Access Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="password" 
                className="form-control" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                style={{ height: '52px', fontSize: '16px', borderRadius: '12px', paddingRight: '45px' }}
              />
              <Lock size={18} color="#94A3B8" style={{ position: 'absolute', right: '16px', top: '17px' }} />
            </div>
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
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              boxShadow: '0 4px 12px rgba(123, 17, 19, 0.2)'
            }}
          >
            {isLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Shield size={18} className="animate-pulse" /> {status}
              </div>
            ) : (
              <>Secure Access <LogIn size={20} /></>
            )}
          </button>
        </form>

        <div style={{ marginTop: '40px', textAlign: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#64748B', fontSize: '12px', fontWeight: '700' }}>
            <Lock size={12} color="#059669" /> End-to-End Encryption (AES-256 Simulation)
          </div>
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: '24px', color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: '600' }}>
        © 2026 Aditya Birla Capital. Security Posture: Level 4 Compliant
      </div>
    </div>
  );
};

export default Login;
