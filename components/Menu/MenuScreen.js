import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Spacing, BorderRadius } from '../../utils/globalStyles';
import { useMenu } from '../../context/MenuContext';
import { useLanguage } from '../../context/LanguageContext';
import MenuItem from './MenuItem';

// Category emoji icons mapping
const categoryIcons = {
  chicken: '🍗',
  beef: '🥩',
  salmon: '🐟',
  sandwich: '🥪',
  salad: '🥗',
  vegetarian: '🥬',
  beverage: '🥤',
};

const MenuScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const {
    menuItems,
    categories,
    selectedCategory,
    loading,
    error,
    loadCategories,
    loadMenuItems,
  } = useMenu();

  useEffect(() => {
    loadCategories();
    loadMenuItems('chicken'); // Load chicken by default
  }, []);

  const handleCategoryPress = (categoryId) => {
    loadMenuItems(categoryId);
  };

  const handleMenuItemPress = (item) => {
    console.log('Menu item pressed:', item);
    // Navigate to SubscriptionPackages screen
    navigation.getParent().navigate('SubscriptionPackages');
  };

  const handleSubscribePress = () => {
    // Navigate to SubscriptionPackages screen
    navigation.getParent().navigate('SubscriptionPackages');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('menu.title')}</Text>
        <Text style={styles.subtitle}>{t('menu.subtitle')}</Text>
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(category) => category.value}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item: category }) => (
            <TouchableOpacity
              style={[
                styles.categoryTab,
                selectedCategory === category.value && styles.categoryTabActive,
              ]}
              onPress={() => handleCategoryPress(category.value)}
            >
              <Text style={styles.categoryEmoji}>
                {categoryIcons[category.value] || '🍽️'}
              </Text>
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.value && styles.categoryTextActive,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Menu Items */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>{t('menu.loadingMenu')}</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>😕</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadMenuItems(selectedCategory)}
          >
            <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={menuItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MenuItem item={item} onPress={handleMenuItemPress} />
          )}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🍽️</Text>
              <Text style={styles.emptyText}>{t('menu.noItems')}</Text>
            </View>
          }
        />
      )}

      {/* Floating Subscribe Button */}
      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribePress}>
          <LinearGradient
            colors={['#00B14F', '#00D95F']}
            style={styles.subscribeButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.subscribeButtonText}>{t('menu.subscribe')} 648 {t('common.sar')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  title: {
    ...Fonts.bold,
    fontSize: 32,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  categoryContainer: {
    paddingVertical: Spacing.md,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.inputBackground,
    borderWidth: 2,
    borderColor: Colors.inputBackground,
    marginLeft: Spacing.sm,
  },
  categoryTabActive: {
    backgroundColor: '#E8F5E9',
    borderColor: Colors.primary,
  },
  categoryEmoji: {
    fontSize: 20,
    marginRight: Spacing.xs,
  },
  categoryText: {
    ...Fonts.medium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  categoryTextActive: {
    ...Fonts.semiBold,
    color: Colors.primary,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  listContent: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Fonts.medium,
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  errorEmoji: {
    fontSize: 60,
    marginBottom: Spacing.md,
  },
  errorText: {
    ...Fonts.medium,
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  retryButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
  },
  retryButtonText: {
    ...Fonts.semiBold,
    fontSize: 14,
    color: Colors.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl * 2,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: Spacing.md,
  },
  emptyText: {
    ...Fonts.medium,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  subscribeButton: {
    width: '100%',
    height: 56,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  subscribeButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subscribeButtonText: {
    ...Fonts.bold,
    fontSize: 16,
    color: Colors.white,
  },
});

export default MenuScreen;
