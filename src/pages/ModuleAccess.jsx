import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Save, RefreshCw } from 'lucide-react';

const ModuleAccess = () => {
  const { roles, permissions, setPermissions, modules, addNotification } = useApp();

  const handleToggle = (module, role) => {
    const updated = { ...permissions };
    updated[module][role] = !updated[module][role];
    setPermissions(updated);
  };

  const handleSave = () => {
    addNotification({ title: 'Permissions Saved', message: 'Global module access matrix has been updated.' });
  };

  return (
    <div className="main-content">
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: '1', minWidth: '280px' }}>
          <h1 style={{ fontSize: 'clamp(20px, 4vw, 24px)', color: '#0F172A' }}>Module Access Matrix</h1>
          <p style={{ color: '#64748B', fontSize: '14px', marginTop: '4px' }}>Configure role-based access control (RBAC) for every platform module.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', width: '100%', maxWidth: 'fit-content' }}>
          <button className="btn btn-outline" onClick={() => window.location.reload()} style={{ flex: 1 }}><RefreshCw size={16} /></button>
          <button className="btn btn-primary" onClick={handleSave} style={{ flex: 1, minWidth: '150px' }}>
            <Save size={16} style={{ marginRight: '8px' }} /> Save Matrix
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="responsive-table-container" style={{ border: 'none', marginBottom: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ position: 'sticky', left: 0, background: '#F8FAFC', zIndex: 10 }}>Module</th>
                {roles.map(role => (
                  <th key={role.id} style={{ textAlign: 'center' }}>{role.name.replace('_', ' ')}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modules.map(module => (
                <tr key={module}>
                  <td style={{ fontWeight: '700', fontSize: '13px', position: 'sticky', left: 0, background: 'white', zIndex: 5, borderRight: '1px solid #F1F5F9' }}>
                    {module}
                  </td>
                  {roles.map(role => (
                    <td key={role.id} style={{ textAlign: 'center' }}>
                      <input 
                        type="checkbox" 
                        checked={permissions[module][role.name] || false}
                        onChange={() => handleToggle(module, role.name)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: '24px', padding: '16px', background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <ShieldCheck size={18} color="var(--primary)" />
        <p style={{ fontSize: '12px', color: '#991B1B', fontWeight: '600' }}>Changes made here take effect immediately for all active user sessions.</p>
      </div>
    </div>
  );
};

export default ModuleAccess;
