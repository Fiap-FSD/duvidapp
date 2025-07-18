// src/contexts/ProfileContext.tsx (com console.log)

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useAuth } from './AuthContext';

interface Profile { id: string; name: string; email: string; }
interface UpdateProfileData { name?: string; email?: string; password?: string; currentPassword?: string; }
interface ProfileContextType {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  success: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<boolean>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clearMessages = () => { setError(null); setSuccess(null); };

  const fetchProfile = useCallback(async () => { /* ...código de busca... */ }, [user?.id]);

  const updateProfile = async (data: UpdateProfileData): Promise<boolean> => {
    if (!user?.id) return false;

    setIsLoading(true);
    clearMessages();
    console.log('[LOG 5 - ProfileContext] Iniciando updateProfile com dados:', data);

    try {
      const token = Cookies.get('access_token');
      const response = await fetch(`https://duvidapp.onrender.com/user/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao atualizar o perfil.');
      }
      
      const updatedProfileData = await response.json();
      setProfile(updatedProfileData);
      
      const updatedAuthUser = { ...user, ...updatedProfileData };
      setUser(updatedAuthUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedAuthUser));
      
      setSuccess('Perfil atualizado com sucesso!');
      console.log('[LOG 7 - ProfileContext] Perfil atualizado com SUCESSO.');
      return true;
    } catch (err: any) {
      console.error('[LOG 6 - ProfileContext] !!! ERRO CAPTURADO !!!', err);
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value = { profile, isLoading, error, success, fetchProfile, updateProfile };

  return (<ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>);
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) { throw new Error('useProfile deve ser usado dentro de um ProfileProvider'); }
  return context;
}