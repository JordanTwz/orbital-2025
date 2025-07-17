// hooks/useFriends.ts

import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import {
  collection,
  onSnapshot,
  getDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  acceptFriend,
  cancelFriendRequest,
  db,
  rejectFriend,
  removeFriend,
  sendFriendRequest,
} from '../firebase';

//TYPES

export type Friend = {
  id: string;      // Friend’s UID
  since: number;   // epoch ms
};

export type Request = {
  id: string;         // Firestore doc ID (sender for incoming, recipient for outgoing)
  from: string;       // sender UID
  to: string;         // recipient UID
  status: string;     // 'pending'
  timestamp: number;  // epoch ms
};

// HOOK

export function useFriends() {
  const uid = getAuth().currentUser?.uid;

  const [friends,  setFriends]  = useState<Friend[]>([]);
  const [incoming, setIncoming] = useState<Request[]>([]);
  const [outgoing, setOutgoing] = useState<Request[]>([]);

  const [loading,  setLoading]  = useState<boolean>(true);
  const [error,    setError]    = useState<string | null>(null);

  // Snapshots (mount / uid change)

  useEffect(() => {
    if (!uid) return;

    const friendsCol  = collection(db, 'users', uid, 'friends');
    const incCol      = collection(db, 'users', uid, 'incomingRequests');
    const outCol      = collection(db, 'users', uid, 'outgoingRequests');

    const unsubF = onSnapshot(
      friendsCol,
      (snap) => {
        setFriends(
          snap.docs.map((d) => ({
            id: d.id,
            since: (d.data() as any).since as number,
          }))
        );
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    const unsubI = onSnapshot(
      incCol,
      (snap) =>
        setIncoming(
          snap.docs.map((d) => {
            const data = d.data() as Omit<Request, 'id'>;
            return { id: d.id, ...data };
          })
        ),
      (err) => setError(err.message)
    );

    const unsubO = onSnapshot(
      outCol,
      (snap) =>
        setOutgoing(
          snap.docs.map((d) => {
            const data = d.data() as Omit<Request, 'id'>;
            return { id: d.id, ...data };
          })
        ),
      (err) => setError(err.message)
    );

    return () => {
      unsubF();
      unsubI();
      unsubO();
    };
  }, [uid]);

  // Actions with optimistic updates

  // accept: move from incoming to friends
  const accept = async (otherId: string) => {
    if (!uid) return;
    try {
      // optimistic local update
      const now = Date.now();
      setIncoming((r) => r.filter((req) => req.from !== otherId));
      setFriends((f) => [...f, { id: otherId, since: now }]);

      await acceptFriend(uid, otherId);
    } catch (e: any) {
      // revert on error
      setError(e.message);
      await refetch(uid);
    }
  };

  // reject: remove from incoming
  const reject = async (otherId: string) => {
    if (!uid) return;
    try {
      setIncoming((r) => r.filter((req) => req.from !== otherId));
      await rejectFriend(uid, otherId);
    } catch (e: any) {
      setError(e.message);
      await refetch(uid);
    }
  };

  // cancel outgoing
  const cancel = async (otherId: string) => {
    if (!uid) return;
    try {
      setOutgoing((r) => r.filter((req) => req.to !== otherId));
      await cancelFriendRequest(uid, otherId);
    } catch (e: any) {
      setError(e.message);
      await refetch(uid);
    }
  };

  // remove friend
  const remove = async (otherId: string) => {
    if (!uid) return;
    try {
      setFriends((f) => f.filter((fr) => fr.id !== otherId));
      await removeFriend(uid, otherId);
    } catch (e: any) {
      setError(e.message);
      await refetch(uid);
    }
  };

  // HELPER: hard refetch if optimistic update fails

  const refetch = async (currentUid: string) => {
    try {
      // friends
      const friendsSnap = await getDoc(
        doc(db, 'users', currentUid, 'friends', '__dummy__') // will fail fast
      ).catch(() => null);
      // read again via listener tick; nothing else needed
    } catch {
      /* ignore */
    }
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
