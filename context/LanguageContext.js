import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { I18nManager, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from '../utils/lang';

const LANGUAGE_KEY = '@app_language';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState('en');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (saved && (saved === 'en' || saved === 'ar')) {
        setLanguageState(saved);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    } finally {
      setIsReady(true);
    }
  };

  const setLanguage = useCallback(async (lang) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, lang);
      setLanguageState(lang);

      // Set RTL flags for next app start (no reload — translate in-place)
      const shouldBeRTL = lang === 'ar';
      I18nManager.allowRTL(shouldBeRTL);
      I18nManager.forceRTL(shouldBeRTL);
    } catch (error) {
      console.error('Error setting language:', error);
    }
  }, []);

  const t = useCallback((key) => {
    const keys = key.split('.');
    let value = translations[language];

    for (const k of keys) {
      value = value?.[k];
    }

    return value || key;
  }, [language]);

  const isRTL = language === 'ar';

  if (!isReady) return null;

  return (
    <LanguageContext.Provider value={{ t, language, setLanguage, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
