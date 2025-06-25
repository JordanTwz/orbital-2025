// screens/friends/IncomingRequestsScreen.tsx
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

export default function IncomingRequestsScreen() {
  const { incoming, loading, error, accept, reject } = useFriends();
  const [names, setNames] = useState<Record<string,string>>({});

  // Load each requester’s displayName/email once
  useEffect(() => {
    incoming.forEach(req => {
      if (!names[req.from]) {
        getDoc(doc(db, 'users', req.from))
          .then(snap => {
            const d = snap.data();
            setNames(n => ({
              ...n,
              [req.from]: d?.displayName ?? d?.email ?? 'Unknown User'
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
      contentContainerStyle={incoming.length ? undefined : styles.center}
      data={incoming}
      keyExtractor={item => item.id}
      ListEmptyComponent={<Text>No incoming requests.</Text>}
      renderItem={({ item }: { item: Request }) => (
        <View style={styles.card}>
          <Text style={styles.fromText}>
            From: {names[item.from] ?? 'Loading…'}
          </Text>
          <View style={styles.buttonRow}>
            <Button title="Accept" onPress={() => accept(item.from)} />
            <Button title="Reject" onPress={() => reject(item.from)} />
          </View>
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
    marginHorizontal: 16,
    marginVertical:   8,
    padding:          16,
    backgroundColor:  AppTheme.colors.card,
    borderRadius:     AppTheme.roundness,
    elevation:        1,
  },
  fromText: {
    fontSize:     16,
    marginBottom: 8,
    color:        AppTheme.colors.text,
  },
  buttonRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
  },
  errorText: {
    color: AppTheme.colors.notification,
  },
});
