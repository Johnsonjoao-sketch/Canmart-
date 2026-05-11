import React, { useState, useEffect } from 'react';
import { api, VIP_PLANS } from '../services/api';
import { auth } from '../lib/firebase';
import { TrendingUp, Clock, ShieldCheck, Zap, CheckCircle2 } from 'lucide-react';
import { formatMZTime } from '../lib/utils';
import { cn } from '../lib/utils';

export const Profits = () => {
  const [investments, setInvestments] = useState<any[]>([]);

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (userId) return api.getInvestments(userId, setInvestments);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold gold-text italic tracking-wider">MEUS LUCROS</h1>
          <p className="text-xs text-gray-400 mt-1">Status dos seus planos VIP ativos</p>
        </div>
        <div className="p-3 bg-gold/10 border border-gold/20 rounded-2xl text-gold">
          <Zap size={24} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="glass-card p-4">
          <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Meus Planos</p>
          <p className="text-xl font-display font-bold text-white">{investments.length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Mensal Estimado</p>
          <p className="text-xl font-display font-bold text-gold">
            {(investments.reduce((acc, inv) => acc + inv.dailyReturn, 0) * 30).toFixed(2)} MT
          </p>
        </div>
      </div>

      <h3 className="font-bold text-sm uppercase text-gray-500 ml-1">Planos Ativos</h3>

      <div className="space-y-4 underline-none">
        {investments.length === 0 ? (
          <div className="glass-card p-10 text-center space-y-3 opacity-50">
            <Zap size={40} className="mx-auto text-gray-600" />
            <p className="text-sm font-medium">Você não possui investimentos ativos.</p>
            <button className="gold-text text-xs uppercase font-bold">Investir Agora</button>
          </div>
        ) : (
          investments.map((inv) => (
            <div key={inv.id} className="glass-card p-5 space-y-4 relative overflow-hidden group border-white/5 hover:border-gold/20 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold border border-gold/20">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{inv.planName}</h4>
                    <p className="text-[10px] text-gray-500">Expira em: {inv.expiryDate?.toDate ? formatMZTime(inv.expiryDate.toDate(), 'dd/MM/yyyy') : '...'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-500">+{inv.dailyReturn} MT</p>
                  <p className="text-[8px] uppercase font-bold text-gray-500">POR DIA</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-gray-400">ATIVO (365 DIAS)</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                  <Clock size={12} />
                  <span>{inv.dailyReturn / (Math.max(1, VIP_PLANS.findIndex(p => p.id === inv.planId) + 1))} MT / tarefa</span>
                </div>
              </div>

              {/* Progress bar simulation */}
              <div className="absolute bottom-0 left-0 h-0.5 bg-gold/20 w-full overflow-hidden">
                <div className="h-full bg-gold w-1/3 animate-[shimmer_2s_infinite]" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Daily Income Message */}
      <div className="p-4 bg-gold/5 border border-gold/10 rounded-2xl flex items-center gap-3">
        <CheckCircle2 className="text-gold" size={18} />
        <p className="text-[10px] text-gray-400 font-medium tracking-tight">
          Lembre-se: Para receber sua renda de <span className="text-gold font-bold">
            {investments.reduce((acc, inv) => acc + inv.dailyReturn, 0).toFixed(2)} MT
          </span> hoje, você deve completar suas tarefas diárias na Área de Tarefas.
        </p>
      </div>
    </div>
  );
};
