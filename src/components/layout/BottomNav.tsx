import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Zap, TrendingUp, Users, User, CheckSquare } from 'lucide-react';
import { cn } from '../../lib/utils';

export const BottomNav = () => {
  const navItems = [
    { icon: Home, label: 'Início', path: '/' },
    { icon: Zap, label: 'VIP', path: '/invest' },
    { icon: CheckSquare, label: 'Tarefas', path: '/tasks' },
    { icon: Users, label: 'Equipe', path: '/team' },
    { icon: User, label: 'Perfil', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0F0F0F] border-t border-white/5 px-4 py-3 z-50 flex justify-between items-center safe-area-bottom">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-1 transition-colors",
              isActive ? "text-gold" : "text-gray-500"
            )
          }
        >
          <item.icon size={22} />
          <span className="text-[10px] font-medium">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};
