import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './index';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { MessageCircle, Eye, EyeOff, Clipboard, ClipboardCheck } from 'lucide-react';

const demoAccounts = [
  { role: 'Aluno', email: 'aluno@teste.com', password: '123456' },
  { role: 'Professor', email: 'professor@teste.com', password: '123456' },
];

interface DemoAccountRowProps {
  role: string;
  email: string;
  password: string;
}

const DemoAccountRow: React.FC<DemoAccountRowProps> = ({ role, email, password }) => {
  const [copied, setCopied] = useState<'email' | 'password' | null>(null);

  const handleCopy = (text: string, type: 'email' | 'password') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const CopyButtonIcon = ({ type }: { type: 'email' | 'password' }) =>
    copied === type ? <ClipboardCheck className="h-3 w-3" /> : <Clipboard className="h-3 w-3" />;

  return (
    <div className="flex items-center justify-between text-xs text-blue-800">
      <p>
        <strong>{role}:</strong> {email} / {password}
      </p>
      <div className="flex space-x-2 ml-4">
        <Button
          size="sm"
          variant="ghost"
          className="h-auto px-2 py-1 text-xs"
          onClick={() => handleCopy(email, 'email')}
        >
          <CopyButtonIcon type="email" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-auto px-2 py-1 text-xs"
          onClick={() => handleCopy(password, 'password')}
        >
          <CopyButtonIcon type="password" />
        </Button>
      </div>
    </div>
  );
};


export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        navigate('/');
      } else {
        setError('Email ou senha incorretos');
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <MessageCircle className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">DuvidApp</span>
          </div>
          <p className="text-gray-600">Entre na sua conta para continuar</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Entrar</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Sua senha"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto font-semibold"
                  onClick={() => navigate('/register')}
                >
                  Cadastre-se
                </Button>
              </p>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">
                Contas de demonstração:
              </h4>
              <div className="space-y-2">
                {demoAccounts.map(account => (
                  <DemoAccountRow key={account.role} {...account} />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}