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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// Authentication

export async function register(email: string, password: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const userRef = userCredential.user;

  await setDoc(doc(db, 'users', userRef.uid), {
    email: userRef.email,
    createdAt: Date.now(),
  });

  return userRef;
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

// — Meal-history helpers —

// Add a meal log under users/{uid}/mealLogs
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

// Fetch all meal logs for a user, ordered by timestamp desc
export async function getMealLogs(uid: string) {
  const colRef = collection(db, 'users', uid, 'mealLogs');
  const q      = query(colRef, orderBy('timestamp', 'desc'));
  const snap   = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Update an existing meal log
export async function updateMealLog(
  uid: string,
  id: string,
  updates: Partial<{
    description: string;
    totalCalories: number;
    dishes: {
      name: string;
      calories: number;
      macros: { carbs: number; fats: number; proteins: number };
    }[];
    timestamp: number;
  }>
) {
  const docRef = doc(db, 'users', uid, 'mealLogs', id);
  return updateDoc(docRef, updates);
}

// Delete a meal log
export async function deleteMealLog(uid: string, id: string) {
  const docRef = doc(db, 'users', uid, 'mealLogs', id);
  return deleteDoc(docRef);
}

// — Friend-request helpers —


/**
 * Get UID of User
 */
export function getUID() {
  return getAuth().currentUser?.uid;
}
/**
 * Send a friend request from uid → friendUid
 */
export async function sendFriendRequest(uid: string, friendUid: string) {
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
  const incomingRef   = doc(db, 'users', friendUid, 'incomingRequests', uid);
  const outgoingRef   = doc(db, 'users', uid, 'outgoingRequests', friendUid);
  const myFriendRef   = doc(db, 'users', uid, 'friends', friendUid);
  const theirFriendRef = doc(db, 'users', friendUid, 'friends', uid);

  await setDoc(myFriendRef, {
    uid: friendUid,
    since: Date.now(),
  });
  await setDoc(theirFriendRef, {
    uid: uid,
    since: Date.now(),
  });
  await deleteDoc(incomingRef);
  await deleteDoc(outgoingRef);
}

/**
 * Reject a friend request
 */
export async function rejectFriend(uid: string, friendUid: string) {
  const incomingRef = doc(db, 'users', friendUid, 'incomingRequests', uid);
  const outgoingRef = doc(db, 'users', uid, 'outgoingRequests', friendUid);

  await deleteDoc(incomingRef);
  await deleteDoc(outgoingRef);
}

/**
 * Cancel a sent friend request
 */
export async function cancelFriendRequest(uid: string, friendUid: string) {
  const outgoingRef = doc(db, 'users', uid, 'outgoingRequests', friendUid);
  const incomingRef = doc(db, 'users', friendUid, 'incomingRequests', uid);

  await deleteDoc(outgoingRef);
  await deleteDoc(incomingRef);
}

/**
 * Remove a friend (unfriend)
 */
export async function removeFriend(uid: string, friendUid: string) {
  const myFriendRef    = doc(db, 'users', uid, 'friends', friendUid);
  const theirFriendRef = doc(db, 'users', friendUid, 'friends', uid);

  await deleteDoc(myFriendRef);
  await deleteDoc(theirFriendRef);
}

/**
 * List current friends
 */
export async function getFriends(uid: string) {
  const myFriendsRef = collection(db, 'users', uid, 'friends');
  const snap         = await getDocs(myFriendsRef);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * List incoming friend requests
 */
export async function getIncomingRequests(uid: string) {
  const incomingRef = collection(db, 'users', uid, 'incomingRequests');
  const snap        = await getDocs(incomingRef);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * List outgoing friend requests
 */
export async function getOutgoingRequests(uid: string) {
  const outgoingRef = collection(db, 'users', uid, 'outgoingRequests');
  const snap        = await getDocs(outgoingRef);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Look up user by UID
 */
export async function searchUserByEmail(email: string) {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('email', '==', email.trim().toLowerCase()));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  return null;
}
