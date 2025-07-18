import React from 'react';
import { ProfileProvider } from '../contexts/ProfileContext';
import { ProfileForm } from '../components/ProfileForm';
import { MainLayout } from '../components/MainLayout';

export default function ProfilePage() {
  return (
    <MainLayout>
      <ProfileProvider>
        <ProfileForm />
      </ProfileProvider>
    </MainLayout>
  );
}