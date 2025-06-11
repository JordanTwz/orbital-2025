// firebase.ts
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  User
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDB0LQru_C36-S07Zfk0D470F1czxJ6XUg',
  authDomain: 'mealcraft-fdfec.firebaseapp.com',
  projectId: 'mealcraft-fdfec',
  storageBucket: 'mealcraft-fdfec.appspot.com',
  messagingSenderId: '917444169063',
  appId: '1:917444169063:web:c92ed7364cc7abd71bf3c2',
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

export function register(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function login(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logout() {
  return signOut(auth);
}

export function subscribeToAuthChanges(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ——— Firestore helpers ———

/**
 * Add a meal log under users/{uid}/mealLogs
 */
export async function addMealLog(
  uid: string,
  log: {
    description: string;
    totalCalories: number;
    dishes: {
      name: string;
      calories: number;
      macros: { carbs: number; fats: number; proteins: number };
    }[];
    timestamp: number;
  }
) {
  const colRef = collection(db, 'users', uid, 'mealLogs');
  return addDoc(colRef, log);
}

/**
 * Fetch all meal logs for a user, ordered by timestamp desc
 */
export async function getMealLogs(uid: string) {
  const colRef = collection(db, 'users', uid, 'mealLogs');
  const q      = query(colRef, orderBy('timestamp', 'desc'));
  const snap   = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
