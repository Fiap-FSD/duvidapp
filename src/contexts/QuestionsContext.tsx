import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
}

interface QuestionsContextType {
  questions: Question[];
  getQuestionById: (id: string) => Question | undefined;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  filters: QuestionFilters;
  setFilters: (filters: Partial<QuestionFilters>) => void;
  addQuestion: (questionData: { title: string; content: string; tags: string[] }) => Promise<boolean>;
  voteQuestion: (questionId: string, userId: string, type: 'up' | 'down') => void;
  getUserQuestionVote: (questionId: string, userId: string) => Vote | undefined;
  isLoading: boolean;
}

const QuestionsContext = createContext<QuestionsContextType | undefined>(undefined);

// --- Dados de Exemplo ---
const DEMO_QUESTIONS: Question[] = [
    {
    id: '1',
    title: 'Como implementar autenticação em React?',
    content: 'Estou tentando implementar um sistema de autenticação em minha aplicação React. Já tentei usar Context API, mas estou tendo dificuldades com o gerenciamento de estado. Alguém pode me ajudar com um exemplo prático?',
    tags: ['react', 'javascript', 'autenticacao'],
    author: { id: '1', name: 'João Silva', role: 'student' },
    createdAt: new Date('2025-07-01T10:00:00'),
    updatedAt: new Date('2025-07-01T11:30:00'),
    views: 45,
    answers: [],
    isResolved: false,
    likes: 8
  },
  {
    id: '2',
    title: 'Diferença entre let, const e var em JavaScript',
    content: 'Estou estudando JavaScript e tenho dúvidas sobre quando usar let, const e var. Qual é a diferença prática entre eles e quando devo usar cada um?',
    tags: ['javascript', 'fundamentos'],
    author: { id: '3', name: 'Ana Costa', role: 'student' },
    createdAt: new Date('2025-06-30T15:00:00'),
    updatedAt: new Date('2025-06-30T15:00:00'),
    views: 67,
    answers: [],
    isResolved: false,
    likes: 12
  }
];

// --- Componente Provider ---
export function QuestionsProvider({ children }: { children: ReactNode }) {
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [questionVotes, setQuestionVotes] = useState<Vote[]>([]);
  const [filters, setFiltersState] = useState<QuestionFilters>({
    tags: [], searchTerm: '', sortBy: 'newest', showResolved: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dúvidas e votos do localStorage na inicialização
  useEffect(() => {
    try {
      const savedQuestions = localStorage.getItem('questions');
      const savedVotes = localStorage.getItem('question_votes');

      if (savedQuestions) {
        const questionsData = JSON.parse(savedQuestions);
        setAllQuestions(questionsData.map((q: any) => ({
          ...q,
          createdAt: new Date(q.createdAt),
          updatedAt: new Date(q.updatedAt),
          answers: q.answers.map((a: any) => ({...a, createdAt: new Date(a.createdAt), updatedAt: new Date(a.updatedAt)}))
        })));
      } else {
        setAllQuestions(DEMO_QUESTIONS);
      }

      if (savedVotes) {
        setQuestionVotes(JSON.parse(savedVotes).map((v: any) => ({...v, createdAt: new Date(v.createdAt)})));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setAllQuestions(DEMO_QUESTIONS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Salvar dúvidas e votos no localStorage sempre que houver mudanças
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('questions', JSON.stringify(allQuestions));
      localStorage.setItem('question_votes', JSON.stringify(questionVotes));
    }
  }, [allQuestions, questionVotes, isLoading]);

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setAllQuestions(prev =>
      prev.map(q => (q.id === id ? { ...q, ...updates, updatedAt: new Date() } : q))
    );
  };

  const voteQuestion = (questionId: string, userId: string, type: 'up' | 'down') => {
    const existingVote = questionVotes.find(v => v.questionId === questionId && v.userId === userId);
    let newVotes = [...questionVotes];

    if (existingVote) {
      if (existingVote.type === type) {
        newVotes = newVotes.filter(v => v.id !== existingVote.id);
      } else {
        newVotes = newVotes.map(v => v.id === existingVote.id ? { ...v, type } : v);
      }
    } else {
      const newVote: Vote = {
        id: `qvote_${Date.now()}`, userId, questionId, type, createdAt: new Date(),
      };
      newVotes.push(newVote);
    }
    
    setQuestionVotes(newVotes);

    const totalLikes = newVotes
      .filter(v => v.questionId === questionId)
      .reduce((sum, vote) => sum + (vote.type === 'up' ? 1 : -1), 0);
      
    updateQuestion(questionId, { likes: totalLikes });
  };

  const getUserQuestionVote = (questionId: string, userId: string): Vote | undefined => {
    return questionVotes.find(v => v.questionId === questionId && v.userId === userId);
  };
  
  const addQuestion = async (questionData: { title: string; content: string; tags: string[] }): Promise<boolean> => {
    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) return false;
    
    const currentUser = JSON.parse(currentUserStr);
    
    const newQuestion: Question = {
      ...questionData,
      id: `question_${Date.now()}`,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
        role: currentUser.role
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

  const getFilteredQuestions = (): Question[] => {
    let filtered = [...allQuestions];
    // Adicione sua lógica de filtro aqui...
    return filtered;
  };

  const value: QuestionsContextType = {
    questions: getFilteredQuestions(),
    getQuestionById,
    updateQuestion,
    filters,
    addQuestion,
    setFilters,
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