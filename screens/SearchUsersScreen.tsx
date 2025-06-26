// screens/SearchUsersScreen.tsx

import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { searchUserByEmail, sendFriendRequest } from '../firebase';
import { AppTheme } from '../theme';
import { Card } from '../components/Card';

export default function SearchUsersScreen() {
  const [email, setEmail] = useState('');
  const [found, setFound] = useState<{ id: string; email: string } | null>(null);
  const currentUser = getAuth().currentUser;

  const handleSearch = async () => {
    try {
      const normalized = email.trim().toLowerCase();
      const result = await searchUserByEmail(normalized);
      if (result && result.id !== currentUser?.uid) {
        setFound(result as any);
      } else {
        setFound(null);
        Alert.alert(
          result?.id === currentUser?.uid
            ? 'You cannot add yourself'
            : 'User not found'
        );
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert('Search error', err.message || 'Something went wrong');
    }
  };

  const handleSendRequest = async () => {
    if (!found || !currentUser) return;
    try {
      await sendFriendRequest(currentUser.uid, found.id);
      Alert.alert('Success', `Friend request sent to ${found.email}`);
      setEmail('');
      setFound(null);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message || 'Failed to send request');
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.title}>Add Friend</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter user email"
          placeholderTextColor={AppTheme.colors.border}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>

        {found && (
          <Card>
            <Text style={styles.foundText}>Found: {found.email}</Text>
            <TouchableOpacity
              style={styles.requestButton}
              onPress={handleSendRequest}
            >
              <Text style={styles.requestButtonText}>Send Request</Text>
            </TouchableOpacity>
          </Card>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  container: {
    padding: AppTheme.spacing.md,
  },
  title: {
    fontSize: AppTheme.typography.h2,
    fontWeight: '600',
    color: AppTheme.colors.primary,
    marginBottom: AppTheme.spacing.lg,
  },
  input: {
    backgroundColor: AppTheme.colors.card,
    borderColor: AppTheme.colors.border,
    borderWidth: 1,
    borderRadius: AppTheme.roundness,
    padding: AppTheme.spacing.sm,
    fontSize: AppTheme.typography.body,
    color: AppTheme.colors.text,
    marginBottom: AppTheme.spacing.md,
  },
  searchButton: {
    backgroundColor: AppTheme.colors.primary,
    paddingVertical: AppTheme.spacing.sm * 1.5,
    borderRadius: AppTheme.roundness,
    alignItems: 'center',
    marginBottom: AppTheme.spacing.lg,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: AppTheme.typography.body,
    fontWeight: '600',
  },
  foundText: {
    fontSize: AppTheme.typography.body,
    marginBottom: AppTheme.spacing.sm,
    color: AppTheme.colors.text,
  },
  requestButton: {
    backgroundColor: AppTheme.colors.primary,
    paddingVertical: AppTheme.spacing.sm,
    borderRadius: AppTheme.roundness / 2,
    alignItems: 'center',
  },
  requestButtonText: {
    color: '#fff',
    fontSize: AppTheme.typography.body,
    fontWeight: '600',
  },
});
