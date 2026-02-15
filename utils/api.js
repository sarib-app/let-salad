import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL for the API
const API_BASE_URL = 'https://calo.dwrylight.com/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear storage
      await AsyncStorage.removeItem('@auth_token');
      await AsyncStorage.removeItem('@user_data');
    }
    return Promise.reject(error);
  }
);

// ==================== AUTHENTICATION APIs ====================

/**
 * 1. Send OTP to phone number
 * @param {string} phone - Phone number with country code (e.g., "+966501234567")
 * @returns {Promise<{code: number, message: string, otp: string}>}
 */
export const sendOTP = async (phone) => {
  try {
    const response = await api.post('/mobile/auth/send-otp', { phone });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 2. Verify OTP and login/register
 * @param {string} phone - Phone number with country code
 * @param {string} code - OTP code received
 * @returns {Promise<{code: number, message: string, user: object, token: string, onboarding_status: object}>}
 */
export const verifyOTP = async (phone, code) => {
  try {
    const response = await api.post('/mobile/auth/verify-otp', {
      phone,
      code,
    });

    // Save token and user data to AsyncStorage
    if (response.data.token) {
      await AsyncStorage.setItem('@auth_token', response.data.token);
      await AsyncStorage.setItem('@user_data', JSON.stringify(response.data.user));
    }

    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 3. Get current user profile
 * @returns {Promise<{code: number, user: object}>}
 */
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/mobile/auth/me');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 4. Update user profile
 * @param {object} profileData - {name, email, language, sex, weight, height, age}
 * @returns {Promise<{code: number, message: string, user: object}>}
 */
export const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/mobile/auth/profile', profileData);

    // Update stored user data
    if (response.data.user) {
      await AsyncStorage.setItem('@user_data', JSON.stringify(response.data.user));
    }

    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 5. Logout user
 * @returns {Promise<object>}
 */
export const logout = async () => {
  try {
    const response = await api.post('/mobile/auth/logout');
    await AsyncStorage.removeItem('@auth_token');
    await AsyncStorage.removeItem('@user_data');
    return response.data;
  } catch (error) {
    // Even if API fails, clear local storage
    await AsyncStorage.removeItem('@auth_token');
    await AsyncStorage.removeItem('@user_data');
    throw error.response?.data || error;
  }
};

// ==================== PREFERENCES APIs ====================

/**
 * Get user preferences
 * @returns {Promise<{code: number, preferences: object}>}
 */
export const getPreferences = async () => {
  try {
    const response = await api.get('/mobile/getPreferences');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Save user preferences
 * @param {object} preferences - {subscribing_for, gender, has_allergies, goal, meal_type}
 * @returns {Promise<{code: number, message: string, preferences: object}>}
 */
export const savePreferences = async (preferences) => {
  try {
    const response = await api.post('/mobile/savePreferences', preferences);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ==================== ADDRESS APIs ====================

/**
 * List user addresses
 * @returns {Promise<{code: number, addresses: Array}>}
 * Backend response: {code: 200, addresses: [{id, type, is_primary, street_address, ...}]}
 */
export const listAddresses = async () => {
  try {
    const response = await api.get('/mobile/listAddresses');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get single address
 * @param {number} id - Address ID
 * @returns {Promise<{code: number, address: object}>}
 * Backend response: {code: 200, address: {id, type, is_primary, ...}}
 */
export const getAddress = async (id) => {
  try {
    const response = await api.get(`/mobile/getAddress/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Create new address
 * @param {object} address - {type, is_primary, street_address, building_number, apartment_number, city, district, postal_code, delivery_notes, latitude, longitude}
 * @returns {Promise<{code: number, message: string, address: object}>}
 * Backend response: {code: 201, message: "Address created successfully", address: {...}}
 */
export const createAddress = async (address) => {
  try {
    const response = await api.post('/mobile/createAddress', address);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Update address
 * @param {number} id - Address ID
 * @param {object} address - Address data
 * @returns {Promise<{code: number, message: string, address: object}>}
 */
export const updateAddress = async (id, address) => {
  try {
    const response = await api.put(`/mobile/updateAddress/${id}`, address);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Set primary address
 * @param {number} id - Address ID
 * @returns {Promise<{code: number, message: string}>}
 */
export const setPrimaryAddress = async (id) => {
  try {
    const response = await api.put(`/mobile/setPrimaryAddress/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Delete address
 * @param {number} id - Address ID
 * @returns {Promise<{code: number, message: string}>}
 */
export const deleteAddress = async (id) => {
  try {
    const response = await api.delete(`/mobile/deleteAddress/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ==================== MENU APIs ====================

/**
 * Get menu items
 * @returns {Promise<{code: number, meals: Array}>}
 * Backend response: {code: 200, meals: [{id, name, name_ar, slug, category, description, description_ar, image_url, calories, protein, carbs, fat, price}, ...]}
 */
export const getMenu = async () => {
  try {
    const response = await api.get('/mobile/menu');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get meal details
 * @param {number} id - Meal ID
 * @returns {Promise<{code: number, meal: object}>}
 * Backend response: {code: 200, meal: {id, name, name_ar, slug, category, description, description_ar, image_url, calories, protein, carbs, fat, price}}
 */
export const getMealDetails = async (id) => {
  try {
    const response = await api.get(`/mobile/menu/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get menu categories
 * @returns {Promise<{code: number, categories: Array}>}
 * Backend response: {code: 200, categories: [{value, label, label_ar}, ...]}
 */
export const getMenuCategories = async () => {
  try {
    const response = await api.get('/mobile/menu/categories');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ==================== SUBSCRIPTION APIs ====================

/**
 * Get subscription types
 * @returns {Promise<Array>}
 */
export const getSubscriptionTypes = async () => {
  try {
    const response = await api.get('/mobile/subscriptions/types');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get packages for subscription type
 * @param {number} typeId - Subscription type ID
 * @returns {Promise<Array>}
 */
export const getSubscriptionPackages = async (typeId) => {
  try {
    const response = await api.get(`/mobile/subscriptions/packages/${typeId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get user's subscriptions
 * @returns {Promise<Array>}
 */
export const getUserSubscriptions = async () => {
  try {
    const response = await api.get('/mobile/subscriptions');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get subscription details
 * @param {number} id - Subscription ID
 * @returns {Promise<object>}
 */
export const getSubscriptionDetails = async (id) => {
  try {
    const response = await api.get(`/mobile/subscriptions/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Purchase subscription
 * @param {object} data - {subscription_type_id, subscription_package_id, payment_method, payment_reference}
 * @returns {Promise<object>}
 */
export const purchaseSubscription = async (data) => {
  try {
    const response = await api.post('/mobile/subscriptions', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Pause subscription
 * @param {number} id - Subscription ID
 * @param {object} data - {paused_until, reason}
 * @returns {Promise<object>}
 */
export const pauseSubscription = async (id, data) => {
  try {
    const response = await api.post(`/mobile/subscriptions/${id}/pause`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Resume subscription
 * @param {number} id - Subscription ID
 * @returns {Promise<object>}
 */
export const resumeSubscription = async (id) => {
  try {
    const response = await api.post(`/mobile/subscriptions/${id}/resume`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ==================== MEAL PLAN APIs ====================

/**
 * Get available meals for next 5 days
 * @returns {Promise<object>}
 */
export const getAvailableMeals = async () => {
  try {
    const response = await api.get('/mobile/mealPlans/available');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get upcoming meal plans
 * @returns {Promise<Array>}
 */
export const getUpcomingMealPlans = async () => {
  try {
    const response = await api.get('/mobile/mealPlans/upcoming');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get meal plans for subscription
 * @param {number} subscriptionId - Subscription ID
 * @returns {Promise<Array>}
 */
export const getSubscriptionMealPlans = async (subscriptionId) => {
  try {
    const response = await api.get(`/mobile/subscriptions/${subscriptionId}/mealPlans`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Create/Update meal plan
 * @param {number} subscriptionId - Subscription ID
 * @param {object} data - {delivery_date, meals: [{meal_id, quantity}]}
 * @returns {Promise<object>}
 */
export const saveMealPlan = async (subscriptionId, data) => {
  try {
    const response = await api.post(`/mobile/subscriptions/${subscriptionId}/mealPlans`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get meal plan details
 * @param {number} subscriptionId - Subscription ID
 * @param {number} planId - Meal plan ID
 * @returns {Promise<object>}
 */
export const getMealPlanDetails = async (subscriptionId, planId) => {
  try {
    const response = await api.get(`/mobile/subscriptions/${subscriptionId}/mealPlans/${planId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Cancel meal plan
 * @param {number} subscriptionId - Subscription ID
 * @param {number} planId - Meal plan ID
 * @returns {Promise<object>}
 */
export const cancelMealPlan = async (subscriptionId, planId) => {
  try {
    const response = await api.delete(`/mobile/subscriptions/${subscriptionId}/mealPlans/${planId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default api;
