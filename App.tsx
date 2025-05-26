/* App.tsx */
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 1. Define and export your navigation param list
export type RootStackParamList = {
  Home: undefined;
  MealLog: undefined;
};

// 2. Create the stack navigator with your param list
const Stack = createNativeStackNavigator<RootStackParamList>();

// 3. Define and export a simple app theme
export const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4CAF50',
    background: '#FFFFFF',
    card: '#F5F5F5',
    text: '#212121',
    border: '#E0E0E0',
  },
};

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <NavigationContainer theme={AppTheme}>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: { backgroundColor: AppTheme.colors.primary },
            headerTintColor: '#ffffff',
            headerTitleStyle: { fontWeight: 'bold', fontSize: 20 },
          }}
        >
          <Stack.Screen
            name="Home"
            component={require('./screens/HomeScreen').default}
            options={{ title: 'MealCraft' }}
          />
          <Stack.Screen
            name="MealLog"
            component={require('./screens/MealLogScreen').default}
            options={{ title: 'Log a Meal' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: AppTheme.colors.background },
});