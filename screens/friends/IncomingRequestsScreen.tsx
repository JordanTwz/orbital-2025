// screens/friends/IncomingRequestsScreen.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { useFriends, Request } from '../../hooks/useFriends';
import { db } from '../../firebase';
import { AppTheme } from '../../theme';
import { Card } from '../../components/Card';

export default function IncomingRequestsScreen() {
  const { incoming, loading, error, accept, reject } = useFriends();
  const [names, setNames] = useState<Record<string,string>>({});

  useEffect(() => {
    incoming.forEach(req => {
      if (!names[req.from]) {
        getDoc(doc(db, 'users', req.from))
          .then(snap => {
            const d = snap.data();
            setNames(n => ({
              ...n,
              [req.from]: d?.displayName ?? d?.email ?? 'Unknown'
            }));
          })
          .catch(console.error);
      }
    });
  }, [incoming]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={AppTheme.colors.primary} />
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={incoming}
      contentContainerStyle={incoming.length ? undefined : styles.center}
      keyExtractor={item => item.id}
      ListEmptyComponent={<Text style={styles.emptyText}>No incoming requests.</Text>}
      renderItem={({ item }: { item: Request }) => (
        <Card>
          <Text style={styles.fromText}>From: {names[item.from] ?? 'Loading...'}</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.acceptButton} onPress={() => accept(item.from)}>
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rejectButton} onPress={() => reject(item.from)}>
              <Text style={styles.buttonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        </Card>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { color: AppTheme.colors.text },
  errorText: { color: AppTheme.colors.notification },
  fromText: { fontSize: 16, marginBottom: AppTheme.spacing.sm, color: AppTheme.colors.text },
  buttonRow: {
    flexDirection: 'row', justifyContent: 'flex-end', marginTop: AppTheme.spacing.sm,
  },
  acceptButton: {
    backgroundColor: AppTheme.colors.primary,
    paddingVertical: 6, paddingHorizontal: 16,
    borderRadius: AppTheme.roundness / 2,
    marginRight: AppTheme.spacing.md,
  },
  rejectButton: {
    backgroundColor: AppTheme.colors.notification,
    paddingVertical: 6, paddingHorizontal: 16,
    borderRadius: AppTheme.roundness / 2,
  },
  buttonText: {
    color: '#fff', fontWeight: '600',
  },
});

