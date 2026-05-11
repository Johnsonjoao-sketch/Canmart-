import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  increment, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from './api';

export const earningsService = {
  processUserEarnings: async (userId: string) => {
    const investRef = collection(db, 'investments');
    const userRef = doc(db, 'users', userId);

    // Get active investments
    const q = query(investRef, where('userId', '==', userId), where('status', '==', 'active'));
    const snap = await getDocs(q);

    if (snap.empty) return;

    let totalToCredit = 0;
    const now = new Date();

    for (const d of snap.docs) {
      const data = d.data();
      const lastCredit = data.lastCreditDate instanceof Timestamp ? data.lastCreditDate.toDate() : new Date(data.lastCreditDate);
      
      // Calculate how many 24h periods have passed
      const diffMs = now.getTime() - lastCredit.getTime();
      const periods = Math.floor(diffMs / (24 * 60 * 60 * 1000));

      if (periods > 0) {
        const earnings = periods * data.dailyReturn;
        totalToCredit += earnings;

        // Update lastCreditDate to reflect the credited periods
        const newCreditDate = new Date(lastCredit.getTime() + periods * 24 * 60 * 60 * 1000);
        await updateDoc(doc(investRef, d.id), {
          lastCreditDate: Timestamp.fromDate(newCreditDate)
        });
      }
    }

    if (totalToCredit > 0) {
      await updateDoc(userRef, {
        balance: increment(totalToCredit)
      });
      console.log(`Credited ${totalToCredit} MT to user ${userId}`);
    }
  }
};
