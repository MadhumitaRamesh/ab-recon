import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Save, RotateCcw, Lock, Unlock, CheckSquare, Square, AlertCircle } from 'lucide-react';

const ModuleAccess = () => {
  const { roles, modules, permissions, saveAllPermissions, addNotification, getDefaultPermissions } = useApp();
  const [localPerms, setLocalPerms] = useState({...permissions});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    setLocalPerms({...permissions});
  }, [permissions]);

  const togglePermission = (mod, role) => {
    const updated = { ...localPerms };
    if (!updated[mod]) updated[mod] = {};
    updated[mod][role] = !updated[mod][role];
    setLocalPerms(updated);
  };

  const handleSave = async () => {
    if (window.confirm('Are you sure you want to apply these permission changes across the entire platform? This will immediately affect all active users.')) {
      const success = await saveAllPermissions(localPerms);
      if (success) {
        addNotification({ title: 'Permissions Synced', message: 'The global module access matrix has been updated successfully.' });
        alert('Success! Global module permissions have been updated and synchronized with the security matrix.');
      }
    }
  };

  const handleReset = async () => {
    if (window.confirm('CRITICAL ACTION: Do you want to restore factory default permissions? This will override all current custom rules and cannot be undone.')) {
      const defaults = getDefaultPermissions();
      const success = await saveAllPermissions(defaults);
      if (success) {
        setLocalPerms(defaults);
        addNotification({ title: 'Defaults Restored', message: 'System permissions have been reset to baseline defaults.' });
        alert('System baseline permissions have been restored successfully.');
      }
    }
  };

  return (
    <div className={`main-content ${isLoaded ? 'animate-reveal' : ''}`} style={{ opacity: isLoaded ? 1 : 0 }}>
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 32px)', color: '#0F172A', fontWeight: '800' }}>Module Access Matrix</h1>
          <p style={{ color: '#64748B', fontSize: '16px', marginTop: '6px' }}>Configure granular module-level permissions across all organizational roles.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <button className="btn btn-outline" onClick={handleReset} style={{ height: '52px' }}>
            <RotateCcw size={18} style={{ marginRight: '10px' }} /> Restore Defaults
          </button>
          <button className="btn btn-primary" onClick={handleSave} style={{ height: '52px', minWidth: '180px' }}>
            <Save size={18} style={{ marginRight: '10px' }} /> Save Changes
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="responsive-table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="data-table" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                <th style={{ position: 'sticky', left: 0, zIndex: 10, background: '#F8FAFC', borderRight: '2px solid var(--border-light)' }}>Application Module</th>
                {roles.map(role => (
                  <th key={role.id} style={{ textAlign: 'center', minWidth: '140px' }}>
                    <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>ROLE</div>
                    {role.name.replace('_', ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modules.map(mod => (
                <tr key={mod}>
                  <td style={{ 
                    fontWeight: '800', 
                    color: '#1E293B', 
                    background: 'white', 
                    position: 'sticky', 
                    left: 0, 
                    zIndex: 5, 
                    borderRight: '2px solid var(--border-light)',
                    fontSize: '14px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                      {mod}
                    </div>
                  </td>
                  {roles.map(role => (
                    <td key={role.id} style={{ textAlign: 'center' }}>
                      <button 
                        onClick={() => togglePermission(mod, role.name)}
                        style={{ 
                          background: 'transparent', 
                          border: 'none', 
                          cursor: 'pointer', 
                          padding: '8px',
                          color: localPerms[mod]?.[role.name] ? 'var(--primary)' : '#CBD5E1',
                          transition: 'all 0.2s ease',
                          transform: localPerms[mod]?.[role.name] ? 'scale(1.1)' : 'scale(1)'
                        }}
                      >
                        {localPerms[mod]?.[role.name] ? <CheckSquare size={24} /> : <Square size={24} />}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: '32px', padding: '24px', background: '#FEFCE8', border: '1px solid #FEF08A', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <AlertCircle size={24} color="#A16207" />
        <p style={{ fontSize: '14px', color: '#854D0E', fontWeight: '600' }}>Warning: Revoking access to the 'Dashboard' or 'Permissions' modules for Admin roles may lead to platform lockout. Always verify the security matrix before saving changes.</p>
      </div>
    </div>
  );
};

export default ModuleAccess;
