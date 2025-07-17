import React, { useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView,
  FlatList,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import {
  collectionGroup,
  onSnapshot,
  query,
  where,
  orderBy,
  doc,
  getDoc,
} from 'firebase/firestore';
import { likeMealLog, unlikeMealLog, db } from '../firebase';
import { useFriends } from '../hooks/useFriends';
import { AppTheme } from '../theme';

export default function PublicFeedScreen() {
  const uid = getAuth().currentUser!.uid;
  const { friends } = useFriends();

  const [feeds, setFeeds] = useState<any[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  /* ─────────────────────────────────────────
     Subscribe whenever the friend list changes
  ──────────────────────────────────────────*/
  useEffect(() => {
    if (friends.length === 0) {
      setFeeds([]);
      return;
    }

    const q = query(
      collectionGroup(db, 'mealLogs'),
      where('isPublic', '==', true),
      where(
        'ownerUid',
        'in',
        friends.map((f) => f.id)
      ),
      orderBy('timestamp', 'desc')
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((d) => ({
          id: d.id,
          ownerUid: d.ref.parent.parent!.id,
          ...(d.data() as any),
        }));
        setFeeds(items);
        setError(null);

        /* Fetch each owner’s name once */
        items.forEach((item) => {
          if (!names[item.ownerUid]) {
            getDoc(doc(db, 'users', item.ownerUid))
              .then((s) => {
                const u = (s.data() as any) || {};
                setNames((n) => ({
                  ...n,
                  [item.ownerUid]: u.displayName ?? u.email ?? item.ownerUid,
                }));
              })
              .catch(console.error);
          }
        });
      },
      (err) => {
        console.error('Public feed listener error:', err);
        setError('Could not load public feed.');
        setFeeds([]);
      }
    );

    return unsub;
  }, [friends]); // ← only depends on friends

  /* ─────────────────────────────────────────
     Like / Unlike handler (no local mutation)
  ──────────────────────────────────────────*/
  const toggleLike = useCallback(
    async (item: any) => {
      const hasLiked = item.likes.includes(uid);
      if (hasLiked) {
        await unlikeMealLog(item.ownerUid, item.id, uid);
      } else {
        await likeMealLog(item.ownerUid, item.id, uid);
      }
    },
    [uid]
  );

  /* ─────────────────────────────────────────
     Render one feed card
  ──────────────────────────────────────────*/
  const renderItem = ({ item }: { item: any }) => {
    const ownerName = names[item.ownerUid] || item.ownerUid;
    const hasLiked = item.likes.includes(uid);

    return (
      <View style={styles.card}>
        <Text style={styles.owner}>{ownerName}</Text>
        <Text style={styles.summary}>
          {item.description} — {item.totalCalories} kcal
        </Text>

        <TouchableOpacity onPress={() => toggleLike(item)}>
          <Text style={styles.likeText}>
            {hasLiked ? '💔 Unlike' : '❤️ Like'} ({item.likes.length})
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  /* ─────────────────────────────────────────
     UI
  ──────────────────────────────────────────*/
  if (error) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={feeds}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={!feeds.length && styles.center}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No public posts yet.</Text>
        }
      />
    </SafeAreaView>
  );
}

/* ─────────────────────────────────────────
   Styles
──────────────────────────────────────────*/
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppTheme.colors.background },
  card: {
    backgroundColor: AppTheme.colors.card,
    padding: AppTheme.spacing.md,
    margin: AppTheme.spacing.sm,
    borderRadius: AppTheme.roundness,
    elevation: 1,
  },
  owner: {
    fontWeight: '600',
    marginBottom: AppTheme.spacing.xs,
    color: AppTheme.colors.text,
  },
  summary: {
    fontSize: AppTheme.typography.body,
    marginBottom: AppTheme.spacing.sm,
    color: AppTheme.colors.text,
  },
  likeText: {
    fontSize: AppTheme.typography.body,
    color: AppTheme.colors.primary,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: AppTheme.typography.body,
    color: AppTheme.colors.text,
  },
  errorText: {
    fontSize: AppTheme.typography.body,
    color: AppTheme.colors.notification,
    textAlign: 'center',
  },
});
