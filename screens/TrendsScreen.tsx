// screens/TrendsScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Dimensions,
  TextInput,
} from 'react-native';
import {
  LineChart,
  BarChart,
  PieChart,
  StackedBarChart,
} from 'react-native-chart-kit';
import { getAuth } from 'firebase/auth';
import { getMealLogs } from '../firebase';
import { AppTheme } from '../theme';

interface MealLog {
  id: string;
  totalCalories: number;
  dishes: {
    name: string;
    calories: number;
    macros: { carbs: number; fats: number; proteins: number };
  }[];
  timestamp: number;
}

export default function TrendsScreen() {
  const [logs, setLogs] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [mealsToShow, setMealsToShow] = useState<string>('All');

  useEffect(() => {
    (async () => {
      const uid = getAuth().currentUser?.uid;
      if (!uid) return;
      const data = (await getMealLogs(uid)) as MealLog[];
      setLogs(data.slice().sort((a, b) => a.timestamp - b.timestamp));
      setLoading(false);
      setMealsToShow(data.length.toString());
    })();
  }, []);

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
            No meal data yet. Log a meal to see your trends!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Determine displayed logs
  const count = parseInt(mealsToShow, 10);
  const validCount =
    isNaN(count) || count <= 0 ? logs.length : Math.min(count, logs.length);
  const displayLogs = logs.slice(-validCount);

  // 1) Calories per meal
  const calorieData = displayLogs.map((l) => l.totalCalories);
  const labels = displayLogs.map((_, i) => `#${i + 1}`);

  // 2) Dishes per meal
  const dishCount = displayLogs.map((l) => l.dishes.length);
  const maxDishCount = Math.max(...dishCount, 1);

  // 3) Macro totals across displayed meals (for pie chart)
  const macroTotals = displayLogs.reduce(
    (t, l) => {
      l.dishes.forEach((d) => {
        t.carbs += d.macros.carbs;
        t.proteins += d.macros.proteins;
        t.fats += d.macros.fats;
      });
      return t;
    },
    { carbs: 0, proteins: 0, fats: 0 }
  );

  // 4) Macro breakdown per meal (for stacked bar)
  const stackedData = displayLogs.map((l) => [
    l.dishes.reduce((s, d) => s + d.macros.carbs, 0),
    l.dishes.reduce((s, d) => s + d.macros.proteins, 0),
    l.dishes.reduce((s, d) => s + d.macros.fats, 0),
  ]);

  // Pie chart data
  const pieData = [
    {
      name: 'Carbs',
      population: macroTotals.carbs,
      color: AppTheme.colors.primary,
      legendFontColor: AppTheme.colors.text,
      legendFontSize: 12,
    },
    {
      name: 'Proteins',
      population: macroTotals.proteins,
      color: AppTheme.colors.notification,
      legendFontColor: AppTheme.colors.text,
      legendFontSize: 12,
    },
    {
      name: 'Fats',
      population: macroTotals.fats,
      color: AppTheme.colors.border,
      legendFontColor: AppTheme.colors.text,
      legendFontSize: 12,
    },
  ];

  const screenWidth = Dimensions.get('window').width - AppTheme.spacing.md * 2;
  const chartConfig = {
    backgroundGradientFrom: AppTheme.colors.background,
    backgroundGradientTo: AppTheme.colors.background,
    decimalPlaces: 0,
    color: (opacity: number = 1): string => AppTheme.colors.primary,
    labelColor: (opacity: number = 1): string => AppTheme.colors.text,
    propsForDots: { r: '4', strokeWidth: '2', stroke: AppTheme.colors.primary },
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Selector */}
        <View style={styles.selectorRow}>
          <Text style={styles.selectorLabel}>Show last </Text>
          <TextInput
            style={styles.selectorInput}
            value={mealsToShow}
            onChangeText={setMealsToShow}
            keyboardType="numeric"
          />
          <Text style={styles.selectorLabel}> meals</Text>
        </View>

        {/* 1) Line Chart */}
        <Text style={styles.title}>Calories per Meal</Text>
        <LineChart
          data={{ labels, datasets: [{ data: calorieData }] }}
          width={screenWidth}
          height={180}
          chartConfig={chartConfig}
          style={styles.chart}
          fromZero
        />

        {/* 2) Bar Chart */}
        <Text style={styles.title}>Dishes per Meal</Text>
        <BarChart
          data={{ labels, datasets: [{ data: dishCount }] }}
          width={screenWidth}
          height={180}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={chartConfig}
          style={styles.chart}
          fromZero
          showBarTops
          showValuesOnTopOfBars
          segments={maxDishCount}
          verticalLabelRotation={30}
        />

        {/* 3) Pie Chart */}
        <Text style={styles.title}>Macro Distribution (g)</Text>
        <PieChart
          data={pieData}
          width={screenWidth}
          height={200}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
          style={styles.chart}
        />

        {/* 4) Stacked Bar Chart */}
        <Text style={styles.title}>Macros per Meal</Text>
        <StackedBarChart
          data={{
            labels,
            legend: ['Carbs', 'Proteins', 'Fats'],
            data: stackedData,
            barColors: [
              AppTheme.colors.primary,
              AppTheme.colors.notification,
              AppTheme.colors.border,
            ],
          }}
          width={screenWidth}
          height={180}
          chartConfig={chartConfig}
          style={styles.chart}
          hideLegend={false}
        />
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
    alignItems: 'center',
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
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: AppTheme.spacing.lg,
  },
  selectorLabel: {
    fontSize: AppTheme.typography.body,
    color: AppTheme.colors.text,
  },
  selectorInput: {
    width: 60,
    marginHorizontal: AppTheme.spacing.xs,
    padding: AppTheme.spacing.xs,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    borderRadius: AppTheme.roundness,
    textAlign: 'center',
    fontSize: AppTheme.typography.body,
    backgroundColor: AppTheme.colors.card,
  },
  title: {
    fontSize: AppTheme.typography.h3,
    fontWeight: 'bold',
    color: AppTheme.colors.text,
    marginTop: AppTheme.spacing.lg,
    marginBottom: AppTheme.spacing.sm,
  },
  chart: {
    borderRadius: AppTheme.roundness,
    marginBottom: AppTheme.spacing.lg,
  },
});
