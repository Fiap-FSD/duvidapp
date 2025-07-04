import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { 
  ThumbsUp, 
  ThumbsDown, 
  CheckCircle, 
  Shield, 
  MessageSquare,
  Edit,
  Trash2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Tipos locais
interface Vote {
  id: string;
  userId: string;
  type: 'up' | 'down';
}

interface Answer {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: 'student' | 'teacher';
  };
  createdAt: Date;
  updatedAt: Date;
  votes: Vote[];
  isValidated: boolean;
  isCorrect?: boolean;
  validatedBy?: {
    id: string;
    name: string;
    role: 'teacher';
  };
  questionId: string;
  verificationComment?: string;
}

interface AnswerCardProps {
  answer: Answer;
  canVote?: boolean;
  canVerify?: boolean;
  userVote?: Vote;
  onVote?: (type: 'up' | 'down') => void;
  onVerify?: (isVerified: boolean, isCorrect?: boolean, comment?: string) => void;
}

export function AnswerCard({ 
  answer, 
  canVote = false, 
  canVerify = false, 
  userVote, 
  onVote, 
  onVerify 
}: AnswerCardProps) {
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [verificationComment, setVerificationComment] = useState(answer.verificationComment || '');

  const handleVote = (type: 'up' | 'down') => {
    if (onVote) {
      onVote(type);
    }
  };

  const handleVerification = (isCorrect: boolean) => {
    if (onVerify) {
      onVerify(true, isCorrect, verificationComment.trim() || undefined);
      setShowVerificationForm(false);
    }
  };

  const removeVerification = () => {
    if (onVerify) {
      onVerify(false, false, undefined);
    }
  };

  return (
    <Card className={`${answer.isCorrect ? 'border-green-500 bg-green-50/50' : ''} ${answer.isValidated ? 'border-blue-200' : ''}`}>
      <CardContent className="p-6">
        {/* Badges de status */}
        <div className="flex items-center gap-2 mb-4">
          {answer.isCorrect && (
            <Badge variant="default" className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-3 w-3 mr-1" />
              Resposta Correta
            </Badge>
          )}
          {answer.isValidated && !answer.isCorrect && (
            <Badge variant="secondary" className="">
              <Shield className="h-3 w-3 mr-1" />
              Verificada pelo Professor
            </Badge>
          )}
        </div>

        {/* Conteúdo da resposta */}
        <div className="prose prose-sm max-w-none mb-4">
          <div className="whitespace-pre-wrap text-gray-700">
            {answer.content}
          </div>
        </div>

        {/* Comentário de verificação */}
        {answer.verificationComment && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Comentário do Professor:
                </p>
                <p className="text-sm text-blue-800">
                  {answer.verificationComment}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Informações do autor e ações */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={answer.author.avatar} alt={answer.author.name} className="" />
              <AvatarFallback className="">
                {answer.author.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <div className="font-medium text-gray-900">{answer.author.name}</div>
              <div className="text-gray-600">
                {formatDistanceToNow(answer.createdAt, { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
                {answer.updatedAt.getTime() !== answer.createdAt.getTime() && (
                  <span className="ml-1">(editado)</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Sistema de votação */}
            {canVote && (
              <div className="flex items-center space-x-1">
                <Button
                  variant={userVote?.type === 'up' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleVote('up')}
                  className="h-8 w-8 p-0"
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span className="text-sm font-medium text-gray-700 min-w-[20px] text-center">
                    {answer.votes.reduce((acc, vote) => acc + (vote.type === 'up' ? 1 : -1), 0)}
                  </span>
                </Button>
                <Button
                  variant={userVote?.type === 'down' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleVote('down')}
                  className="h-8 w-8 p-0"
                >
                  <ThumbsDown className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Ações do professor */}
            {canVerify && (
              <div className="flex items-center space-x-2">
                {!answer.isValidated ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowVerificationForm(!showVerificationForm)}
                    className=""
                  >
                    <Shield className="h-4 w-4 mr-1" />
                    Verificar
                  </Button>
                ) : (
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowVerificationForm(!showVerificationForm)}
                      className=""
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeVerification}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Formulário de verificação */}
        {showVerificationForm && canVerify && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Comentário de verificação (opcional):
                </label>
                <Textarea
                  placeholder="Adicione um comentário sobre esta resposta..."
                  value={verificationComment}
                  onChange={(e) => setVerificationComment(e.target.value)}
                  className="text-sm"
                  rows={2}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleVerification(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Marcar como Correta
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleVerification(false)}
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <Shield className="h-4 w-4 mr-1" />
                  Apenas Verificar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowVerificationForm(false)}
                  className=""
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

