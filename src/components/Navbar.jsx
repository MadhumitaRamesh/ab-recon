import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, LogOut, Search, User, Menu, X, CheckCircle } from 'lucide-react';

const Navbar = ({ user, onLogout }) => {
  const { searchQuery, setSearchQuery, notifications, markAllAsRead, sidebarOpen, setSidebarOpen } = useApp();
  const [showNotifs, setShowNotifs] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

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
      padding: '0 24px',
      transition: 'left 0.3s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
        <button 
          className="mobile-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ 
            display: 'none', 
            background: 'transparent', 
            border: 'none', 
            cursor: 'pointer',
            color: '#64748B'
          }}
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className="header-search" style={{ position: 'relative', width: '300px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94A3B8' }} />
          <input 
            type="text" 
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowNotifs(!showNotifs)}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              cursor: 'pointer', 
              color: '#64748B', 
              position: 'relative',
              padding: '4px'
            }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span style={{ 
                position: 'absolute', 
                top: '0px', 
                right: '0px', 
                background: 'var(--primary)', 
                color: 'white', 
                fontSize: '9px', 
                minWidth: '16px',
                height: '16px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid white',
                fontWeight: 'bold'
              }}>{unreadCount}</span>
            )}
          </button>

          {showNotifs && (
            <div className="animate-fade-in" style={{ 
              position: 'absolute', 
              top: '40px', 
              right: '0', 
              width: '320px', 
              background: 'white', 
              borderRadius: '8px', 
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)', 
              border: '1px solid #E2E8F0',
              overflow: 'hidden'
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', fontSize: '13px' }}>Notifications</span>
                <button 
                  onClick={() => { markAllAsRead(); setShowNotifs(false); }}
                  style={{ fontSize: '11px', color: 'var(--primary)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                >
                  Mark all as read
                </button>
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.map(n => (
                  <div key={n.id} style={{ 
                    padding: '12px 16px', 
                    borderBottom: '1px solid #F8FAFC', 
                    background: n.read ? 'white' : '#FFF9F9',
                    display: 'flex',
                    gap: '12px'
                  }}>
                    <div style={{ marginTop: '2px' }}>
                      <CheckCircle size={16} color={n.read ? '#CBD5E1' : 'var(--primary)'} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: n.read ? '500' : '600', color: '#1E293B' }}>{n.title}</div>
                      <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{n.message}</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className="user-profile">
          <div style={{ textAlign: 'right', display: 'none' }} className="d-md-block">
            <div style={{ fontSize: '12px', fontWeight: '600' }}>{user.employeeId}</div>
            <div style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase' }}>{user.role}</div>
          </div>
          <div style={{ 
            width: '34px', 
            height: '34px', 
            borderRadius: '8px', 
            background: '#F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)',
            border: '1px solid #E2E8F0'
          }}>
            <User size={18} />
          </div>
        </div>

        <button 
          onClick={onLogout}
          style={{ 
            background: 'transparent',
            border: 'none',
            color: '#64748B',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <LogOut size={20} />
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 768px) {
          .mobile-toggle { display: block !important; }
          .d-md-block { display: none !important; }
          .user-profile { gap: 0 !important; }
        }
        @media (min-width: 769px) {
          .d-md-block { display: block !important; }
        }
      `}} />
    </div>
  );
};

export default Navbar;
