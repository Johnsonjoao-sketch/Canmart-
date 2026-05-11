import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../lib/firebase';
import { api, UserProfile } from '../services/api';
import { Wallet, ArrowDownCircle, ArrowUpCircle, MessageCircle, Info, Gift, Trophy, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export const Dashboard = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [investments, setInvestments] = useState<any[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);

  const banners = [
    {
      image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=800",
      title: "Liderança Canmart",
      description: "Nossa equipe de especialistas foca em rendimentos consistentes."
    },
    {
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800",
      title: "Comunidade Premium",
      description: "Junte-se a mais de 50.000 membros em Moçambique."
    },
    {
      image: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?auto=format&fit=crop&q=80&w=800",
      title: "Transparência Total",
      description: "Relatórios de lucros diários e saques em até 24 horas."
    }
  ];

  useEffect(() => {
    const bannerInterval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(bannerInterval);
  }, [banners.length]);

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    // Just refresh profile
    api.getUser(userId).then(setProfile);
    
    // Load investments
    const unsub = api.getInvestments(userId, setInvestments);
    
    // Show WhatsApp popup after delay
    const timer = setTimeout(() => setShowWhatsApp(true), 1500);

    return () => {
      unsub();
      clearTimeout(timer);
    };
  }, []);

  const totalDailyEarnings = investments.reduce((acc, inv) => acc + (inv.dailyReturn || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center text-black font-bold">C</div>
          <div>
            <h2 className="text-sm font-bold text-gray-400">Bem-vindo,</h2>
            <p className="text-lg font-display gold-text font-bold leading-tight truncate w-32">
              {profile?.phone || 'Usuário Premium'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="relative p-2 bg-white/5 rounded-full border border-white/10">
            <Bell size={20} className="text-gold" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>
      </header>

      {/* Rotating Banner */}
      <div className="relative h-48 w-full rounded-2xl overflow-hidden border border-white/10 shadow-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBanner}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <img 
              src={banners[currentBanner].image} 
              alt={banners[currentBanner].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
              <h3 className="text-gold font-display font-bold text-lg leading-tight">
                {banners[currentBanner].title}
              </h3>
              <p className="text-white/80 text-xs mt-1">
                {banners[currentBanner].description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Banner Indicators */}
        <div className="absolute bottom-3 right-4 flex gap-1.5 z-10">
          {banners.map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                currentBanner === i ? "w-4 bg-gold" : "w-1 bg-white/30"
              )} 
            />
          ))}
        </div>
      </div>

      {/* Balance Card */}
      <div className="glass-card p-6 bg-gradient-to-br from-white/10 to-transparent relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-gold/10 blur-[50px] rounded-full" />
        <p className="text-gray-400 text-sm font-medium mb-1">Saldo da Conta (MT)</p>
        <div className="flex items-end gap-2 mb-6">
          <h1 className="text-4xl font-display font-bold">{profile?.balance.toFixed(2) || '0.00'}</h1>
          <span className="text-gold font-bold mb-1">MT</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Link to="/deposit" className="gold-button flex items-center justify-center gap-2 py-3">
            <ArrowDownCircle size={18} /> Depositar
          </Link>
          <Link to="/withdraw" className="bg-white/5 border border-white/10 rounded-full flex items-center justify-center gap-2 py-3 text-gold font-bold transition-all active:scale-95">
            <ArrowUpCircle size={18} /> Sacar
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4">
          <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Renda de Hoje</p>
          <p className="text-xl font-display font-bold text-gold">{totalDailyEarnings.toFixed(2)} MT</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Renda Total</p>
          <p className="text-xl font-display font-bold text-white">{profile?.totalEarnings.toFixed(2) || '0.00'} MT</p>
        </div>
      </div>

      {/* Horizontal Actions */}
      <div className="flex justify-between px-1">
        {[
          { icon: Info, label: 'Sobre Nós', color: 'text-blue-400' },
          { icon: Gift, label: 'Lucky Box', color: 'text-pink-400' },
          { icon: Trophy, label: 'Ranking', color: 'text-yellow-400' },
          { icon: MessageCircle, label: 'Suporte', color: 'text-green-400' },
        ].map((item, i) => (
          <button key={i} className="flex flex-col items-center gap-2">
            <div className={cn("p-3 rounded-2xl bg-white/5 border border-white/10", item.color)}>
              <item.icon size={20} />
            </div>
            <span className="text-[10px] font-medium text-gray-400">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Banner / Referral */}
      <div className="glass-card p-4 bg-gold/5 border-gold/20 flex items-center gap-4">
        <div className="p-3 bg-gold rounded-full text-black">
          <Gift size={24} />
        </div>
        <div>
          <h4 className="font-bold text-sm">Convide amigos e ganhe!</h4>
          <p className="text-[10px] text-gray-400 mt-0.5">Ganhe 25% do primeiro investimento de cada convidado direto.</p>
        </div>
      </div>

      {/* Recent Activity (Social Proof) */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
            <Trophy size={16} className="text-gold" /> Atividade em Tempo Real
          </h3>
          <span className="text-[10px] text-green-500 font-bold flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> ONLINE
          </span>
        </div>
        <div className="space-y-3">
          {[
            { phone: '84***1424', amount: '2,000.00', action: 'Saque' },
            { phone: '82***5561', amount: '400.00', action: 'Tarefa' },
            { phone: '86***9200', amount: '10,000.00', action: 'Depósito' },
          ].map((item, i) => (
            <div 
              key={i}
              className="flex justify-between items-center text-[10px] border-b border-white/5 pb-2 last:border-0 last:pb-0"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold">
                  {item.phone[0]}
                </div>
                <span className="text-gray-400 font-medium">{item.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-500 italic">{item.action}</span>
                <span className="text-gold font-bold">{item.amount} MT</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Support Button */}
      <a 
        href="https://wa.me/258856159602" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed right-6 bottom-24 w-12 h-12 bg-green-500 rounded-full shadow-lg shadow-green-500/20 flex items-center justify-center text-white z-40 transition-transform active:scale-90"
      >
        <MessageCircle size={24} />
      </a>

      {/* WhatsApp Modal */}
      <AnimatePresence>
        {showWhatsApp && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center px-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-card p-8 text-center max-w-sm w-full border-gold/30"
            >
              <div className="w-16 h-16 bg-green-500 rounded-2xl mx-auto flex items-center justify-center mb-4">
                <MessageCircle size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold font-display mb-2">Grupo Oficial WhatsApp</h3>
              <p className="text-gray-400 text-sm mb-6">Entre no nosso grupo oficial para receber atualizações, comprovativos de saque e suporte exclusivo.</p>
              
              <div className="flex flex-col gap-3">
                <a 
                  href="https://chat.whatsapp.com/F7LCu6tb8wr5tFJkGdXKdR" 
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowWhatsApp(false)}
                  className="bg-green-500 text-white font-bold py-3 rounded-full hover:bg-green-600 transition-colors"
                >
                  Entrar no Grupo
                </a>
                <button 
                  onClick={() => setShowWhatsApp(false)}
                  className="text-gray-500 text-sm font-medium py-2"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
