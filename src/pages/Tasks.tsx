import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api, UserProfile, VIP_PLANS } from '../services/api';
import { auth } from '../lib/firebase';
import { 
  Star, 
  CheckCircle2, 
  ShoppingBag, 
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

const TaskSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <header className="flex justify-between items-center">
      <div className="space-y-2">
        <div className="h-6 w-32 bg-white/10 rounded-lg" />
        <div className="h-3 w-48 bg-white/5 rounded-lg" />
      </div>
      <div className="h-6 w-16 bg-white/10 rounded-full" />
    </header>

    <div className="grid grid-cols-2 gap-3">
      <div className="glass-card p-4 flex flex-col items-center space-y-2">
        <div className="h-3 w-20 bg-white/5 rounded" />
        <div className="h-6 w-12 bg-white/10 rounded" />
      </div>
      <div className="glass-card p-4 flex flex-col items-center space-y-2">
        <div className="h-3 w-24 bg-white/5 rounded" />
        <div className="h-6 w-16 bg-white/10 rounded" />
      </div>
    </div>

    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="h-4 w-32 bg-white/10 rounded" />
        <div className="h-3 w-16 bg-white/5 rounded" />
      </div>
      <div className="p-6 space-y-6">
        <div className="flex gap-4">
          <div className="w-24 h-24 rounded-2xl bg-white/10 shrink-0" />
          <div className="flex-1 space-y-3 py-2">
            <div className="h-4 w-full bg-white/10 rounded" />
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-6 h-6 bg-white/5 rounded-full" />
              ))}
            </div>
          </div>
        </div>
        <div className="bg-white/5 rounded-2xl p-4 space-y-3">
          <div className="h-3 w-full bg-white/10 rounded" />
          <div className="h-3 w-2/3 bg-white/10 rounded" />
        </div>
        <div className="h-14 w-full bg-white/10 rounded-full" />
      </div>
    </div>
  </div>
);

