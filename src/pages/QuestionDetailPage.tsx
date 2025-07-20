import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useQuestions } from '../contexts/QuestionsContext';
import { useAnswers } from '../contexts/AnswersContext';
import { useUI } from '../contexts/UIContext';
import { MainLayout } from '../components/MainLayout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Edit, Trash2, ThumbsUp, ThumbsDown, AlertCircle, CheckCircle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// --- Tipos ---
type Question = NonNullable<ReturnType<typeof useQuestions>['getQuestionById']>;
type User = ReturnType<typeof useAuth>['user'];
type FetchedAnswer = {
  id: string;
  _id: string;
  content: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  votes: number;
  likes: number;
  dislikes: number;
  likedBy: string[];
  dislikedBy: string[];
  isVerified: boolean;
};

// --- Função Auxiliar para ler o Cookie ---
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// --- Sub-componentes ---
function AnswerVoteControl({ answer, user, onLike, onDislike }: { 
  answer: FetchedAnswer, 
  user: User,
  onLike: () => void,
  onDislike: () => void
}) {
  if (!user) return null;
  
  const userLiked = answer.likedBy?.includes(user.id) || false;
  const userDisliked = answer.dislikedBy?.includes(user.id) || false;
  
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onLike} 
          className={userLiked ? 'bg-blue-100 border-blue-300 text-blue-700' : ''}
        >
          <ThumbsUp className="h-4 w-4" />
        </Button>
        <span className="font-bold text-green-600 min-w-[2ch] text-center">{answer.likes || 0}</span>
      </div>
      <div className="flex items-center gap-1">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onDislike} 
          className={userDisliked ? 'bg-red-100 border-red-300 text-red-700' : ''}
        >
          <ThumbsDown className="h-4 w-4" />
        </Button>
        <span className="font-bold text-red-600 min-w-[2ch] text-center">{answer.dislikes || 0}</span>
      </div>
    </div>
  );
}

