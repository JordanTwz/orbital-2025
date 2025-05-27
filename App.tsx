// App.tsx
import React, { useState, useEffect } from 'react'
import { SafeAreaView, ActivityIndicator, View, Text, TouchableOpacity } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { subscribeToAuthChanges, logout } from './firebase'
import SignInScreen from './screens/SignInScreen'
import SignUpScreen from './screens/SignUpScreen'
import HomeScreen from './screens/HomeScreen'
import MealLogScreen from './screens/MealLogScreen'
import { AppTheme } from './theme'

export type RootStackParamList = {
  SignIn: undefined
  SignUp: undefined
  Home: undefined
  MealLog: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function App() {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null)

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(user => {
      setInitialRoute(user ? 'Home' : 'SignIn')
    })
    return unsubscribe
  }, [])

  if (!initialRoute) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    )
  }

  return (
    <NavigationContainer theme={AppTheme}>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerStyle: { backgroundColor: AppTheme.colors.primary },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: 'bold', fontSize: 20 },
        }}
      >
        <Stack.Screen
          name="SignIn"
          component={SignInScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={({ navigation }) => ({
            title: 'MealCraft',
            headerRight: () => (
              <TouchableOpacity
                onPress={async () => {
                  await logout()
                  navigation.replace('SignIn')
                }}
                style={{ marginRight: 16 }}
              >
                <Text style={{ color: '#ffffff', fontSize: 16 }}>
                  Logout
                </Text>
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="MealLog"
          component={MealLogScreen}
          options={{ title: 'Log a Meal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
