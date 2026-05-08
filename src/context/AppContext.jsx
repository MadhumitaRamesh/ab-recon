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
  const [exceptionFilters, setExceptionFilters] = useState({ runId: '', masterId: '' });

  const modules = [
    'Dashboard', 'Recon Masters', 'Run Recon', 'Exception Queue',
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
    perms['Run Recon']['Ops_Maker'] = true;
    perms['Exception Queue']['Ops_Maker'] = true;
    perms['Exception Queue']['Ops_Checker'] = true;
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
    triggerType: r.trigger_type || 'Manual',
    matched: r.matched_count,
    exceptions: r.exception_count,
    time: r.run_time ? r.run_time.substring(0, 5) : '--',
    startTime: r.start_time ? r.start_time.substring(0, 5) : '--',
    endTime: r.end_time ? r.end_time.substring(0, 5) : '--',
    date: r.run_date ? new Date(r.run_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '--',
    rawDate: r.run_date,
    rawTime: r.run_time
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
    age: e.age || '0 days',
    priority: e.priority,
    status: e.status,
    masterId: e.recon_master_id,
    product: e.product_name || 'Unknown',
    runId: e.run_id,
    runDate: e.run_date ? new Date(e.run_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '--',
    sourceType: e.source_type,
    uniqueRef: e.unique_reference_number,
    assignedRole: e.assigned_role || 'Operations'
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
          fetch(`${API_URL}/exceptions?date=${new Date().toISOString().split('T')[0]}`).then(r => r.json()),
          fetch(`${API_URL}/audit-logs`).then(r => r.json()),
          fetch(`${API_URL}/run-history?date=${new Date().toISOString().split('T')[0]}`).then(r => r.json()),
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

  const addUser = async (userData) => {
    try {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(prev => [...prev, { ...userData, id: data.id }]);
        logAudit('User Provisioned', 'Identity', `New employee access granted to ${userData.name}`, 'Security');
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Identity provisioning failed.' };
      }
    } catch (err) {
      console.error('User Provisioning Failed:', err);
      return { success: false, error: 'Network error or server unavailable.' };
    }
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
        const fullUser = { ...data.user, token: data.token };
        setUser(fullUser);
        localStorage.setItem('ab_recon_user', JSON.stringify(fullUser));
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

  const addRole = async (roleData) => {
    try {
      const res = await fetch(`${API_URL}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roleData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRoles(prev => [...prev, { ...roleData, id: data.id }]);
        logAudit('Role Created', 'RBAC', `New role '${roleData.name}' defined`, 'Security');
        return true;
      }
    } catch (err) {
      console.error('Role Persistence Failed:', err);
    }
    return false;
  };

  const addMaster = async (master) => {
    try {
      const res = await fetch(`${API_URL}/masters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...master, status: 'Active' })
      });
      const saved = await res.json();
      if (res.ok) {
        setMasters(prev => [...prev, saved]);
        logAudit('Master Record Created', 'Recon', `Product ${master.name} added to master list`, 'System');
        return true;
      }
    } catch (e) {
      console.error('Master Persistence Failed:', e);
      setMasters(prev => [...prev, { ...master, id: Date.now() }]);
    }
    return false;
  };

  const fetchSuggestions = async (exceptionId) => {
    try {
      const res = await fetch(`${API_URL}/suggestions/${exceptionId}`);
      if (!res.ok) throw new Error('Failed to fetch suggestions');
      return await res.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const fetchFilteredExceptions = async (filters) => {
    try {
      const params = new URLSearchParams();
      if (filters.date) params.append('date', filters.date);
      if (filters.master) params.append('master', filters.master);
      if (filters.type) params.append('type', filters.type);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.status) params.append('status', filters.status);

      const res = await fetch(`${API_URL}/exceptions?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setExceptions(data.map(normalizeException));
      }
    } catch (e) { console.error('Exception Fetch Failed:', e); }
  };

  const fetchFilteredHistory = async (filters) => {
    try {
      const params = new URLSearchParams();
      if (filters.date) params.append('date', filters.date);
      if (filters.master) params.append('master', filters.master);
      if (filters.status) params.append('status', filters.status);
      if (filters.triggerType) params.append('triggerType', filters.triggerType);

      const res = await fetch(`${API_URL}/run-history?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setRunHistory(data.map(normalizeRunHistory));
      }
    } catch (e) { console.error('History Fetch Failed:', e); }
  };

  const triggerReconRun = async (masterId, runDate, triggerType) => {
    try {
      const res = await fetch(`${API_URL}/recon/trigger`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ masterId, runDate, triggerType })
      });
      const result = await res.json();
      
      if (res.ok && result.success) {
        // Refresh history and exceptions
        const [rawHistory, rawExceptions] = await Promise.all([
          fetch(`${API_URL}/run-history`).then(r => r.json()),
          fetch(`${API_URL}/exceptions`).then(r => r.json())
        ]);
        
        setRunHistory(rawHistory.map(normalizeRunHistory));
        setExceptions(rawExceptions.map(normalizeException));
        
        logAudit('Manual Run Success', 'Engine', `Cycle ${result.runId} completed. Matched: ${result.matchedCount}`, 'Operations');
        return result;
      } else {
        throw new Error(result.error || 'Recon execution failed');
      }
    } catch (e) {
      console.error('Recon Trigger Failed:', e);
      throw e;
    }
  };

  const saveRunHistory = async (newRun) => {
    try {
      const res = await fetch(`${API_URL}/run-history`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          id: newRun.id,
          product: newRun.product,
          status: newRun.status,
          trigger_type: newRun.triggerType || 'Manual',
          matched_count: newRun.matched,
          exception_count: newRun.exceptions,
          run_date: newRun.rawDate,
          run_time: newRun.rawTime,
          start_time: newRun.startTime,
          end_time: newRun.endTime
        })
      });
      if (res.ok) {
        // Refresh history to get ordered list
        const rawHistory = await fetch(`${API_URL}/run-history`).then(r => r.json());
        setRunHistory(rawHistory.map(normalizeRunHistory));
      }
    } catch (e) {
      setRunHistory(prev => [newRun, ...prev]);
    }
  };

  const deleteRole = async (id, name) => {
    try {
      const res = await fetch(`${API_URL}/roles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRoles(prev => prev.filter(r => r.id !== id));
        logAudit('Role Deleted', 'RBAC', `Role '${name}' permanently removed`, 'Security');
        return true;
      }
    } catch (e) { console.error(e); }
    return false;
  };

  const deleteMaster = async (id, name) => {
    try {
      const res = await fetch(`${API_URL}/masters/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMasters(prev => prev.filter(m => m.id !== id));
        logAudit('Master Deleted', 'Recon', `Product ${name} removed`, 'System');
        return true;
      }
    } catch (e) { console.error(e); }
    return false;
  };

  const updateUser = async (id, updatedData) => {
    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: updatedData.name,
          employee_id: updatedData.employeeId,
          role_name: updatedData.role,
          status: updatedData.status
        })
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === id ? { ...updatedData, id } : u));
        logAudit('User Updated', 'Identity', `Profile for ${updatedData.name} modified`, 'Security');
        return true;
      }
    } catch (e) { console.error(e); }
    return false;
  };

  const deleteUser = async (id, name, employeeId) => {
    try {
      const res = await fetch(`${API_URL}/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== id));
        logAudit('Access Revoked', 'Identity', `User ${name} (${employeeId}) removed`, 'Security');
        return true;
      }
    } catch (e) { console.error(e); }
    return false;
  };

  const updateMaster = async (id, updatedMaster) => {
    try {
      const res = await fetch(`${API_URL}/masters/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMaster)
      });
      if (res.ok) {
        setMasters(prev => prev.map(m => m.id === id ? { ...updatedMaster, id } : m));
        logAudit('Master Updated', 'Recon', `Configuration for ${updatedMaster.name} modified`, 'System');
        return true;
      }
    } catch (e) { console.error(e); }
    return false;
  };

  const updateRole = async (id, updatedRole) => {
    try {
      const res = await fetch(`${API_URL}/roles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRole)
      });
      if (res.ok) {
        setRoles(prev => prev.map(r => r.id === id ? { ...updatedRole, id } : r));
        logAudit('Role Updated', 'RBAC', `Permissions for '${updatedRole.name}' modified`, 'Security');
        return true;
      }
    } catch (e) { console.error(e); }
    return false;
  };

  const savePermission = async (module_name, role_name, is_allowed) => {
    try {
      const res = await fetch(`${API_URL}/permissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module_name, role_name, is_allowed })
      });
      if (res.ok) {
        setPermissions(prev => {
          const newPerms = { ...prev };
          if (!newPerms[module_name]) newPerms[module_name] = {};
          newPerms[module_name][role_name] = is_allowed;
          return newPerms;
        });
      }
    } catch (e) { console.error(e); }
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

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try { await fetch(`${API_URL}/notifications/read`, { method: 'PATCH' }); } catch (e) {}
  };

  const saveAllPermissions = async (perms) => {
    try {
      const promises = [];
      Object.keys(perms).forEach(modName => {
        Object.keys(perms[modName]).forEach(roleName => {
          promises.push(
            fetch(`${API_URL}/permissions`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                module_name: modName,
                role_name: roleName,
                is_allowed: perms[modName][roleName] ? 1 : 0
              })
            })
          );
        });
      });
      await Promise.all(promises);
      setPermissions(perms);
      logAudit('Permissions Updated', 'RBAC', 'Global module access matrix modified', 'Security');
      return true;
    } catch (e) { console.error(e); }
    return false;
  };

  const resolveException = async (id) => {
    try {
      const res = await fetch(`${API_URL}/exceptions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setExceptions(prev => prev.filter(e => e.id !== id));
        logAudit('Exception Resolved', 'Exception', `Transaction ${id} marked as closed`, 'Operations');
        return true;
      }
    } catch (e) { console.error(e); }
    return false;
  };

  return (
    <AppContext.Provider value={{
      user, setUser,
      activePage, setActivePage,
      roles, setRoles, addRole, updateRole, deleteRole,
      permissions, setPermissions, savePermission, saveAllPermissions,
      masters, setMasters, addMaster, updateMaster, deleteMaster,
      exceptions, setExceptions, resolveException,
      aiSuggestions, setAiSuggestions,
      users, setUsers, addUser, updateUser, deleteUser,
      auditLogs, setAuditLogs, logAudit,
      runHistory, setRunHistory: saveRunHistory,
      fetchFilteredExceptions, fetchFilteredHistory,
      triggerReconRun, fetchSuggestions,
      exceptionFilters, setExceptionFilters,
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