function AuthorInfo({ name, avatar, date, label }: { name: string, avatar?: string, date: Date, label: string }) {
  return (
    <div className="bg-gray-100 p-3 rounded-md text-sm w-fit ml-auto">
      <div className="text-gray-600 mb-2">{label} {formatDistanceToNow(date, { locale: ptBR, addSuffix: true })}</div>
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={avatar} />
          <AvatarFallback>{(name || '?').charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <span className="font-medium text-gray-800">{name || 'Autor desconhecido'}</span>
      </div>
    </div>
  );
}

// --- Componente Principal da Página ---
export default function QuestionDetailPage() {
  const { id: questionId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getQuestionById, isLoading: isQuestionsLoading } = useQuestions();
  const { addAnswer, deleteAnswer, updateAnswer, verifyAnswer, likeAnswer, dislikeAnswer } = useAnswers();
  const { showToast } = useUI();

  const [answers, setAnswers] = useState<FetchedAnswer[]>([]);
  const [isLoadingAnswers, setIsLoadingAnswers] = useState(true);
  const [newAnswerContent, setNewAnswerContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  const question = questionId ? getQuestionById(questionId) : undefined;
  const isQuestionOwner = user && question && user.id === question.author.id;
  const hasVerifiedAnswer = answers.some(a => a.isVerified);

  // **FUNÇÕES COM IMPLEMENTAÇÃO COMPLETA**
  const fetchAnswers = async () => {
    if (!questionId) return;
    setIsLoadingAnswers(true);
    const token = getCookie('access_token');
    if (!token) {
      setIsLoadingAnswers(false);
      return;
    }
    try {
      const response = await fetch(`http://localhost:3000/resposta/${questionId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.status === 404) {
        setAnswers([]);
        return;
      }
      if (!response.ok) throw new Error('Falha ao carregar respostas.');
      const data = await response.json();
      setAnswers(data.map((item: any) => ({ 
        ...item, 
        id: item._id,
        likes: item.likes || 0,
        dislikes: item.dislikes || 0,
        likedBy: item.likedBy || [],
        dislikedBy: item.dislikedBy || []
      })));
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setIsLoadingAnswers(false);
    }
  };

  useEffect(() => {
    fetchAnswers();
  }, [questionId]);

  const handleDeleteAnswer = async (answerId: string) => {
    if (window.confirm('Tem certeza que deseja deletar esta resposta?')) {
      const success = await deleteAnswer(answerId);
      if (success) fetchAnswers();
    }
  };

  const handleUpdateAnswer = async () => {
    if (!editingAnswerId || editingContent.trim().length < 10) return;
    const success = await updateAnswer(editingAnswerId, { content: editingContent.trim() });
    if (success) {
      setEditingAnswerId(null);
      setEditingContent('');
      fetchAnswers();
    }
  };

  const handleStartEditing = (answer: FetchedAnswer) => {
    setEditingAnswerId(answer.id);
    setEditingContent(answer.content);
  };

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionId || !user || newAnswerContent.trim().length < 10) return;
    setIsSubmitting(true);
    const success = await addAnswer({
      duvidaId: questionId,
      content: newAnswerContent.trim(),
    });
    if (success) {
      setNewAnswerContent('');
      setTimeout(() => fetchAnswers(), 300);
    }
    setIsSubmitting(false);
  };

  const handleVerifyAnswer = async (answerId: string) => {
    const success = await verifyAnswer(answerId);
    if (success) {
      fetchAnswers();
    }
  };

  const handleLikeAnswer = async (answerId: string) => {
    const success = await likeAnswer(answerId);
    if (success) {
      fetchAnswers();
    }
  };

  const handleDislikeAnswer = async (answerId: string) => {
    const success = await dislikeAnswer(answerId);
    if (success) {
      fetchAnswers();
    }
  };

  if (isQuestionsLoading) {
    return <MainLayout><p className="text-center p-10">Carregando...</p></MainLayout>;
  }
  if (!question) {
    return (
      <MainLayout>
        <Card className="text-center p-12 max-w-2xl mx-auto">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold">Dúvida não encontrada</h2>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="pb-6 border-b">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{question.title}</h1>
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap mt-4">{question.content}</p>
        </div>

        <div className="mt-10">
          {isLoadingAnswers ? (
            <p className="text-center p-10">Carregando respostas...</p>
          ) : answers.length > 0 ? (
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold">{answers.length} Respostas</h2>
              {answers.map(answer => (
                <div key={answer.id} className={`pt-6 border-t ${answer.isVerified ? 'border-green-300 bg-green-50 p-4 rounded-lg' : ''}`}>
                  {answer.isVerified && (
                    <Badge className="mb-4 bg-green-600 text-white">
                      <CheckCircle className="h-4 w-4 mr-1" /> Melhor Resposta
                    </Badge>
                  )}
                  {editingAnswerId === answer.id ? (
                    <div className="mb-4">
                      <Textarea value={editingContent} onChange={(e) => setEditingContent(e.target.value)} rows={5} className="mb-2" />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleUpdateAnswer}>Salvar</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingAnswerId(null)}>Cancelar</Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap mb-6">{answer.content}</p>
                  )}
                  <div className="flex justify-between items-center">
                    <AnswerVoteControl 
                      answer={answer} 
                      user={user} 
                      onLike={() => handleLikeAnswer(answer.id)}
                      onDislike={() => handleDislikeAnswer(answer.id)}
                    />
                    <div className="flex items-center gap-2">
                      {isQuestionOwner && !hasVerifiedAnswer && !answer.isVerified && (
                        <Button variant="outline" size="sm" className="text-green-700 border-green-300 hover:bg-green-100" onClick={() => handleVerifyAnswer(answer.id)}>
                          <CheckCircle className="h-4 w-4 mr-1" /> Marcar como correta
                        </Button>
                      )}
                      {user?.role === 'admin' && editingAnswerId !== answer.id && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => handleStartEditing(answer)}>
                            <Edit className="h-4 w-4 mr-1" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteAnswer(answer.id)}>
                            <Trash2 className="h-4 w-4 mr-1" />
                          </Button>
                        </>
                      )}
                    </div>
                    <AuthorInfo name={answer.authorName} avatar={answer.authorAvatar} date={new Date(answer.createdAt)} label="Respondido" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center p-10">Nenhuma resposta ainda.</p>
          )}
        </div>

        {user && (
          <Card className="mt-12">
            <CardHeader><CardTitle>Sua Resposta</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleAnswerSubmit} className="space-y-4">
                <Textarea value={newAnswerContent} onChange={e => setNewAnswerContent(e.target.value)} placeholder="Compartilhe sua solução..." rows={6} required disabled={isSubmitting} />
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Enviando...' : 'Enviar Resposta'}</Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
