import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  
  // Persistence Helper
  const getSavedData = (key, defaultValue) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  };

  // Roles Management
  const [roles, setRoles] = useState(() => getSavedData('ab_recon_roles', [
    { id: 1, name: 'Admin', status: 'Active' },
    { id: 2, name: 'Ops_Maker', status: 'Active' },
    { id: 3, name: 'Ops_Checker', status: 'Active' },
    { id: 4, name: 'CS User', status: 'Active' },
    { id: 5, name: 'BU_User', status: 'Active' },
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
    perms['Dashboard']['Ops_Maker'] = true;
    perms['Dashboard']['Ops_Checker'] = true;
    perms['Dashboard']['CS User'] = true;
    perms['Run History']['Admin'] = true;
    perms['Run History']['Ops_Maker'] = true;
    perms['Run History']['Ops_Checker'] = true;
    perms['Run History']['CS User'] = true;
    perms['AI Suggestions']['Admin'] = true;
    perms['AI Suggestions']['Ops_Maker'] = true;
    perms['Reports']['Admin'] = true;
    perms['Reports']['Ops_Maker'] = true;
    perms['Reports']['Ops_Checker'] = true;
    perms['Reports']['CS User'] = true;
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

  const login = (employeeId) => {
    const matchedUser = users.find(u => u.employeeId === employeeId);
    if (matchedUser) {
      setUser(matchedUser);
      localStorage.setItem('ab_recon_user', JSON.stringify(matchedUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ab_recon_user');
    setActivePage('dashboard');
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
