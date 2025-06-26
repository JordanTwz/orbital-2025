import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { useFriends, Request } from '../../hooks/useFriends';
import { db } from '../../firebase';
import { AppTheme } from '../../theme';
import { Card } from '../../components/Card';

export default function OutgoingRequestsScreen() {
  const { outgoing, loading, error, cancel } = useFriends();
  const [names, setNames] = useState<Record<string,string>>({});

  useEffect(() => {
    outgoing.forEach(req => {
      if (!names[req.to]) {
        getDoc(doc(db, 'users', req.to))
          .then(snap => {
            const d = snap.data();
            setNames(n => ({
              ...n,
              [req.to]: d?.displayName ?? d?.email ?? 'Unknown'
            }));
          })
          .catch(console.error);
      }
    });
  }, [outgoing]);

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
      data={outgoing}
      contentContainerStyle={outgoing.length ? undefined : styles.center}
      keyExtractor={item => item.id}
      ListEmptyComponent={<Text style={styles.emptyText}>No pending requests.</Text>}
      renderItem={({ item }: { item: Request }) => (
        <Card>
          <View style={styles.row}>
            <Text style={styles.toText}>To: {names[item.to] ?? 'Loading…'}</Text>
            <TouchableOpacity style={styles.cancelButton} onPress={() => cancel(item.to)}>
              <Text style={styles.buttonText}>Cancel</Text>
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
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  toText: { fontSize: 16, color: AppTheme.colors.text },
  cancelButton: {
    backgroundColor: AppTheme.colors.notification,
    paddingVertical: 6, paddingHorizontal: 16,
    borderRadius: AppTheme.roundness / 2,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
});
