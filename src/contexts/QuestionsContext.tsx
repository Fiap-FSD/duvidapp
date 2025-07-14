import Cookies from 'js-cookie';
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';

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
  voteQuestion: (questionId: string, userId: string, type: 'up' | 'down') => void;
  getUserQuestionVote: (questionId: string, userId: string) => Vote | undefined;
  isLoading: boolean;
}

const QuestionsContext = createContext<QuestionsContextType | undefined>(undefined);

// --- Componente Provider ---
export function QuestionsProvider({ children }: { children: ReactNode }) {
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [questionVotes, setQuestionVotes] = useState<Vote[]>([]);
  const [filters, setFiltersState] = useState<QuestionFilters>({
    tags: [], searchTerm: '', sortBy: 'newest', showResolved: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
  // Define uma função assíncrona para buscar os dados
  const fetchDuvidas = async () => {
    setIsLoading(true); // Inicia o carregamento

    try {
      // 1. Pega o token de autenticação do cookie
      const token = Cookies.get('access_token');

      // Se não houver token, não prossegue (opcional, mas recomendado)
      if (!token) {
        throw new Error('Token de autenticação não encontrado.');
      }

      // 2. Faz a requisição GET para o seu backend
      const response = await fetch('https://duvidapp.onrender.com/duvida', {
        method: 'GET',
        headers: {
          // 3. Envia o token no cabeçalho de autorização
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      
      // 4. Verifica se a resposta do servidor foi bem-sucedida
      if (!response.ok) {
        // Se não foi (ex: erro 401, 403, 500), lança um erro
        throw new Error('Falha ao buscar as dúvidas do servidor.');
      }
     

      // 5. Converte a resposta para JSON
      const data: Question[] = await response.json();


      const mappedQuestions: Question[] = data.map((apiQuestion: any) => {
        return {
          // Mapeando os campos existentes
          id: apiQuestion._id,          // Renomeia _id para id
          title: apiQuestion.title,
          content: apiQuestion.content,
          tags: apiQuestion.tags,
          likes: apiQuestion.likes,
          views: apiQuestion.viewing,      // Renomeia viewing para views
          createdAt: new Date(apiQuestion.createdAt), // Converte string para Data
          updatedAt: new Date(apiQuestion.updatedAt), // Converte string para Data

          // Adicionando os campos que faltam com valores padrão
          author: { 
            id: apiQuestion.author?.id || 'unknown', 
            name: apiQuestion.author?.name || 'Autor Desconhecido', 
            role: 'student' 
          }, // DADO PADRÃO
          answers: apiQuestion.answers || [],             // DADO PADRÃO
          isResolved: apiQuestion.isResolved || false,  // DADO PADRÃO
        };
      });

      setAllQuestions(mappedQuestions);

    } catch (error) {
      console.error('Erro ao buscar dúvidas:', error);
      // Opcional: Tratar o erro, talvez mostrando uma mensagem na tela
      setAllQuestions([]); // Limpa as dúvidas em caso de erro
    } finally {
      // 7. Finaliza o carregamento, independentemente do resultado
      setIsLoading(false);
    }
  };

  fetchDuvidas(); // Chama a função para iniciar a busca
}, []); // O array vazio [] garante que isso rode apenas uma vez ao carregar
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



   // 💡 MUDANÇA PRINCIPAL: SUBSTITUINDO getFilteredQuestions POR useMemo
  const filteredAndSortedQuestions = useMemo(() => {
    console.log("Recalculando lista..."); // Adicione para ver quando a função roda

    // ETAPA 1: FILTRAGEM
    let filtered = allQuestions.filter(question => {
      // Filtro de termo de busca
      const searchTermLower = filters.searchTerm.toLowerCase().trim();
      const searchMatch = searchTermLower === '' ||
        question.title.toLowerCase().includes(searchTermLower) ||
        question.content.toLowerCase().includes(searchTermLower);
        
      // Adicione aqui outros filtros que você tem (tags, showResolved, authorId)
      // Exemplo para 'showResolved'
      const resolvedMatch = filters.showResolved ? true : !question.isResolved;

      // ⚙️ NOVO: Filtro de Tags
      // Se não houver tags selecionadas, o filtro passa (true).
      // Se houver, a pergunta PRECISA ter PELO MENOS UMA das tags selecionadas.
      const tagsMatch = filters.tags.length === 0 ||
      question.tags.some(tag => filters.tags.includes(tag));


      return searchMatch && resolvedMatch && tagsMatch; // E outros que adicionar
    });

    // ETAPA 2: ORDENAÇÃO
    // Criamos uma cópia com [...filtered] para não modificar o array original
    const sorted = [...filtered].sort((a, b) => {
      switch (filters.sortBy) {
        case 'mostViewed':
          // Ordena por mais visualizações
          return b.views - a.views;
        case 'mostAnswered':
          // Ordena por mais respostas
          return b.answers.length - a.answers.length;
        case 'oldest':
          // Ordena pela data de criação mais antiga
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'newest':
        default:
          // Ordena pela data de criação mais nova (padrão)
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    return sorted;
  }, [allQuestions, filters]); // Dependências: Roda de novo só se allQuestions ou filters mudar


  const value: QuestionsContextType = {
    // ❗️ Usa a lista memoizada aqui
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