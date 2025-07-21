'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

// --- Tipos ---
interface DecodedToken {
  sub: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  exp: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: RegisterPayload) => Promise<{ success: boolean; message?: string }>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    try {
      const token = Cookies.get('access_token');
      if (token) {
        const decodedToken: DecodedToken = jwtDecode(token);
        if (decodedToken.exp * 1000 > Date.now()) {
          setUser({
            id: decodedToken.sub,
            name: decodedToken.name,
            email: decodedToken.email,
            role: decodedToken.role,
          });
        } else {
          Cookies.remove('access_token', { path: '/' });
        }
      }
    } catch (error) {
      console.error("Falha ao processar o token:", error);
      Cookies.remove('access_token', { path: '/' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('https://duvidapp.onrender.com/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      const token = data.access_token;

      if (token) {
        const decodedToken: DecodedToken = jwtDecode(token);
        Cookies.set('access_token', token, { expires: 1, path: '/' });
        setUser({
          id: decodedToken.sub,
          name: decodedToken.name,
          email: decodedToken.email,
          role: decodedToken.role,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterPayload): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      const roleForApi = userData.role === 'teacher' ? 'admin' : 'user';
      const response = await fetch('https://duvidapp.onrender.com/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          password: userData.password,
          role: roleForApi,
        }),
      });

      if (response.ok) {
        return { success: true };
      }
      if (response.status === 409) {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Este email já está em uso.' };
      }
      return { success: false, message: 'Ocorreu um erro inesperado ao registrar.' };

    } catch (error) {
      console.error('Erro na chamada de registro:', error);
      return { success: false, message: 'Não foi possível conectar ao servidor.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    Cookies.remove('access_token', { path: '/' });
    setUser(null);
    navigate('/login');
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    register,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}