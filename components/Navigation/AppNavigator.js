import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingScreen from '../Onboarding/OnboardingScreen';
import AuthStack from './AuthStack';
import BottomTabNavigator from './BottomTabNavigator';
import SubscriptionPackagesScreen from '../Subscription/SubscriptionPackagesScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="Onboarding"
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Auth" component={AuthStack} />
      <Stack.Screen name="MainApp" component={BottomTabNavigator} />
      <Stack.Screen
        name="SubscriptionPackages"
        component={SubscriptionPackagesScreen}
        options={{
          headerShown: true,
          headerTitle: 'Choose Your Plan',
          headerBackTitle: 'Back',
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
