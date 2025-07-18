import React from 'react';  
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Header';


export default function PerfilPage() {
  const { user } = useAuth();

  if (!user) return <p>Carregando usuário...</p>;

  console.log("user.role =", user.role);

  const roleMap = {
    teacher: 'Professor',
    student: 'Aluno',
  };

  const displayRole = roleMap[user.role?.trim().toLowerCase()] || 'Usuário';

  return (
    <>
      <Header />
      <div className="max-w-2xl mx-auto mt-16 p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Meu Perfil</h1>
        <div className="space-y-4">
          <p><strong>Nome:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Tipo de usuário:</strong> {displayRole}</p>
        </div>
      </div>
    </>
  );
}
