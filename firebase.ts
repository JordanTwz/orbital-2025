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
  orderBy,
  doc,
  setDoc,
  deleteDoc} from 'firebase/firestore';

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

/**
 *
 * @param uid
 * @param friendUid
 * Sends a request from uid to friendUid
 */
export async function addFriend(uid: string, friendUid: string) {
  const outgoingRef = doc(db, 'users', uid, 'outgoingRequests', friendUid);
  const incomingRef = doc(db, 'users', friendUid, 'incomingRequests', uid);

  const requestData = {
    from: uid,
    to: friendUid,
    status: 'pending',
    timestamp: Date.now(),
  };

  await setDoc(outgoingRef, requestData);
  await setDoc(incomingRef, requestData);

}

/**
 * Accept a friend request
 */
export async function acceptFriend(uid: string, friendUid: string) {
  const incomingRef = doc(db, 'users', friendUid, 'incomingRequests', uid);
  const outgoingRef = doc(db, 'users', uid, 'outgoingRequests', friendUid);

  const myFriendRef = doc(db, 'users', uid, 'friends', friendUid);
  const theirFriendRef = doc(db, 'users', friendUid, 'friends', uid);
  //Add to friends for both users
  await setDoc(myFriendRef, {
    uid: friendUid,
    since: Date.now(),
  });
  await setDoc(theirFriendRef, {
    uid: uid,
    since: Date.now(),
  })
  //Remove the friend requests
  await deleteDoc(incomingRef);
  await deleteDoc(outgoingRef);

}

/**
 * Get list of current friends
 */

export async function getFriends(uid: string) {
  const myFriendsRef = collection(db, 'users', uid, 'friends');
  const snap = await getDocs(myFriendsRef);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Get incoming friend requests
 */
export async function getIncomingRequests(uid: string) {
  const incomingRef = collection(db, 'users', uid, 'incomingRequests');
  const snap = await getDocs(incomingRef);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}