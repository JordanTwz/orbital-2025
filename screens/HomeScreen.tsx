// screens/HomeScreen.tsx
import React from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { AppTheme } from '../theme';
import { logout } from '../firebase';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const handleLogout = async () => {
    await logout();
    navigation.replace('SignIn');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.title}>MealCraft</Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('MealLog')}
        >
          <Text style={styles.primaryButtonText}>Log a Meal</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('MealHistory')}
        >
          <Text style={styles.secondaryButtonText}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tertiaryButton}
          onPress={handleLogout}
        >
          <Text style={styles.tertiaryButtonText}>Logout</Text>
        </TouchableOpacity>
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
    flex: 1,
    padding: AppTheme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: AppTheme.typography.h2,
    fontWeight: 'bold',
    color: AppTheme.colors.primary,
    marginBottom: AppTheme.spacing.lg,
  },
  primaryButton: {
    width: '80%',
    backgroundColor: AppTheme.colors.primary,
    paddingVertical: AppTheme.spacing.sm * 2,
    borderRadius: AppTheme.roundness,
    alignItems: 'center',
    marginBottom: AppTheme.spacing.md,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: AppTheme.typography.body,
    fontWeight: '600',
  },
  secondaryButton: {
    width: '80%',
    backgroundColor: AppTheme.colors.card,
    borderWidth: 1,
    borderColor: AppTheme.colors.primary,
    paddingVertical: AppTheme.spacing.sm * 2,
    borderRadius: AppTheme.roundness,
    alignItems: 'center',
    marginBottom: AppTheme.spacing.md,
    elevation: 1,
  },
  secondaryButtonText: {
    color: AppTheme.colors.primary,
    fontSize: AppTheme.typography.body,
    fontWeight: '600',
  },
  tertiaryButton: {
    width: '80%',
    backgroundColor: AppTheme.colors.notification,
    paddingVertical: AppTheme.spacing.sm * 2,
    borderRadius: AppTheme.roundness,
    alignItems: 'center',
    elevation: 2,
  },
  tertiaryButtonText: {
    color: '#fff',
    fontSize: AppTheme.typography.body,
    fontWeight: '600',
  },
});
