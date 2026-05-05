import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  
  // Roles Management
  const [roles, setRoles] = useState([
    { id: 1, name: 'Admin', status: 'Active' },
    { id: 2, name: 'Ops_Maker', status: 'Active' },
    { id: 3, name: 'Ops_Checker', status: 'Active' },
    { id: 4, name: 'CS User', status: 'Active' },
    { id: 5, name: 'BU_User', status: 'Active' },
  ]);

  // Module Access Permissions
  const modules = [
    'Dashboard', 'Recon Masters', 'Run Recon', 'Exception Queue', 
    'AI Suggestions', 'Reports', 'Audit Log', 'Users', 'Roles', 'Permissions'
  ];

  const initialPermissions = {};
  modules.forEach(mod => {
    initialPermissions[mod] = {};
    roles.forEach(role => {
      initialPermissions[mod][role.name] = role.name === 'Admin';
    });
  });

  // Pre-fill some defaults
  initialPermissions['Dashboard']['Ops_Maker'] = true;
  initialPermissions['Dashboard']['Ops_Checker'] = true;
  initialPermissions['Dashboard']['CS User'] = true;
  initialPermissions['Run Recon']['Ops_Maker'] = true;
  initialPermissions['Exception Queue']['Ops_Maker'] = true;
  initialPermissions['Exception Queue']['Ops_Checker'] = true;
  initialPermissions['Reports']['CS User'] = true;

  const [permissions, setPermissions] = useState(initialPermissions);

  // Recon Masters
  const [masters, setMasters] = useState([
    { id: 1, name: 'Cash Back', frequency: 'Daily', type: 'Automatic', sources: '2-Way', status: 'Active' },
    { id: 2, name: 'BBPS', frequency: 'Daily', type: 'Manual', sources: '3-Way', status: 'Active' },
    { id: 3, name: 'DigiGold', frequency: 'Weekly', type: 'API-based', sources: '2-Way', status: 'Active' },
  ]);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('ab_recon_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ab_recon_user');
    setActivePage('dashboard');
  };

  const updatePermissions = (newPermissions) => {
    setPermissions(newPermissions);
  };

  const addMaster = (master) => {
    setMasters([...masters, { ...master, id: Date.now() }]);
  };

  return (
    <AppContext.Provider value={{
      user, setUser,
      activePage, setActivePage,
      roles, setRoles,
      permissions, updatePermissions,
      masters, addMaster,
      login, logout,
      modules
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
