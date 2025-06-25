import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Button,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { useFriends, Request } from '../../hooks/useFriends';
import { db } from '../../firebase';
import { AppTheme } from '../../theme';

export default function OutgoingRequestsScreen() {
  const { outgoing, loading, error, cancel } = useFriends();
  const [names, setNames] = useState<Record<string,string>>({});

  // Load each recipient's email/displayName once
  useEffect(() => {
    outgoing.forEach(req => {
      if (!names[req.to]) {
        getDoc(doc(db, 'users', req.to))
          .then(snap => {
            const d = snap.data();
            setNames(n => ({
              ...n,
              [req.to]: d?.displayName ?? d?.email ?? 'Unknown User'
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
      contentContainerStyle={outgoing.length ? undefined : styles.center}
      data={outgoing}
      keyExtractor={item => item.id}
      ListEmptyComponent={<Text>No pending requests.</Text>}
      renderItem={({ item }: { item: Request }) => (
        <View style={styles.card}>
          <Text style={styles.toText}>
            To: {names[item.to] ?? 'Loading…'}
          </Text>
          <Button title="Cancel" onPress={() => cancel(item.to)} />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex:           1,
    justifyContent: 'center',
    alignItems:     'center',
    padding:        20,
  },
  card: {
    flexDirection:    'row',
    justifyContent:   'space-between',
    alignItems:       'center',
    padding:          16,
    marginHorizontal: 16,
    marginVertical:   8,
    backgroundColor:  AppTheme.colors.card,
    borderRadius:     AppTheme.roundness,
    elevation:        1,
  },
  toText: {
    fontSize: 16,
    color:    AppTheme.colors.text,
  },
  errorText: {
    color: AppTheme.colors.notification,
  },
});
