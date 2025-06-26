// screens/friends/FriendsListScreen.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { useFriends, Friend } from '../../hooks/useFriends';
import { db } from '../../firebase';
import { AppTheme } from '../../theme';
import { Card } from '../../components/Card';

export default function FriendsListScreen() {
  const { friends, loading, error, remove } = useFriends();
  const [names, setNames] = useState<Record<string,string>>({});

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

  const confirmRemove = (id: string) => {
    const displayName = names[id] ?? 'this friend';
    Alert.alert(
      'Remove Friend',
      `Are you sure you want to remove ${displayName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => remove(id) },
      ]
    );
  };

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
      data={friends}
      contentContainerStyle={friends.length ? undefined : styles.center}
      keyExtractor={item => item.id}
      ListEmptyComponent={<Text style={styles.emptyText}>No friends yet.</Text>}
      renderItem={({ item }: { item: Friend }) => (
        <Card>
          <View style={styles.row}>
            <Text style={styles.nameText}>
              {names[item.id] ?? 'Loading...'}
            </Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => confirmRemove(item.id)}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </Card>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  emptyText: {
    color: AppTheme.colors.text, fontSize: AppTheme.typography.body,
  },
  errorText: {
    color: AppTheme.colors.notification, textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameText: {
    fontSize: 16,
    color: AppTheme.colors.text,
  },
  removeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: AppTheme.colors.notification,
    borderRadius: AppTheme.roundness / 2,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
