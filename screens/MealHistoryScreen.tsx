// screens/MealHistoryScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  SafeAreaView,
  FlatList,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getAuth } from 'firebase/auth';
import { getMealLogs, deleteMealLog } from '../firebase';
import type { RootStackParamList } from '../App';
import { AppTheme } from '../theme';

type MealLog = {
  id: string;
  description: string;
  totalCalories: number;
  dishes: {
    name: string;
    calories: number;
    macros: { carbs: number; fats: number; proteins: number };
  }[];
  timestamp: number;
};

type Props = NativeStackScreenProps<RootStackParamList, 'MealHistory'>;

export default function MealHistoryScreen({ navigation }: Props) {
  const [logs, setLogs] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    const uid = getAuth().currentUser?.uid;
    if (!uid) return;
    try {
      const data = await getMealLogs(uid);
      setLogs(data as MealLog[]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  // refetch every time this screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchLogs();
    }, [])
  );

  const handleDelete = async (id: string) => {
    const uid = getAuth().currentUser?.uid;
    if (!uid) return;
    try {
      await deleteMealLog(uid, id);
      setLogs(current => current.filter(log => log.id !== id));
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to delete meal');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={AppTheme.colors.primary} />
      </View>
    );
  }

  // Guard: if no logs, show a friendly message
  if (logs.length === 0) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <Text style={styles.noDataText}>
            No meal history yet. Log a meal to get started!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={logs}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('MealDetail', { log: item })
              }
            >
              <Text style={styles.date}>
                {new Date(item.timestamp).toLocaleString()}
              </Text>
              <Text style={styles.summary}>
                {item.description} — {item.totalCalories} kcal
              </Text>
            </TouchableOpacity>

            <View style={styles.actionRow}>
              <TouchableOpacity
                onPress={() => navigation.navigate('EditMeal', { log: item })}
              >
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  list: {
    padding: AppTheme.spacing.md,
  },
  item: {
    backgroundColor: AppTheme.colors.card,
    padding: AppTheme.spacing.md,
    borderRadius: AppTheme.roundness,
    marginBottom: AppTheme.spacing.sm,
    elevation: 1,
  },
  date: {
    fontSize: AppTheme.typography.small,
    color: AppTheme.colors.border,
    marginBottom: AppTheme.spacing.xs,
  },
  summary: {
    fontSize: AppTheme.typography.body,
    color: AppTheme.colors.text,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: AppTheme.spacing.sm,
  },
  editText: {
    marginRight: AppTheme.spacing.lg,
    color: AppTheme.colors.primary,
    fontWeight: '600',
  },
  deleteText: {
    color: AppTheme.colors.notification,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: AppTheme.typography.body,
    color: AppTheme.colors.text,
    textAlign: 'center',
  },
});
