import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './components/Navigation/AppNavigator';
import { MenuProvider } from './context/MenuContext';

export default function App() {
  return (
    <MenuProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <AppNavigator />
      </NavigationContainer>
    </MenuProvider>
  );
}

