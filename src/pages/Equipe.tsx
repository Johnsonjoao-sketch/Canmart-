import React, { useState, useEffect } from 'react';
import { api, UserProfile } from '../services/api';
import { auth } from '../lib/firebase';
import { Users, UserPlus, Trophy, CheckCircle2, ChevronRight, Copy, Share2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface Challenge {
  id: string;
  count: number;
  reward: number;
  label: string;
}

const CHALLENGES: Challenge[] = [
  { id: '1', count: 1, reward: 20, label: 'Convide 1 e ganhe MT 20' },
  { id: '5', count: 5, reward: 98, label: 'Convide 5 e ganhe MT 98' },
  { id: '12', count: 12, reward: 200, label: 'Convide 12 e ganhe MT 200' },
  { id: '25', count: 25, reward: 500, label: 'Convide 25 e ganhe MT 500' },
];

export const Equipe = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [teamStats, setTeamStats] = useState({ total: 0, level1: 0, level2: 0, level3: 0 });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      api.getUser(userId).then(setProfile);
      // In a real app, you would query count of users where referrerId == userId
      // For demo, we'll set some numbers or listen to a collection
    }
  }, []);

  const referralLink = `${window.location.origin}/auth?invite=${profile?.referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-display font-bold gold-text uppercase italic">Minha Equipe</h1>
        <p className="text-gray-400 text-xs mt-1">Expanda sua rede e aumente seus lucros</p>
      </div>

      {/* Team Stats Summary */}
      <div className="glass-card p-6 bg-gradient-to-br from-gold/10 to-transparent border-gold/20">
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center">
            <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Membros Totais</p>
            <p className="text-3xl font-display font-bold">0</p>
          </div>
          <div className="text-center border-l border-white/5">
            <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Comissão Total</p>
            <p className="text-3xl font-display font-bold text-gold">0.00 MT</p>
          </div>
        </div>
      </div>

      {/* Referral Link Card */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">Link de Convite</h3>
          <span className="text-[10px] bg-gold/10 text-gold px-2 py-0.5 rounded-full font-bold">BONUS 25%</span>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm truncate text-gray-400">
            {referralLink}
          </div>
          <button 
            onClick={copyLink}
            className="bg-gold p-3 rounded-xl text-black active:scale-95 transition-all"
          >
            {copied ? <CheckCircle2 size={20} /> : <Share2 size={20} />}
          </button>
        </div>
        <p className="text-[10px] text-gray-500 italic text-center">
          * Você ganha 25% do primeiro investimento dos seus convidados do Nível A.
        </p>
      </div>

      {/* Commission Levels */}
      <section className="space-y-4">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <Users size={20} className="text-gold" /> Estrutura de Ganhos
        </h2>
        <div className="space-y-3">
          {[
            { level: 'A', percent: '25%', count: 0, label: 'Primeiro Nível' },
            { level: 'B', percent: '2%', count: 0, label: 'Segundo Nível' },
            { level: 'C', percent: '1%', count: 0, label: 'Terceiro Nível' },
          ].map((item) => (
            <div key={item.level} className="glass-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-display font-bold text-gold border border-gold/20">
                  {item.level}
                </div>
                <div>
                  <h4 className="font-bold text-sm">{item.label}</h4>
                  <p className="text-xs text-gray-500">{item.count} membros ativos</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-display font-bold gold-text">{item.percent}</p>
                <p className="text-[8px] uppercase font-bold text-gray-500">COMISSÃO</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Challenges (Mission Grid) */}
      <section className="space-y-4">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <Trophy size={20} className="text-gold" /> Desafios de Equipe
        </h2>
        <div className="grid gap-4 underline-none">
          {CHALLENGES.map((ch) => (
            <div key={ch.id} className="glass-card p-5 flex items-center justify-between border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-gold opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="space-y-2">
                <p className="font-bold text-sm">{ch.label}</p>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gold w-0 transition-all duration-1000" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400">0/{ch.count}</span>
                </div>
              </div>
              <div className="text-center">
                <button 
                  disabled
                  className="bg-white/5 border border-white/10 text-gray-500 px-4 py-2 rounded-lg text-[10px] font-bold opacity-50 cursor-not-allowed"
                >
                  RECEBER
                </button>
                <p className="text-[8px] mt-1 text-gold font-bold">+{ch.reward} MT</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
