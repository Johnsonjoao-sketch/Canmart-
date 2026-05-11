import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { api } from '../services/api';
import { auth } from '../lib/firebase';
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ChevronLeft
} from 'lucide-react';
import { formatMZTime } from '../lib/utils';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

export const Transactions = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'deposit' | 'withdrawal' | 'profit'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const unsub = api.getTransactions(userId, (data) => {
      // Sort by createdAt descending
      const sorted = data.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });
      setTransactions(sorted);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    return tx.type === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 size={16} className="text-green-500" />;
      case 'pending':
        return <Clock size={16} className="text-yellow-500" />;
      case 'rejected':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <AlertCircle size={16} className="text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'pending': return 'Pendente';
      case 'rejected': return 'Rejeitado';
      default: return status;
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <header className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 bg-white/5 rounded-xl border border-white/10 text-gray-400"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-xl font-display font-bold gold-text">Histórico de Transações</h2>
      </header>

      {/* Filters */}
      <div className="flex gap-2 bg-white/5 p-1 rounded-2xl border border-white/10 overflow-x-auto scrollbar-hide">
        {[
          { id: 'all', label: 'Todos' },
          { id: 'deposit', label: 'Depósitos' },
          { id: 'withdrawal', label: 'Saques' },
          { id: 'profit', label: 'Bónus' }
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => setFilter(btn.id as any)}
            className={cn(
              "flex-1 py-2 text-xs font-bold rounded-xl transition-all",
              filter === btn.id ? "bg-gold text-black shadow-lg" : "text-gray-500 hover:text-white"
            )}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center pt-20 gap-4">
          <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Carregando transações...</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center pt-20 text-center px-10">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-gray-600 mb-4">
            <History size={32} />
          </div>
          <p className="text-gray-400 font-medium">Nenhuma transação encontrada</p>
          <p className="text-xs text-gray-600 mt-1">Suas atividades de depósito e saque aparecerão aqui.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map((tx, i) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-4 flex items-center gap-4 border-white/5"
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                tx.type === 'deposit' ? "bg-green-500/10 text-green-500" : 
                tx.type === 'withdrawal' ? "bg-gold/10 text-gold" : "bg-blue-500/10 text-blue-500"
              )}>
                {tx.type === 'deposit' ? <ArrowDownCircle size={24} /> : 
                 tx.type === 'withdrawal' ? <ArrowUpCircle size={24} /> : <CheckCircle2 size={24} />}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-sm truncate">
                    {tx.type === 'deposit' ? 'Depósito' : 
                     tx.type === 'withdrawal' ? 'Saque' : 'Prémio de Tarefa'} {tx.method}
                  </h4>
                  <p className={cn(
                    "text-sm font-display font-bold",
                    tx.type === 'deposit' || tx.type === 'profit' ? "text-green-500" : "text-gold"
                  )}>
                    {tx.type === 'deposit' || tx.type === 'profit' ? '+' : '-'}{tx.amount.toFixed(2)} MT
                  </p>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                    <Clock size={12} />
                    <span>{tx.createdAt ? formatMZTime(tx.createdAt) : 'Pendente...'}</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    {getStatusIcon(tx.status)}
                    <span className={cn(
                      "text-[10px] font-bold uppercase",
                      tx.status === 'completed' ? "text-green-500" : 
                      tx.status === 'pending' ? "text-yellow-500" : "text-red-500"
                    )}>
                      {getStatusText(tx.status)}
                    </span>
                  </div>
                </div>

                {tx.targetNumber && (
                  <p className="text-[10px] text-gray-600 mt-2 bg-white/5 py-1 px-2 rounded-lg inline-block">
                    Para: {tx.targetNumber}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
