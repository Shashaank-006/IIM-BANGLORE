import { createContext, useContext, useState, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

// Mock user database - in a real app this would be an API call
const MOCK_USERS = [
  {
    email: 'priya.nair@nic.in',
    password: 'GovWatch@2026',
    name: 'Priya Nair',
    role: 'Joint Secretary, Ministry of Rural Development',
    employeeId: 'IAS-TG-012',
    department: 'Ministry of Rural Development',
    initials: 'PN',
  },
  {
    email: 'ranjit.sahu@cag.gov.in',
    password: 'Audit@2026',
    name: 'Ranjit Kumar Sahu',
    role: 'CAG Auditor',
    employeeId: 'CAG-CG-045',
    department: 'Comptroller & Auditor General of India',
    initials: 'RS',
  },
  {
    email: 'demo@govwatch.gov.in',
    password: 'Demo@1234',
    name: 'Demo User',
    role: 'State Audit Officer',
    employeeId: 'SAO-DL-001',
    department: 'State Finance Department',
    initials: 'DU',
  },
  {
    email: 'collector.sindhudurg@nic.in',
    password: 'Collector@2026',
    name: 'Sunil Patkar (IAS)',
    role: 'District Collector',
    employeeId: 'DC-MH-033',
    department: 'District Administration, Sindhudurg',
    initials: 'SP',
  },
  {
    email: 'municipal.officer@nic.in',
    password: 'Municipal@2026',
    name: 'Amit Deshmukh',
    role: 'Municipal Officer',
    employeeId: 'MO-MH-402',
    department: 'Malvan Municipal Council',
    initials: 'AD',
  },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('gw_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback(async (email, password) => {
    try {
      const res = await api.auth.login(email, password);
      
      if (!res.success) {
        throw new Error(res.message || 'Invalid credentials. Please check your email and password.');
      }

      const initials = res.name
        ? res.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
        : 'AD';

      const sessionUser = {
        email: res.email,
        name: res.name,
        role: res.role,
        employeeId: res.employeeId,
        department: res.department,
        initials,
      };

      localStorage.setItem('gw_user', JSON.stringify(sessionUser));
      setUser(sessionUser);
      return sessionUser;
    } catch (err) {
      console.error("Backend auth failed, trying offline mock accounts...", err);
      // Robust fallback to keep local dev working if server is not running
      const localUsers = JSON.parse(localStorage.getItem('gw_local_users') || '[]');
      const found = [...MOCK_USERS, ...localUsers].find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (!found) {
        throw new Error(err.message || 'Invalid credentials. Please check your email and password.');
      }

      const sessionUser = {
        email: found.email,
        name: found.name,
        role: found.role,
        employeeId: found.employeeId,
        department: found.department,
        initials: found.initials || 'US',
      };

      localStorage.setItem('gw_user', JSON.stringify(sessionUser));
      setUser(sessionUser);
      return sessionUser;
    }
  }, []);

  const signup = useCallback(async (formData) => {
    try {
      const res = await api.auth.signup(formData);
      
      if (!res.success) {
        throw new Error(res.message || 'Registration failed.');
      }

      const initials = res.name
        ? res.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
        : 'US';

      const sessionUser = {
        email: res.email,
        name: res.name,
        role: res.role,
        employeeId: res.employeeId,
        department: res.department,
        initials,
      };

      localStorage.setItem('gw_user', JSON.stringify(sessionUser));
      setUser(sessionUser);
      return sessionUser;
    } catch (err) {
      console.error("Backend signup failed, performing offline signup fallback...", err);
      const initials = formData.fullName
        ? formData.fullName.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
        : 'US';
      const newUser = {
        email: formData.email,
        name: formData.fullName,
        role: formData.role,
        employeeId: formData.employeeId,
        department: formData.department,
        password: formData.password,
        initials,
      };
      const localUsers = JSON.parse(localStorage.getItem('gw_local_users') || '[]');
      localUsers.push(newUser);
      localStorage.setItem('gw_local_users', JSON.stringify(localUsers));

      localStorage.setItem('gw_user', JSON.stringify(newUser));
      setUser(newUser);
      return newUser;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('gw_user');
    setUser(null);
  }, []);

  const switchRole = useCallback((newRole) => {
    const found = MOCK_USERS.find((u) => u.role === newRole);
    if (!found) return;
    const sessionUser = {
      email: found.email,
      name: found.name,
      role: found.role,
      employeeId: found.employeeId,
      department: found.department,
      initials: found.initials,
    };
    localStorage.setItem('gw_user', JSON.stringify(sessionUser));
    setUser(sessionUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
