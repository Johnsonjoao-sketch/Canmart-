import React, { useState, useEffect } from 'react';
import { api, VIP_PLANS, SPECIAL_PRODUCT, UserProfile } from '../services/api';
import { auth } from '../lib/firebase';
import { Check, ShieldCheck, Zap, Star } from 'lucide-react';
import { cn } from '../lib/utils';

export const Invest = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [buying, setBuying] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (userId) api.getUser(userId).then(setUserProfile);
  }, []);

  const handleBuy = async (plan: any) => {
    if (!auth.currentUser) return;
    setBuying(plan.id);
    try {
      await api.buyPlan(auth.currentUser.uid, plan);
      setSuccess(`Plano ${plan.name} ativado com sucesso!`);
      // Refresh user balance
      api.getUser(auth.currentUser.uid).then(setUserProfile);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setBuying(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-display font-bold gold-text uppercase italic">Área VIP</h1>
        <p className="text-gray-400 text-xs mt-1">Invista no seu futuro com alto rendimento</p>
      </div>

      {/* Special Product Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Star size={18} className="text-gold" />
          <h2 className="font-bold text-lg">Produto Especial</h2>
        </div>
        
        <div className="glass-card overflow-hidden border-gold/30 bg-gold/5 relative group">
          <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 animate-pulse">
            ÚNICO
          </div>
          <div className="flex p-4 gap-4">
            <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-white/10">
              <img src={SPECIAL_PRODUCT.image} alt={SPECIAL_PRODUCT.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gold text-lg">{SPECIAL_PRODUCT.name}</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 mb-3">
                <div className="text-[10px] text-gray-400">Renda: <span className="text-white font-bold">{SPECIAL_PRODUCT.dailyIncome} MT/Dia</span></div>
                <div className="text-[10px] text-gray-400">Preço: <span className="text-gold font-bold">{SPECIAL_PRODUCT.price} MT</span></div>
              </div>
              <button 
                onClick={() => handleBuy(SPECIAL_PRODUCT)}
                disabled={!!buying}
                className="w-full bg-gold py-2 rounded-lg text-black text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
              >
                {buying === SPECIAL_PRODUCT.id ? 'ATIVANDO...' : 'ATIVAR AGORA'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* VIP Plans Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Zap size={18} className="text-gold" />
          <h2 className="font-bold text-lg">Planos de Frota</h2>
        </div>

        <div className="grid gap-4">
          {VIP_PLANS.map((plan) => (
            <div key={plan.id} className="glass-card overflow-hidden flex group border-white/5 active:border-gold/30 transition-all p-3 gap-3">
              <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden relative border border-white/10">
                <img src={plan.image} alt={plan.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-display font-bold gold-text italic uppercase truncate mb-1">{plan.name}</h3>
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    <div className="text-[9px] text-gray-500 uppercase font-bold">Investimento: <span className="text-white">{plan.price} MT</span></div>
                    <div className="text-[9px] text-gray-500 uppercase font-bold">Renda: <span className="text-gold font-bold">{plan.dailyIncome} MT</span></div>
                    <div className="text-[9px] text-green-500 uppercase font-bold">Retorno: 4% ao dia</div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-1 text-[8px] text-gray-400">
                    <ShieldCheck size={10} className="text-green-500" />
                    <span>Duração: {plan.duration} d</span>
                  </div>
                  <button 
                    onClick={() => handleBuy(plan)}
                    disabled={!!buying}
                    className="gold-button px-4 py-1.5 text-[10px] uppercase"
                  >
                    {buying === plan.id ? '...' : 'Ativar'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Success Notification */}
      {success && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-lg shadow-green-500/20 z-50 animate-bounce">
          <Check size={18} />
          <span className="text-sm font-bold">{success}</span>
        </div>
      )}
    </div>
  );
};
