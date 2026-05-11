import React, { useState, useEffect } from 'react';
import { api, UserProfile } from '../services/api';
import { auth } from '../lib/firebase';
import { ArrowLeft, Wallet, Camera, Upload, CheckCircle2, History, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

export const Deposit = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'M-Pesa' | 'e-Mola'>('M-Pesa');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (userId) api.getUser(userId).then(setProfile);
  }, []);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    const val = parseFloat(amount);
    if (isNaN(val) || val < 650) return alert('O valor mínimo de depósito é 650 MT.');

    setLoading(true);
    try {
      // In a real app we'd upload file to Storage, here we use a dummy URL
      const dummyProofUrl = "https://example.com/proof.jpg";
      await api.deposit(profile.uid, val, method, dummyProofUrl);
      alert('Depósito recebido. Aguarde aprovação do administrador.');
      navigate('/');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const quickValues = [650, 1500, 5000, 10000, 50000];

  return (
    <div className="space-y-6 pb-20">
      <header className="flex items-center gap-4 mb-2">
        <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-full border border-white/10 text-gold transition-all active:scale-95">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-display font-bold italic tracking-wider">RECARREGAR</h1>
      </header>

      {/* Balance Box */}
      <div className="glass-card p-6 bg-gradient-to-br from-gold/20 via-gold/5 to-transparent relative overflow-hidden">
        <div className="absolute right-[-20px] top-[-20px] opacity-10">
          <Wallet size={120} />
        </div>
        <p className="text-gray-400 text-xs font-bold uppercase mb-1">Saldo Atual</p>
        <div className="flex items-end gap-2">
          <h2 className="text-3xl font-display font-bold">{profile?.balance.toFixed(2) || '0.00'}</h2>
          <span className="text-gold font-bold mb-1">MT</span>
        </div>
      </div>

      <form onSubmit={handleDeposit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Valor da Recarga (Min 650 MT)</label>
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
          <div className="flex flex-wrap gap-2 mt-3">
            {quickValues.map((v) => (
              <button 
                key={v}
                type="button"
                onClick={() => setAmount(v.toString())}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-bold border transition-all",
                  amount === v.toString() ? "bg-gold text-black border-gold" : "bg-white/5 text-gray-400 border-white/10"
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Método de Recarga</label>
          <div className="grid grid-cols-2 gap-3">
            {['M-Pesa', 'e-Mola'].map((m: any) => (
              <button 
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={cn(
                  "flex items-center justify-center gap-3 py-4 rounded-xl border transition-all",
                  method === m ? "border-gold bg-gold/10 text-gold" : "border-white/10 bg-white/5 text-gray-500"
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white",
                  m === 'M-Pesa' ? "bg-red-600" : "bg-orange-500"
                )}>
                  {m[0]}
                </div>
                <span className="font-bold text-sm">{m}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase ml-1">Upload de Comprovativo</label>
          <label className="flex flex-col items-center justify-center w-full h-32 bg-white/5 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-gold/50 transition-all">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {file ? (
                <div className="flex items-center gap-2 text-gold font-bold text-sm">
                  <CheckCircle2 size={24} /> {file.name}
                </div>
              ) : (
                <>
                  <Camera className="w-10 h-10 text-gray-500 mb-2" />
                  <p className="text-xs text-gray-500 uppercase font-bold">Tirar Foto ou Galeria</p>
                </>
              )}
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
        </div>

        <button 
          type="submit" 
          disabled={loading || !file}
          className="w-full gold-button py-4 text-sm uppercase flex items-center justify-center gap-2"
        >
          {loading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : 'Confirmar Recarga'}
        </button>
      </form>

      {/* History Link */}
      <button 
        onClick={() => navigate('/transactions')}
        className="w-full flex items-center justify-between p-4 glass-card border-gold/20 text-gold active:scale-[0.98] transition-all"
      >
        <div className="flex items-center gap-3">
          <History size={18} />
          <span className="text-xs font-bold uppercase">Ver Histórico de Depósitos</span>
        </div>
        <ChevronRight size={16} />
      </button>

      <div className="glass-card p-5 space-y-4">
        <h4 className="text-xs font-bold text-gold uppercase border-b border-white/5 pb-2">Instruções de Recarga</h4>
        <ul className="space-y-3">
          {[
            "1. Escolha o valor que deseja recarregar.",
            "2. Escolha o método (M-Pesa ou e-Mola).",
            "3. Envie o valor para o número indicado abaixo:",
            "M-Pesa: 85 615 9602 (Nome: Pedro)",
            "4. Tire um screenshot do comprovativo e faça o upload acima.",
            "5. Aguarde até 30 minutos para o saldo ser creditado."
          ].map((rule, i) => (
            <li key={i} className={cn("text-[10px] font-medium", rule.includes("85 615 9602") ? "text-gold font-bold text-xs" : "text-gray-500")}>{rule}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
