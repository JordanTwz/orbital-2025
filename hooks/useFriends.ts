// hooks/useFriends.ts
import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, onSnapshot } from 'firebase/firestore';
import {
  acceptFriend,
  cancelFriendRequest,
  db,
  rejectFriend,
  removeFriend
} from '../firebase';

export type Friend = {
  id: string;      // Firestore doc ID
  since: number;   // timestamp when friendship was established
};

export type Request = {
  id: string;         // Firestore doc ID
  from: string;       // sender UID
  to: string;         // recipient UID
  status: string;     // e.g. "pending"
  timestamp: number;  // when request was sent
};

export function useFriends() {
  const uid = getAuth().currentUser?.uid;
  const [friends, setFriends]   = useState<Friend[]>([]);
  const [incoming, setIncoming] = useState<Request[]>([]);
  const [outgoing, setOutgoing] = useState<Request[]>([]);
  const [loading, setLoading]   = useState<boolean>(true);
  const [error, setError]       = useState<string|null>(null);

  useEffect(() => {
    if (!uid) return;

    const friendsCol = collection(db, 'users', uid, 'friends');
    const incCol = collection(db, 'users', uid, 'incomingRequests');
    const outCol = collection(db, 'users', uid, 'outgoingRequests');

    const unsubF = onSnapshot(
      friendsCol,
      snap => {
        setFriends(
          snap.docs.map(d => ({
            id: d.id,
            since: (d.data() as any).since as number,
          }))
        );
        setLoading(false);
      },
      err => {
        setError(err.message);
        setLoading(false);
      }
    );

    const unsubI = onSnapshot(
      incCol,
      snap => {
        setIncoming(
          snap.docs.map(d => {
            const data = d.data() as Omit<Request, 'id'>;
            return {
              id: d.id,
              from: data.from,
              to: data.to,
              status: data.status,
              timestamp: data.timestamp,
            };
          })
        );
      },
      err => setError(err.message)
    );

    const unsubO = onSnapshot(
      outCol,
      snap => {
        setOutgoing(
          snap.docs.map(d => {
            const data = d.data() as Omit<Request, 'id'>;
            return {
              id: d.id,
              from: data.from,
              to: data.to,
              status: data.status,
              timestamp: data.timestamp,
            };
          })
        );
      },
      err => setError(err.message)
    );

    return () => {
      unsubF();
      unsubI();
      unsubO();
    };
  }, [uid]);

  const accept = async (otherId: string) => {
    if (!uid) return;
    await acceptFriend(uid, otherId);
  };
  const reject = async (otherId: string) => {
    if (!uid) return;
    await rejectFriend(uid, otherId);
  };
  const cancel = async (otherId: string) => {
    if (!uid) return;
    await cancelFriendRequest(uid, otherId);
  };
  const remove = async (otherId: string) => {
    if (!uid) return;
    await removeFriend(uid, otherId);
  };

  return {
    friends,
    incoming,
    outgoing,
    loading,
    error,
    accept,
    reject,
    cancel,
    remove,
  };
}
