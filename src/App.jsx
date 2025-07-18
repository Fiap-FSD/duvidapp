import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProviders } from './pages/index';
import HomePage from './pages/page';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NewQuestionPage from './pages/NewQuestionPage';
import QuestionDetailPage from './pages/QuestionDetailPage';
import PerfilPage from './pages/ProfilePage';
import './App.css';

function App() {
  return (
    <Router>
      <AppProviders>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/new-question" element={<NewQuestionPage />} />
            <Route path="/question/:id" element={<QuestionDetailPage />} />
            <Route path="/perfil" element={<PerfilPage />} />
          </Routes>
        </div>
      </AppProviders>
    </Router>
  );
}

export default App;

