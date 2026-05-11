import React, { useState, useEffect } from 'react';
import { api, UserProfile } from '../services/api';
import { auth } from '../lib/firebase';
import { 
  Building2, 
  CreditCard, 
  ChevronRight, 
  LogOut, 
  Shield, 
  FileText, 
  Download, 
  History,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

export const Perfil = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankData, setBankData] = useState({ name: '', number: '', bank: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (userId) api.getUser(userId).then((data) => {
      setProfile(data);
      if (data?.bankData) setBankData(data.bankData);
    });
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
  };

  const handleSaveBank = async () => {
    if (!profile) return;
    try {
      await api.updateBankData(profile.uid, bankData);
      setShowBankModal(false);
      api.getUser(profile.uid).then(setProfile);
    } catch (err) {
      alert('Erro ao guardar dados bancários');
    }
  };

  const menuItems = [
    { icon: FileText, label: 'Sobre a Empresa', path: '#' },
    { icon: History, label: 'Registos de Renda', path: '/profits' },
    { icon: History, label: 'Registos de Depósito', path: '/transactions' },
    { icon: History, label: 'Registos de Saque', path: '/transactions' },
    { icon: Shield, label: 'Gestor de Segurança', path: '#' },
    { icon: Download, label: 'Baixar Aplicativo', path: '#' },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex flex-col items-center py-6">
        <div className="w-24 h-24 bg-gold rounded-full flex items-center justify-center text-4xl font-bold text-black border-4 border-white/5 mb-4 shadow-xl">
          {profile?.phone?.[0] || 'U'}
        </div>
        <h2 className="text-xl font-display font-bold gold-text">Olá, Premium</h2>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-sm text-gray-500">{profile?.phone || '(+258) 000 000 000'}</p>
          <div className="bg-gold/10 text-gold text-[10px] font-bold px-2 py-0.5 rounded-full border border-gold/20">
            VIP 0
          </div>
        </div>
      </div>

      {/* Finance Bar */}
      <div className="glass-card p-6 grid grid-cols-2 gap-4 divide-x divide-white/5">
        <div className="text-center">
          <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Saldo da Conta</p>
          <p className="text-lg font-display font-bold">{profile?.balance.toFixed(2) || '0.00'} MT</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Conta de Renda</p>
          <p className="text-lg font-display font-bold text-gold">0.00 MT</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <button onClick={() => navigate('/deposit')} className="glass-card p-4 flex flex-col items-center gap-2 active:scale-95 transition-all">
          <div className="text-gold"><CreditCard size={24} /></div>
          <span className="text-[10px] font-bold">Recarregar</span>
        </button>
        <button onClick={() => navigate('/withdraw')} className="glass-card p-4 flex flex-col items-center gap-2 active:scale-95 transition-all">
          <div className="text-gold"><LogOut className="rotate-180" size={24} /></div>
          <span className="text-[10px] font-bold">Saque</span>
        </button>
        <button onClick={() => setShowBankModal(true)} className="glass-card p-4 flex flex-col items-center gap-2 active:scale-95 transition-all">
          <div className="text-gold"><Building2 size={24} /></div>
          <span className="text-[10px] font-bold">Dados Bancários</span>
        </button>
      </div>

      {/* Menu List */}
      <div className="glass-card overflow-hidden">
        {menuItems.map((item, i) => (
          <button 
            key={i} 
            onClick={() => item.path !== '#' && navigate(item.path)}
            className={cn(
              "w-full flex items-center justify-between p-5 active:bg-white/5 transition-all",
              i !== menuItems.length - 1 && "border-b border-white/5"
            )}
          >
            <div className="flex items-center gap-4 text-gray-400">
              <item.icon size={20} />
              <span className="text-sm font-medium text-white">{item.label}</span>
            </div>
            <ChevronRight size={18} className="text-gray-600" />
          </button>
        ))}
      </div>

      {/* Logout Button */}
      <button 
        onClick={handleLogout}
        className="w-full bg-gradient-to-r from-red-900 to-red-700 text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all mb-4"
      >
        <LogOut size={20} /> LOGOUT
      </button>

      {/* Bank Modal */}
      {showBankModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[110] flex items-center justify-center px-6">
          <div className="glass-card p-8 w-full max-w-sm space-y-6 border-gold/30">
            <div className="text-center">
              <h3 className="text-xl font-display font-bold gold-text">Dados Bancários</h3>
              <p className="text-xs text-gray-500 mt-1">Configure onde deseja receber seus saques</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Nome Completo</label>
                <input 
                  type="text" 
                  value={bankData.name}
                  onChange={(e) => setBankData({...bankData, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-gold"
                  placeholder="Nome do titular"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Número de Conta</label>
                <input 
                  type="text" 
                  value={bankData.number}
                  onChange={(e) => setBankData({...bankData, number: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-gold"
                  placeholder="Número (Ex: 84XXXXXXX)"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Banco / Operadora</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setBankData({...bankData, bank: 'M-Pesa'})}
                    className={cn(
                      "flex items-center justify-center gap-2 py-3 rounded-xl border transition-all",
                      bankData.bank === 'M-Pesa' ? "border-gold bg-gold/10 text-gold" : "border-white/10 bg-white/5 text-gray-500"
                    )}
                  >
                    <div className="w-5 h-5 bg-red-600 rounded flex items-center justify-center text-[8px] font-bold text-white">M</div>
                    M-Pesa
                  </button>
                  <button 
                    onClick={() => setBankData({...bankData, bank: 'e-Mola'})}
                    className={cn(
                      "flex items-center justify-center gap-2 py-3 rounded-xl border transition-all",
                      bankData.bank === 'e-Mola' ? "border-gold bg-gold/10 text-gold" : "border-white/10 bg-white/5 text-gray-500"
                    )}
                  >
                    <div className="w-5 h-5 bg-orange-500 rounded flex items-center justify-center text-[8px] font-bold text-white">E</div>
                    e-Mola
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button 
                onClick={handleSaveBank}
                className="gold-button py-3 text-sm"
              >
                SALVAR DADOS
              </button>
              <button 
                onClick={() => setShowBankModal(false)}
                className="py-2 text-gray-500 text-sm font-medium"
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
