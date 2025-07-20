import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

// Tipos
interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
  avatar?: string;
  createdAt: Date;
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
  // Ajustando o tipo para um retorno mais informativo
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
    const loadUser = () => {
      try {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          userData.createdAt = new Date(userData.createdAt);
          setUser(userData);
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        localStorage.removeItem('currentUser');
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
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
      const accessToken = data.access_token;

      if (accessToken) {
        Cookies.set('access_token', accessToken, { expires: 7, path: '/' });
        const userData = data.user || { id: '', name: '', email, role: 'student', createdAt: new Date() };
        setUser(userData);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        window.location.href = '/';
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

  // ✅ FUNÇÃO REGISTER CORRIGIDA
  const register = async (userData: RegisterPayload): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      // Mapeia o papel do frontend para o que o backend espera
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

      if (response.ok) { // Status 201 Created
        return { success: true };
      }

      // Trata erros específicos como email já em uso
      if (response.status === 409) {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Este email já está em uso.' };
      }
      
      // Outros erros
      return { success: false, message: 'Ocorreu um erro inesperado.' };

    } catch (error) {
      console.error('Erro na chamada de registro:', error);
      return { success: false, message: 'Não foi possível conectar ao servidor.' };
    } finally {
      setIsLoading(false);
    }
  };


  const logout = () => {
    Cookies.remove('access_token');
    localStorage.removeItem('currentUser');
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