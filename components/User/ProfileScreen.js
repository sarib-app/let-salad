import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Fonts, Spacing, BorderRadius } from '../../utils/globalStyles';

const ProfileScreen = () => {
  const navigation = useNavigation();

  const handleMenuPress = (item) => {
    switch (item.id) {
      case 3: // Delivery Address
        navigation.navigate('AddressManagement');
        break;
      default:
        break;
    }
  };
  const menuItems = [
    { id: 1, title: 'Edit Profile', icon: '✏️' },
    { id: 2, title: 'My Preferences', icon: '⚙️' },
    { id: 3, title: 'Delivery Address', icon: '📍' },
    { id: 4, title: 'Payment Methods', icon: '💳' },
    { id: 5, title: 'Order History', icon: '📦' },
    { id: 6, title: 'Help & Support', icon: '💬' },
    { id: 7, title: 'Settings', icon: '🔧' },
    { id: 8, title: 'Logout', icon: '🚪' },
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
              <Text style={styles.menuTitle}>{item.title}</Text>
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
