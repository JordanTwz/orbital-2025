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

import {
  getFirestore,
  collection,
  collectionGroup,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  where,
  arrayUnion,
  arrayRemove,
  writeBatch,
} from 'firebase/firestore';

// Firebase App & Firestore

const firebaseConfig = {
  apiKey:            'AIzaSyDB0LQru_C36-S07Zfk0D470F1czxJ6XUg',
  authDomain:        'mealcraft-fdfec.firebaseapp.com',
  projectId:         'mealcraft-fdfec',
  storageBucket:     'mealcraft-fdfec.appspot.com',
  messagingSenderId: '917444169063',
  appId:             '1:917444169063:web:c92ed7364cc7abd71bf3c2',
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// Auth helpers

export async function register(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  const cred       = await createUserWithEmailAndPassword(auth, normalized, password);
  const uid        = cred.user.uid;

  await setDoc(doc(db, 'users', uid), {
    email: normalized,
    createdAt: Date.now(),
  });
  return cred.user;
}

export function login(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
}

export function logout() {
  return signOut(auth);
}

export function subscribeToAuthChanges(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

// Meal-log CRUD + likes / privacy

export async function addMealLog(uid: string, log: any) {
  const ref = collection(db, 'users', uid, 'mealLogs');
  return addDoc(ref, {
    ...log,
    ownerUid: uid,
    isPublic: false,
    likes: [] as string[],
  });
}

export async function getMealLogs(uid: string) {
  const ref  = collection(db, 'users', uid, 'mealLogs');
  const q    = query(ref, orderBy('timestamp', 'desc'));
  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ownerUid: uid,
    ...(d.data() as any),
  }));
}

export async function updateMealLog(uid: string, id: string, updates: any) {
  return updateDoc(doc(db, 'users', uid, 'mealLogs', id), updates);
}

export async function deleteMealLog(uid: string, id: string) {
  return deleteDoc(doc(db, 'users', uid, 'mealLogs', id));
}

export async function setMealPrivacy(ownerUid: string, id: string, isPublic: boolean) {
  return updateDoc(doc(db, 'users', ownerUid, 'mealLogs', id), { isPublic });
}

export async function likeMealLog(ownerUid: string, id: string, likerUid: string) {
  return updateDoc(doc(db, 'users', ownerUid, 'mealLogs', id), {
    likes: arrayUnion(likerUid),
  });
}

export async function unlikeMealLog(ownerUid: string, id: string, likerUid: string) {
  return updateDoc(doc(db, 'users', ownerUid, 'mealLogs', id), {
    likes: arrayRemove(likerUid),
  });
}

/* Query friends' public meal logs (feed) */
export async function getPublicMealLogs(currentUid: string) {
  const friendsSnap = await getDocs(collection(db, 'users', currentUid, 'friends'));
  const friendIds   = friendsSnap.docs.map((d) => d.id);
  if (!friendIds.length) return [];

  const logsQ = query(
    collectionGroup(db, 'mealLogs'),
    where('isPublic', '==', true),
    where('ownerUid', 'in', friendIds),
    orderBy('timestamp', 'desc')
  );

  const snap = await getDocs(logsQ);
  return snap.docs.map((d) => ({
    id: d.id,
    ownerUid: d.ref.parent.parent!.id,
    ...(d.data() as any),
  }));
}

// Friends and Requests

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

export async function sendFriendRequest(uid: string, friendUid: string) {
  const outgoing = doc(db, 'users', uid,       'outgoingRequests', friendUid);
  const incoming = doc(db, 'users', friendUid, 'incomingRequests', uid);

  const data = {
    from: uid,
    to: friendUid,
    status: 'pending',
    timestamp: Date.now(),
  };

  await setDoc(outgoing, data);
  await setDoc(incoming, data);
}

// atomic accept with writeBatch

export async function acceptFriend(uid: string, friendUid: string) {
  const batch = writeBatch(db);

  const incoming = doc(db, 'users', uid,       'incomingRequests', friendUid);
  const outgoing = doc(db, 'users', friendUid, 'outgoingRequests', uid);
  const me       = doc(db, 'users', uid,       'friends',          friendUid);
  const them     = doc(db, 'users', friendUid, 'friends',          uid);

  const since = Date.now();

  batch.set(me,   { since });
  batch.set(them, { since });
  batch.delete(incoming);
  batch.delete(outgoing);

  await batch.commit();  // all-or-nothing
}

export async function rejectFriend(uid: string, friendUid: string) {
  await deleteDoc(doc(db, 'users', uid,       'incomingRequests', friendUid));
  await deleteDoc(doc(db, 'users', friendUid, 'outgoingRequests', uid));
}

export async function cancelFriendRequest(uid: string, friendUid: string) {
  await deleteDoc(doc(db, 'users', uid,       'outgoingRequests', friendUid));
  await deleteDoc(doc(db, 'users', friendUid, 'incomingRequests', uid));
}

export async function removeFriend(uid: string, friendUid: string) {
  await deleteDoc(doc(db, 'users', uid,       'friends', friendUid));
  await deleteDoc(doc(db, 'users', friendUid, 'friends', uid));
}

export async function getFriends(uid: string) {
  const col   = collection(db, 'users', uid, 'friends');
  const snap  = await getDocs(col);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

export { db };
