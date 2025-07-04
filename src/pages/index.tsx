import React, { ReactNode } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { QuestionsProvider } from '../contexts/QuestionsContext';
import { AnswersProvider } from '../contexts/AnswersContext';
import { UIProvider } from '../contexts/UIContext';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <UIProvider>
      <AuthProvider>
        <QuestionsProvider>
          <AnswersProvider>
            {children}
          </AnswersProvider>
        </QuestionsProvider>
      </AuthProvider>
    </UIProvider>
  );
}

// Re-exportar hooks para facilitar importação
export { useAuth } from '../contexts/AuthContext';
export { useQuestions } from '../contexts/QuestionsContext';
export { useAnswers } from '../contexts/AnswersContext';
export { useUI } from '../contexts/UIContext';

