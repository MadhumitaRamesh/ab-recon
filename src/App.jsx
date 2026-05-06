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
import RunHistory from './pages/RunHistory';
import AiSuggestions from './pages/AiSuggestions';
import Reports from './pages/Reports';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

function App() {
  const { user, setUser, activePage, logout, login } = useApp();

  useEffect(() => {
    const savedUser = localStorage.getItem('ab_recon_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed && parsed.employeeId) {
        setUser(parsed);
      } else {
        localStorage.removeItem('ab_recon_user');
      }
    }
  }, [setUser]);

  // Global Interactivity Script
  useEffect(() => {
    const handleMouseOver = (e) => {
      const card = e.target.closest('.card');
      if (card) card.classList.add('js-hover');
    };

    const handleMouseOut = (e) => {
      const card = e.target.closest('.card');
      if (card) card.classList.remove('js-hover');
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  if (!user) {
    return <Login onLogin={login} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'masters': return <ReconMaster />;
      case 'runs': return <RunRecon />;
      case 'history': return <RunHistory />;
      case 'exceptions': return <ExceptionQueue />;
      case 'suggestions': return <AiSuggestions />;
      case 'reports': return <Reports />;
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
      <div style={{ flex: 1, position: 'relative' }}>
        <Navbar user={user} onLogout={logout} />
        {renderPage()}
      </div>
    </div>
  );
}

export default App;
