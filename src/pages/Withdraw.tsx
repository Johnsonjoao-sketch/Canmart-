import React, { useState, useEffect } from 'react';
import { api, UserProfile } from '../services/api';
import { auth } from '../lib/firebase';
import { ArrowLeft, Wallet, AlertCircle, ChevronRight, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

export const Withdraw = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'M-Pesa' | 'e-Mola'>('M-Pesa');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (userId) api.getUser(userId).then(setProfile);
  }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    const val = parseFloat(amount);
    if (isNaN(val) || val < 100) return alert('O valor mínimo de saque é 100 MT.');
    if (val > profile.balance) return alert('Saldo insuficiente.');

    setLoading(true);
    try {
      await api.withdraw(profile.uid, val, method, profile.bankData?.number || '');
      alert('Saque solicitado com sucesso! Aguarde aprovação.');
      navigate('/profile');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4 mb-2">
        <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-full border border-white/10 text-gold">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-display font-bold italic tracking-wider">SOLICITAR SAQUE</h1>
      </header>

      {/* Balance Box */}
      <div className="glass-card p-6 bg-gradient-to-br from-gold/20 via-gold/5 to-transparent relative overflow-hidden">
        <div className="absolute right-[-20px] top-[-20px] opacity-10">
          <Wallet size={120} />
        </div>
        <p className="text-gray-400 text-xs font-bold uppercase mb-1">Valor Sacável</p>
        <div className="flex items-end gap-2">
          <h2 className="text-3xl font-display font-bold">{profile?.balance.toFixed(2) || '0.00'}</h2>
          <span className="text-gold font-bold mb-1">MT</span>
        </div>
      </div>

      <form onSubmit={handleWithdraw} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Valor do Saque (Min 100 MT)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gold font-bold">MT</span>
            <input 
              type="number" 
              placeholder="0.00"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-gold font-display font-bold text-lg"
            />
          </div>
          {amount && parseFloat(amount) >= 100 && (
            <div className="flex justify-between px-1 mt-2">
              <span className="text-[10px] text-gray-500">Valor a receber (-12%):</span>
              <span className="text-[10px] text-gold font-bold">{(parseFloat(amount) * 0.88).toFixed(2)} MT</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Método de Carteira</label>
          <div className="grid grid-cols-2 gap-3">
            {['M-Pesa', 'e-Mola'].map((m: any) => (
              <button 
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={cn(
                  "flex items-center justify-center gap-3 py-4 rounded-xl border transition-all",
                  method === m ? "border-gold bg-gold/10 text-gold shadow-[0_0_15px_rgba(212,175,55,0.1)]" : "border-white/10 bg-white/5 text-gray-500"
                )}
              >
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  method === m ? "bg-gold animate-pulse" : "bg-gray-700"
                )} />
                <span className="font-bold text-sm">{m}</span>
              </button>
            ))}
          </div>
        </div>

        {!profile?.bankData && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex gap-3 items-start">
            <AlertCircle className="text-red-500 shrink-0" size={18} />
            <p className="text-[10px] text-red-200">Você ainda não configurou seus dados bancários no perfil. Por favor, faça isso antes de solicitar o saque.</p>
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading || !profile?.bankData}
          className="w-full gold-button py-4 text-sm uppercase flex items-center justify-center gap-2"
        >
          {loading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : 'Confirmar Saque'}
        </button>
      </form>

      {/* History Link */}
      <button 
        onClick={() => navigate('/transactions')}
        className="w-full flex items-center justify-between p-4 glass-card border-gold/20 text-gold active:scale-[0.98] transition-all"
      >
        <div className="flex items-center gap-3">
          <History size={18} />
          <span className="text-xs font-bold uppercase">Ver Histórico de Saques</span>
        </div>
        <ChevronRight size={16} />
      </button>

      {/* Rules */}
      <div className="glass-card p-5 space-y-4">
        <h4 className="text-xs font-bold text-gold uppercase border-b border-white/5 pb-2">Regras de Saque</h4>
        <ul className="space-y-2">
          {[
            "1. Horário de Saque: Segunda a Sábado (10h às 22h)",
            "2. Quantidade Mínima para Saque: 100 MT",
            "3. Taxa de Saque: 12%",
            "4. Apenas usuários com plano ativo podem sacar",
            "5. Os fundos serão creditados em até 24 horas."
          ].map((rule, i) => (
            <li key={i} className="text-[10px] text-gray-500 font-medium">{rule}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
