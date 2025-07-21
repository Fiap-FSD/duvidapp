import React from 'react';
import { useQuestions, useAuth } from '../pages/index';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Search, Filter, Tag, User, CheckCircle, Clock } from 'lucide-react';

export function Sidebar() {
  const { filters, setFilters, questions } = useQuestions();
  const { user } = useAuth();

  const allTags = React.useMemo(() => {
    const tagCounts = new Map<string, number>();
    
    questions.forEach(question => {
      question.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    return Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ name: tag, count }))
      .sort((a, b) => b.count - a.count);
  }, [questions]);

  const handleSearchChange = (value: string) => {
    setFilters({ searchTerm: value });
  };

  const handleTagToggle = (tagName: string) => {
    const newTags = filters.tags.includes(tagName)
      ? filters.tags.filter(t => t !== tagName)
      : [...filters.tags, tagName];
    
    setFilters({ tags: newTags });
  };

  const handleSortChange = (sortBy: typeof filters.sortBy) => {
    setFilters({ sortBy });
  };

  const clearFilters = () => {
    setFilters({
      tags: [],
      searchTerm: '',
      sortBy: 'newest',
      status: 'all', // Alterado
      authorId: undefined,
    });
  };

  const showMyQuestions = () => {
    if (user) {
      setFilters({ authorId: user.id });
    }
  };

  return (
    <aside className="w-80 bg-gray-50 border-r min-h-screen p-4 space-y-6">
      <Card className="">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center">
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </CardTitle>
        </CardHeader>
        <CardContent className="">
          <Input
            type="text"
            placeholder="Buscar dúvidas..."
            value={filters.searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full"
          />
        </CardContent>
      </Card>

      <Card className="">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs"
            >
              Limpar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-2 block">
              Ordenar por:
            </label>
            <div className="space-y-1">
              {[
                { value: 'newest', label: 'Mais recentes' },
                { value: 'oldest', label: 'Mais antigas' },
                { value: 'mostViewed', label: 'Mais visualizadas' },
                { value: 'mostAnswered', label: 'Mais respondidas' },
              ].map(option => (
                <Button
                  key={option.value}
                  variant={filters.sortBy === option.value ? 'default' : 'ghost'}
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => handleSortChange(option.value as typeof filters.sortBy)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Status (Bloco atualizado) */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-2 block">
              Status:
            </label>
            <div className="space-y-1">
              <Button
                variant={filters.status === 'all' ? 'default' : 'ghost'}
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => setFilters({ status: 'all' })}
              >
                <CheckCircle className="h-3 w-3 mr-2" />
                Todas
              </Button>
              <Button
                variant={filters.status === 'resolved' ? 'default' : 'ghost'}
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => setFilters({ status: 'resolved' })}
              >
                <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                Resolvidas
              </Button>
              <Button
                variant={filters.status === 'unresolved' ? 'default' : 'ghost'}
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => setFilters({ status: 'unresolved' })}
              >
                <Clock className="h-3 w-3 mr-2 text-yellow-500" />
                Não resolvidas
              </Button>
            </div>
          </div>

          {user && (
            <div>
              <Button
                variant={filters.authorId === user.id ? 'default' : 'ghost'}
                size="sm"
                className="w-full justify-start text-xs"
                onClick={showMyQuestions}
              >
                <User className="h-3 w-3 mr-2" />
                Minhas dúvidas
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {allTags.length > 0 && (
        <Card className="">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <Tag className="h-4 w-4 mr-2" />
              Tags Populares
            </CardTitle>
          </CardHeader>
          <CardContent className="">
            <div className="space-y-2">
              {allTags.slice(0, 10).map(tag => (
                <div
                  key={tag.name}
                  className="flex items-center justify-between"
                >
                  <Badge
                    variant={filters.tags.includes(tag.name) ? 'default' : 'secondary'}
                    className="cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => handleTagToggle(tag.name)}
                  >
                    {tag.name}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {tag.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Estatísticas</CardTitle>
        </CardHeader>
        <CardContent className="">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Total de dúvidas:</span>
              <span className="font-medium">{questions.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Resolvidas:</span>
              <span className="font-medium">
                {questions.filter(q => q.isResolved).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pendentes:</span>
              <span className="font-medium">
                {questions.filter(q => !q.isResolved).length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}