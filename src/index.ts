// Tipos principais do sistema

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
  avatar?: string;
  createdAt: Date;
}

export interface Question {
  id: string;
  title: string;
  content: string;
  tags: string[];
  authorId: string;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
  answers: Answer[];
  views: number;
  isResolved: boolean;
}

export interface Answer {
  id: string;
  questionId: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
  votes: number;
  isVerified: boolean; // Marcada pelo professor
  isCorrect: boolean; // Marcada pelo professor como resposta correta
  verificationComment?: string; // Comentário do professor
}

export interface Vote {
  id: string;
  answerId: string;
  userId: string;
  type: 'up' | 'down';
  createdAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  count: number; // Número de dúvidas com esta tag
}

// Tipos para filtros e busca
export interface QuestionFilters {
  tags: string[];
  searchTerm: string;
  sortBy: 'newest' | 'oldest' | 'mostViewed' | 'mostAnswered';
  showResolved: boolean;
  authorId?: string;
}

// Tipos para estatísticas do dashboard
export interface DashboardStats {
  totalQuestions: number;
  totalAnswers: number;
  totalUsers: number;
  questionsThisWeek: number;
  answersThisWeek: number;
  topTags: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  recentActivity: Array<{
    type: 'question' | 'answer' | 'verification';
    title: string;
    author: string;
    timestamp: Date;
    questionId: string;
  }>;
}

// Tipos para contextos
export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<boolean>;
  isLoading: boolean;
}

export interface QuestionsContextType {
  questions: Question[];
  filters: QuestionFilters;
  addQuestion: (question: Omit<Question, 'id' | 'createdAt' | 'updatedAt' | 'answers' | 'views'>) => void;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  deleteQuestion: (id: string) => void;
  setFilters: (filters: Partial<QuestionFilters>) => void;
  getQuestionById: (id: string) => Question | undefined;
  incrementViews: (id: string) => void;
  isLoading: boolean;
}

export interface AnswersContextType {
  addAnswer: (answer: Omit<Answer, 'id' | 'createdAt' | 'updatedAt' | 'votes'>) => void;
  updateAnswer: (id: string, updates: Partial<Answer>) => void;
  deleteAnswer: (id: string) => void;
  voteAnswer: (answerId: string, userId: string, type: 'up' | 'down') => void;
  verifyAnswer: (answerId: string, isVerified: boolean, isCorrect?: boolean, comment?: string) => void;
  getUserVote: (answerId: string, userId: string) => Vote | undefined;
  isLoading: boolean;
}

export interface UIContextType {
  isModalOpen: boolean;
  modalContent: React.ReactNode | null;
  openModal: (content: React.ReactNode) => void;
  closeModal: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

// Tipos para formulários
export interface QuestionFormData {
  title: string;
  content: string;
  tags: string[];
}

export interface AnswerFormData {
  content: string;
}

export interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher';
}

// Tipos para componentes
export interface QuestionCardProps {
  question: Question;
  showActions?: boolean;
  compact?: boolean;
}

export interface AnswerCardProps {
  answer: Answer;
  canVote?: boolean;
  canVerify?: boolean;
  userVote?: Vote;
  onVote?: (type: 'up' | 'down') => void;
  onVerify?: (isVerified: boolean, isCorrect?: boolean, comment?: string) => void;
}

export interface TagProps {
  tag: string;
  count?: number;
  selected?: boolean;
  onClick?: () => void;
  removable?: boolean;
  onRemove?: () => void;
}

// Tipos para API/Storage
export interface StorageData {
  users: User[];
  questions: Question[];
  votes: Vote[];
  currentUser: User | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

