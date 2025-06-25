// screen/MealDetailScreen.tsx

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { AppTheme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'MealDetail'>;

export default function MealDetailScreen({ route, navigation }: Props) {
  const { log } = route.params;

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Details for:</Text>
        <Text style={styles.description}>{log.description}</Text>
        <Text style={styles.summary}>{log.totalCalories} kcal</Text>

        {log.dishes.map((dish: any, idx: number) => (
          <View key={idx} style={styles.dishCard}>
            <Text style={styles.dishName}>
              {dish.name} — {dish.calories} kcal
            </Text>
            <View style={styles.macroRow}>
              <Text style={styles.macroLabel}>Carbs:</Text>
              <Text style={styles.macroValue}>{dish.macros.carbs} g</Text>
            </View>
            <View style={styles.macroRow}>
              <Text style={styles.macroLabel}>Proteins:</Text>
              <Text style={styles.macroValue}>{dish.macros.proteins} g</Text>
            </View>
            <View style={styles.macroRow}>
              <Text style={styles.macroLabel}>Fats:</Text>
              <Text style={styles.macroValue}>{dish.macros.fats} g</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditMeal', { log })}
        >
          <Text style={styles.editButtonText}>Edit This Meal</Text>
        </TouchableOpacity>
      </ScrollView>
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
  heading: {
    fontSize: AppTheme.typography.h3,
    fontWeight: 'bold',
    marginBottom: AppTheme.spacing.sm,
    color: AppTheme.colors.text,
  },
  description: {
    fontSize: AppTheme.typography.body,
    marginBottom: AppTheme.spacing.xs,
    color: AppTheme.colors.text,
  },
  summary: {
    fontSize: AppTheme.typography.body,
    fontWeight: '600',
    marginBottom: AppTheme.spacing.md,
    color: AppTheme.colors.primary,
  },
  dishCard: {
    backgroundColor: AppTheme.colors.card,
    padding: AppTheme.spacing.md,
    borderRadius: AppTheme.roundness,
    marginBottom: AppTheme.spacing.md,
    elevation: 1,
  },
  dishName: {
    fontSize: AppTheme.typography.body,
    fontWeight: '500',
    marginBottom: AppTheme.spacing.sm,
    color: AppTheme.colors.text,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: AppTheme.spacing.xs,
  },
  macroLabel: {
    fontSize: AppTheme.typography.small,
    color: AppTheme.colors.text,
  },
  macroValue: {
    fontSize: AppTheme.typography.small,
    fontWeight: '600',
    color: AppTheme.colors.text,
  },
  editButton: {
    backgroundColor: AppTheme.colors.primary,
    paddingVertical: AppTheme.spacing.sm * 1.5,
    borderRadius: AppTheme.roundness,
    alignItems: 'center',
    marginTop: AppTheme.spacing.lg,
    elevation: 2,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: AppTheme.typography.body,
  },
});
