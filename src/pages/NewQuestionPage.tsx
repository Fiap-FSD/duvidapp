import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useQuestions } from './index';
import { MainLayout } from '../components/MainLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { X, Plus } from 'lucide-react';
import Cookies from 'js-cookie';

export default function NewQuestionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addQuestion } = useQuestions();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [] as string[]
  });
  const [currentTag, setCurrentTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirecionar se não estiver logado
  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.title.trim().length < 10) {
      setError('O título deve ter pelo menos 10 caracteres');
      setIsLoading(false);
      return;
    }

    if (formData.content.trim().length < 20) {
      setError('A descrição deve ter pelo menos 20 caracteres');
      setIsLoading(false);
      return;
    }

    if (formData.tags.length === 0) {
      setError('Adicione pelo menos uma tag');
      setIsLoading(false);
      return;
    }

    try {
      const token = Cookies.get('access_token');
      console.log('Token:', token);
      if (!token) {
        setError('Você não está autenticado. Por favor, faça login novamente.');
        setIsLoading(false);
        navigate('/login');
        return;
      }

      const response = await fetch('https://duvidapp.onrender.com/duvida', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          content: formData.content.trim(),
          tags: formData.tags,
        }),
      });


        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Falha ao criar a dúvida.');
        }

         navigate('/');

    } catch (err: any) {
      setError(err.message || 'Erro ao criar dúvida. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const addTag = () => {
    const tag = currentTag.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Nova Dúvida</h1>
          <p className="text-gray-600 mt-2">
            Descreva sua dúvida de forma clara e detalhada para receber as melhores respostas.
          </p>
        </div>

        <Card className="">
          <CardHeader className="">
            <CardTitle className="">Criar Nova Dúvida</CardTitle>
          </CardHeader>
          <CardContent className="">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label className="" htmlFor="title">
                  Título da dúvida
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input className=""
                  id="title"
                  name="title"
                  type="text"
                  placeholder="Ex: Como implementar autenticação em React?"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
                <p className="text-xs text-gray-500">
                  Seja específico e descritivo. Mínimo 10 caracteres.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="" htmlFor="content">
                  Descrição detalhada
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Textarea className=""
                  id="content"
                  name="content"
                  placeholder="Descreva sua dúvida em detalhes. Inclua o que você já tentou, códigos relevantes, mensagens de erro, etc."
                  value={formData.content}
                  onChange={handleChange}
                  rows={8}
                  required
                />
                <p className="text-xs text-gray-500">
                  Quanto mais detalhes, melhor será a resposta. Mínimo 20 caracteres.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="" htmlFor="tags">
                  Tags
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="flex space-x-2">
                  <Input className=""
                    id="tags"
                    type="text"
                    placeholder="Ex: react, javascript, css"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={handleTagKeyPress}
                  />
                  <Button
                  className=""
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={addTag}
                    disabled={!currentTag.trim() || formData.tags.length >= 5}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                
                <p className="text-xs text-gray-500">
                  Adicione até 5 tags para categorizar sua dúvida. Pressione Enter para adicionar.
                </p>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button
                  size="sm"
                  type="submit" 
                  variant="outline"
                  disabled={isLoading}
                  className="flex-1"
                  
                >
                  {isLoading ? 'Publicando...' : 'Publicar Dúvida'}
                </Button>
                <Button 
                size="sm"
                  type="button" 
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Dicas */}
        <Card className="mt-6">
          <CardHeader className="">
            <CardTitle className="text-lg">💡 Dicas para uma boa pergunta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <p>• <strong>Seja específico:</strong> Inclua detalhes sobre o problema</p>
            <p>• <strong>Mostre o que tentou:</strong> Compartilhe suas tentativas de solução</p>
            <p>• <strong>Use tags relevantes:</strong> Ajuda outros a encontrar sua pergunta</p>
            <p>• <strong>Formate o código:</strong> Use blocos de código quando necessário</p>
            <p>• <strong>Seja respeitoso:</strong> Mantenha um tom profissional e educado</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
