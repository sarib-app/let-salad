import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Fonts, Spacing, BorderRadius } from '../../utils/globalStyles';
import { useLanguage } from '../../context/LanguageContext';
import { deleteAccount } from '../../utils/api';

const ProfileScreen = () => {
  const { t, language, setLanguage } = useLanguage();
  const navigation = useNavigation();

  const handleDeleteAccount = () => {
    Alert.alert(
      t('profileScreen.deleteAccountTitle'),
      t('profileScreen.deleteAccountMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            } catch (error) {
              Alert.alert(t('common.error'), error.message || t('profileScreen.failedDeleteAccount'));
            }
          },
        },
      ]
    );
  };

  const handleLanguageToggle = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
  };

  const handleMenuPress = (item) => {
    switch (item.id) {
      case 1: // Edit Profile
        navigation.navigate('EditProfile');
        break;
      case 2: // Language
        handleLanguageToggle();
        break;
      case 3: // Delivery Address
        navigation.navigate('AddressManagement');
        break;
      case 5: // Help & Support
        Linking.openURL('mailto:support@letsalad.com');
        break;
      case 6: // Terms and Conditions
        break;
      case 7: // Privacy Policy
        break;
      case 8: // Delete Account
        handleDeleteAccount();
        break;
      case 9: // Logout
        break;
      default:
        break;
    }
  };
  const menuItems = [
    { id: 1, titleKey: 'profileScreen.editProfile', icon: '✏️' },
    { id: 2, title: `${t('profileScreen.language')} (${language === 'en' ? 'العربية' : 'English'})`, icon: '🌐' },
    { id: 3, titleKey: 'profileScreen.deliveryAddress', icon: '📍' },
    { id: 4, titleKey: 'profileScreen.paymentMethods', icon: '💳' },
    { id: 5, titleKey: 'profileScreen.helpSupport', icon: '💬' },
    { id: 6, titleKey: 'profileScreen.termsConditions', icon: '📄' },
    { id: 7, titleKey: 'profileScreen.privacyPolicy', icon: '🔏' },
    { id: 8, titleKey: 'profileScreen.deleteAccount', icon: '🗑️' },
    { id: 9, titleKey: 'profileScreen.logout', icon: '🚪' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>👤</Text>
        </View>
        <Text style={styles.name}>User Name</Text>
        <Text style={styles.email}>user@example.com</Text>
      </View>

      <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
        {menuItems.map((item) => (
          <TouchableOpacity key={item.id} style={styles.menuItem} onPress={() => handleMenuPress(item)}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuTitle}>{item.title || t(item.titleKey)}</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatar: {
    fontSize: 48,
  },
  name: {
    ...Fonts.bold,
    fontSize: 22,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  email: {
    ...Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  menuTitle: {
    ...Fonts.medium,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  menuArrow: {
    ...Fonts.regular,
    fontSize: 24,
    color: Colors.textSecondary,
  },
});

export default ProfileScreen;
