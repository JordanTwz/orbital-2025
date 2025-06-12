// screens/EditMealScreen.tsx
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getAuth } from 'firebase/auth';
import { updateMealLog } from '../firebase';
import type { RootStackParamList } from '../App';
import { AppTheme } from '../theme';

type Dish = {
  name: string;
  calories: number;
  macros: {
    carbs: number;
    fats: number;
    proteins: number;
  };
};

type Props = NativeStackScreenProps<RootStackParamList, 'EditMeal'>;

export default function EditMealScreen({ route, navigation }: Props) {
  const { log } = route.params;
  const [description, setDescription] = useState(log.description);
  const [dishes, setDishes] = useState<Dish[]>(log.dishes);

  // Update a field on a dish
  const handleDishChange = (
    index: number,
    field: keyof Dish | keyof Dish['macros'],
    value: string
  ) => {
    setDishes(current =>
      current.map((dish, i) => {
        if (i !== index) return dish;
        if (field === 'name') {
          return { ...dish, name: value };
        } else if (field === 'calories') {
          return { ...dish, calories: Number(value) || 0 };
        } else {
          return {
            ...dish,
            macros: {
              ...dish.macros,
              [field]: Number(value) || 0
            }
          };
        }
      })
    );
  };

  // Remove a dish
  const handleRemoveDish = (index: number) => {
    setDishes(current => current.filter((_, i) => i !== index));
  };

  // Add a new blank dish
  const handleAddDish = () => {
    setDishes(current => [
      ...current,
      { name: '', calories: 0, macros: { carbs: 0, fats: 0, proteins: 0 } }
    ]);
  };

  // Sum of dish calories
  const totalCalories = dishes.reduce((sum, d) => sum + d.calories, 0);

  const handleSave = async () => {
    const uid = getAuth().currentUser?.uid;
    if (!uid) return;
    try {
      await updateMealLog(uid, log.id, {
        description,
        dishes,
        totalCalories,
      });

      navigation.replace('MealDetail', {
        log: { ...log, description, dishes, totalCalories }
      });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not update meal');
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Description */}
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
        />

        {/* Editable dishes */}
        {dishes.map((dish, idx) => (
          <View key={idx} style={styles.dishCard}>
            <View style={styles.dishHeaderRow}>
              <Text style={styles.dishHeader}>Dish {idx + 1}</Text>
              <TouchableOpacity onPress={() => handleRemoveDish(idx)}>
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={dish.name}
              onChangeText={text => handleDishChange(idx, 'name', text)}
            />

            <Text style={styles.label}>Calories</Text>
            <TextInput
              style={styles.input}
              value={String(dish.calories)}
              keyboardType="numeric"
              onChangeText={text => handleDishChange(idx, 'calories', text)}
            />

            <Text style={styles.label}>Carbs (g)</Text>
            <TextInput
              style={styles.input}
              value={String(dish.macros.carbs)}
              keyboardType="numeric"
              onChangeText={text => handleDishChange(idx, 'carbs', text)}
            />

            <Text style={styles.label}>Proteins (g)</Text>
            <TextInput
              style={styles.input}
              value={String(dish.macros.proteins)}
              keyboardType="numeric"
              onChangeText={text => handleDishChange(idx, 'proteins', text)}
            />

            <Text style={styles.label}>Fats (g)</Text>
            <TextInput
              style={styles.input}
              value={String(dish.macros.fats)}
              keyboardType="numeric"
              onChangeText={text => handleDishChange(idx, 'fats', text)}
            />
          </View>
        ))}

        {/* Add Dish Button */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddDish}>
          <Text style={styles.addButtonText}>+ Add Dish</Text>
        </TouchableOpacity>

        {/* Total calories */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Calories:</Text>
          <Text style={styles.totalValue}>{totalCalories} kcal</Text>
        </View>

        {/* Save */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
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
  label: {
    fontSize: AppTheme.typography.body,
    color: AppTheme.colors.text,
    marginTop: AppTheme.spacing.sm,
    marginBottom: AppTheme.spacing.xs,
  },
  input: {
    backgroundColor: AppTheme.colors.card,
    padding: AppTheme.spacing.sm,
    borderRadius: AppTheme.roundness,
    fontSize: AppTheme.typography.body,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  dishCard: {
    marginTop: AppTheme.spacing.lg,
    padding: AppTheme.spacing.md,
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.roundness,
    elevation: 1,
  },
  dishHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dishHeader: {
    fontSize: AppTheme.typography.h3,
    fontWeight: '600',
  },
  removeText: {
    color: AppTheme.colors.notification,
    fontWeight: '600',
  },
  addButton: {
    marginTop: AppTheme.spacing.lg,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: AppTheme.typography.body,
    color: AppTheme.colors.primary,
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: AppTheme.spacing.lg,
    padding: AppTheme.spacing.sm,
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.roundness,
  },
  totalLabel: {
    fontSize: AppTheme.typography.body,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: AppTheme.typography.body,
    fontWeight: '600',
    color: AppTheme.colors.primary,
  },
  saveButton: {
    backgroundColor: AppTheme.colors.primary,
    paddingVertical: AppTheme.spacing.sm * 1.5,
    borderRadius: AppTheme.roundness,
    alignItems: 'center',
    marginTop: AppTheme.spacing.xl,
    elevation: 2,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: AppTheme.typography.body,
    fontWeight: '600',
  },
});
