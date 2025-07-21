import Cookies from 'js-cookie';
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';

// --- Tipos (sem alterações) ---
interface Vote {
  id: string;
  userId: string;
  questionId?: string;
  answerId?: 'up' | 'down';
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
  verificationComment?: string;
}

interface Question {
  id: string;
  title: string;
  content: string;
  tags: string[];
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: 'student' | 'teacher';
  };
  createdAt: Date;
  updatedAt: Date;
  views: number;
  answers: Answer[];
  isResolved: boolean;
  likes: number;
}

interface QuestionFilters {
  tags: string[];
  searchTerm: string;
  sortBy: 'newest' | 'oldest' | 'mostViewed' | 'mostAnswered';
  status: 'all' | 'resolved' | 'unresolved';
  authorId?: string;
}

interface QuestionsContextType {
  questions: Question[];
  allQuestionsUnfiltered: Question[];
  getQuestionById: (id: string) => Question | undefined;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  filters: QuestionFilters;
  setFilters: (filters: Partial<QuestionFilters>) => void;
  addQuestion: (questionData: { title: string; content: string; tags: string[] }) => Promise<boolean>;
  voteQuestion: (questionId: string) => Promise<void>;
  getUserQuestionVote: (questionId: string, userId: string) => Vote | undefined;
  isLoading: boolean;
  refetchQuestions: () => Promise<void>; // Nova função exposta
}

const QuestionsContext = createContext<QuestionsContextType | undefined>(undefined);

export function QuestionsProvider({ children }: { children: ReactNode }) {
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [questionVotes, setQuestionVotes] = useState<Vote[]>([]);
  const [filters, setFiltersState] = useState<QuestionFilters>({
    tags: [],
    searchTerm: '',
    sortBy: 'newest',
    status: 'all',
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Envolve a lógica de busca em um useCallback para estabilidade
  const refetchQuestions = useCallback(async () => {
    if (!user) {
      setAllQuestions([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const token = Cookies.get('access_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const questionsResponse = await fetch('https://duvidapp.onrender.com/duvida', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!questionsResponse.ok) throw new Error('Falha ao buscar dúvidas.');
      
      const questionsFromApi: any[] = await questionsResponse.json();

      const answerPromises = questionsFromApi.map(question =>
        fetch(`https://duvidapp.onrender.com/resposta/${question._id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }).then(res => res.ok ? res.json() : [])
      );

      const answersResults = await Promise.all(answerPromises);

      const mappedQuestions: Question[] = questionsFromApi.map((apiQuestion, index) => ({
        id: apiQuestion._id,
        title: apiQuestion.title,
        content: apiQuestion.content,
        tags: apiQuestion.tags,
        likes: apiQuestion.likes || 0,
        views: apiQuestion.viewing || 0,
        createdAt: new Date(apiQuestion.createdAt),
        updatedAt: new Date(apiQuestion.updatedAt),
        author: {
          id: apiQuestion.authorId,
          name: apiQuestion.authorName || 'Autor Desconhecido',
          role: 'student'
        },
        answers: answersResults[index] || [],
        isResolved: apiQuestion.isResolved || false,
      }));

      setAllQuestions(mappedQuestions);
    } catch (error) {
      console.error('Erro ao buscar dados completos das dúvidas:', error);
      setAllQuestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]); // A função depende do 'user' para obter o token e dados

  // O useEffect inicial pode ser removido, pois a HomePage irá controlar o carregamento.
  // Ou mantido para garantir o primeiro carregamento caso o contexto seja usado em outra página inicial.
  // Vamos mantê-lo por segurança.
  useEffect(() => {
    refetchQuestions();
  }, [refetchQuestions]);
  
  const addQuestion = async (questionData: { title: string; content: string; tags: string[] }): Promise<boolean> => { return true; };
  
  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setAllQuestions(prev =>
      prev.map(q => (q.id === id ? { ...q, ...updates, updatedAt: new Date() } : q))
    );
  };

  const voteQuestion = async (questionId: string): Promise<void> => { };

  const getUserQuestionVote = (questionId: string, userId: string): Vote | undefined => {
    return questionVotes.find(v => v.questionId === questionId && v.userId === userId);
  };
  
  const getQuestionById = (id: string): Question | undefined => {
    return allQuestions.find(q => q.id === id);
  };

  const setFilters = (newFilters: Partial<QuestionFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  // Lógica de filtro e ordenação (sem alterações)
  const filteredAndSortedQuestions = useMemo(() => {
    let filtered = [...allQuestions];

    if (filters.searchTerm.trim()) {
      const lowerSearch = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(q =>
        q.title.toLowerCase().includes(lowerSearch) ||
        q.content.toLowerCase().includes(lowerSearch)
      );
    }
    if (filters.tags.length > 0) {
      filtered = filtered.filter(q =>
        filters.tags.every(tag => q.tags.includes(tag))
      );
    }
    if (filters.authorId) {
        filtered = filtered.filter(q => q.author.id === filters.authorId);
    }
    if (filters.status === 'resolved') {
        filtered = filtered.filter(q => 
            q.answers.some(answer => answer.isVerified === true)
        );
    } else if (filters.status === 'unresolved') {
        filtered = filtered.filter(q => 
            !q.answers.some(answer => answer.isVerified === true)
        );
    }
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        break;
      case 'mostViewed':
        filtered.sort((a, b) => b.views - a.views);
        break;
      case 'mostAnswered':
        filtered.sort((a, b) => b.answers.length - a.answers.length);
        break;
    }

    return filtered;
  }, [allQuestions, filters]);

  const value: QuestionsContextType = {
    questions: filteredAndSortedQuestions,
    allQuestionsUnfiltered: allQuestions,
    getQuestionById,
    updateQuestion,
    filters,
    setFilters,
    addQuestion,
    voteQuestion,
    getUserQuestionVote,
    isLoading,
    refetchQuestions, // Exporta a nova função
  };

  return (
    <QuestionsContext.Provider value={value}>
      {children}
    </QuestionsContext.Provider>
  );
}

export function useQuestions() {
  const context = useContext(QuestionsContext);
  if (context === undefined) {
    throw new Error('useQuestions deve ser usado dentro de um QuestionsProvider');
  }
  return context;
}