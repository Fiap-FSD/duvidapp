import Cookies from 'js-cookie';
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useUI } from './UIContext';

// --- Tipos (Restaurados) ---
interface Vote {
  id: string;
  userId: string;
  questionId?: string;
  answerId?: string;
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
  showResolved: boolean;
  authorId?: string;
}

interface QuestionsContextType {
  questions: Question[];
  getQuestionById: (id: string) => Question | undefined;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  filters: QuestionFilters;
  setFilters: (filters: Partial<QuestionFilters>) => void;
  addQuestion: (questionData: { title: string; content: string; tags: string[] }) => Promise<boolean>;
  voteQuestion: (questionId: string) => Promise<void>;
  getUserQuestionVote: (questionId: string, userId: string) => Vote | undefined;
  isLoading: boolean;
}

const QuestionsContext = createContext<QuestionsContextType | undefined>(undefined);

export function QuestionsProvider({ children }: { children: ReactNode }) {
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [questionVotes, setQuestionVotes] = useState<Vote[]>([]);
  const [filters, setFiltersState] = useState<QuestionFilters>({
    tags: [], searchTerm: '', sortBy: 'newest', showResolved: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { showToast } = useUI(); // Adicionado para notificações

  // Lógica de busca de dúvidas (Restaurada)
  const fetchDuvidas = async () => {
    if (!user) {
      setAllQuestions([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const token = Cookies.get('access_token');
      if (!token) {
        setAllQuestions([]);
        return;
      }
      const response = await fetch('http://localhost:3000/duvida', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        setAllQuestions([]);
        return;
      }
      const data: any[] = await response.json();
      const mappedQuestions: Question[] = data.map((apiQuestion) => ({
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
        answers: apiQuestion.answers || [],
        isResolved: apiQuestion.isResolved || false,
      }));
      setAllQuestions(mappedQuestions);
    } catch (error) {
      console.error('Erro ao buscar dúvidas:', error);
      setAllQuestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDuvidas();
  }, [user]);

  // **FUNÇÃO addQuestion CORRIGIDA**
  const addQuestion = async (questionData: { title: string; content: string; tags: string[] }): Promise<boolean> => {
    if (!user) {
      showToast('Você precisa estar logado para criar uma dúvida.', 'error');
      return false;
    }
    const token = Cookies.get('access_token');
    if (!token) {
      showToast('Sessão inválida. Por favor, faça login novamente.', 'error');
      return false;
    }
    try {
      const response = await fetch('http://localhost:3000/duvida', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questionData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao criar a dúvida.');
      }
      showToast('Dúvida criada com sucesso!', 'success');
      fetchDuvidas(); // Atualiza a lista de dúvidas
      return true;
    } catch (error: any) {
      console.error("Erro ao criar dúvida:", error);
      showToast(error.message, 'error');
      return false;
    }
  };

  // O restante da sua lógica (Restaurado)
  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setAllQuestions(prev =>
      prev.map(q => (q.id === id ? { ...q, ...updates, updatedAt: new Date() } : q))
    );
  };

  const voteQuestion = async (questionId: string): Promise<void> => {
    // ... sua lógica de voto ...
  };

  const getUserQuestionVote = (questionId: string, userId: string): Vote | undefined => {
    return questionVotes.find(v => v.questionId === questionId && v.userId === userId);
  };
  
  const getQuestionById = (id: string): Question | undefined => {
    return allQuestions.find(q => q.id === id);
  };

  const setFilters = (newFilters: Partial<QuestionFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

 const filteredAndSortedQuestions = useMemo(() => {
  let filtered = [...allQuestions];

  // 🔍 Filtrar por termo de busca (no título ou conteúdo)
  if (filters.searchTerm.trim()) {
    const lowerSearch = filters.searchTerm.toLowerCase();
    filtered = filtered.filter(q =>
      q.title.toLowerCase().includes(lowerSearch) ||
      q.content.toLowerCase().includes(lowerSearch)
    );
  }

  // 🏷️ Filtrar por tags
  if (filters.tags.length > 0) {
    filtered = filtered.filter(q =>
      filters.tags.every(tag => q.tags.includes(tag))
    );
  }

  // ✅ Filtrar resolvidos
  if (!filters.showResolved) {
    filtered = filtered.filter(q => !q.isResolved);
  }

  // 🔽 Ordenação
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

  // Objeto de valor completo (Restaurado)
  const value: QuestionsContextType = {
    questions: filteredAndSortedQuestions,
    getQuestionById,
    updateQuestion,
    filters,
    setFilters,
    addQuestion,
    voteQuestion,
    getUserQuestionVote,
    isLoading,
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
