'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuestions } from './QuestionsContext';

// --- Tipos ---
interface Vote {
  id: string;
  userId: string;
  answerId: string;
  type: 'up' | 'down';
  createdAt: Date;
}

interface Answer {
  id: string;
  questionId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: Date;
  updatedAt: Date;
  votes: number;
  isVerified: boolean;
  isCorrect: boolean;
}

interface AnswersContextType {
  addAnswer: (answerData: Omit<Answer, 'id' | 'createdAt' | 'updatedAt' | 'votes' | 'isVerified' | 'isCorrect'>) => void;
  updateAnswer: (id: string, updates: Partial<Answer>) => void;
  voteAnswer: (answerId: string, userId: string, type: 'up' | 'down') => void;
  getUserVote: (answerId: string, userId: string) => Vote | undefined;
}

const AnswersContext = createContext<AnswersContextType | undefined>(undefined);

// --- Componente Provider ---
export function AnswersProvider({ children }: { children: ReactNode }) {
  const [votes, setVotes] = useState<Vote[]>([]);
  const { questions, updateQuestion } = useQuestions(); // Depende do context de Questions

  // Carrega e salva os VOTOS DAS RESPOSTAS no localStorage
  useEffect(() => {
    try {
      const savedVotes = localStorage.getItem('answer_votes');
      if (savedVotes) {
        setVotes(JSON.parse(savedVotes).map((v: any) => ({...v, createdAt: new Date(v.createdAt)})));
      }
    } catch (error) {
      console.error("Erro ao carregar votos das respostas:", error);
      localStorage.removeItem('answer_votes');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('answer_votes', JSON.stringify(votes));
  }, [votes]);

  // Função para adicionar uma nova resposta
  const addAnswer = (answerData: Omit<Answer, 'id' | 'createdAt' | 'updatedAt' | 'votes' | 'isVerified' | 'isCorrect'>) => {
    const newAnswer: Answer = {
      ...answerData,
      id: `answer_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      votes: 0,
      isVerified: false,
      isCorrect: false,
    };

    // Encontra a dúvida pai para adicionar a nova resposta
    const question = questions.find(q => q.id === answerData.questionId);
    if (question) {
      const updatedAnswers = [...question.answers, newAnswer];
      // Usa a função do QuestionsContext para atualizar a dúvida com a nova lista de respostas
      updateQuestion(question.id, { answers: updatedAnswers });
    }
  };

  // Função para atualizar uma resposta existente (usada para votos)
  const updateAnswer = (id: string, updates: Partial<Answer>) => {
    const question = questions.find(q => q.answers.some(a => a.id === id));
    if (question) {
      const updatedAnswers = question.answers.map(answer =>
        answer.id === id ? { ...answer, ...updates, updatedAt: new Date() } : answer
      );
      updateQuestion(question.id, { answers: updatedAnswers });
    }
  };

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
    
    const totalVotes = newVotes
      .filter(v => v.answerId === answerId)
      .reduce((sum, vote) => sum + (vote.type === 'up' ? 1 : -1), 0);
      
    updateAnswer(answerId, { votes: totalVotes });
  };
  
  const getUserVote = (answerId: string, userId: string) => {
    return votes.find(v => v.answerId === answerId && v.userId === userId);
  };

  const value = { addAnswer, updateAnswer, voteAnswer, getUserVote };

  return (
    <AnswersContext.Provider value={value as AnswersContextType}>
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