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
import { ThumbsUp, ThumbsDown, AlertCircle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Question = NonNullable<ReturnType<typeof useQuestions>['getQuestionById']>;
type Answer = Question['answers'][0];
type User = ReturnType<typeof useAuth>['user'];

function AnswerVoteControl({ answer, user }: { answer: Answer; user: User }) {
  const { voteAnswer, getUserVote } = useAnswers();
  if (!user) return null;

  const userVote = getUserVote(answer.id, user.id);
  const handleVote = (type: 'up' | 'down') => voteAnswer(answer.id, user.id, type);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleVote('up')}
        className={userVote?.type === 'up' ? 'bg-blue-100 border-blue-300 text-blue-700' : ''}
      >
        <ThumbsUp className="h-4 w-4" />
      </Button>
      <span className="font-bold text-gray-700 min-w-[2ch] text-center">{answer.votes}</span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleVote('down')}
        className={userVote?.type === 'down' ? 'bg-red-100 border-red-300 text-red-700' : ''}
      >
        <ThumbsDown className="h-4 w-4" />
      </Button>
    </div>
  );
}

function AuthorInfo({ name, avatar, date, label }: { name: string; avatar?: string; date: Date; label: string }) {
  return (
    <div className="bg-gray-100 p-3 rounded-md text-sm w-fit ml-auto">
      <div className="text-gray-600 mb-2">
        {label} {formatDistanceToNow(date, { locale: ptBR, addSuffix: true })}
      </div>
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={avatar} />
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <span className="font-medium text-gray-800">{name}</span>
      </div>
    </div>
  );
}

export default function QuestionDetailPage() {
  const { id: questionId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { user } = useAuth();
  const { getQuestionById, isLoading: isQuestionsLoading } = useQuestions();
  const { addAnswer } = useAnswers();
  const { showToast } = useUI();

  const [newAnswerContent, setNewAnswerContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [questionId]);

  const question = questionId ? getQuestionById(questionId) : undefined;
  const answers = question?.answers || [];

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionId || !user || newAnswerContent.trim().length < 10) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    addAnswer({
      questionId,
      content: newAnswerContent.trim(),
      authorId: user.id,
      authorName: user.name,
      authorAvatar: user.avatar,
    });

    setNewAnswerContent('');
    setIsSubmitting(false);
    showToast('Resposta enviada com sucesso!', 'success');
  };

  if (isQuestionsLoading) {
    return (
      <MainLayout>
        <p className="text-center p-10">Carregando...</p>
      </MainLayout>
    );
  }

  if (!question) {
    return (
      <MainLayout>
        <Card className="text-center p-12 max-w-2xl mx-auto">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold">Dúvida não encontrada</h2>
          <p className="text-gray-600 mt-2">O link pode estar quebrado ou a dúvida foi removida.</p>
          <Button variant="outline" onClick={() => navigate('/')} className="mt-6">
            Voltar para a Home
          </Button>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="pb-6 border-b">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{question.title}</h1>
          <div className="text-sm text-gray-500">
            Perguntado em {format(question.createdAt, "dd 'de' MMMM, yyyy", { locale: ptBR })}
          </div>
        </div>

        <div className="py-6 border-b">
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap mb-6">{question.content}</p>
          <div className="flex flex-wrap gap-2 mb-6">
            {question.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex justify-end items-center">
            <AuthorInfo name={question.author.name} avatar={question.author.avatar} date={question.createdAt} label="Perguntado" />
          </div>
        </div>

        <div className="mt-10">
          {answers.length > 0 && (
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              {answers.length} {answers.length === 1 ? 'Resposta' : 'Respostas'}
            </h2>
          )}
          <div className="space-y-8">
            {answers.map((answer) => (
              <div key={answer.id} className="pt-6 border-t">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap mb-6">{answer.content}</p>
                <div className="flex justify-between items-center">
                  <AnswerVoteControl answer={answer} user={user} />
                  <AuthorInfo name={answer.authorName} avatar={answer.authorAvatar} date={answer.createdAt} label="Respondido" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {user && (
          <Card className="mt-12">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Sua Resposta</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAnswerSubmit} className="space-y-4">
                <Textarea
                  value={newAnswerContent}
                  onChange={(e) => setNewAnswerContent(e.target.value)}
                  placeholder="Compartilhe sua solução ou conhecimento..."
                  rows={6}
                  required
                  disabled={isSubmitting}
                />
                <div className="flex justify-start">
                  <Button
                    type="submit"
                    disabled={newAnswerContent.trim().length < 10 || isSubmitting}
                    className={`transition-colors duration-200 ${
                      newAnswerContent.trim().length >= 10 && !isSubmitting
                        ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    size="md"
                    variant="default"
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar Resposta'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
