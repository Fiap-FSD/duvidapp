import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { MessageCircle, Plus, BarChart3, User, LogOut } from 'lucide-react';

export function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo e Navegação */}
          <div className="flex items-center space-x-6">
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <MessageCircle className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">
                DuvidApp
              </span>
            </div>

            {user && (
              <nav className="hidden md:flex items-center space-x-4">
                <Button className=""
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/')}
                >
                  Dúvidas
                </Button>
                
                {user.role === 'teacher' && (
                  <Button className=""
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate('/dashboard')}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                )}
              </nav>
            )}
          </div>

          {/* Ações do Usuário */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <Button className=""
                  size="sm"
                  variant="ghost" 
                  onClick={() => navigate('/new-question')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Dúvida
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src={user.avatar || '/avatar-default.png'} 
                          alt={user.name} 
                          className="h-8 w-8" 
                        />
                        <AvatarFallback className="">
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal" inset>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.role === 'teacher' ? 'Professor' : 'Aluno'}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="" />
                    <DropdownMenuItem
                      className="cursor-pointer"
                      inset
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/perfil');
                      }}
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Perfil</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="" />
                    <DropdownMenuItem className="" inset onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button className=""
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/login')}
                >
                  Entrar
                </Button>
                <Button className=""
                  size="sm"
                  variant="ghost" 
                  onClick={() => navigate('/register')}
                >
                  Cadastrar
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

