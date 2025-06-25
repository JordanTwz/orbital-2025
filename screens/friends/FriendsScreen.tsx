// screens/friends/FriendsScreen.tsx

import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import FriendsListScreen from './FriendsListScreen';
import IncomingRequestsScreen from './IncomingRequestsScreen';
import OutgoingRequestsScreen from './OutgoingRequestsScreen';
import { AppTheme } from '../../theme';

const Tab = createMaterialTopTabNavigator();

export default function FriendsScreen() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarIndicatorStyle: { backgroundColor: AppTheme.colors.primary },
        tabBarActiveTintColor: AppTheme.colors.text,
        tabBarStyle: { backgroundColor: AppTheme.colors.card },
      }}
    >
      <Tab.Screen
        name="FriendsList"
        component={FriendsListScreen}
        options={{ title: 'Friends' }}
      />
      <Tab.Screen
        name="Incoming"
        component={IncomingRequestsScreen}
        options={{ title: 'Requests In' }}
      />
      <Tab.Screen
        name="Outgoing"
        component={OutgoingRequestsScreen}
        options={{ title: 'Requests Out' }}
      />
    </Tab.Navigator>
  );
}
