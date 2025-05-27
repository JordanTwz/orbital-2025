// firebase.ts
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDB0LQru_C36-S07Zfk0D470F1czxJ6XUg',
  authDomain: 'mealcraft-fdfec.firebaseapp.com',
  projectId: 'mealcraft-fdfec',
  storageBucket: 'mealcraft-fdfec.appspot.com',
  messagingSenderId: '917444169063',
  appId: '1:917444169063:web:c92ed7364cc7abd71bf3c2',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export function register(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function login(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logout() {
  return signOut(auth);
}

export function subscribeToAuthChanges(
  callback: (user: User | null) => void
) {
  return onAuthStateChanged(auth, callback);
}
