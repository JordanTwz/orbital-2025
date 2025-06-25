// screens/HomeScreen.tsx

import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { AppTheme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.title}>MealCraft</Text>

        {/* Log a Meal */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('MealLog')}
        >
          <Text style={styles.primaryButtonText}>Log a Meal</Text>
        </TouchableOpacity>

        {/* Meal Insights */}
        <Text style={styles.sectionHeader}>Meal Insights</Text>
        <View style={styles.gridRow}>
          <TouchableOpacity
            style={styles.gridButton}
            onPress={() => navigation.navigate('MealHistory')}
          >
            <Text style={styles.gridButtonText}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.gridButton}
            onPress={() => navigation.navigate('Trends')}
          >
            <Text style={styles.gridButtonText}>Trends</Text>
          </TouchableOpacity>
        </View>

        {/* Community */}
        <Text style={[styles.sectionHeader, styles.socialHeader]}>
          Community
        </Text>
        <View style={styles.gridRow}>
          <TouchableOpacity
            style={styles.gridButton}
            onPress={() => navigation.navigate('Friends')}
          >
            <Text style={styles.gridButtonText}>Friends</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.gridButton}
            onPress={() => navigation.navigate('Friends')}
          >
            <Text style={styles.gridButtonText}>Requests</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.tertiaryButton}
          onPress={() => navigation.navigate('SearchUsers')}
        >
          <Text style={styles.tertiaryButtonText}>Add Friend</Text>
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
  },
  title: {
    fontSize: AppTheme.typography.h2,
    fontWeight: 'bold',
    color: AppTheme.colors.primary,
    textAlign: 'center',
    marginBottom: AppTheme.spacing.lg,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: AppTheme.colors.primary,
    paddingVertical: AppTheme.spacing.sm * 2,
    borderRadius: AppTheme.roundness,
    alignItems: 'center',
    marginBottom: AppTheme.spacing.lg,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: AppTheme.typography.body,
    fontWeight: '600',
  },
  sectionHeader: {
    fontSize: AppTheme.typography.h3,
    fontWeight: '600',
    color: AppTheme.colors.text,
    marginBottom: AppTheme.spacing.sm,
  },
  socialHeader: {
    marginTop: AppTheme.spacing.lg,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: AppTheme.spacing.md,
  },
  gridButton: {
    width: '48%',
    backgroundColor: AppTheme.colors.card,
    borderWidth: 1,
    borderColor: AppTheme.colors.primary,
    paddingVertical: AppTheme.spacing.sm * 1.5,
    borderRadius: AppTheme.roundness,
    alignItems: 'center',
    elevation: 1,
  },
  gridButtonText: {
    color: AppTheme.colors.primary,
    fontSize: AppTheme.typography.body,
    fontWeight: '600',
  },
  tertiaryButton: {
    width: '100%',
    backgroundColor: AppTheme.colors.card,
    borderWidth: 1,
    borderColor: AppTheme.colors.primary,
    paddingVertical: AppTheme.spacing.sm * 1.5,
    borderRadius: AppTheme.roundness,
    alignItems: 'center',
    marginTop: AppTheme.spacing.md,
    elevation: 1,
  },
  tertiaryButtonText: {
    color: AppTheme.colors.primary,
    fontSize: AppTheme.typography.body,
    fontWeight: '600',
  },
});
