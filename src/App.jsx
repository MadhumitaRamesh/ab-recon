import React, { useEffect } from 'react';
import { useApp } from './context/AppContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ReconMaster from './pages/ReconMaster';
import ExceptionQueue from './pages/ExceptionQueue';
import ModuleAccess from './pages/ModuleAccess';
import AuditLog from './pages/AuditLog';
import Roles from './pages/Roles';
import Users from './pages/Users';
import RunRecon from './pages/RunRecon';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

function App() {
  const { user, setUser, activePage, setActivePage, logout, login } = useApp();

  useEffect(() => {
    const savedUser = localStorage.getItem('ab_recon_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, [setUser]);

  if (!user) {
    return <Login onLogin={login} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'masters': return <ReconMaster />;
      case 'runs': return <RunRecon />;
      case 'exceptions': return <ExceptionQueue />;
      case 'suggestions': return <ExceptionQueue />;
      case 'reports': return <div className="main-content"><div className="card"><h3>Reconciliation Reports</h3><p style={{ color: '#64748B', marginTop: '12px' }}>Operational reports for matched and unmatched transactions.</p></div></div>;
      case 'audit': return <AuditLog />;
      case 'users': return <Users />;
      case 'roles': return <Roles />;
      case 'permissions': return <ModuleAccess />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Navbar user={user} onLogout={logout} />
        {renderPage()}
      </div>
    </div>
  );
}

export default App;
