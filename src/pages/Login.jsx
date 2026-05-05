import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, User, Briefcase } from 'lucide-react';

const Login = () => {
  const { roles, login } = useApp();
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (employeeId && password && role) {
      login({ employeeId, role });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyCenter: 'center', background: '#F0F2F5', padding: '20px', justifyContent: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '48px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '24px', letterSpacing: '-0.5px', fontFamily: 'Outfit, sans-serif' }}>
            ADITYA BIRLA CAPITAL
          </div>
          <div style={{ marginTop: '8px', fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500' }}>
            Reconciliation & Exception Intelligence
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label className="form-label">Employee ID</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94A3B8' }} />
              <input type="text" className="form-control" style={{ paddingLeft: '38px' }} placeholder="Enter Employee ID" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94A3B8' }} />
              <input type="password" className="form-control" style={{ paddingLeft: '38px' }} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">System Role</label>
            <div style={{ position: 'relative' }}>
              <Briefcase size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94A3B8' }} />
              <select className="form-control" style={{ paddingLeft: '38px', appearance: 'none', background: 'white' }} value={role} onChange={(e) => setRole(e.target.value)} required >
                <option value="">Select your role</option>
                {roles.map(r => (
                  <option key={r.id} value={r.name}>{r.name.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '44px', marginTop: '8px' }}>
            Sign In to Platform
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
