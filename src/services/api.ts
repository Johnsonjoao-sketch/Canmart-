import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  serverTimestamp,
  increment,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { getMZDate } from '../lib/utils';

// Types
export interface UserProfile {
  uid: string;
  phone: string;
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalEarnings: number;
  referrerId?: string;
  referralCode: string;
  bankData?: {
    name: string;
    number: string;
    bank: string;
  };
  createdAt: any;
  lastTaskDate?: string;
  tasksCompletedToday?: number;
}

export interface InvestmentPlan {
  id: string;
  name: string;
  image: string;
  price: number;
  dailyIncome: number;
  duration: number; // in days
  type: 'vip' | 'special';
}

export interface Investment {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  amount: number;
  dailyReturn: number;
  startDate: any;
  expiryDate: any;
  status: 'active' | 'expired';
}

// Collections references
const usersRef = collection(db, 'users');
const investRef = collection(db, 'investments');
const transRef = collection(db, 'transactions');

export const VIP_PLANS: InvestmentPlan[] = [
  { id: 'panela_pressao', name: 'VIP 1 - Panela de Pressão', image: 'https://images.unsplash.com/photo-1584990344111-a82c4b036ca6?auto=format&fit=crop&q=80&w=400', price: 650, dailyIncome: 26, duration: 365, type: 'vip' },
  { id: 'conjunto_colheres', name: 'VIP 2 - Conjunto Colheres', image: 'https://images.unsplash.com/photo-1594385208974-2e73f69324aa?auto=format&fit=crop&q=80&w=400', price: 1200, dailyIncome: 48, duration: 365, type: 'vip' },
  { id: 'telefone_smart', name: 'VIP 3 - Smartphone', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=400', price: 2500, dailyIncome: 100, duration: 365, type: 'vip' },
  { id: 'tigelas_vidro', name: 'VIP 4 - Conjunto Tigelas', image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=400', price: 5000, dailyIncome: 200, duration: 365, type: 'vip' },
  { id: 'liquidificador', name: 'VIP 5 - Liquidificador', image: 'https://images.unsplash.com/photo-1585238341267-1cfec2046a55?auto=format&fit=crop&q=80&w=400', price: 10000, dailyIncome: 400, duration: 365, type: 'vip' },
  { id: 'microondas', name: 'VIP 6 - Micro-ondas', image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&q=80&w=400', price: 25000, dailyIncome: 1000, duration: 365, type: 'vip' },
  { id: 'geladeira', name: 'VIP 7 - Frigorífico', image: 'https://images.unsplash.com/photo-1571175432247-497cc3f5979d?auto=format&fit=crop&q=80&w=400', price: 50000, dailyIncome: 2000, duration: 365, type: 'vip' },
];

export const SPECIAL_PRODUCT: InvestmentPlan = {
  id: 'kit_cozinha',
  name: 'Kit Cozinha Especial',
  image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=400',
  price: 2000,
  dailyIncome: 80,
  duration: 365,
  type: 'special'
};

export const api = {
  getUser: async (uid: string) => {
    const d = await getDoc(doc(usersRef, uid));
    return d.exists() ? d.data() as UserProfile : null;
  },

  createUserProfile: async (uid: string, phone: string, inviteCode?: string) => {
    let referrerId = null;
    
    if (inviteCode) {
      try {
        const q = query(usersRef, where('referralCode', '==', inviteCode.trim().toUpperCase()));
        const snap = await getDocs(q);
        if (!snap.empty) {
          referrerId = snap.docs[0].id;
        }
      } catch (err) {
        console.error('Error resolving referral code:', err);
      }
    }

    const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const profile: any = {
      uid,
      phone,
      balance: 0,
      totalDeposited: 0,
      totalWithdrawn: 0,
      totalEarnings: 0,
      referralCode,
      createdAt: serverTimestamp()
    };

    if (referrerId) {
      profile.referrerId = referrerId;
    }

    await setDoc(doc(usersRef, uid), profile);
    return profile as UserProfile;
  },

  updateBankData: async (uid: string, data: UserProfile['bankData']) => {
    await updateDoc(doc(usersRef, uid), { bankData: data });
  },

  getInvestments: (userId: string, callback: (investments: any[]) => void) => {
    return onSnapshot(query(investRef, where('userId', '==', userId), where('status', '==', 'active')), (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  },

  completeTask: async (userId: string, amount: number) => {
    const userRef = doc(usersRef, userId);
    const today = new Date().toISOString().split('T')[0];

    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;
    
    const profile = userSnap.data() as UserProfile;
    const isNewDay = profile.lastTaskDate !== today;
    
    await updateDoc(userRef, {
      balance: increment(amount),
      totalEarnings: increment(amount),
      lastTaskDate: today,
      tasksCompletedToday: isNewDay ? 1 : increment(1)
    });

    await addDoc(transRef, {
      userId,
      type: 'profit',
      amount: amount,
      method: 'TASK_REWARD',
      status: 'completed',
      createdAt: serverTimestamp()
    });
  },

  buyPlan: async (userId: string, plan: InvestmentPlan) => {
    const userDoc = await api.getUser(userId);
    if (!userDoc || userDoc.balance < plan.price) throw new Error('Saldo insuficiente');

    // Check if this is the first investment
    const q = query(investRef, where('userId', '==', userId));
    const existingSnap = await getDocs(q);
    const isFirstInvestment = existingSnap.empty;

    // Deduct balance
    await updateDoc(doc(usersRef, userId), { balance: increment(-plan.price) });

    // Create investment
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + plan.duration);

    await addDoc(investRef, {
      userId,
      planId: plan.id,
      planName: plan.name,
      amount: plan.price,
      dailyReturn: plan.dailyIncome,
      startDate: serverTimestamp(),
      expiryDate: expiry,
      lastCreditDate: serverTimestamp(),
      status: 'active'
    });

    // Handle Referral Commissions (A:25%, B:2%, C:1%) - ONLY ON FIRST INVESTMENT
    if (isFirstInvestment && userDoc.referrerId) {
      // Level A (25%)
      const referrerA = await api.getUser(userDoc.referrerId);
      if (referrerA) {
        const bonusA = plan.price * 0.25;
        await updateDoc(doc(usersRef, referrerA.uid), { balance: increment(bonusA) });
        
        // Level B (2%)
        if (referrerA.referrerId) {
          const referrerB = await api.getUser(referrerA.referrerId);
          if (referrerB) {
            const bonusB = plan.price * 0.02;
            await updateDoc(doc(usersRef, referrerB.uid), { balance: increment(bonusB) });
            
            // Level C (1%)
            if (referrerB.referrerId) {
              const referrerC = await api.getUser(referrerB.referrerId);
              if (referrerC) {
                const bonusC = plan.price * 0.01;
                await updateDoc(doc(usersRef, referrerC.uid), { balance: increment(bonusC) });
              }
            }
          }
        }
      }
    }
  },

  deposit: async (userId: string, amount: number, method: string, proofUrl: string) => {
    await addDoc(transRef, {
      userId,
      type: 'deposit',
      amount,
      method,
      status: 'pending',
      proofImageUrl: proofUrl,
      createdAt: serverTimestamp()
    });
  },

  withdraw: async (userId: string, amount: number, method: string, number: string) => {
    const user = await api.getUser(userId);
    if (!user || user.balance < amount) throw new Error('Saldo insuficiente');

    // Deduct balance immediately
    await updateDoc(doc(usersRef, userId), { balance: increment(-amount) });

    await addDoc(transRef, {
      userId,
      type: 'withdrawal',
      amount,
      method,
      targetNumber: number,
      status: 'pending',
      createdAt: serverTimestamp()
    });
  },

  getTransactions: (userId: string, callback: (txs: any[]) => void) => {
    return onSnapshot(query(transRef, where('userId', '==', userId)), (snap) => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }
};
