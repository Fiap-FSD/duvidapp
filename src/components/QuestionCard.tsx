import React from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  MessageCircle, 
  Eye, 
  Clock, 
  CheckCircle, 
  User,
  ThumbsUp 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Tipo Question local
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
  answers: {
    id: string;
    content: string;
    authorId: string;
    authorName: string;
    createdAt: Date;
    isCorrect: boolean;
    votes: number;
  }[];
  isResolved: boolean;
  likes: number;
}

interface QuestionCardProps {
  question: Question;
  showActions?: boolean;
  compact?: boolean;
}

export function QuestionCard({ question, showActions = false, compact = false }: QuestionCardProps) {
  console.log('Verificando a pergunta:', question);
  console.log('Tipo de question.answers:', typeof question.answers, question.answers);
  const hasCorrectAnswer = question.answers?.some(answer => answer.isCorrect);
  const totalVotes = question.answers.reduce((sum, answer) => sum + answer.votes, 0);
  
  return (
    <Card className={`hover:shadow-md transition-shadow ${question.isResolved ? 'border-green-200 bg-green-50/30' : ''}`}>
      <CardHeader className={compact ? 'pb-2' : 'pb-3'}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div 
              className="block hover:text-blue-600 transition-colors cursor-pointer"
            >
              <h3 className={`font-semibold text-gray-900 ${compact ? 'text-base' : 'text-lg'} line-clamp-2`}>
                {question.title}
              </h3>
            </div>
            
            {!compact && (
              <p className="text-gray-600 mt-2 line-clamp-3">
                {question.content}
              </p>
            )}
          </div>
          
          {question.isResolved && (
            <CheckCircle className="h-5 w-5 text-green-600 ml-3 flex-shrink-0" />
          )}
        </div>
        
        {/* Tags */}
        {question.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {question.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent className={compact ? 'pt-0' : ''}>
        <div className="flex items-center justify-between">
          {/* Autor e data */}
          <div className="flex items-center space-x-3">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {question.author.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm text-gray-600">
              <span className="font-medium">{question.author.name}</span>
              <span className="mx-1">•</span>
              <span>
                {formatDistanceToNow(question.createdAt, { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
              </span>
            </div>
          </div>
          
          {/* Estatísticas */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            {/* Visualizações */}
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{question.views}</span>
            </div>
            
            {/* Respostas */}
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4" />
              <span>{question.answers.length}</span>
            </div>
            
            {/* Votos totais */}
            {totalVotes > 0 && (
              <div className="flex items-center space-x-1">
                <ThumbsUp className="h-4 w-4" />
                <span>{totalVotes}</span>
              </div>
            )}
            
            {/* Indicador de resposta correta */}
            {hasCorrectAnswer && (
              <div className="flex items-center space-x-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-xs font-medium">Resolvida</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Preview das respostas (apenas se não for compact) */}
        {!compact && question.answers.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Última resposta:</span>
              <span className="ml-2">
                {question.answers[question.answers.length - 1].authorName}
              </span>
              <span className="mx-1">•</span>
              <span>
                {formatDistanceToNow(
                  question.answers[question.answers.length - 1].createdAt, 
                  { addSuffix: true, locale: ptBR }
                )}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

