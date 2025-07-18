import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactElement;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Exibe um feedback visual enquanto a autenticação é verificada
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  // Se não estiver carregando e não houver usuário, redireciona para o login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se o usuário estiver autenticado, renderiza a página solicitada
  return children;
}