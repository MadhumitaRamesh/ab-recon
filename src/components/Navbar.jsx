import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, LogOut, Search, User, Menu, X, CheckCircle, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, logout, searchQuery, setSearchQuery, notifications, markAllAsRead, sidebarOpen, setSidebarOpen } = useApp();
  const [showNotifs, setShowNotifs] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!user) return null;

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
      transition: 'all 0.3s ease'
    }} className="header-nav">
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
          <Menu size={24} />
        </button>

        <div className="header-search" style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontSize: '11px', fontWeight: '800', background: '#ECFDF5', padding: '6px 12px', borderRadius: '20px' }}>
          <Shield size={12} /> SECURE SESSION
        </div>

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
              width: '280px', 
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
                  Mark all
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
                    <CheckCircle size={14} color={n.read ? '#CBD5E1' : 'var(--primary)'} style={{ marginTop: '2px' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#1E293B' }}>{n.title}</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>{n.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '16px', borderLeft: '1px solid #F1F5F9' }} className="user-info">
          <div style={{ textAlign: 'right', display: 'none' }} className="user-details">
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#1E293B' }}>{user.employeeId}</div>
            <div style={{ fontSize: '10px', color: 'var(--primary)', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '0.5px' }}>{user.role.replace('_', ' ')}</div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E2E8F0' }}>
            <User size={20} color="var(--primary)" />
          </div>
          <button 
            onClick={logout} 
            title="Secure Sign Out"
            style={{ 
              background: '#FEE2E2', 
              border: 'none', 
              color: '#DC2626', 
              cursor: 'pointer', 
              padding: '10px', 
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 768px) {
          .header-nav { left: 0 !important; padding: 0 16px !important; }
          .mobile-toggle { display: block !important; }
          .user-details { display: none !important; }
        }
        @media (min-width: 769px) {
          .user-details { display: block !important; }
        }
      `}} />
    </div>
  );
};

export default Navbar;
