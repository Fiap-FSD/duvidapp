import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Buscar usuários dos dados de exemplo e localStorage
      const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const allUsers = [...DEMO_USERS, ...localUsers];
      
      // Encontrar usuário por email
      const foundUser = allUsers.find(u => u.email === email);
      
      if (foundUser && password === '123456') {
        setUser(foundUser);
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
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
    setUser(null);
    localStorage.removeItem('currentUser');
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

