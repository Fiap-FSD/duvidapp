'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

// --- Tipos ---
interface DecodedToken {
  sub: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  iat: number;
  exp: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// --- Função Auxiliar para ler o Cookie ---
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Efeito para verificar o token no cookie ao carregar a página
  useEffect(() => {
    const token = getCookie('access_token');
    if (token) {
      try {
        const decodedToken: DecodedToken = jwtDecode(token);
        if (decodedToken.exp * 1000 > Date.now()) {
          setUser({
            id: decodedToken.sub,
            name: decodedToken.name,
            email: decodedToken.email,
            role: decodedToken.role,
          });
        } else {
          logout();
        }
      } catch (error) {
        console.error("Token no cookie é inválido:", error);
        logout();
      }
    }
  }, []);

  // **FUNÇÃO DE LOGIN CORRIGIDA**
  // Agora ela faz a chamada à API e retorna true/false
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // 1. Faz a chamada POST para a API de login
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        // Se a resposta não for 2xx, o login falhou
        return false;
      }

      // 2. Extrai o objeto JSON da resposta
      const data = await response.json();
      const token = data.access_token; // Pega o token de dentro do objeto

      if (!token) {
        return false; // Se não houver token, falhou
      }

      // 3. Salva o token no cookie
      document.cookie = `access_token=${token}; path=/; max-age=86400; SameSite=Lax`;

      // 4. Decodifica o token e atualiza o estado do usuário
      const decodedToken: DecodedToken = jwtDecode(token);
      setUser({
        id: decodedToken.sub,
        name: decodedToken.name,
        email: decodedToken.email,
        role: decodedToken.role,
      });

      return true; // Sucesso!

    } catch (error) {
      console.error("Erro na chamada da API de login:", error);
      return false; // Falha
    }
  };

  // **FUNÇÃO DE LOGOUT CORRIGIDA**
  const logout = () => {
    // Remove o cookie e limpa o estado do usuário
    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setUser(null);
    // **ALTERAÇÃO FEITA AQUI**: Força o redirecionamento para a página inicial
    window.location.href = '/';
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
