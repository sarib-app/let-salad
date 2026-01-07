import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingScreen from '../Onboarding/OnboardingScreen';
import AuthStack from './AuthStack';
import BottomTabNavigator from './BottomTabNavigator';
import SubscriptionPackagesScreen from '../Subscription/SubscriptionPackagesScreen';
import ManageSubscriptionScreen from '../Subscription/ManageSubscriptionScreen';
import MealSelectionScreen from '../Subscription/MealSelectionScreen';
import DeliveryPreferencesScreen from '../Checkout/DeliveryPreferencesScreen';
import CheckoutScreen from '../Checkout/CheckoutScreen';
import AddressSelectionScreen from '../Checkout/AddressSelectionScreen';
import PaymentMethodScreen from '../Checkout/PaymentMethodScreen';
import OrderConfirmationScreen from '../Checkout/OrderConfirmationScreen';

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
      <Stack.Screen
        name="ManageSubscription"
        component={ManageSubscriptionScreen}
        options={{
          headerShown: true,
          headerTitle: 'Manage Subscription',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="MealSelection"
        component={MealSelectionScreen}
        options={{
          headerShown: true,
          headerTitle: 'Select Meals',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="DeliveryPreferences"
        component={DeliveryPreferencesScreen}
        options={{
          headerShown: true,
          headerTitle: 'Delivery Preferences',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{
          headerShown: true,
          headerTitle: 'Checkout',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="AddressSelection"
        component={AddressSelectionScreen}
        options={{
          headerShown: true,
          headerTitle: 'Delivery Address',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="PaymentMethod"
        component={PaymentMethodScreen}
        options={{
          headerShown: true,
          headerTitle: 'Payment Method',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="OrderConfirmation"
        component={OrderConfirmationScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
