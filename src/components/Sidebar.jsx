import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Settings, 
  RefreshCcw, 
  AlertTriangle, 
  Zap, 
  FileText, 
  ShieldCheck, 
  Users, 
  Grid,
  ChevronRight
} from 'lucide-react';

const Sidebar = () => {
  const { user, activePage, setActivePage, permissions } = useApp();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, moduleName: 'Dashboard' },
    { id: 'masters', label: 'Recon Masters', icon: Settings, moduleName: 'Recon Masters' },
    { id: 'runs', label: 'Run Recon', icon: RefreshCcw, moduleName: 'Run Recon' },
    { id: 'exceptions', label: 'Exception Queue', icon: AlertTriangle, moduleName: 'Exception Queue' },
    { id: 'suggestions', label: 'AI Suggestions', icon: Zap, moduleName: 'AI Suggestions' },
    { id: 'reports', label: 'Reports', icon: FileText, moduleName: 'Reports' },
    { id: 'audit', label: 'Audit Log', icon: ShieldCheck, moduleName: 'Audit Log' },
    { id: 'users', label: 'Users', icon: Users, moduleName: 'Users' },
    { id: 'roles', label: 'Roles', icon: Grid, moduleName: 'Roles' },
    { id: 'permissions', label: 'Permissions', icon: ShieldCheck, moduleName: 'Permissions' },
  ];

  // Filter items based on dynamic permissions for the current user's role
  const filteredItems = menuItems.filter(item => 
    permissions[item.moduleName] && permissions[item.moduleName][user.role]
  );

  return (
    <div style={{ 
      width: 'var(--sidebar-width)', 
      height: '100vh', 
      background: '#1A1C1E', 
      color: '#E2E8F0',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '4px 0 10px rgba(0,0,0,0.1)'
    }}>
      <div style={{ padding: '32px 24px', borderBottom: '1px solid #2D3135' }}>
        <div style={{ color: 'var(--primary)', fontWeight: '900', fontSize: '20px', fontFamily: 'Outfit, sans-serif' }}>
          ABC <span style={{ color: 'white', fontWeight: '400' }}>RECON</span>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '24px 0', overflowY: 'auto' }}>
        {filteredItems.map(item => (
          <button 
            key={item.id}
            onClick={() => setActivePage(item.id)}
            style={{ 
              width: '100%',
              padding: '12px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: activePage === item.id ? '#2D3135' : 'transparent',
              color: activePage === item.id ? 'white' : '#94A3B8',
              border: 'none',
              borderLeft: `3px solid ${activePage === item.id ? 'var(--primary)' : 'transparent'}`,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <item.icon size={18} />
              <span style={{ fontSize: '14px', fontWeight: activePage === item.id ? '600' : '400' }}>{item.label}</span>
            </div>
            {activePage === item.id && <ChevronRight size={14} />}
          </button>
        ))}
      </nav>

      <div style={{ padding: '24px', borderTop: '1px solid #2D3135', background: '#141618' }}>
        <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '500' }}>PLATFORM V2.0</div>
      </div>
    </div>
  );
};

export default Sidebar;
