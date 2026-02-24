import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useLanguage } from '../../context/LanguageContext';
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
import VisaPaymentScreen from '../Checkout/VisaPaymentScreen';
import AddressManagementScreen from '../Address/AddressManagementScreen';
import AddEditAddressScreen from '../Address/AddEditAddressScreen';
import EditProfile from '../User/EditProfile';
import ChangePassword from '../User/ChangePassword';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { t } = useLanguage();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerBackTitle: t('common.back'),
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
          headerTitle: t('nav.chooseYourPlan'),
        }}
      />
      <Stack.Screen
        name="ManageSubscription"
        component={ManageSubscriptionScreen}
        options={{
          headerShown: true,
          headerTitle: t('nav.manageSubscription'),
        }}
      />
      <Stack.Screen
        name="MealSelection"
        component={MealSelectionScreen}
        options={{
          headerShown: true,
          headerTitle: t('nav.selectMeals'),
        }}
      />
      <Stack.Screen
        name="DeliveryPreferences"
        component={DeliveryPreferencesScreen}
        options={{
          headerShown: true,
          headerTitle: t('nav.deliveryPreferences'),
        }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{
          headerShown: true,
          headerTitle: t('nav.checkout'),
        }}
      />
      <Stack.Screen
        name="AddressSelection"
        component={AddressSelectionScreen}
        options={{
          headerShown: true,
          headerTitle: t('nav.deliveryAddress'),
        }}
      />
      <Stack.Screen
        name="PaymentMethod"
        component={PaymentMethodScreen}
        options={{
          headerShown: true,
          headerTitle: t('nav.paymentMethod'),
        }}
      />
      <Stack.Screen
        name="VisaPayment"
        component={VisaPaymentScreen}
        options={{
          headerShown: true,
          headerTitle: t('nav.payWithCard'),
        }}
      />
      <Stack.Screen
        name="OrderConfirmation"
        component={OrderConfirmationScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AddressManagement"
        component={AddressManagementScreen}
        options={{
          headerShown: true,
          headerTitle: t('nav.myAddresses'),
        }}
      />
      <Stack.Screen
        name="AddEditAddress"
        component={AddEditAddressScreen}
        options={({ route }) => ({
          headerShown: true,
          headerTitle: route.params?.address ? t('nav.editAddress') : t('nav.addAddress'),
        })}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfile}
        options={{
          headerShown: true,
          headerTitle: t('nav.editProfile'),
        }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePassword}
        options={{
          headerShown: true,
          headerTitle: t('nav.changePassword'),
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
