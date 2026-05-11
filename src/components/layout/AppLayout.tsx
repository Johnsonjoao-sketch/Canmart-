import React from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export const AppLayout = () => {
  return (
    <div className="min-h-screen bg-premium-black pb-24 max-w-md mx-auto relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-96 bg-gold/5 blur-[100px] -z-10 pointer-events-none" />
      <main className="px-5 pt-6 animate-in fade-in duration-500">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};
