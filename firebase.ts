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
    getFireStore,
    doc,
    setDoc,
    updateDoc,
    arrayUnion,
    ArrayRemove,
    getDoc
    } from 'firebase/firestore'

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
const db = getFirestore(app);

export function register(email: string, password: string) {
  const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredentials.user;

  await createUserDocument(user.uid);

  return user;
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

export async function sendFriendRequest(senderId: string, receiverId: string) {
    const senderRef = doc(db, "users", senderId);
    const receiverRef = doc(db, "users", receiverId);

    await updateDoc(senderRef, {
        outgoingRequests: arrayUnion(receiverId)
        });

    await updateDoc(receiverRef, {incomingRequests: arrayUnion(senderId)
        });
    }

export async function acceptFriendRequest(currentUserId: string, requesterId: string) {
    const currentUserRef = doc(db, "users", currentUserId);
    const requesterRef = doc(db, "users", requesterId);

    await updateDoc(currentUserRef, {
        incomingRequests: arrayRemove(requesterId),
        friends; arrayUnion(requesterId)
        });

    await updateDoc(requesterRef, {
        outgoingRequests: arrayRemove(currentUserId),
        friends; arrayUnion(currentUserId)
        });
    }

export async function getFriends(userId: string) {
    const userDoc = getDoc(doc(db, "users", userId));

    if(userDoc.exists()) {
        return userDoc.data().friends || [];
        }
    return [];
    }

export async function createUserDocument(userId: string) {
    const userRef = doc(db, "users", userId);

    await setDoc(userRef, {
        friends: [],
        incomingRequests: [],
        outgoingRequests: []
        });
    }
