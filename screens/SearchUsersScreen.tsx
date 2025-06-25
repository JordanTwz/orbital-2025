// screens/SearchUsersScreen.tsx
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  Alert,
  StyleSheet,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import {
  searchUserByEmail,
  sendFriendRequest,
} from '../firebase';
import { AppTheme } from '../theme';

export default function SearchUsersScreen() {
  const [email, setEmail]           = useState('');
  const [foundEmail, setFoundEmail] = useState<string | null>(null);
  const [foundUid, setFoundUid]     = useState<string | null>(null);
  const currentUser = getAuth().currentUser;

  const handleSearch = async () => {
    try {
      const normalized = email.trim().toLowerCase();
      const result = await searchUserByEmail(normalized);
      if (result && result.id !== currentUser?.uid) {
        setFoundUid(result.id);
        setFoundEmail(result.email);
      } else {
        setFoundUid(null);
        setFoundEmail(null);
        Alert.alert(
          result?.id === currentUser?.uid
            ? 'You cannot add yourself'
            : 'User not found'
        );
      }
    } catch (err: any) {
      console.error('searchUserByEmail error:', err);
      Alert.alert('Error searching', err.message || 'Unknown error');
    }
  };

  const handleSendRequest = async () => {
    if (!currentUser || !foundUid) return;
    console.log(
      `Sending friend request from ${currentUser.uid} → ${foundUid}`
    );
    try {
      await sendFriendRequest(currentUser.uid, foundUid);
      Alert.alert(
        'Success',
        `Request sent to ${foundEmail}`,
        [{ text: 'OK', onPress: () => {
            setEmail('');
            setFoundUid(null);
            setFoundEmail(null);
          }
        }]
      );
    } catch (err: any) {
      console.error('sendFriendRequest error:', err);
      Alert.alert(
        'Failed to send request',
        err.message || 'Unknown error'
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Friend by Email</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter user email"
        placeholderTextColor={AppTheme.colors.border}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Button title="Search" onPress={handleSearch} />

      {foundEmail && (
        <View style={styles.resultContainer}>
          <Text style={styles.result}>Found: {foundEmail}</Text>
          <Button
            title="Send Friend Request"
            onPress={handleSendRequest}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: AppTheme.colors.background,
    flex: 1,
  },
  title: {
    fontSize: 20,
    marginBottom: 12,
    color: AppTheme.colors.text,
    fontWeight: '600',
  },
  input: {
    borderBottomWidth: 1,
    borderColor: AppTheme.colors.border,
    marginBottom: 20,
    fontSize: 16,
    color: AppTheme.colors.text,
    paddingVertical: 8,
  },
  resultContainer: {
    marginTop: 20,
  },
  result: {
    fontSize: 16,
    marginBottom: 8,
    color: AppTheme.colors.text,
  },
});
