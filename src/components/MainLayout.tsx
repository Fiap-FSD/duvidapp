import React, { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useAuth } from '../pages/index';

interface MainLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

export function MainLayout({ children, showSidebar = true }: MainLayoutProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        {/* Sidebar - apenas para usuários logados */}
        {user && showSidebar && <Sidebar />}
        
        {/* Conteúdo principal */}
        <main className={`flex-1 ${user && showSidebar ? '' : 'container mx-auto px-4'}`}>
          <div className={`${user && showSidebar ? 'p-6' : 'py-6'}`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

