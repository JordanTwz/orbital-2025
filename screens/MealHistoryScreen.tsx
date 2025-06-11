// screens/MealHistoryScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  FlatList,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getAuth } from 'firebase/auth';
import { getMealLogs } from '../firebase';
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

  useEffect(() => {
    (async () => {
      const uid = getAuth().currentUser?.uid;
      if (!uid) return;
      const data = await getMealLogs(uid);
      setLogs(data as MealLog[]);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={AppTheme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={logs}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
