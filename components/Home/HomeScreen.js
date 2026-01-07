import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Preferences from '../User/Preferences';
import MenuScreen from '../Menu/MenuScreen';
import { getUserPreferences } from '../../utils/storage';
import { Colors } from '../../utils/globalStyles';

const HomeScreen = ({ navigation }) => {
  const [hasCompletedPreferences, setHasCompletedPreferences] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user has completed preferences on mount and when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      checkPreferences();
    }, [])
  );

  const checkPreferences = async () => {
    const prefs = await getUserPreferences();
    setHasCompletedPreferences(!!prefs);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Show Preferences for new users first
  if (!hasCompletedPreferences) {
    return (
      <Preferences
        navigation={navigation}
        onComplete={() => setHasCompletedPreferences(true)}
      />
    );
  }

  // After preferences complete, show Menu
  return <MenuScreen navigation={navigation} />;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
});

export default HomeScreen;
