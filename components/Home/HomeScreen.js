import React, { useState } from 'react';
import Preferences from '../User/Preferences';
import MenuScreen from '../Menu/MenuScreen';

const HomeScreen = ({ navigation }) => {
  const [hasCompletedPreferences, setHasCompletedPreferences] = useState(false);

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

export default HomeScreen;
