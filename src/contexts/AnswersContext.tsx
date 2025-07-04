'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import { useQuestions } from './QuestionsContext';
import { Answer, AnswersContextType, Vote } from '..';

const AnswersContext = createContext<AnswersContextType | undefined>(undefined);

interface AnswersProviderProps {
  children: ReactNode;
}

export function AnswersProvider({ children }: AnswersProviderProps) {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { questions, updateQuestion } = useQuestions();

  // Carregar votos do localStorage na inicialização
  useEffect(() => {
    const loadVotes = () => {
      try {
        const savedVotes = localStorage.getItem('votes');
        if (savedVotes) {
          const votesData = JSON.parse(savedVotes);
          // Converter strings de data de volta para objetos Date
          const parsedVotes = votesData.map((v: any) => ({
            ...v,
            createdAt: new Date(v.createdAt),
          }));
          setVotes(parsedVotes);
        }
      } catch (error) {
        console.error('Erro ao carregar votos:', error);
        localStorage.removeItem('votes');
      } finally {
        setIsLoading(false);
      }
    };

    loadVotes();
  }, []);

  // Salvar votos no localStorage sempre que houver mudanças
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('votes', JSON.stringify(votes));
    }
  }, [votes, isLoading]);

  const addAnswer = (answerData: Omit<Answer, 'id' | 'createdAt' | 'updatedAt' | 'votes'>) => {
    const newAnswer: Answer = {
      ...answerData,
      id: `answer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      votes: 0,
      isVerified: false,
      isCorrect: false,
    };

    // Encontrar a dúvida e adicionar a resposta
    const question = questions.find(q => q.id === answerData.questionId);
    if (question) {
      const updatedAnswers = [...question.answers, newAnswer];
      updateQuestion(answerData.questionId, { answers: updatedAnswers });
    }
  };

  const updateAnswer = (id: string, updates: Partial<Answer>) => {
    // Encontrar a dúvida que contém esta resposta
    const question = questions.find(q => 
      q.answers.some(a => a.id === id)
    );
    
    if (question) {
      const updatedAnswers = question.answers.map(answer => 
        answer.id === id 
          ? { ...answer, ...updates, updatedAt: new Date() }
          : answer
      );
      updateQuestion(question.id, { answers: updatedAnswers });
    }
  };

  const deleteAnswer = (id: string) => {
    // Encontrar a dúvida que contém esta resposta
    const question = questions.find(q => 
      q.answers.some(a => a.id === id)
    );
    
    if (question) {
      const updatedAnswers = question.answers.filter(answer => answer.id !== id);
      updateQuestion(question.id, { answers: updatedAnswers });
      
      // Remover votos relacionados a esta resposta
      setVotes(prev => prev.filter(vote => vote.answerId !== id));
    }
  };

  const voteAnswer = (answerId: string, userId: string, type: 'up' | 'down') => {
    // Verificar se o usuário já votou nesta resposta
    const existingVote = votes.find(v => v.answerId === answerId && v.userId === userId);
    
    if (existingVote) {
      if (existingVote.type === type) {
        // Remover voto se for o mesmo tipo
        setVotes(prev => prev.filter(v => v.id !== existingVote.id));
      } else {
        // Alterar tipo do voto
        setVotes(prev => prev.map(v => 
          v.id === existingVote.id 
            ? { ...v, type }
            : v
        ));
      }
    } else {
      // Criar novo voto
      const newVote: Vote = {
        id: `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        answerId,
        userId,
        type,
        createdAt: new Date(),
      };
      setVotes(prev => [...prev, newVote]);
    }

    // Atualizar contagem de votos na resposta
    updateVoteCount(answerId);
  };

  const updateVoteCount = (answerId: string) => {
    const answerVotes = votes.filter(v => v.answerId === answerId);
    const upVotes = answerVotes.filter(v => v.type === 'up').length;
    const downVotes = answerVotes.filter(v => v.type === 'down').length;
    const totalVotes = upVotes - downVotes;

    updateAnswer(answerId, { votes: totalVotes });
  };

  const verifyAnswer = (answerId: string, isVerified: boolean, isCorrect?: boolean, comment?: string) => {
    const updates: Partial<Answer> = {
      isVerified,
      verificationComment: comment,
    };

    if (isCorrect !== undefined) {
      updates.isCorrect = isCorrect;
      
      // Se esta resposta está sendo marcada como correta, 
      // desmarcar outras respostas da mesma dúvida
      if (isCorrect) {
        const question = questions.find(q => 
          q.answers.some(a => a.id === answerId)
        );
        
        if (question) {
          const updatedAnswers = question.answers.map(answer => 
            answer.id === answerId 
              ? { ...answer, ...updates, updatedAt: new Date() }
              : { ...answer, isCorrect: false }
          );
          updateQuestion(question.id, { 
            answers: updatedAnswers,
            isResolved: true // Marcar dúvida como resolvida
          });
          return;
        }
      }
    }

    updateAnswer(answerId, updates);
  };

  const getUserVote = (answerId: string, userId: string): Vote | undefined => {
    return votes.find(v => v.answerId === answerId && v.userId === userId);
  };

  const value: AnswersContextType = {
    addAnswer,
    updateAnswer,
    deleteAnswer,
    voteAnswer,
    verifyAnswer,
    getUserVote,
    isLoading,
  };

  return (
    <AnswersContext.Provider value={value}>
      {children}
    </AnswersContext.Provider>
  );
}

export function useAnswers() {
  const context = useContext(AnswersContext);
  if (context === undefined) {
    throw new Error('useAnswers deve ser usado dentro de um AnswersProvider');
  }
  return context;
}

