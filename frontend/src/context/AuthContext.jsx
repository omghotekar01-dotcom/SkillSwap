import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }

    // If we cached the user, show it immediately while verifying the token
    try {
      const cached = localStorage.getItem('user');
      if (cached) setUser(JSON.parse(cached));
    } catch (e) {
      // ignore parse errors
    }

    api.get('/auth/me', { signal: controller.signal })
      .then(r => {
        setUser(r.data);
        try { localStorage.setItem('user', JSON.stringify(r.data)); } catch (e) {}
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth-unauthorized', handleUnauthorized);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    try { localStorage.setItem('user', JSON.stringify(data.user)); } catch (e) {}
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (form) => {
    const { data } = await api.post('/auth/register', form);
    localStorage.setItem('token', data.token);
    try { localStorage.setItem('user', JSON.stringify(data.user)); } catch (e) {}
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};