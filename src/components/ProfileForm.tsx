import React, { useEffect, useState } from 'react';
import { useProfile } from '../contexts/ProfileContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

export function ProfileForm() {
  const { profile, isLoading, error, success, fetchProfile, updateProfile } = useProfile();
  
  // Estado local do formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState(''); // <-- NOVO ESTADO

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setEmail(profile.email);
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Tipagem explícita para clareza
    const dataToUpdate: { 
      name?: string; 
      email?: string; 
      password?: string; 
      currentPassword?: string 
    } = {};

    if (name !== profile?.name) dataToUpdate.name = name;
    if (email !== profile?.email) dataToUpdate.email = email;

    // Lógica atualizada para a senha
    if (password) {
      dataToUpdate.password = password;
      dataToUpdate.currentPassword = currentPassword;
    }

    if (Object.keys(dataToUpdate).length === 0) return;

    const wasSuccessful = await updateProfile(dataToUpdate);
    if (wasSuccessful) {
      setPassword('');
      setCurrentPassword(''); // Limpa ambos os campos de senha
    }
  };
  
  if (isLoading && !profile) {
    return <div className="text-center p-10">Carregando perfil...</div>;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Meu Perfil</CardTitle>
        <CardDescription>Atualize suas informações pessoais.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          
          {/* CAMPO NOVO PARA SENHA ATUAL */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Senha Atual</Label>
            <Input 
              id="currentPassword" 
              type="password" 
              placeholder="Obrigatória para alterar a senha" 
              value={currentPassword} 
              onChange={(e) => setCurrentPassword(e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Nova Senha</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="Deixe em branco para não alterar" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}