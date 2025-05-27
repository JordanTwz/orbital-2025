// screens/HomeScreen.tsx
import React from 'react'
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../App'
import { AppTheme } from '../theme'

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>

export default function HomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to MealCraft!</Text>
        <TouchableOpacity
          style={styles.button}
          accessibilityLabel="Log a meal"
          onPress={() => navigation.navigate('MealLog')}
        >
          <Text style={styles.buttonText}>Log a Meal</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea:  { flex: 1, backgroundColor: AppTheme.colors.background },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  title:     { fontSize: 24, marginBottom: 24, color: AppTheme.colors.text },
  button:    {
    backgroundColor: AppTheme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 4,
  },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
})
