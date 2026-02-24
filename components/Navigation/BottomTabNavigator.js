import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../../utils/globalStyles';
import { useLanguage } from '../../context/LanguageContext';

// Import screens
import HomeScreen from '../Home/HomeScreen';
import SubscriptionsScreen from '../Subscription/SubscriptionsScreen';
import ProfileScreen from '../User/ProfileScreen';
// import TestPaymentScreen from './TestPaymentScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  const { t } = useLanguage();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
        },
        tabBarLabelStyle: {
          ...Fonts.medium,
          fontSize: 12,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: t('nav.home'),
          tabBarIcon: ({ focused }) => (
            <Text style={styles.tabIcon}>{focused ? '🏠' : '🏠'}</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Subscriptions"
        component={SubscriptionsScreen}
        options={{
          tabBarLabel: t('nav.subscriptions'),
          tabBarIcon: ({ focused }) => (
            <Text style={styles.tabIcon}>{focused ? '📋' : '📋'}</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: t('nav.profile'),
          tabBarIcon: ({ focused }) => (
            <Text style={styles.tabIcon}>{focused ? '👤' : '👤'}</Text>
          ),
        }}
      />
      {/* <Tab.Screen
        name="TestPayment"
        component={TestPaymentScreen}
        options={{
          tabBarLabel: 'Test',
          tabBarIcon: ({ focused }) => (
            <Text style={styles.tabIcon}>{focused ? '💳' : '💳'}</Text>
          ),
        }}
      /> */}
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 24,
  },
});

export default BottomTabNavigator;
