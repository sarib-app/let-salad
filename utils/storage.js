import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const KEYS = {
  USER_PROFILE: '@user_profile',
  USER_PREFERENCES: '@user_preferences',
  ACTIVE_SUBSCRIPTIONS: '@active_subscriptions',
  HAS_COMPLETED_ONBOARDING: '@has_completed_onboarding',
};

// User Profile
export const saveUserProfile = async (profileData) => {
  try {
    await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profileData));
    return true;
  } catch (error) {
    console.error('Error saving user profile:', error);
    return false;
  }
};

export const getUserProfile = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.USER_PROFILE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// User Preferences
export const saveUserPreferences = async (preferences) => {
  try {
    await AsyncStorage.setItem(KEYS.USER_PREFERENCES, JSON.stringify(preferences));
    return true;
  } catch (error) {
    console.error('Error saving user preferences:', error);
    return false;
  }
};

export const getUserPreferences = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.USER_PREFERENCES);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return null;
  }
};

// Active Subscriptions
export const saveActiveSubscription = async (subscription) => {
  try {
    const existing = await getActiveSubscriptions();
    const updated = [...(existing || []), subscription];
    await AsyncStorage.setItem(KEYS.ACTIVE_SUBSCRIPTIONS, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Error saving subscription:', error);
    return false;
  }
};

export const getActiveSubscriptions = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.ACTIVE_SUBSCRIPTIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting subscriptions:', error);
    return [];
  }
};

export const updateSubscription = async (subscriptionId, updates) => {
  try {
    const existing = await getActiveSubscriptions();
    const updated = existing.map((sub) =>
      sub.id === subscriptionId ? { ...sub, ...updates } : sub
    );
    await AsyncStorage.setItem(KEYS.ACTIVE_SUBSCRIPTIONS, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Error updating subscription:', error);
    return false;
  }
};

// Onboarding
export const setOnboardingComplete = async () => {
  try {
    await AsyncStorage.setItem(KEYS.HAS_COMPLETED_ONBOARDING, 'true');
    return true;
  } catch (error) {
    console.error('Error setting onboarding complete:', error);
    return false;
  }
};

export const hasCompletedOnboarding = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.HAS_COMPLETED_ONBOARDING);
    return data === 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
};

// Clear all data (for testing/logout)
export const clearAllData = async () => {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};

export default {
  saveUserProfile,
  getUserProfile,
  saveUserPreferences,
  getUserPreferences,
  saveActiveSubscription,
  getActiveSubscriptions,
  updateSubscription,
  setOnboardingComplete,
  hasCompletedOnboarding,
  clearAllData,
};
