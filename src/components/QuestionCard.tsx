import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { MessageCircle, Eye, ThumbsUp, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// NOTA: Idealmente, este tipo viria de um arquivo compartilhado, como `src/types.ts`
interface Question {
  id: string;
  title: string;
  content: string;
  tags: string[];
  author: {
    name: string;
    avatar?: string;
  };
  createdAt: Date;
  views: number;
  answers: {
    authorName: string;
    createdAt: Date;
    votes: number;
  }[];
  isResolved: boolean;
  likes: number;
}

interface QuestionCardProps {
  question: Question;
  compact?: boolean;
}

export function QuestionCard({ question, compact = false }: QuestionCardProps) {
  const navigate = useNavigate();

  // Otimização: Calcula a última resposta apenas se a lista de respostas mudar.
  const lastAnswer = useMemo(() => {
    if (!question.answers || question.answers.length === 0) {
      return null;
    }
    // Supondo que a última resposta é a última no array
    return question.answers[question.answers.length - 1];
  }, [question.answers]);

  // Navega para a página de detalhes da dúvida ao clicar
  const handleCardClick = () => {
    navigate(`/question/${question.id}`);
  };

  return (
    <Card
      onClick={handleCardClick}
      className={`transition-shadow cursor-pointer group ${
        question.isResolved ? 'border-green-200 bg-green-50/40' : 'hover:shadow-md'
      }`}
    >
      <CardHeader className={compact ? 'pb-2' : 'pb-3'}>
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {question.title}
          </h3>
          {question.isResolved && (
            <CheckCircle className="h-5 w-5 text-green-600 ml-3 flex-shrink-0" title="Resolvida" />
          )}
        </div>

        {question.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {question.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className={compact ? 'pt-0' : ''}>
        {!compact && (
          <p className="text-gray-600 mt-1 mb-4 line-clamp-3">{question.content}</p>
        )}

        <div className="flex items-center justify-between">
          {/* Informações do Autor */}
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={question.author.avatar} />
              <AvatarFallback className="text-xs">
                {question.author.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm text-gray-600">
              <span className="font-medium">{question.author.name}</span>
              <span className="mx-1">•</span>
              <span>
                {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true, locale: ptBR })}
              </span>
            </div>
          </div>

          {/* Estatísticas da Dúvida */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1" title="Votos na dúvida">
              <ThumbsUp className="h-4 w-4" />
              <span>{question.likes}</span>
            </div>
            <div className="flex items-center space-x-1" title="Respostas">
              <MessageCircle className="h-4 w-4" />
              <span>{question.answers?.length || 0}</span>
            </div>
             <div className="flex items-center space-x-1" title="Visualizações">
              <Eye className="h-4 w-4" />
              <span>{question.views}</span>
            </div>
          </div>
        </div>

        {/* Preview da Última Resposta */}
        {!compact && lastAnswer && (
          <div className="mt-4 pt-3 border-t text-sm text-gray-600">
            <strong>Última resposta:</strong> {lastAnswer.authorName} •{' '}
            {formatDistanceToNow(new Date(lastAnswer.createdAt), { addSuffix: true, locale: ptBR })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}