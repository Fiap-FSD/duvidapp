import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Answer } from '..';

// Tipos
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
  filters: QuestionFilters;
  setFilters: (filters: Partial<QuestionFilters>) => void;
  addQuestion: (questionData: { title: string; content: string; tags: string[] }) => Promise<boolean>;
  isLoading: boolean;
}

const QuestionsContext = createContext<QuestionsContextType | undefined>(undefined);

interface QuestionsProviderProps {
  children: ReactNode;
}

const defaultFilters: QuestionFilters = {
  tags: [],
  searchTerm: '',
  sortBy: 'newest',
  showResolved: true,
};

// Dados de demonstração
const DEMO_QUESTIONS: Question[] = [
  {
    id: '1',
    title: 'Como implementar autenticação em React?',
    content: 'Estou tentando implementar um sistema de autenticação em minha aplicação React. Já tentei usar Context API, mas estou tendo dificuldades com o gerenciamento de estado. Alguém pode me ajudar com um exemplo prático?',
    tags: ['react', 'javascript', 'autenticacao'],
    author: {
      id: '1',
      name: 'João Silva',
      role: 'student'
    },
    createdAt: new Date('2024-07-01'),
    updatedAt: new Date('2024-07-01'),
    views: 45,
    answers: [
  {
    id: 'ans1',
    questionId: '1', // O ID da pergunta à qual esta resposta pertence
    content: 'Esta é a forma correta de fazer...',
    authorId: '1', // Propriedade separada
    authorName: 'João Silva', // Propriedade separada
    createdAt: new Date(),
    updatedAt: new Date(),
    votes: 15,
    isVerified: true,
    isCorrect: true
  }
],
    isResolved: false,
    likes: 8
  },
  {
    id: '2',
    title: 'Diferença entre let, const e var em JavaScript',
    content: 'Estou estudando JavaScript e tenho dúvidas sobre quando usar let, const e var. Qual é a diferença prática entre eles e quando devo usar cada um?',
    tags: ['javascript', 'fundamentos'],
    author: {
      id: '3',
      name: 'Ana Costa',
      role: 'student'
    },
    createdAt: new Date('2024-06-30'),
    updatedAt: new Date('2024-06-30'),
    views: 67,
    answers: [
  {
    id: 'ans2',
    questionId: '2', // O ID da pergunta à qual esta resposta pertence
    content: 'Esta é a forma correta de fazer...',
    authorId: '2', // Propriedade separada
    authorName: 'Ana Costa', // Propriedade separada
    createdAt: new Date(),
    updatedAt: new Date(),
    votes: 15,
    isVerified: true,
    isCorrect: true
  }
],
    isResolved: true,
    likes: 12
  }
];

export function QuestionsProvider({ children }: QuestionsProviderProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filters, setFiltersState] = useState<QuestionFilters>(defaultFilters);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dúvidas do localStorage na inicialização
  useEffect(() => {
    const loadQuestions = () => {
      try {
        const savedQuestions = localStorage.getItem('questions');
        if (savedQuestions) {
          const questionsData = JSON.parse(savedQuestions);
          // Converter strings de data de volta para objetos Date
          const parsedQuestions = questionsData.map((q: any) => ({
            ...q,
            createdAt: new Date(q.createdAt),
            updatedAt: new Date(q.updatedAt),
          }));
          setQuestions(parsedQuestions);
        } else {
          // Se não há dados salvos, usar dados de demonstração
          setQuestions(DEMO_QUESTIONS);
          localStorage.setItem('questions', JSON.stringify(DEMO_QUESTIONS));
        }
      } catch (error) {
        console.error('Erro ao carregar dúvidas:', error);
        setQuestions(DEMO_QUESTIONS);
        localStorage.setItem('questions', JSON.stringify(DEMO_QUESTIONS));
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, []);

  // Salvar dúvidas no localStorage sempre que houver mudanças
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('questions', JSON.stringify(questions));
    }
  }, [questions, isLoading]);

  const addQuestion = async (questionData: { title: string; content: string; tags: string[] }): Promise<boolean> => {
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Obter usuário atual do localStorage
      const currentUserStr = localStorage.getItem('currentUser');
      if (!currentUserStr) {
        return false;
      }
      
      const currentUser = JSON.parse(currentUserStr);
      
      const newQuestion: Question = {
        ...questionData,
        id: `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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

      setQuestions(prev => [newQuestion, ...prev]);
      return true;
    } catch (error) {
      console.error('Erro ao adicionar pergunta:', error);
      return false;
    }
  };

  const setFilters = (newFilters: Partial<QuestionFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  // Filtrar e ordenar dúvidas baseado nos filtros
  const getFilteredQuestions = (): Question[] => {
    let filtered = [...questions];

    // Filtrar por termo de busca
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(q => 
        q.title.toLowerCase().includes(searchLower) ||
        q.content.toLowerCase().includes(searchLower) ||
        q.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Filtrar por tags
    if (filters.tags.length > 0) {
      filtered = filtered.filter(q => 
        filters.tags.some(tag => q.tags.includes(tag))
      );
    }

    // Filtrar por status resolvido
    if (!filters.showResolved) {
      filtered = filtered.filter(q => !q.isResolved);
    }

    // Ordenar
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
  };

  const value: QuestionsContextType = {
    questions: getFilteredQuestions(),
    filters,
    addQuestion,
    setFilters,
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

