import React from 'react';
import { Bell, LogOut, Search, User } from 'lucide-react';

const Navbar = ({ user, onLogout }) => {
  return (
    <div style={{ 
      height: 'var(--header-height)', 
      background: 'white',
      borderBottom: '1px solid var(--border-light)',
      position: 'fixed',
      top: 0,
      right: 0,
      left: 'var(--sidebar-width)',
      zIndex: 90,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94A3B8' }} />
          <input 
            type="text" 
            placeholder="Search records, users, logs..."
            style={{ 
              width: '100%', 
              padding: '8px 12px 8px 38px', 
              borderRadius: '6px', 
              border: '1px solid #E2E8F0',
              fontSize: '13px',
              background: '#F8FAFC'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ position: 'relative', cursor: 'pointer', color: '#64748B' }}>
          <Bell size={20} />
          <span style={{ 
            position: 'absolute', 
            top: '-2px', 
            right: '-2px', 
            background: 'var(--primary)', 
            color: 'white', 
            fontSize: '10px', 
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid white',
            fontWeight: 'bold'
          }}>5</span>
        </div>

        <div style={{ height: '32px', width: '1px', background: '#E2E8F0' }}></div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', fontWeight: '600' }}>{user.employeeId}</div>
            <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase' }}>{user.role}</div>
          </div>
          <div style={{ 
            width: '38px', 
            height: '38px', 
            borderRadius: '8px', 
            background: '#F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)',
            border: '1px solid #E2E8F0'
          }}>
            <User size={20} />
          </div>
        </div>

        <button 
          onClick={onLogout}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            background: 'transparent',
            border: 'none',
            color: '#64748B',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            marginLeft: '8px'
          }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Navbar;
