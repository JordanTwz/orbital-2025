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
import { useFriends, Friend } from '../../hooks/useFriends';
import { db } from '../../firebase';
import { AppTheme } from '../../theme';

export default function FriendsListScreen() {
  const { friends, loading, error, remove } = useFriends();
  const [names, setNames] = useState<Record<string,string>>({});

  // Fetch each friend's email once
  useEffect(() => {
    friends.forEach(fr => {
      if (!names[fr.id]) {
        getDoc(doc(db, 'users', fr.id))
          .then(snap => {
            const d = snap.data();
            setNames(n => ({
              ...n,
              [fr.id]: d?.displayName ?? d?.email ?? 'Unknown User'
            }));
          })
          .catch(console.error);
      }
    });
  }, [friends]);

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
        <Button title="Try Again" onPress={() => {/* hook auto–refreshes */}} />
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={friends.length ? undefined : styles.center}
      data={friends}
      keyExtractor={item => item.id}
      ListEmptyComponent={<Text>You have no friends yet.</Text>}
      renderItem={({ item }: { item: Friend }) => (
        <View style={styles.card}>
          <Text style={styles.nameText}>
            {names[item.id] ?? 'Loading…'}
          </Text>
          <Button title="Remove" onPress={() => remove(item.id)} />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex:            1,
    justifyContent:  'center',
    alignItems:      'center',
    padding:         20,
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
  nameText: {
    fontSize: 16,
    color:     AppTheme.colors.text,
  },
  errorText: {
    color:       AppTheme.colors.notification,
    marginBottom: 12,
  },
});
