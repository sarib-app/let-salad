import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../Auth/Login';
import Signup from '../Auth/Signup';
import OTPVerification from '../Auth/OTPVerification';
import CompleteProfile from '../User/CompleteProfile';
import Preferences from '../User/Preferences';
import TermsAndConditionsScreen from '../Legal/TermsAndConditionsScreen';
import PrivacyPolicyScreen from '../Legal/PrivacyPolicyScreen';

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={Signup} />
      <Stack.Screen name="OTPVerification" component={OTPVerification} />
      <Stack.Screen name="CompleteProfile" component={CompleteProfile} />
      <Stack.Screen name="Preferences" component={Preferences} />
      <Stack.Screen
        name="TermsAndConditions"
        component={TermsAndConditionsScreen}
        options={{ headerShown: true, headerTitle: 'Terms & Conditions' }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{ headerShown: true, headerTitle: 'Privacy Policy' }}
      />
    </Stack.Navigator>
  );
};

export default AuthStack;
