import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext();
const API_URL = 'http://127.0.0.1:5001/api';

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [activePageInternal, setActivePageInternal] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [exceptionFilters, setExceptionFilters] = useState({ runId: '', masterId: '' });

  const setActivePage = (page) => {
    setSearchQuery(''); // Clear search on page change for better UX
    setActivePageInternal(page);
  };

  const activePage = activePageInternal;

  const modules = [
    'Dashboard', 'Recon Masters', 'Run Recon', 'Exception Queue', 'Recon Transactions',
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
    perms['Recon Transactions']['Ops_Maker'] = true;
    perms['Recon Transactions']['Ops_Checker'] = true;
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
      id: r.id, product: r.product, triggerType: r.trigger_type,
      rawDate: datePart,
      date: datePart ? new Date(datePart).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '--',
      status: r.status, matched: Number(r.matched_count).toLocaleString('en-IN'),
      exceptions: Number(r.exception_count).toLocaleString('en-IN'),
      startTime: r.start_time ? new Date(r.start_time).toLocaleTimeString() : '--',
      endTime: r.end_time ? new Date(r.end_time).toLocaleTimeString() : '--',
      matchedAmount: r.matched_amount || 0,
      exceptionAmount: r.exception_amount || 0,
      claimAmount: r.claim_amount || 0,
      refundAmount: r.refund_amount || 0,
      snrAmount: r.snr_amount || 0,
      settlementStatus: r.settlement_status || 'Open'
    };
  }, []);

  const normalizeAuditLog = useCallback((l) => {
    const d = new Date(l.created_at);
    return {
      id: l.id, action: l.action, user: l.user_name, detail: l.detail, type: l.type,
      date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: d.toLocaleTimeString(), hash: l.forensic_hash
    };
  }, []);

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

  const logAudit = async (action, type, detail, category) => {
    await fetch(`${API_URL}/audit-logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, type, detail, category, user_name: user?.employeeId || 'System' })
    });
    fetchAll();
  };

  const fetchFilteredHistory = async (filters) => {
    const q = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_URL}/run-history?${q}`);
    const data = await res.json();
    if (Array.isArray(data)) setRunHistory(data.map(normalizeRunHistory));
  };

  const fetchFilteredExceptions = async (filters) => {
    const q = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_URL}/exceptions?${q}`);
    const data = await res.json();
    if (Array.isArray(data)) setExceptions(data.map(normalizeException));
  };

  const triggerReconRun = async (masterId, runDate, triggerType, manualData) => {
    const res = await fetch(`${API_URL}/recon/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ masterId, runDate, triggerType, manualData })
    });
    const data = await res.json();
    if (res.ok) { 
      await fetchAll(); 
      // Force refresh for the specific run date to ensure immediate UI sync
      await fetchFilteredHistory({ date: runDate });
      await fetchFilteredExceptions({ date: runDate });
      return data; 
    }
    throw new Error(data.error || 'Execution failed');
  };

  const resolveException = async (id, remarks) => {
    const res = await fetch(`${API_URL}/exceptions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ remarks, status: 'Resolved' })
    });
    if (res.ok) { fetchAll(); logAudit('Exception Resolved', 'Recon', `ID: ${id}`, 'System'); return true; }
    return false;
  };

  const updateExceptionStatus = async (id, status) => {
    const res = await fetch(`${API_URL}/exceptions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) { fetchAll(); return true; }
    return false;
  };

  const addUser = async (userData) => {
    const res = await fetch(`${API_URL}/users`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userData) });
    const data = await res.json();
    if (res.ok) { fetchAll(); logAudit('User Provisioned', 'Identity', `${userData.name}`, 'Security'); return { success: true }; }
    return { success: false, error: data.error };
  };

  const updateUser = async (id, userData) => {
    const res = await fetch(`${API_URL}/users/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userData) });
    if (res.ok) { fetchAll(); logAudit('User Updated', 'Identity', `ID: ${id}`, 'Security'); return true; }
    return false;
  };

  const deleteUser = async (id, name, employeeId) => {
    const res = await fetch(`${API_URL}/users/${id}`, { method: 'DELETE' });
    if (res.ok) { fetchAll(); logAudit('User Deleted', 'Identity', `${name} (${employeeId})`, 'Security'); return true; }
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
    const res = await fetch(`${API_URL}/permissions/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permissions: payload })
    });
    if (res.ok) { fetchAll(); return true; }
    return false;
  };

  const saveQueryConfig = async (configData) => {
    const res = await fetch(`${API_URL}/query-configs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(configData)
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

  const fetchSuggestions = async (exceptionId) => {
    try {
      const res = await fetch(`${API_URL}/ai-suggestions`);
      const data = await res.json();
      const normalized = Array.isArray(data) ? data.map(normalizeAiSuggestion) : [];
      if (!exceptionId) setAiSuggestions(normalized);
      return normalized;
    } catch (e) {
      console.error('Failed to fetch suggestions', e);
      return [];
    }
  };

  const markAllAsRead = async () => {
    const res = await fetch(`${API_URL}/notifications/read-all`, { method: 'PUT' });
    if (res.ok) fetchAll();
  };

  const resetSystemData = async () => {
    const res = await fetch(`${API_URL}/system/reset`, { method: 'POST' });
    const data = await res.json();
    return data;
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
