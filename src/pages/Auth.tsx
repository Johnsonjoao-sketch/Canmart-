import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { api } from '../services/api';
import { cn } from '../lib/utils';
import { Lock, Phone, UserPlus, LogIn, CheckCircle2 } from 'lucide-react';

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invite = params.get('invite');
    if (invite) setInviteCode(invite);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Sanitize phone: remove any non-numeric characters
    const sanitizedPhone = phone.replace(/\D/g, '');
    if (sanitizedPhone.length < 9) {
      setError('Número de telefone inválido. Deve ter pelo menos 9 dígitos.');
      setLoading(false);
      return;
    }

    // Mock email using sanitized phone for Firebase Auth
    const email = `${sanitizedPhone}@canmart.com`;

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        if (password.length < 6) throw new Error('A senha deve ter pelo menos 6 caracteres.');
        if (password !== confirmPassword) throw new Error('As senhas não coincidem');
        
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await api.createUserProfile(userCred.user.uid, sanitizedPhone, inviteCode || undefined);
      }
    } catch (err: any) {
      console.error('Auth Error:', err.code, err.message);
      
      switch (err.code) {
        case 'auth/operation-not-allowed':
          setError('O método de login por telefone/senha ainda não foi ativado no Console do Firebase. Por favor, ative o provedor "E-mail/Senha" nas configurações de Autenticação.');
          break;
        case 'auth/invalid-email':
          setError('Número de telefone ou formato inválido.');
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('Telefone ou senha incorretos.');
          break;
        case 'auth/email-already-in-use':
          setError('Este número de telefone já está registrado.');
          break;
        case 'auth/weak-password':
          setError('A senha é muito fraca. Use pelo menos 6 caracteres.');
          break;
        case 'auth/network-request-failed':
          setError('Erro de conexão. Verifique sua internet.');
          break;
        default:
          setError(err.message || 'Ocorreu um erro inesperado. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-premium-black px-6 flex flex-col justify-center max-w-md mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-display font-bold gold-text uppercase tracking-widest">Canmart</h1>
        <p className="text-gray-400 mt-2">Plataforma Premium de Investimento</p>
      </div>

      <div className="glass-card p-8 relative overflow-hidden">
        <div className="flex bg-white/5 rounded-full p-1 mb-8">
          <button 
            onClick={() => setIsLogin(false)}
            className={cn("flex-1 py-2 rounded-full text-sm font-medium transition-all", !isLogin ? "bg-gold text-black" : "text-gray-400")}
          >
            Cadastro
          </button>
          <button 
            onClick={() => setIsLogin(true)}
            className={cn("flex-1 py-2 rounded-full text-sm font-medium transition-all", isLogin ? "bg-gold text-black" : "text-gray-400")}
          >
            Login
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase ml-1">Número de Telefone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="tel" 
                placeholder="Ex: 841234567"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-gold transition-colors"
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase ml-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="password" 
                placeholder="********"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-gold transition-colors"
              />
            </div>
          </div>

          {!isLogin && (
            <>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase ml-1">Confirmar Senha</label>
                <div className="relative">
                  <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="password" 
                    placeholder="********"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase ml-1">Código de Convite (Opcional)</label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="text" 
                    placeholder="CÓDIGO"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
              </div>
            </>
          )}

          {error && <p className="text-red-500 text-xs italic">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full gold-button py-3 mt-4 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : isLogin ? (
              <><LogIn size={20} /> Entrar Agora</>
            ) : (
              <><UserPlus size={20} /> Registrar-se Agora</>
            )}
          </button>
        </form>
      </div>

      <div className="mt-8 text-center text-xs text-gray-500 flex flex-col gap-2">
        <p>© 2026 Canmart Premium. Todos os direitos reservados.</p>
        <p className="flex items-center justify-center gap-1">
          <CheckCircle2 size={12} className="text-gold" /> Seguro e Criptografado
        </p>
      </div>
    </div>
  );
};
