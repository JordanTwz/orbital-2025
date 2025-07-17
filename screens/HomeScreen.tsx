// screens/HomeScreen.tsx

import React from 'react';
import {
  SafeAreaView,
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { AppTheme } from '../theme';
import { useFriends } from '../hooks/useFriends';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { incoming } = useFriends();
  const badgeCount = incoming.length;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        {/* Logo */}
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

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
            style={[styles.gridButton, styles.gridButtonLarge]}
            onPress={() => navigation.navigate('MealHistory')}
          >
            <Text style={styles.gridButtonText}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.gridButton, styles.gridButtonLarge]}
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
            {badgeCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {badgeCount > 9 ? '9+' : badgeCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridButton}
            onPress={() => navigation.navigate('SearchUsers')}
          >
            <Text style={styles.gridButtonText}>Add Friend</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridButton}
            onPress={() => navigation.navigate('PublicFeed')}
          >
            <Text style={styles.gridButtonText}>Feed</Text>
          </TouchableOpacity>
        </View>
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
  logo: {
    width: 250,
    height: 250,
    alignSelf: 'center',
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
    width: '30%',
    backgroundColor: AppTheme.colors.card,
    borderWidth: 1,
    borderColor: AppTheme.colors.primary,
    paddingVertical: AppTheme.spacing.sm * 1.5,
    borderRadius: AppTheme.roundness,
    alignItems: 'center',
    elevation: 1,
    position: 'relative', // for badge positioning
  },
  // New style for 2-button row to spread evenly
  gridButtonLarge: {
    width: '48%',
  },
  gridButtonText: {
    color: AppTheme.colors.primary,
    fontSize: AppTheme.typography.body,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: AppTheme.colors.notification,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