export const Tasks = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [rating, setRating] = useState(0);

  // Mock products for evaluation
  const products = [
    { name: "Conjunto de Panelas Inox", image: "https://images.unsplash.com/photo-1584990344111-a82c4b036ca6?auto=format&fit=crop&q=80&w=200" },
    { name: "Smartphone Premium 128GB", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=200" },
    { name: "Liquidificador Industrial", image: "https://images.unsplash.com/photo-1585238341267-1cfec2046a55?auto=format&fit=crop&q=80&w=200" },
    { name: "Faqueiro Completo", image: "https://images.unsplash.com/photo-1594385208974-2e73f69324aa?auto=format&fit=crop&q=80&w=200" },
    { name: "Smart TV 55 polegadas", image: "https://images.unsplash.com/photo-1593359677759-543733479e0c?auto=format&fit=crop&q=80&w=200" }
  ];

  const [currentProduct, setCurrentProduct] = useState(products[0]);

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const loadData = async () => {
      const p = await api.getUser(userId);
      setProfile(p);
      
      const unsub = api.getInvestments(userId, (data) => {
        setInvestments(data);
        setLoading(false);
      });
      return unsub;
    };

    loadData();
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const completedToday = profile?.lastTaskDate === today ? (profile?.tasksCompletedToday || 0) : 0;
  
  // Calculate max tasks based on current VIP level
  // User said: vip 1 = 1 task, vip 2 = 2 tasks...
  // We'll find the highest VIP level among active investments
  const maxTasks = investments.reduce((max, inv) => {
    const planIndex = VIP_PLANS.findIndex(p => p.id === inv.planId);
    const level = planIndex !== -1 ? planIndex + 1 : 1;
    return Math.max(max, level);
  }, 0);

  const availableTasks = maxTasks - completedToday;

  // Calculate reward per task
  // If user has RIP 2 (48 MT daily), and 2 tasks, each task is 24 MT.
  const currentVip = VIP_PLANS.find((_, index) => index + 1 === maxTasks);
  const rewardPerTask = currentVip ? (currentVip.dailyIncome / maxTasks) : 0;

  const handleComplete = async () => {
    if (rating < 5) {
      toast.error("Por favor, avalie com 5 estrelas para ganhar a recompensa!");
      return;
    }

    setCompleting(true);
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      await api.completeTask(userId, rewardPerTask);
      
      // Refresh profile
      const updated = await api.getUser(userId);
      setProfile(updated);
      
      toast.success(`Tarefa concluída! +${rewardPerTask.toFixed(2)} MT adicionados.`);
      setRating(0);
      setCurrentProduct(products[Math.floor(Math.random() * products.length)]);
    } catch (err) {
      toast.error("Erro ao completar tarefa.");
    } finally {
      setCompleting(false);
    }
  };

  if (loading) return <TaskSkeleton />;

  return (
    <div className="space-y-6 pb-24">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-display font-bold gold-text">Área de Tarefas</h2>
          <p className="text-[10px] text-gray-500 uppercase font-bold">Avalie produtos e ganhe dinheiro</p>
        </div>
        <div className="px-3 py-1 bg-gold/10 border border-gold/20 rounded-full">
          <span className="text-[10px] font-bold text-gold">VIP {maxTasks}</span>
        </div>
      </header>

      {/* Progress Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4 flex flex-col items-center">
          <p className="text-[10px] uppercase text-gray-500 font-bold mb-1">Tarefas de Hoje</p>
          <p className="text-xl font-display font-bold text-white">{completedToday} / {maxTasks}</p>
        </div>
        <div className="glass-card p-4 flex flex-col items-center">
          <p className="text-[10px] uppercase text-gray-500 font-bold mb-1">Recompensa / Tarefa</p>
          <p className="text-xl font-display font-bold text-gold">{rewardPerTask.toFixed(2)} MT</p>
        </div>
      </div>

      {maxTasks === 0 ? (
        <div className="glass-card p-10 text-center space-y-4 border-dashed border-gold/30">
          <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto text-gold">
            <AlertCircle size={32} />
          </div>
          <div>
            <h3 className="font-bold text-white">Nenhum VIP Ativo</h3>
            <p className="text-xs text-gray-500 mt-1">Você precisa de um plano VIP ativo para liberar tarefas diárias.</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="gold-button w-full py-3"
            onClick={() => window.location.href = '/invest'}
          >
            Ver Planos VIP
          </motion.button>
        </div>
      ) : availableTasks <= 0 ? (
        <div className="glass-card p-10 text-center space-y-4">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500">
            <CheckCircle2 size={32} />
          </div>
          <div>
            <h3 className="font-bold text-white">Todas as Tarefas Concluídas!</h3>
            <p className="text-xs text-gray-500 mt-1">Você já completou suas tarefas VIP {maxTasks} por hoje. Volte amanhã!</p>
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card overflow-hidden"
        >
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag size={16} className="text-gold" />
              <span className="text-xs font-bold uppercase">Avaliação de Produto</span>
            </div>
            <span className="text-[10px] font-medium text-gray-500">Tarefa {completedToday + 1} de {maxTasks}</span>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex gap-4">
              <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-white/10">
                <img src={currentProduct.image} alt="Product" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h4 className="font-bold text-sm text-white mb-2">{currentProduct.name}</h4>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button 
                      key={s} 
                      onClick={() => setRating(s)}
                      className="transition-transform active:scale-125"
                    >
                      <Star 
                        size={24} 
                        className={cn(
                          "transition-all",
                          rating >= s ? "fill-gold text-gold" : "text-gray-700"
                        )} 
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 space-y-2 border border-white/5">
              <div className="flex justify-between text-[10px] uppercase font-bold text-gray-500">
                <span>Comissão</span>
                <span className="text-gold">+{rewardPerTask.toFixed(2)} MT</span>
              </div>
              <p className="text-xs text-gray-400">Ajude nossa empresa a ranquear melhor este produto em Moçambique e ganhe sua recompensa diária.</p>
            </div>

            <button
              onClick={handleComplete}
              disabled={completing || rating < 5}
              className={cn(
                "w-full py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-all transition-transform active:scale-95 shadow-lg",
                rating === 5 ? "gold-button" : "bg-white/5 text-gray-600 border border-white/10 cursor-not-allowed"
              )}
            >
              {completing ? "Enviando..." : "Concluir Avaliação"}
              <ArrowRight size={18} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Info Card */}
      <div className="glass-card p-4 border-gold/10 bg-gold/5">
        <div className="flex gap-3">
          <TrendingUp size={20} className="text-gold shrink-0" />
          <div>
            <h5 className="text-[10px] uppercase font-bold text-gold">Dica de Lucro</h5>
            <p className="text-[10px] text-gray-400 mt-0.5">Suba de nível VIP para desbloquear mais tarefas e aumentar seus ganhos diários. Cada nível libera mais produtos para avaliar.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
