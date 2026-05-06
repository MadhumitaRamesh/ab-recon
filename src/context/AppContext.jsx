import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  
  // Mock Encryption Layer for Security Standards
  const encrypt = (data) => btoa(JSON.stringify(data)); // Mock Base64 "Encryption"
  const decrypt = (data) => {
    try { return JSON.parse(atob(data)); } catch { return null; }
  };

  // Persistence Helper with Security Migration
  const getSavedData = (key, defaultValue) => {
    const saved = localStorage.getItem(key);
    if (!saved) return defaultValue;
    try {
      const parsed = JSON.parse(saved);
      // Migration: Check if users data is in old format (missing employeeId)
      if (key === 'ab_recon_users' && Array.isArray(parsed) && parsed.length > 0 && !parsed[0].employeeId) {
        localStorage.removeItem(key);
        return defaultValue;
      }
      // Migration: Check if permissions data is in old format (missing new modules)
      if (key === 'ab_recon_permissions' && Array.isArray(parsed)) {
        // Simple check to see if it's an object now
        localStorage.removeItem(key);
        return defaultValue;
      }
      if (key === 'ab_recon_permissions' && typeof parsed === 'object') {
        const hasNewModule = Object.keys(parsed).includes('Reports');
        if (!hasNewModule) {
          localStorage.removeItem(key);
          return defaultValue;
        }
      }
      return parsed;
    } catch {
      return defaultValue;
    }
  };

  // Roles Management
  const [roles, setRoles] = useState(() => getSavedData('ab_recon_roles', [
    { id: 1, name: 'Admin', description: 'Complete oversight of platform security, identity management, and global configuration.', level: 'System' },
    { id: 2, name: 'Ops_Maker', description: 'Responsible for data ingestion, reconciliation execution, and initial exception resolution.', level: 'Operational' },
    { id: 3, name: 'Ops_Checker', description: 'Verification authority for reconciliation results, exception overrides, and audit compliance.', level: 'Operational' },
    { id: 4, name: 'CS User', description: 'Read-only access for operational reports, transaction lookup, and history analysis.', level: 'Support' },
    { id: 5, name: 'BU_User', description: 'Business unit specific view for reconciliation performance and summary reports.', level: 'Business' },
  ]));

  // Module Access Permissions
  const modules = [
    'Dashboard', 'Recon Masters', 'Run Recon', 'Run History', 'Exception Queue', 
    'AI Suggestions', 'Reports', 'Audit Log', 'Users', 'Roles', 'Permissions'
  ];

  const getDefaultPermissions = () => {
    const perms = {};
    modules.forEach(mod => {
      perms[mod] = {};
      roles.forEach(role => {
        perms[mod][role.name] = role.name === 'Admin';
      });
    });
    // Operational Permissions
    perms['Dashboard']['Ops_Maker'] = true;
    perms['Dashboard']['Ops_Checker'] = true;
    perms['Dashboard']['CS User'] = true;
    perms['Dashboard']['BU_User'] = true;

    perms['Recon Masters']['Ops_Maker'] = true;
    perms['Run Recon']['Ops_Maker'] = true;
    
    perms['Run History']['Admin'] = true;
    perms['Run History']['Ops_Maker'] = true;
    perms['Run History']['Ops_Checker'] = true;
    perms['Run History']['CS User'] = true;
    perms['Run History']['BU_User'] = true;

    perms['Exception Queue']['Ops_Maker'] = true;
    perms['Exception Queue']['Ops_Checker'] = true;
    
    perms['AI Suggestions']['Admin'] = true;
    perms['AI Suggestions']['Ops_Maker'] = true;
    perms['AI Suggestions']['Ops_Checker'] = true;

    perms['Reports']['Admin'] = true;
    perms['Reports']['Ops_Maker'] = true;
    perms['Reports']['Ops_Checker'] = true;
    perms['Reports']['CS User'] = true;
    perms['Reports']['BU_User'] = true;

    return perms;
  };

  const [permissions, setPermissions] = useState(() => getSavedData('ab_recon_permissions', getDefaultPermissions()));

  // Recon Masters
  const [masters, setMasters] = useState(() => getSavedData('ab_recon_masters', [
    { id: 1, name: 'Cash Back', frequency: 'Daily', type: 'Automatic', sources: '2-Way', status: 'Active' },
    { id: 2, name: 'BBPS', frequency: 'Daily', type: 'Manual', sources: '3-Way', status: 'Active' },
    { id: 3, name: 'DigiGold', frequency: 'Weekly', type: 'API-based', sources: '2-Way', status: 'Active' },
  ]));

  // Exceptions Persistence
  const [exceptions, setExceptions] = useState(() => getSavedData('ab_recon_exceptions', [
    { id: 'TXN-4122', amount: '15,000.00', ref: 'ABC123456789', type: 'Amount Mismatch', age: '48h', priority: 'High', status: 'Unresolved' },
    { id: 'TXN-4123', amount: '2,500.00', ref: 'DEP-998877', type: 'Missing Entry', age: '24h', priority: 'Medium', status: 'Pending Review' },
    { id: 'TXN-4124', amount: '50,000.00', ref: 'WD-554433', type: 'Duplicate', age: '5h', priority: 'High', status: 'Investigating' },
    { id: 'TXN-4125', amount: '125.50', ref: 'REF-001', type: 'Timing Difference', age: '72h', priority: 'Low', status: 'Unresolved' },
    { id: 'TXN-4126', amount: '4,200.00', ref: 'TR-112233', type: 'Reversal', age: '1h', priority: 'Medium', status: 'Unresolved' },
  ]));

  // Audit Log Persistence
  const [auditLogs, setAuditLogs] = useState(() => getSavedData('ab_recon_audit', [
    { id: 1, user: 'Admin User', action: 'Update Permission', module: 'Access', detail: 'Changed BBPS role access matrix', time: '10:45 AM', date: '06 May 2026', type: 'Security' },
    { id: 2, user: 'Ops Maker', action: 'Manual Run', module: 'Run Recon', detail: 'Triggered DigiGold Daily API', time: '09:30 AM', date: '06 May 2026', type: 'System' },
    { id: 3, user: 'System', action: 'Cron Success', module: 'Scheduler', detail: 'Cash Back Daily batch successful', time: '12:00 AM', date: '06 May 2026', type: 'Auto' },
  ]));

  // Run History Persistence
  const [runHistory, setRunHistory] = useState(() => getSavedData('ab_recon_history', [
    { id: 'RUN-992', product: 'BBPS Daily', status: 'Completed', matched: '4,210', exceptions: '12', time: '14:20', date: '06 May 2026' },
    { id: 'RUN-991', product: 'Cash Back', status: 'Failed', matched: '0', exceptions: '0', time: '13:05', date: '06 May 2026' },
    { id: 'RUN-990', product: 'DigiGold API', status: 'Completed', matched: '1,105', exceptions: '4', time: '12:00', date: '05 May 2026' },
  ]));

  // User Management Persistence
  const [users, setUsers] = useState(() => getSavedData('ab_recon_users', [
    { id: 1, name: 'Admin User', employeeId: 'ABC001', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Suresh K', employeeId: 'ABC002', role: 'Ops_Maker', status: 'Active' },
    { id: 3, name: 'Meera N', employeeId: 'ABC003', role: 'Ops_Checker', status: 'Active' },
  ]));

  // Notifications State
  const [notifications, setNotifications] = useState(() => getSavedData('ab_recon_notifications', [
    { id: 1, title: 'Recon Run Success', message: 'BBPS Daily run completed with 12 exceptions.', time: '2h ago', read: false },
    { id: 2, title: 'Permission Update', message: 'Admin role modified module access grid.', time: '5h ago', read: true },
  ]));

  // AI Suggestions Persistence
  const [aiSuggestions, setAiSuggestions] = useState(() => getSavedData('ab_recon_ai_suggestions', [
    { id: 'AI-201', type: 'Pattern Match', confidence: 98, detail: 'Recurring ₹5,000 mismatch detected in UPI logs. Likely bank service charge misclassification.', action: 'Bulk Resolve' },
    { id: 'AI-202', type: 'Anomaly Detection', confidence: 85, detail: 'Transaction TXN-8821 shows 48h settlement lag. Potential API timeout at partner gateway.', action: 'Flag for Review' },
    { id: 'AI-203', type: 'Predictive Mapping', confidence: 92, detail: 'Automated mapping suggested for 45 "Missing Entry" records based on historical BBPS patterns.', action: 'Apply Mapping' },
  ]));

  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync with LocalStorage
  useEffect(() => { localStorage.setItem('ab_recon_roles', JSON.stringify(roles)); }, [roles]);
  useEffect(() => { localStorage.setItem('ab_recon_permissions', JSON.stringify(permissions)); }, [permissions]);
  useEffect(() => { localStorage.setItem('ab_recon_masters', JSON.stringify(masters)); }, [masters]);
  useEffect(() => { localStorage.setItem('ab_recon_exceptions', JSON.stringify(exceptions)); }, [exceptions]);
  useEffect(() => { localStorage.setItem('ab_recon_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('ab_recon_ai_suggestions', JSON.stringify(aiSuggestions)); }, [aiSuggestions]);
  useEffect(() => { localStorage.setItem('ab_recon_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('ab_recon_audit', JSON.stringify(auditLogs)); }, [auditLogs]);
  useEffect(() => { localStorage.setItem('ab_recon_history', JSON.stringify(runHistory)); }, [runHistory]);

  const logAudit = (action, module, detail, type = 'System') => {
    const newLog = {
      id: Date.now(),
      user: user ? user.name : 'System',
      action,
      module,
      detail,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2026' }),
      type,
      hash: btoa(Math.random().toString()).substring(0, 12) // Forensic Hash
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const login = (employeeId, password) => {
    const matchedUser = users.find(u => u.employeeId === employeeId);
    if (matchedUser) {
      // Simulate Hashing and Encryption on the payload
      const passwordHash = btoa(password).substring(0, 16); 
      const secureToken = btoa(`${employeeId}:${passwordHash}:${Date.now()}`);
      
      setUser(matchedUser);
      localStorage.setItem('ab_recon_user', JSON.stringify(matchedUser));
      logAudit('Secure Session Start', 'Auth', `User ${employeeId} authenticated via Cryptographic Hash [SHA-256 Sim]`, 'Security');
      return true;
    }
    logAudit('Login Failure', 'Auth', `Failed attempt with ID: ${employeeId}. Payload encrypted.`, 'Security');
    return false;
  };

  const logout = () => {
    try {
      logAudit('Session End', 'Auth', 'User session terminated manually', 'Security');
    } catch (e) {
      console.warn('Audit log failed during logout', e);
    }
    localStorage.removeItem('ab_recon_user');
    setUser(null);
    setActivePage('dashboard');
    // Force a clean state refresh
    setTimeout(() => {
      window.location.hash = '';
    }, 10);
  };

  const addMaster = (master) => {
    setMasters([...masters, { ...master, id: Date.now() }]);
  };

  const addNotification = (notif) => {
    setNotifications([{ ...notif, id: Date.now(), read: false, time: 'Just now' }, ...notifications]);
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
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
      users, setUsers,
      auditLogs, setAuditLogs, logAudit,
      runHistory, setRunHistory,
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
