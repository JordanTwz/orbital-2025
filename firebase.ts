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
  updateDoc,
  deleteDoc,
  where
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

/** Register a new user and store their email lowercased */
export async function register(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  const userCred   = await createUserWithEmailAndPassword(auth, normalized, password);
  const uid        = userCred.user.uid;
  await setDoc(doc(db, 'users', uid), {
    email: normalized,
    createdAt: Date.now(),
  });
  return userCred.user;
}

/** Sign in existing user */
export function login(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
}

/** Sign out current user */
export function logout() {
  return signOut(auth);
}

/** Subscribe to auth state changes */
export function subscribeToAuthChanges(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/* -------------------------------------------------------------------------- */
/*                          Meal-log helpers (unchanged)                      */
/* -------------------------------------------------------------------------- */

export async function addMealLog(uid: string, log: any) {
  const colRef = collection(db, 'users', uid, 'mealLogs');
  return addDoc(colRef, log);
}
export async function getMealLogs(uid: string) {
  const colRef = collection(db, 'users', uid, 'mealLogs');
  const q      = query(colRef, orderBy('timestamp', 'desc'));
  const snap   = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
}
export async function updateMealLog(uid: string, id: string, updates: any) {
  const docRef = doc(db, 'users', uid, 'mealLogs', id);
  return updateDoc(docRef, updates);
}
export async function deleteMealLog(uid: string, id: string) {
  const docRef = doc(db, 'users', uid, 'mealLogs', id);
  return deleteDoc(docRef);
}

/* -------------------------------------------------------------------------- */
/*                        Friend-request helpers                              */
/* -------------------------------------------------------------------------- */

export function getUID() {
  return auth.currentUser?.uid;
}

export async function sendFriendRequest(uid: string, friendUid: string) {
  const outgoingRef = doc(db, 'users', uid, 'outgoingRequests', friendUid);
  const incomingRef = doc(db, 'users', friendUid, 'incomingRequests', uid);
  const requestData = { from: uid, to: friendUid, status: 'pending', timestamp: Date.now() };
  await setDoc(outgoingRef, requestData);
  await setDoc(incomingRef, requestData);
}

export async function acceptFriend(uid: string, friendUid: string) {
  const incomingRef   = doc(db, 'users', uid, 'incomingRequests', friendUid);
  const outgoingRef   = doc(db, 'users', friendUid, 'outgoingRequests', uid);
  const myFriendRef    = doc(db, 'users', uid, 'friends', friendUid);
  const theirFriendRef = doc(db, 'users', friendUid, 'friends', uid);
  await setDoc(myFriendRef,    { since: Date.now() });
  await setDoc(theirFriendRef, { since: Date.now() });
  await deleteDoc(incomingRef);
  await deleteDoc(outgoingRef);
}

export async function rejectFriend(uid: string, friendUid: string) {
  const incomingRef = doc(db, 'users', uid, 'incomingRequests', friendUid);
  const outgoingRef = doc(db, 'users', friendUid, 'outgoingRequests', uid);
  await deleteDoc(incomingRef);
  await deleteDoc(outgoingRef);
}

export async function cancelFriendRequest(uid: string, friendUid: string) {
  const outgoingRef = doc(db, 'users', uid, 'outgoingRequests', friendUid);
  const incomingRef = doc(db, 'users', friendUid, 'incomingRequests', uid);
  await deleteDoc(outgoingRef);
  await deleteDoc(incomingRef);
}

export async function removeFriend(uid: string, friendUid: string) {
  const myFriendRef    = doc(db, 'users', uid, 'friends', friendUid);
  const theirFriendRef = doc(db, 'users', friendUid, 'friends', uid);
  await deleteDoc(myFriendRef);
  await deleteDoc(theirFriendRef);
}

export async function getFriends(uid: string) {
  const colRef = collection(db, 'users', uid, 'friends');
  const snap   = await getDocs(colRef);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
}

export async function getIncomingRequests(uid: string) {
  const colRef = collection(db, 'users', uid, 'incomingRequests');
  const snap   = await getDocs(colRef);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
}

export async function getOutgoingRequests(uid: string) {
  const colRef = collection(db, 'users', uid, 'outgoingRequests');
  const snap   = await getDocs(colRef);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
}

export async function searchUserByEmail(email: string) {
  const usersRef = collection(db, 'users');
  const q        = query(usersRef, where('email', '==', email));
  const snap     = await getDocs(q);
  if (!snap.empty) {
    const docSnap = snap.docs[0];
    return { id: docSnap.id, ...(docSnap.data() as any) };
  }
  return null;
}

// **ADD THIS LINE** so other modules can import your Firestore instance:
export { db };
