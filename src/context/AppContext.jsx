import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext();
const API_URL = 'http://127.0.0.1:5001/api';

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');

  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [masters, setMasters] = useState([]);
  const [exceptions, setExceptions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [runHistory, setRunHistory] = useState([]);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [queryConfigs, setQueryConfigs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [exceptionFilters, setExceptionFilters] = useState({ runId: '', masterId: '' });

  const modules = [
    'Dashboard', 'Recon Masters', 'Run Recon', 'Exception Queue',
    'AI Suggestions', 'Reports', 'Query Config', 'Audit Log', 'Users', 'Roles', 'Permissions'
  ];

  const getDefaultPermissions = () => {
    const perms = {};
    modules.forEach(mod => {
      perms[mod] = {};
      ['Admin', 'Ops_Maker', 'Ops_Checker', 'CS_User', 'BU_User'].forEach(role => {
        perms[mod][role] = role === 'Admin';
      });
    });
    perms['Dashboard']['Ops_Maker'] = true;
    perms['Dashboard']['Ops_Checker'] = true;
    perms['Dashboard']['CS_User'] = true;
    perms['Dashboard']['BU_User'] = true;
    perms['Recon Masters']['Ops_Maker'] = true;
    perms['Run Recon']['Ops_Maker'] = true;
    perms['Exception Queue']['Ops_Maker'] = true;
    perms['Exception Queue']['Ops_Checker'] = true;
    perms['AI Suggestions']['Ops_Maker'] = true;
    perms['AI Suggestions']['Ops_Checker'] = true;
    perms['Reports']['Ops_Maker'] = true;
    perms['Reports']['CS_User'] = true;
    perms['Reports']['BU_User'] = true;
    perms['Query Config']['Ops_Maker'] = true;
    return perms;
  };

  // --- DATA NORMALIZERS ---

  const normalizeUser = useCallback((u) => ({
    id: u.id, name: u.name, employeeId: u.employee_id, role: u.role_name, status: u.status
  }), []);

  const normalizeRunHistory = useCallback((r) => {
    const datePart = r.run_date ? (typeof r.run_date === 'string' ? r.run_date.split('T')[0] : r.run_date.toISOString().split('T')[0]) : null;
    return {
      id: r.id, product: r.product, status: r.status, triggerType: r.trigger_type || 'Manual',
      matched: Number(r.matched_count || 0), exceptions: Number(r.exception_count || 0),
      time: r.run_time ? r.run_time.substring(0, 5) : '--',
      startTime: r.start_time ? r.start_time.substring(0, 5) : '--',
      endTime: r.end_time ? r.end_time.substring(0, 5) : '--',
      date: datePart ? new Date(datePart).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '--',
      rawDate: datePart, rawTime: r.run_time
    };
  }, []);

  const normalizeAuditLog = useCallback((a) => ({
    id: a.id, user: a.user_name, action: a.action, module: a.module, detail: a.detail,
    time: a.log_time ? a.log_time.substring(0, 5) : '--',
    date: a.log_date ? new Date(a.log_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '--',
    type: a.type, hash: a.forensic_hash
  }), []);

  const normalizeException = useCallback((e) => {
    const datePart = e.run_date ? (typeof e.run_date === 'string' ? e.run_date.split('T')[0] : e.run_date.toISOString().split('T')[0]) : null;
    return {
      id: e.id, amount: e.amount ? Number(e.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00',
      ref: e.ref_no, type: e.type, age: e.age || '0 days', priority: e.priority, status: e.status,
      masterId: e.recon_master_id, product: e.product_name || 'Unknown', runId: e.run_id,
      runDate: datePart ? new Date(datePart).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '--',
      sourceType: e.source_type, uniqueRef: e.unique_reference_number, assignedRole: e.assigned_role || 'Operations',
      remarks: e.remarks || ''
    };
  }, []);

  const normalizeNotification = useCallback((n) => ({
    id: n.id, title: n.title, message: n.message, time: n.time_label || 'Just now',
    read: n.is_read === 1 || n.is_read === true
  }), []);

  const normalizeAiSuggestion = useCallback((s) => ({
    id: s.id, type: s.type, confidence: s.confidence, detail: s.detail, action: s.recommended_action
  }), []);

  const normalizePermissions = useCallback((rows) => {
    if (!rows || rows.length === 0) return getDefaultPermissions();
    const permMap = {};
    rows.forEach(item => {
      if (!permMap[item.module_name]) permMap[item.module_name] = {};
      permMap[item.module_name][item.role_name] = item.is_allowed === 1 || item.is_allowed === true;
    });
    return permMap;
  }, []);

  // --- ACTIONS ---

  const fetchAll = useCallback(async () => {
    try {
      const getLocalDate = () => {
        const d = new Date();
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      };
      const localToday = getLocalDate();
      const [rawUsers, rawMasters, rawExceptions, rawAudit, rawHistory, rawNotifs, rawAI, rawPerms, rawRoles, rawQueryConfigs] = await Promise.all([
        fetch(`${API_URL}/users`).then(r => r.json()),
        fetch(`${API_URL}/masters`).then(r => r.json()),
        fetch(`${API_URL}/exceptions?date=${localToday}`).then(r => r.json()),
        fetch(`${API_URL}/audit-logs`).then(r => r.json()),
        fetch(`${API_URL}/run-history?date=${localToday}`).then(r => r.json()),
        fetch(`${API_URL}/notifications`).then(r => r.json()),
        fetch(`${API_URL}/ai-suggestions`).then(r => r.json()),
        fetch(`${API_URL}/permissions`).then(r => r.json()),
        fetch(`${API_URL}/roles`).then(r => r.json()),
        fetch(`${API_URL}/query-configs`).then(r => r.json()),
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
      setQueryConfigs(Array.isArray(rawQueryConfigs) ? rawQueryConfigs : []);
    } catch (err) { console.warn('Sync failed', err.message); }
  }, [normalizeUser, normalizeException, normalizeAuditLog, normalizeRunHistory, normalizeNotification, normalizeAiSuggestion, normalizePermissions]);

  useEffect(() => {
    setPermissions(getDefaultPermissions());
    fetchAll();
    const interval = setInterval(fetchAll, 60000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  useEffect(() => {
    const savedUser = localStorage.getItem('ab_recon_user');
    if (savedUser) { try { setUser(JSON.parse(savedUser)); } catch (e) {} }
  }, []);

  const addNotification = useCallback((notif) => {
    setNotifications(prev => [{ ...notif, id: Date.now(), time: 'Just now', read: false }, ...prev]);
  }, []);

  const logAudit = useCallback(async (action, module, detail, type = 'System') => {
    const forensicHash = btoa(Math.random().toString()).substring(0, 12);
    const newLog = {
      id: Date.now(), user: user ? user.name : 'System', action, module, detail, type,
      hash: forensicHash, time: new Date().toLocaleTimeString('en-GB'), date: new Date().toISOString().split('T')[0]
    };
    setAuditLogs(prev => [newLog, ...prev]);
    try {
      await fetch(`${API_URL}/audit-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_name: newLog.user, action, module, detail, type, forensic_hash: forensicHash })
      });
    } catch (e) {}
  }, [user]);

  // CRUD Actions
  const addUser = async (userData) => {
    const res = await fetch(`${API_URL}/users`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userData) });
    if (res.ok) { fetchAll(); logAudit('User Created', 'Identity', `User ${userData.name} added`, 'Security'); return true; }
    return false;
  };

  const updateUser = async (id, userData) => {
    const res = await fetch(`${API_URL}/users/${id}`, { 
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ name: userData.name, employee_id: userData.employeeId, role_name: userData.role, status: userData.status }) 
    });
    if (res.ok) { fetchAll(); logAudit('User Updated', 'Identity', `User ${id} modified`, 'Security'); return true; }
    return false;
  };

  const deleteUser = async (id, name) => {
    const res = await fetch(`${API_URL}/users/${id}`, { method: 'DELETE' });
    if (res.ok) { fetchAll(); logAudit('User Deleted', 'Identity', `User ${name} removed`, 'Security'); return true; }
    return false;
  };

  const addMaster = async (masterData) => {
    const res = await fetch(`${API_URL}/masters`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(masterData) });
    if (res.ok) { fetchAll(); logAudit('Master Created', 'Recon', `Product ${masterData.name} added`, 'System'); return true; }
    return false;
  };

  const updateMaster = async (id, masterData) => {
    const res = await fetch(`${API_URL}/masters/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(masterData) });
    if (res.ok) { fetchAll(); logAudit('Master Updated', 'Recon', `Product ${masterData.name} updated`, 'System'); return true; }
    return false;
  };

  const deleteMaster = async (id, name) => {
    const res = await fetch(`${API_URL}/masters/${id}`, { method: 'DELETE' });
    if (res.ok) { fetchAll(); logAudit('Master Deleted', 'Recon', `Product ${name} removed`, 'System'); return true; }
    return false;
  };

  const addRole = async (roleData) => {
    const res = await fetch(`${API_URL}/roles`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(roleData) });
    if (res.ok) { fetchAll(); logAudit('Role Created', 'RBAC', `Role ${roleData.name} added`, 'Security'); return true; }
    return false;
  };

  const updateRole = async (id, roleData) => {
    const res = await fetch(`${API_URL}/roles/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(roleData) });
    if (res.ok) { fetchAll(); logAudit('Role Updated', 'RBAC', `Role ${id} modified`, 'Security'); return true; }
    return false;
  };

  const deleteRole = async (id, name) => {
    const res = await fetch(`${API_URL}/roles/${id}`, { method: 'DELETE' });
    if (res.ok) { fetchAll(); logAudit('Role Deleted', 'RBAC', `Role ${name} removed`, 'Security'); return true; }
    return false;
  };

  const savePermission = async (module_name, role_name, is_allowed) => {
    const res = await fetch(`${API_URL}/permissions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ module_name, role_name, is_allowed }) });
    if (res.ok) fetchAll();
  };

  const saveAllPermissions = async (perms) => {
    const payload = [];
    Object.keys(perms).forEach(modName => {
      Object.keys(perms[modName]).forEach(roleName => {
        payload.push({
          module_name: modName,
          role_name: roleName,
          is_allowed: perms[modName][roleName] ? 1 : 0
        });
      });
    });

    try {
      const res = await fetch(`${API_URL}/permissions/bulk`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ permissions: payload }) 
      });
      if (!res.ok) throw new Error('Bulk Update Failed');
      await fetchAll();
      return true;
    } catch (err) {
      console.error('[API] Bulk Save Error:', err);
      return false;
    }
  };

  const triggerReconRun = useCallback(async (masterId, runDate, triggerType, manualData = null) => {
    const res = await fetch(`${API_URL}/recon/trigger`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ masterId, runDate, triggerType, manualData }) 
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Trigger Failed');
    }
    const result = await res.json();
    await fetchAll();
    return result;
  }, [fetchAll]);

  const fetchFilteredHistory = useCallback(async (filters) => {
    console.log('[API] Fetching Filtered History:', filters);
    const params = new URLSearchParams();
    if (filters.date) params.append('date', filters.date);
    if (filters.master && filters.master !== 'All Products') params.append('master', filters.master);
    if (filters.status && filters.status !== 'All Statuses') params.append('status', filters.status);
    if (filters.triggerType && filters.triggerType !== 'All Types') params.append('triggerType', filters.triggerType);
    
    try {
      const res = await fetch(`${API_URL}/run-history?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRunHistory(data.map(normalizeRunHistory));
        addNotification({ title: 'Data Refreshed', message: 'Execution logs updated from server.' });
      } else {
        console.error('[API] History Fetch Error:', res.status);
      }
    } catch (err) {
      console.error('[API] History Fetch Network Error:', err);
    }
  }, [normalizeRunHistory, addNotification]);

  const fetchFilteredExceptions = useCallback(async (filters) => {
    console.log('[API] Fetching Filtered Exceptions:', filters);
    const params = new URLSearchParams();
    if (filters.runId) params.append('runId', filters.runId);
    if (filters.date) params.append('date', filters.date);
    if (filters.master && filters.master !== 'All Products') params.append('master', filters.master);
    if (filters.type && filters.type !== 'All Types') params.append('type', filters.type);
    if (filters.priority && filters.priority !== 'All Priorities') params.append('priority', filters.priority);
    if (filters.status && filters.status !== 'All Statuses') params.append('status', filters.status);
    
    try {
      const res = await fetch(`${API_URL}/exceptions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setExceptions(data.map(normalizeException));
        addNotification({ title: 'Queue Refreshed', message: 'Exception intelligence updated.' });
      } else {
        console.error('[API] Exception Fetch Error:', res.status);
      }
    } catch (err) {
      console.error('[API] Exception Fetch Network Error:', err);
    }
  }, [normalizeException, addNotification]);

  const resolveException = async (id) => {
    const res = await fetch(`${API_URL}/exceptions/${id}`, { method: 'DELETE' });
    if (res.ok) { fetchAll(); logAudit('Exception Resolved', 'Exception', `Transaction ${id} closed`, 'Operations'); return true; }
    return false;
  };
  
  const updateExceptionStatus = async (id, status, remarks) => {
    const res = await fetch(`${API_URL}/exceptions/${id}`, { 
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ status, remarks }) 
    });
    if (res.ok) { 
      fetchAll(); 
      logAudit('Exception Updated', 'Exception', `Transaction ${id} set to ${status} with remarks`, 'Operations'); 
      return true; 
    }
    return false;
  };

  const fetchSuggestions = async (exceptionId) => {
    const res = await fetch(`${API_URL}/suggestions/${exceptionId}`);
    return res.ok ? await res.json() : [];
  };

  const markAllAsRead = async () => {
    await fetch(`${API_URL}/notifications/read`, { method: 'PATCH' });
    fetchAll();
  };

  const resetSystemData = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/reset-data`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        await fetchAll();
        return data;
      }
      throw new Error('Server returned an error');
    } catch (err) {
      console.error('System reset failed:', err);
      throw err;
    }
  };

  const saveQueryConfig = async (config) => {
    const res = await fetch(`${API_URL}/query-configs`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ ...config, created_by: user?.name || 'Admin' }) 
    });
    if (res.ok) { fetchAll(); return true; }
    return false;
  };

  const deleteQueryConfig = async (id) => {
    const res = await fetch(`${API_URL}/query-configs/${id}`, { method: 'DELETE' });
    if (res.ok) { fetchAll(); return true; }
    return false;
  };

  const login = async (employeeId, password) => {
    const res = await fetch(`${API_URL}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ employeeId, password }) });
    const data = await res.json();
    if (res.ok && data.success) {
      const fullUser = { ...data.user, token: data.token };
      setUser(fullUser);
      localStorage.setItem('ab_recon_user', JSON.stringify(fullUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('ab_recon_user');
    setUser(null);
    setActivePage('dashboard');
    window.location.reload();
  };

  return (
    <AppContext.Provider value={{
      user, setUser, activePage, setActivePage,
      roles, setRoles, addRole, updateRole, deleteRole,
      permissions, setPermissions, savePermission, saveAllPermissions,
      masters, setMasters, addMaster, updateMaster, deleteMaster,
      exceptions, setExceptions, resolveException, updateExceptionStatus,
      aiSuggestions, setAiSuggestions,
      users, setUsers, addUser, updateUser, deleteUser,
      auditLogs, setAuditLogs, logAudit,
      runHistory, fetchFilteredHistory,
      fetchFilteredExceptions, triggerReconRun,
      notifications, addNotification, markAllAsRead,
      queryConfigs, saveQueryConfig, deleteQueryConfig,
      searchQuery, setSearchQuery, sidebarOpen, setSidebarOpen,
      login, logout, modules, fetchAll, fetchSuggestions,
      exceptionFilters, setExceptionFilters, resetSystemData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
