import React from 'react';
import { AuthProvider, AuthGate, useAuth } from './lib/auth';
import { AppMain } from './components/AppMain';

function Shell() {
  const { user, logout } = useAuth();
  return <AppMain currentUser={user} onLogout={logout} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate>
        <Shell />
      </AuthGate>
    </AuthProvider>
  );
}
