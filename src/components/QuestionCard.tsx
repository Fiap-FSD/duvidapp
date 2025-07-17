import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { MessageCircle, Eye, ThumbsUp, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

  
  const [likes, setLikes] = useState<number>(question.likes ?? 0);
  
  const [hasLiked, setHasLiked] = useState<boolean>(false);

  const lastAnswer = useMemo(() => {
    if (!question.answers || question.answers.length === 0) {
      return null;
    }
    return question.answers[question.answers.length - 1];
  }, [question.answers]);

  const handleCardClick = () => {
    navigate(`/question/${question.id}`);
  };


  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (hasLiked) {
      
      setLikes((prev) => Math.max(prev - 1, 0)); 
      setHasLiked(false);
    } else {
      
      setLikes((prev) => prev + 1);
      setHasLiked(true);
    }
  };

  return (
    <Card
      onClick={handleCardClick}
      className={`transition-shadow group ${
        question.isResolved ? 'border-green-200 bg-green-50/40' : 'hover:shadow-md cursor-pointer'
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
          {/* Autor */}
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

          {/* Estatísticas */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            {/* Curtir */}
            <div
              onClick={handleLikeClick}
              className={`flex items-center space-x-1 cursor-pointer hover:text-blue-600 ${
                hasLiked ? 'text-blue-600' : ''
              }`}
              title={hasLiked ? 'Você já curtiu (clique para remover)' : 'Curtir'}
              aria-label={`Curtir. Total de curtidas: ${likes}`}
            >
              <ThumbsUp className="h-4 w-4" />
              <span>{likes}</span>
            </div>

            {/* Respostas */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center space-x-1 cursor-pointer hover:text-blue-600"
              title="Respostas"
              aria-label={`Total de respostas: ${question.answers?.length ?? 0}`}
            >
              <MessageCircle className="h-4 w-4" />
              <span>{question.answers?.length ?? 0}</span>
            </div>

            {/* Visualizações */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center space-x-1 cursor-pointer hover:text-blue-600"
              title="Visualizações"
              aria-label={`Total de visualizações: ${question.views ?? 0}`}
            >
              <Eye className="h-4 w-4" />
              <span>{question.views ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Última resposta */}
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
