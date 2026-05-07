import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();
const API_URL = 'http://localhost:5001/api';

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');

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
    perms['Dashboard']['Ops_Maker'] = true;
    perms['Dashboard']['Ops_Checker'] = true;
    perms['Dashboard']['CS User'] = true;
    perms['Dashboard']['BU_User'] = true;
    perms['Recon Masters']['Ops_Maker'] = true;
    perms['Run Recon']['Ops_Maker'] = true;
    perms['Run History']['Ops_Maker'] = true;
    perms['Run History']['Ops_Checker'] = true;
    perms['Run History']['CS User'] = true;
    perms['Run History']['BU_User'] = true;
    perms['Exception Queue']['Ops_Maker'] = true;
    perms['Exception Queue']['Ops_Checker'] = true;
    perms['AI Suggestions']['Ops_Maker'] = true;
    perms['AI Suggestions']['Ops_Checker'] = true;
    perms['Reports']['Ops_Maker'] = true;
    perms['Reports']['Ops_Checker'] = true;
    perms['Reports']['CS User'] = true;
    perms['Reports']['BU_User'] = true;
    return perms;
  };

  // --- DATA NORMALIZERS: Map DB columns → Frontend field names ---

  const normalizeUser = (u) => ({
    id: u.id,
    name: u.name,
    employeeId: u.employee_id,
    role: u.role_name,
    status: u.status
  });

  const normalizeRunHistory = (r) => ({
    id: r.id,
    product: r.product,
    status: r.status,
    matched: r.matched_count,
    exceptions: r.exception_count,
    time: r.run_time ? r.run_time.substring(0, 5) : '--',
    date: r.run_date ? new Date(r.run_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '--'
  });

  const normalizeAuditLog = (a) => ({
    id: a.id,
    user: a.user_name,
    action: a.action,
    module: a.module,
    detail: a.detail,
    time: a.log_time ? a.log_time.substring(0, 5) : '--',
    date: a.log_date ? new Date(a.log_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '--',
    type: a.type,
    hash: a.forensic_hash
  });

  const normalizeException = (e) => ({
    id: e.id,
    amount: e.amount ? Number(e.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00',
    ref: e.ref_no,
    type: e.type,
    age: e.age,
    priority: e.priority,
    status: e.status
  });

  const normalizeNotification = (n) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    time: n.time_label || 'Just now',
    read: n.is_read === 1 || n.is_read === true
  });

  const normalizeAiSuggestion = (s) => ({
    id: s.id,
    type: s.type,
    confidence: s.confidence,
    detail: s.detail,
    action: s.recommended_action
  });

  const normalizePermissions = (rows) => {
    if (!rows || rows.length === 0) return getDefaultPermissions();
    const permMap = {};
    rows.forEach(item => {
      if (!permMap[item.module_name]) permMap[item.module_name] = {};
      permMap[item.module_name][item.role_name] = item.is_allowed === 1 || item.is_allowed === true;
    });
    return permMap;
  };

  // --- INITIAL DATA FETCH FROM MySQL ---

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [rawUsers, rawMasters, rawExceptions, rawAudit, rawHistory, rawNotifs, rawAI, rawPerms, rawRoles] = await Promise.all([
          fetch(`${API_URL}/users`).then(r => r.json()),
          fetch(`${API_URL}/masters`).then(r => r.json()),
          fetch(`${API_URL}/exceptions`).then(r => r.json()),
          fetch(`${API_URL}/audit-logs`).then(r => r.json()),
          fetch(`${API_URL}/run-history`).then(r => r.json()),
          fetch(`${API_URL}/notifications`).then(r => r.json()),
          fetch(`${API_URL}/ai-suggestions`).then(r => r.json()),
          fetch(`${API_URL}/permissions`).then(r => r.json()),
          fetch(`${API_URL}/roles`).then(r => r.json()),
        ]);

        setUsers(Array.isArray(rawUsers) ? rawUsers.map(normalizeUser) : []);
        setMasters(Array.isArray(rawMasters) ? rawMasters : []);
        setExceptions(Array.isArray(rawExceptions) ? rawExceptions.map(normalizeException) : []);
        setAuditLogs(Array.isArray(rawAudit) ? rawAudit.map(normalizeAuditLog) : []);
        setRunHistory(Array.isArray(rawHistory) ? rawHistory.map(normalizeRunHistory) : []);
        setNotifications(Array.isArray(rawNotifs) ? rawNotifs.map(normalizeNotification) : []);
        setAiSuggestions(Array.isArray(rawAI) ? rawAI.map(normalizeAiSuggestion) : []);
        setRoles(Array.isArray(rawRoles) ? rawRoles : []);
        setPermissions(normalizePermissions(rawPerms));

      } catch (err) {
        console.warn('Backend unreachable. Loading fallback data.', err.message);
        // Fallback data so UI is never empty
        setMasters([
          { id: 1, name: 'Cash Back', frequency: 'Daily', type: 'Automatic', sources: '2-Way', status: 'Active' },
          { id: 2, name: 'BBPS', frequency: 'Daily', type: 'Manual', sources: '3-Way', status: 'Active' },
          { id: 3, name: 'DigiGold', frequency: 'Weekly', type: 'API-based', sources: '2-Way', status: 'Active' },
        ]);
        setUsers([
          { id: 1, name: 'Admin User', employeeId: 'ABC001', role: 'Admin', status: 'Active' },
          { id: 2, name: 'Suresh K', employeeId: 'ABC002', role: 'Ops_Maker', status: 'Active' },
        ]);
        setRoles([
          { id: 1, name: 'Admin', description: 'Full access', level: 'System' },
          { id: 2, name: 'Ops_Maker', description: 'Operations', level: 'Operational' },
        ]);
        setExceptions([
          { id: 'TXN-4122', amount: '15,000.00', ref: 'ABC123456789', type: 'Amount Mismatch', age: '48h', priority: 'High', status: 'Unresolved' },
          { id: 'TXN-4123', amount: '2,500.00', ref: 'DEP-998877', type: 'Missing Entry', age: '24h', priority: 'Medium', status: 'Pending Review' },
        ]);
        setRunHistory([
          { id: 'RUN-992', product: 'BBPS Daily', status: 'Completed', matched: '4,210', exceptions: '12', time: '14:20', date: '06 May 2026' },
          { id: 'RUN-991', product: 'Cash Back', status: 'Failed', matched: '0', exceptions: '0', time: '13:05', date: '06 May 2026' },
        ]);
        setAuditLogs([
          { id: 1, user: 'Admin User', action: 'Session Start', module: 'Auth', detail: 'Logged in', time: '10:45', date: '06 May 2026', type: 'Security', hash: 'abc123' },
        ]);
        setNotifications([
          { id: 1, title: 'System Ready', message: 'Platform initialized.', time: '1m ago', read: false },
        ]);
        setAiSuggestions([
          { id: 'AI-201', type: 'Pattern Match', confidence: 98, detail: 'Recurring ₹5,000 mismatch in UPI logs.', action: 'Bulk Resolve' },
          { id: 'AI-202', type: 'Anomaly Detection', confidence: 85, detail: 'TXN-8821 shows 48h settlement lag.', action: 'Flag for Review' },
        ]);
        setPermissions(getDefaultPermissions());
      }
    };

    fetchAll();
  }, []);

  // Restore logged-in session
  useEffect(() => {
    const savedUser = localStorage.getItem('ab_recon_user');
    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch (e) {}
    }
  }, []);

  // --- ACTIONS ---

  const logAudit = async (action, module, detail, type = 'System') => {
    const forensicHash = btoa(Math.random().toString()).substring(0, 12);
    const newLog = {
      id: Date.now(),
      user: user ? user.name : 'System',
      action, module, detail, type,
      hash: forensicHash,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };
    setAuditLogs(prev => [newLog, ...prev]);

    try {
      await fetch(`${API_URL}/audit-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: newLog.user, action, module, detail, type, forensic_hash: forensicHash
        })
      });
    } catch (e) {}
  };

  const addUser = async (newUser) => {
    try {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(prev => [...prev, { ...newUser, id: data.id }]);
        logAudit('User Provisioned', 'Identity', `Created access for ${newUser.name} (${newUser.employeeId})`, 'Security');
        return true;
      }
    } catch (err) {
      console.error('User Persistence Failed:', err);
    }
    return false;
  };

  const login = async (employeeId, password) => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        localStorage.setItem('ab_recon_user', JSON.stringify(data.user));
        logAudit('Secure Session Start', 'Auth', `User ${employeeId} authenticated via bcrypt`, 'Security');
        return true;
      }
    } catch (err) {
      // Fallback: local match if backend is unreachable
      const matchedUser = users.find(u => u.employeeId === employeeId);
      if (matchedUser) {
        setUser(matchedUser);
        localStorage.setItem('ab_recon_user', JSON.stringify(matchedUser));
        return true;
      }
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
      const saved = await res.json();
      setMasters(prev => [...prev, saved]);
    } catch (e) {
      setMasters(prev => [...prev, { ...master, id: Date.now() }]);
    }
  };

  const saveRunHistory = async (newRun) => {
    setRunHistory(prev => [newRun, ...prev]);
    try {
      await fetch(`${API_URL}/run-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newRun.id,
          product: newRun.product,
          status: newRun.status,
          matched_count: newRun.matched,
          exception_count: newRun.exceptions
        })
      });
    } catch (e) {}
  };

  const addNotification = async (notif) => {
    const newNotif = { ...notif, id: Date.now(), time: 'Just now', read: false };
    setNotifications(prev => [newNotif, ...prev]);
    try {
      await fetch(`${API_URL}/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: notif.title, message: notif.message, time_label: 'Just now' })
      });
    } catch (e) {}
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <AppContext.Provider value={{
      user, setUser,
      activePage, setActivePage,
      roles, setRoles,
      permissions, setPermissions,
      masters, setMasters, addMaster,
      exceptions, setExceptions,
      aiSuggestions, setAiSuggestions,
      users, setUsers, addUser,
      auditLogs, setAuditLogs, logAudit,
      runHistory, setRunHistory: saveRunHistory,
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
