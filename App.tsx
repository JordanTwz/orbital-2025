// App.tsx
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ActivityIndicator,
  View,
  Text,
  TouchableOpacity
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  subscribeToAuthChanges,
  logout
} from './firebase';

import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import HomeScreen from './screens/HomeScreen';
import MealLogScreen from './screens/MealLogScreen';
import MealHistoryScreen from './screens/MealHistoryScreen';
import MealDetailScreen from './screens/MealDetailScreen';
import EditMealScreen from './screens/EditMealScreen';
import TrendsScreen from './screens/TrendsScreen';

// ← Newly added imports
import FriendsListScreen from './screens/FriendsListScreen';
import FriendRequestsScreen from './screens/FriendRequestsScreen';
import SearchUsersScreen from './screens/SearchUsersScreen';

import { AppTheme } from './theme';

// ← Extend your navigation params
export type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  Home: undefined;
  MealLog: undefined;
  MealHistory: undefined;
  MealDetail: { log: any };
  EditMeal: { log: any };
  Trends: undefined;

  // ← New entries
  FriendsList: undefined;
  FriendRequests: undefined;
  SearchUsers: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [initialRoute, setInitialRoute] =
    useState<keyof RootStackParamList | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(user => {
      setInitialRoute(user ? 'Home' : 'SignIn');
    });
    return unsubscribe;
  }, []);

  if (!initialRoute) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
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
                  await logout();
                  navigation.replace('SignIn');
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
        <Stack.Screen
          name="MealHistory"
          component={MealHistoryScreen}
          options={{ title: 'History' }}
        />
        <Stack.Screen
          name="MealDetail"
          component={MealDetailScreen}
          options={{ title: 'Meal Details' }}
        />
        <Stack.Screen
          name="EditMeal"
          component={EditMealScreen}
          options={{ title: 'Edit Meal' }}
        />
        <Stack.Screen
          name="Trends"
          component={TrendsScreen}
          options={{ title: 'Eating Trends' }}
        />

        {/* ← New friend-related screens */}
        <Stack.Screen
          name="FriendsList"
          component={FriendsListScreen}
          options={{ title: 'Your Friends' }}
        />
        <Stack.Screen
          name="FriendRequests"
          component={FriendRequestsScreen}
          options={{ title: 'Friend Requests' }}
        />
        <Stack.Screen
          name="SearchUsers"
          component={SearchUsersScreen}
          options={{ title: 'Add Friend' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
