import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import CompleteProfile from '../User/CompleteProfile';
import Preferences from '../User/Preferences';
import MenuScreen from '../Menu/MenuScreen';
import { getCurrentUser } from '../../utils/api';
import { Colors } from '../../utils/globalStyles';

const HomeScreen = ({ navigation }) => {
  const [profileCompleted, setProfileCompleted] = useState(true);
  const [preferencesCompleted, setPreferencesCompleted] = useState(true);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      checkUserStatus();
    }, [])
  );

  const checkUserStatus = async () => {
    try {
      const response = await getCurrentUser();
      if (response.code === 200 && response.user) {
        setProfileCompleted(response.user.has_completed_profile === true);
        setPreferencesCompleted(response.user.has_completed_preferences === true);
      }
    } catch (error) {
      console.error('Error fetching user status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Show CompleteProfile if not completed
  if (!profileCompleted) {
    return (
      <CompleteProfile
        navigation={navigation}
        onComplete={() => setProfileCompleted(true)}
      />
    );
  }

  // Show Preferences if not completed
  if (!preferencesCompleted) {
    return (
      <Preferences
        navigation={navigation}
        onComplete={() => setPreferencesCompleted(true)}
      />
    );
  }

  // Both complete, show Menu
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
