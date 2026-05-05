import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Save, RotateCcw, Shield } from 'lucide-react';

const ModuleAccess = () => {
  const { roles, modules, permissions, updatePermissions } = useApp();
  const [localPerms, setLocalPerms] = useState(permissions);

  const togglePermission = (mod, roleName) => {
    if (roleName === 'Admin') return; // Admin locked
    setLocalPerms(prev => ({
      ...prev,
      [mod]: {
        ...prev[mod],
        [roleName]: !prev[mod][roleName]
      }
    }));
  };

  const handleSave = () => {
    updatePermissions(localPerms);
    alert('System permissions updated. Affected users will see changes on their next interaction.');
  };

  return (
    <div className="main-content">
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '24px', color: '#0F172A' }}>Module Access Matrix</h1>
          <p style={{ color: '#64748B', fontSize: '14px', marginTop: '4px' }}>Configure role-based access control (RBAC) permissions for platform modules.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-outline"><RotateCcw size={16} style={{ marginRight: '8px' }} /> Reset</button>
          <button className="btn btn-primary" onClick={handleSave}><Save size={16} style={{ marginRight: '8px' }} /> Save Matrix</button>
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table className="data-table" style={{ borderBottom: 'none' }}>
          <thead>
            <tr>
              <th style={{ width: '300px' }}>Module / Navigation Item</th>
              {roles.map(role => (
                <th key={role.name} style={{ textAlign: 'center' }}>{role.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modules.map(mod => (
              <tr key={mod}>
                <td style={{ fontWeight: '600', padding: '16px 24px' }}>{mod}</td>
                {roles.map(role => (
                  <td key={role.name} style={{ textAlign: 'center', padding: '16px' }}>
                    <input 
                      type="checkbox" 
                      checked={localPerms[mod][role.name]} 
                      onChange={() => togglePermission(mod, role.name)}
                      disabled={role.name === 'Admin'}
                      style={{ width: '18px', height: '18px', cursor: role.name === 'Admin' ? 'not-allowed' : 'pointer', accentColor: 'var(--primary)' }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '32px', padding: '24px', background: '#FFFBEB', borderRadius: '8px', border: '1px solid #FCD34D', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <Shield size={20} color="#B45309" style={{ marginTop: '2px' }} />
        <div>
          <h4 style={{ fontSize: '14px', color: '#92400E', fontWeight: '700', marginBottom: '4px' }}>Security Policy Enforcement</h4>
          <p style={{ fontSize: '13px', color: '#B45309', lineHeight: '1.5' }}>Administrator role permissions are system-locked. Changes to other roles will reflect instantly in the sidebar navigation.</p>
        </div>
      </div>
    </div>
  );
};

export default ModuleAccess;
