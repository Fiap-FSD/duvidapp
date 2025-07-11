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

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Usuários de demonstração
const DEMO_USERS: User[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'aluno@teste.com',
    role: 'student',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Prof. Maria Santos',
    email: 'professor@teste.com',
    role: 'teacher',
    createdAt: new Date('2024-01-10'),
  },
];

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  

  // Carregar usuário do localStorage na inicialização
  useEffect(() => {
    const loadUser = () => {
      try {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          // Converter strings de data de volta para objetos Date
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
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      const accessToken = data.access_token;

      if (accessToken) {
        // Armazena o token no cookie
        document.cookie = `access_token=${accessToken}; path=/`;

         Cookies.set('token', accessToken, { expires: 7 });

        // Opcional: buscar dados do usuário na resposta ou em outra rota
        // Exemplo: data.user
        const userData = data.user || { id: '', name: '', email, role: 'student', createdAt: new Date() };
        setUser(userData);
        localStorage.setItem('currentUser', JSON.stringify(userData));

        // Redireciona para a página principal
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

  const register = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Buscar usuários existentes
      const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const allUsers = [...DEMO_USERS, ...localUsers];
      
      // Verificar se email já existe
      if (allUsers.some(u => u.email === userData.email)) {
        return false;
      }
      
      // Criar novo usuário
      const newUser: User = {
        ...userData,
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
      };
      
      // Salvar usuário
      localUsers.push(newUser);
      localStorage.setItem('users', JSON.stringify(localUsers));
      
      // Fazer login automático
      setUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      
      return true;
    } catch (error) {
      console.error('Erro no registro:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    Cookies.remove('token');
    setUser(null);
    // router.push('/login');
    navigate('/login');
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    register,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

