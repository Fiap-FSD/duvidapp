import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useQuestions } from './index';
import { MainLayout } from '../components/MainLayout';
import { QuestionCard } from '../components/QuestionCard';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { MessageCircle, Plus, Users, BookOpen } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  // Pega a nova função 'refetchQuestions' do contexto
  const { questions, isLoading, refetchQuestions } = useQuestions();

  // Este useEffect irá forçar o recarregamento dos dados sempre que a página for acessada
  useEffect(() => {
    if (user) {
      refetchQuestions();
    }
  }, [user]); // A dependência em 'user' garante que o fetch só ocorre quando o usuário está logado
               // e que a função 'refetchQuestions' (que depende do user) está estável.

  if (!user) {
    return (
      <MainLayout showSidebar={false}>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="text-center max-w-2xl mx-auto px-4">
            <MessageCircle className="h-16 w-16 text-blue-600 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              DuvidApp
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Uma plataforma onde alunos podem postar dúvidas e receber respostas 
              de colegas e professores. Como um Stack Overflow para sua turma!
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <MessageCircle className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Poste Dúvidas</h3>
                  <p className="text-sm text-gray-600">
                    Faça perguntas sobre a matéria com tags organizadas
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Ajude Colegas</h3>
                  <p className="text-sm text-gray-600">
                    Responda dúvidas e ganhe reconhecimento da turma
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Validação do Professor</h3>
                  <p className="text-sm text-gray-600">
                    Respostas verificadas e validadas pelo professor
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="ghost"
                className="w-full sm:w-auto"
                onClick={() => navigate('/register')}
              >
                Começar Agora
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto"
                onClick={() => navigate('/login')}
              >
                Já tenho conta
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header da página */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dúvidas da Turma</h1>
            <p className="text-gray-600">
              {questions.length} dúvida{questions.length !== 1 ? 's' : ''} encontrada{questions.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <Button size="sm" variant="ghost" onClick={() => navigate('/new-question')}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Dúvida
          </Button>
        </div>

        {/* Lista de dúvidas */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : questions.length > 0 ? (
          <div className="space-y-4">
            {questions.map(question => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma dúvida encontrada
              </h3>
              <p className="text-gray-600 mb-6">
                Seja o primeiro a postar uma dúvida para a turma!
              </p>
              <Button size="sm" variant="ghost" onClick={() => navigate('/new-question')}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Dúvida
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}