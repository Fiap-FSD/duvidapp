import Cookies from 'js-cookie';
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useAuth } from './AuthContext'; // Supondo que você tenha um AuthContext para pegar o usuário

// --- Tipos ---
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

  useEffect(() => {
    const fetchDuvidas = async () => {
      setIsLoading(true);
      try {
        const token = Cookies.get('access_token');
        if (!token) {
          throw new Error('Token de autenticação não encontrado.');
        }

        const response = await fetch('https://duvidapp.onrender.com/duvida', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Falha ao buscar as dúvidas do servidor.');
        }

        const data: any[] = await response.json();
        const mappedQuestions: Question[] = data.map((apiQuestion) => ({
          id: apiQuestion._id,
          title: apiQuestion.title,
          content: apiQuestion.content,
          tags: apiQuestion.tags,
          likes: apiQuestion.likes,
          views: apiQuestion.viewing,
          createdAt: new Date(apiQuestion.createdAt),
          updatedAt: new Date(apiQuestion.updatedAt),
          author: { 
            id: apiQuestion.author?.id || 'unknown', 
            name: apiQuestion.author?.name || 'Autor Desconhecido', 
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
    fetchDuvidas();
  }, []);

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setAllQuestions(prev =>
      prev.map(q => (q.id === id ? { ...q, ...updates, updatedAt: new Date() } : q))
    );
  };

  const voteQuestion = async (questionId: string): Promise<void> => {
    if (!user) return;

    const question = allQuestions.find((q) => q.id === questionId);
    if (!question) return;

    const existingVote = questionVotes.find(
      (v) => v.questionId === questionId && v.userId === user.id
    );
    const isLiking = !existingVote;
    const originalLikes = question.likes;
    const newLikes = isLiking ? originalLikes + 1 : originalLikes - 1;

    const originalVotes = [...questionVotes];
    const updatedVotes = isLiking
      ? [...originalVotes, { id: `qvote_${Date.now()}`, userId: user.id, questionId, type: 'up', createdAt: new Date() }]
      : originalVotes.filter((v) => v.id !== existingVote?.id);
    
    updateQuestion(questionId, { likes: newLikes });
    setQuestionVotes(updatedVotes);

    try {
      const token = Cookies.get('access_token');
      
      const payload = {
        title: question.title,
        content: question.content,
        tags: question.tags,
        viewing: question.views,
        likes: newLikes,
      };

      const response = await fetch(`https://duvidapp.onrender.com/duvida/${questionId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar o voto no servidor.');
      }
    } catch (error) {
      console.error(error);
      updateQuestion(questionId, { likes: originalLikes });
      setQuestionVotes(originalVotes);
    }
  };

  const getUserQuestionVote = (questionId: string, userId: string): Vote | undefined => {
    return questionVotes.find(v => v.questionId === questionId && v.userId === userId);
  };
  
  const addQuestion = async (questionData: { title: string; content: string; tags: string[] }): Promise<boolean> => {
    if (!user) return false;
    
    const newQuestion: Question = {
      ...questionData,
      id: `question_${Date.now()}`,
      author: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        role: user.role
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      answers: [],
      views: 0,
      isResolved: false,
      likes: 0
    };

    setAllQuestions(prev => [newQuestion, ...prev]);
    return true;
  };

  const getQuestionById = (id: string): Question | undefined => {
    return allQuestions.find(q => q.id === id);
  };

  const setFilters = (newFilters: Partial<QuestionFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  const filteredAndSortedQuestions = useMemo(() => {
    let filtered = allQuestions.filter(question => {
      const searchTermLower = filters.searchTerm.toLowerCase().trim();
      const searchMatch = searchTermLower === '' ||
        question.title.toLowerCase().includes(searchTermLower) ||
        question.content.toLowerCase().includes(searchTermLower);
        
      const resolvedMatch = filters.showResolved ? true : !question.isResolved;

      const tagsMatch = filters.tags.length === 0 ||
        question.tags.some(tag => filters.tags.includes(tag));

      return searchMatch && resolvedMatch && tagsMatch;
    });

    const sorted = [...filtered].sort((a, b) => {
      switch (filters.sortBy) {
        case 'mostViewed':
          return b.views - a.views;
        case 'mostAnswered':
          return b.answers.length - a.answers.length;
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    return sorted;
  }, [allQuestions, filters]);

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