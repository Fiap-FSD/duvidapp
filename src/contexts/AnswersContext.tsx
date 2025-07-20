'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUI } from './UIContext';

// --- Tipos ---
interface Vote {
  id: string;
  userId: string;
  answerId: string;
  type: 'up' | 'down';
  createdAt: Date;
}

// Tipos mais específicos para as funções
type AddAnswerData = { duvidaId: string; content: string; };
type UpdateAnswerData = { content: string; };

interface AnswersContextType {
  addAnswer: (data: AddAnswerData) => Promise<boolean>;
  updateAnswer: (answerId: string, updates: UpdateAnswerData) => Promise<boolean>;
  deleteAnswer: (answerId: string) => Promise<boolean>;
  verifyAnswer: (answerId: string) => Promise<boolean>;
  voteAnswer: (answerId: string, userId: string, type: 'up' | 'down') => void;
  getUserVote: (answerId: string, userId: string) => Vote | undefined;
  likeAnswer: (answerId: string) => Promise<boolean>;
  dislikeAnswer: (answerId: string) => Promise<boolean>;
}

// --- Função Auxiliar para ler o Cookie ---
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

const AnswersContext = createContext<AnswersContextType | undefined>(undefined);

// --- Componente Provider ---
export function AnswersProvider({ children }: { children: ReactNode }) {
  const { showToast } = useUI();
  // RESTAURADO: Estado para gerenciar os votos localmente
  const [votes, setVotes] = useState<Vote[]>([]);

  // RESTAURADO: Efeitos para carregar/salvar votos do localStorage
  useEffect(() => {
    try {
      const savedVotes = localStorage.getItem('answer_votes');
      if (savedVotes) {
        setVotes(JSON.parse(savedVotes).map((v: any) => ({...v, createdAt: new Date(v.createdAt)})));
      }
    } catch (error) {
      console.error("Erro ao carregar votos das respostas:", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('answer_votes', JSON.stringify(votes));
  }, [votes]);

  const callApi = async (url: string, method: 'PUT' | 'DELETE' | 'POST' | 'PATCH', body?: any) => {
    const token = getCookie('access_token');
    if (!token) {
      showToast('Sua sessão expirou. Faça login novamente.', 'error');
      return null;
    }
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Falha na operação ${method}`);
      }
      return response;
    } catch (error: any) {
      console.error(`Erro na operação ${method}:`, error);
      showToast(error.message, 'error');
      return null;
    }
  };

  const addAnswer = async (answerData: AddAnswerData): Promise<boolean> => {
    const response = await callApi(`https://duvidapp.onrender.com/resposta`, 'POST', answerData);
    if (response) {
      showToast('Resposta criada com sucesso!', 'success');
      return true;
    }
    return false;
  };

  const deleteAnswer = async (answerId: string): Promise<boolean> => {
    const response = await callApi(`https://duvidapp.onrender.com/resposta/${answerId}`, 'DELETE');
    if (response) {
      showToast('Resposta deletada com sucesso!', 'success');
      return true;
    }
    return false;
  };

  const updateAnswer = async (answerId: string, updates: UpdateAnswerData): Promise<boolean> => {
    const response = await callApi(`https://duvidapp.onrender.com/resposta/${answerId}`, 'PUT', updates);
    if (response) {
      showToast('Resposta atualizada com sucesso!', 'success');
      return true;
    }
    return false;
  };

  const verifyAnswer = async (answerId: string): Promise<boolean> => {
    const response = await callApi(`https://duvidapp.onrender.com/resposta/${answerId}/verify`, 'PATCH');
    if (response) {
      showToast('Resposta marcada como a melhor!', 'success');
      return true;
    }
    return false;
  };

  const likeAnswer = async (answerId: string): Promise<boolean> => {
    const response = await callApi(`https://duvidapp.onrender.com/resposta/${answerId}/like`, 'PATCH');
    if (response) {
      showToast('Like registrado!', 'success');
      return true;
    }
    return false;
  };

  const dislikeAnswer = async (answerId: string): Promise<boolean> => {
    const response = await callApi(`https://duvidapp.onrender.com/resposta/${answerId}/dislike`, 'PATCH');
    if (response) {
      showToast('Dislike registrado!', 'success');
      return true;
    }
    return false;
  };

  // RESTAURADO: Lógica de votos (mantida para compatibilidade)
  const voteAnswer = (answerId: string, userId: string, type: 'up' | 'down') => {
    let newVotes = [...votes];
    const existingVote = votes.find(v => v.answerId === answerId && v.userId === userId);

    if (existingVote) {
      if (existingVote.type === type) {
        newVotes = newVotes.filter(v => v.id !== existingVote.id);
      } else {
        newVotes = newVotes.map(v => v.id === existingVote.id ? { ...v, type } : v);
      }
    } else {
      newVotes.push({ id: `avote_${Date.now()}`, answerId, userId, type, createdAt: new Date() });
    }
    setVotes(newVotes);
  };
  
  // RESTAURADO: Função para pegar o voto do usuário
  const getUserVote = (answerId: string, userId: string) => {
    return votes.find(v => v.answerId === answerId && v.userId === userId);
  };

  // CORRIGIDO: Adicionadas todas as funções ao objeto de valor
  const value = { 
    addAnswer, 
    updateAnswer, 
    deleteAnswer, 
    verifyAnswer, 
    voteAnswer, 
    getUserVote,
    likeAnswer,
    dislikeAnswer
  };

  return (
    <AnswersContext.Provider value={value}>
      {children}
    </AnswersContext.Provider>
  );
}

// --- Hook customizado ---
export function useAnswers() {
  const context = useContext(AnswersContext);
  if (!context) {
    throw new Error('useAnswers deve ser usado dentro de um AnswersProvider');
  }
  return context;
}