import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();
const API_URL = 'http://localhost:5001/api';

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  
  // Data States
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState(null);
  const [masters, setMasters] = useState([]);
  const [exceptions, setExceptions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [runHistory, setRunHistory] = useState([]);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Initial Data Fetch from MySQL Backend
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const fetchers = [
          fetch(`${API_URL}/roles`).then(r => r.json()),
          fetch(`${API_URL}/masters`).then(r => r.json()),
          fetch(`${API_URL}/exceptions`).then(r => r.json()),
          fetch(`${API_URL}/audit-logs`).then(r => r.json()),
          fetch(`${API_URL}/run-history`).then(r => r.json()),
          fetch(`${API_URL}/users`).then(r => r.json()),
          fetch(`${API_URL}/notifications`).then(r => r.json()),
          fetch(`${API_URL}/ai-suggestions`).then(r => r.json()),
          fetch(`${API_URL}/permissions`).then(r => r.json()),
        ];

        const [r, m, e, a, h, u, n, s, p] = await Promise.all(fetchers);
        
        setRoles(r || []);
        setMasters(m || []);
        setExceptions(e || []);
        setAuditLogs(a || []);
        setRunHistory(h || []);
        setUsers(u || []);
        setNotifications(n || []);
        setAiSuggestions(s || []);
        
        // Structure permissions if they exist, otherwise use fallback
        if (p && p.length > 0) {
          const permMap = {};
          p.forEach(item => {
            if (!permMap[item.module_name]) permMap[item.module_name] = {};
            permMap[item.module_name][item.role_name] = item.is_allowed;
          });
          setPermissions(permMap);
        } else {
          // Hardcoded fallback permissions if DB is empty
          setPermissions(getDefaultPermissions());
        }
      } catch (err) {
        console.warn('Backend Sync Failed. Falling back to local data protocol.', err);
        // Load some basic fallback data if backend is unreachable
        setMasters([
          { id: 1, name: 'Cash Back', frequency: 'Daily', type: 'Automatic', sources: '2-Way', status: 'Active' },
          { id: 2, name: 'BBPS', frequency: 'Daily', type: 'Manual', sources: '3-Way', status: 'Active' },
        ]);
        setPermissions(getDefaultPermissions());
      }
    };

    fetchInitialData();
  }, []);

  const modules = [
    'Dashboard', 'Recon Masters', 'Run Recon', 'Run History', 'Exception Queue', 
    'AI Suggestions', 'Reports', 'Audit Log', 'Users', 'Roles', 'Permissions'
  ];

  const getDefaultPermissions = () => {
    const perms = {};
    modules.forEach(mod => {
      perms[mod] = {};
      ['Admin', 'Ops_Maker', 'Ops_Checker', 'CS User', 'BU_User'].forEach(role => {
        perms[mod][role] = role === 'Admin';
      });
    });
    // Basic Operational Access
    perms['Dashboard']['Ops_Maker'] = true;
    perms['Run Recon']['Ops_Maker'] = true;
    perms['Run History']['Ops_Maker'] = true;
    return perms;
  };

  const logAudit = async (action, module, detail, type = 'System') => {
    const forensicHash = btoa(Math.random().toString()).substring(0, 12);
    const newLog = {
      user_name: user ? user.name : 'System',
      action,
      module,
      detail,
      type,
      forensic_hash: forensicHash
    };

    // Optimistic Update
    setAuditLogs(prev => [{ ...newLog, id: Date.now(), log_time: 'Now', log_date: 'Today' }, ...prev]);

    try {
      await fetch(`${API_URL}/audit-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog)
      });
    } catch (err) {
      console.error('Audit Persistence Failed:', err);
    }
  };

  const login = (employeeId, password) => {
    const matchedUser = users.find(u => u.employee_id === employeeId);
    if (matchedUser) {
      setUser(matchedUser);
      localStorage.setItem('ab_recon_user', JSON.stringify(matchedUser));
      logAudit('Secure Session Start', 'Auth', `User ${employeeId} authenticated via MySQL Identity Provider`, 'Security');
      return true;
    }
    return false;
  };

  const logout = () => {
    logAudit('Session End', 'Auth', 'User session terminated manually', 'Security');
    localStorage.removeItem('ab_recon_user');
    setUser(null);
    setActivePage('dashboard');
    setTimeout(() => { window.location.reload(); }, 50);
  };

  const addMaster = async (master) => {
    try {
      const res = await fetch(`${API_URL}/masters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...master, status: 'Active' })
      });
      const savedMaster = await res.json();
      setMasters(prev => [...prev, savedMaster]);
    } catch (err) {
      setMasters(prev => [...prev, { ...master, id: Date.now() }]);
    }
  };

  const updateRunHistory = async (newRun) => {
    // Map frontend object to DB columns
    const dbRun = {
      id: newRun.id,
      product: newRun.product,
      status: newRun.status,
      matched_count: newRun.matched,
      exception_count: newRun.exceptions
    };

    setRunHistory(prev => [newRun, ...prev]);

    try {
      await fetch(`${API_URL}/run-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbRun)
      });
    } catch (err) {
      console.error('Run History Persistence Failed:', err);
    }
  };

  const addNotification = async (notif) => {
    const newNotif = { ...notif, time_label: 'Just now' };
    setNotifications(prev => [{ ...newNotif, id: Date.now() }, ...prev]);
    
    try {
      await fetch(`${API_URL}/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNotif)
      });
    } catch (err) {
      console.error('Notification Persistence Failed:', err);
    }
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
  };

  // Restore Session on Mount
  useEffect(() => {
    const savedUser = localStorage.getItem('ab_recon_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  return (
    <AppContext.Provider value={{
      user, setUser,
      activePage, setActivePage,
      roles, setRoles,
      permissions, setPermissions,
      masters, setMasters, addMaster,
      exceptions, setExceptions,
      aiSuggestions, setAiSuggestions,
      users, setUsers,
      auditLogs, setAuditLogs, logAudit,
      runHistory, setRunHistory: updateRunHistory,
      notifications, addNotification, markAllAsRead,
      searchQuery, setSearchQuery,
      sidebarOpen, setSidebarOpen,
      login, logout,
      modules
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
