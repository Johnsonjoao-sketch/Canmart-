import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Invest } from './pages/Invest';
import { Equipe } from './pages/Equipe';
import { Perfil } from './pages/Perfil';
import { Auth } from './pages/Auth';
import { Withdraw } from './pages/Withdraw';
import { Deposit } from './pages/Deposit';
import { Profits } from './pages/Profits';
import { Transactions } from './pages/Transactions';
import { Tasks } from './pages/Tasks';
import { Toaster } from 'sonner';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <>
      <Toaster position="top-center" richColors />
      <BrowserRouter>
      <Routes>
        {!user ? (
          <>
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Navigate to="/auth" />} />
            <Route path="/register" element={<Navigate to="/auth" />} />
            <Route path="*" element={<Navigate to="/auth" />} />
          </>
        ) : (
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/invest" element={<Invest />} />
            <Route path="/team" element={<Equipe />} />
            <Route path="/profile" element={<Perfil />} />
            <Route path="/profits" element={<Profits />} />
            <Route path="/withdraw" element={<Withdraw />} />
            <Route path="/deposit" element={<Deposit />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  </>
);
}
