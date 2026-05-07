import { createContext, useContext, useState } from 'react';
import { login as apiLogin } from '../api/auth.api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]   = useState(() => { try { return JSON.parse(localStorage.getItem('itpm_user')); } catch { return null; } });
  const [token, setToken] = useState(() => localStorage.getItem('itpm_token'));

  const login = async (email, password) => {
    const { data } = await apiLogin(email, password);
    localStorage.setItem('itpm_token', data.token);
    localStorage.setItem('itpm_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('itpm_token');
    localStorage.removeItem('itpm_user');
    setToken(null);
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, token, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
