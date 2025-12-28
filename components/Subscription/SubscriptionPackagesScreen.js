import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Spacing, BorderRadius } from '../../utils/globalStyles';
import { fetchSubscriptionPackages } from '../../data/mockSubscriptionData';

const SubscriptionPackagesScreen = ({ navigation }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDuration, setSelectedDuration] = useState(24);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const data = await fetchSubscriptionPackages();
      setPackages(data);
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePackageSelect = (pkg) => {
    console.log('Selected package:', pkg);
    // Navigate to checkout or payment
    // navigation.navigate('Checkout', { package: pkg, duration: selectedDuration });
  };

  const getMealsSummary = (meals) => {
    return meals.map((m) => `${m.qty} ${m.meal_name}`).join(', ');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading packages...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>Select a subscription package that fits your lifestyle</Text>

        {/* Duration Toggle */}
        <View style={styles.durationContainer}>
          <TouchableOpacity
            style={[
              styles.durationButton,
              selectedDuration === 24 && styles.durationButtonActive,
            ]}
            onPress={() => setSelectedDuration(24)}
          >
            <Text
              style={[
                styles.durationText,
                selectedDuration === 24 && styles.durationTextActive,
              ]}
            >
              24 Days
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.durationButton,
              selectedDuration === 10 && styles.durationButtonActive,
            ]}
            onPress={() => setSelectedDuration(10)}
          >
            <Text
              style={[
                styles.durationText,
                selectedDuration === 10 && styles.durationTextActive,
              ]}
            >
              10 Days
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {packages.map((pkg) => {
          const price = selectedDuration === 24 ? pkg.price_24 : pkg.price_10;

          return (
            <TouchableOpacity
              key={pkg.id}
              style={[styles.packageCard, pkg.popular && styles.packageCardPopular]}
              onPress={() => handlePackageSelect(pkg)}
            >
              {pkg.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>⭐ Most Popular</Text>
                </View>
              )}

              <View style={styles.packageHeader}>
                <Text style={styles.packageTitle}>{pkg.package_title}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>{price}</Text>
                  <Text style={styles.currency}> SAR</Text>
                </View>
              </View>

              {pkg.description && (
                <Text style={styles.description}>{pkg.description}</Text>
              )}

              <View style={styles.mealsContainer}>
                <Text style={styles.mealsLabel}>Includes:</Text>
                <Text style={styles.mealsText}>{getMealsSummary(pkg.meals)}</Text>
              </View>

              <View style={styles.durationBadge}>
                <Text style={styles.durationBadgeText}>{selectedDuration} Days</Text>
              </View>

              <View style={styles.selectButton}>
                <LinearGradient
                  colors={pkg.popular ? ['#00B14F', '#00D95F'] : ['#F5F5F5', '#F5F5F5']}
                  style={styles.selectButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text
                    style={[
                      styles.selectButtonText,
                      !pkg.popular && styles.selectButtonTextSecondary,
                    ]}
                  >
                    Select Plan
                  </Text>
                </LinearGradient>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  loadingText: {
    ...Fonts.medium,
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  title: {
    ...Fonts.bold,
    fontSize: 28,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  durationContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.md,
    padding: 4,
  },
  durationButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  durationButtonActive: {
    backgroundColor: Colors.white,
  },
  durationText: {
    ...Fonts.medium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  durationTextActive: {
    ...Fonts.semiBold,
    color: Colors.primary,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  packageCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border,
    position: 'relative',
  },
  packageCardPopular: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F9F4',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: Spacing.lg,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  popularText: {
    ...Fonts.semiBold,
    fontSize: 12,
    color: Colors.white,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  packageTitle: {
    ...Fonts.bold,
    fontSize: 18,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.md,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    ...Fonts.bold,
    fontSize: 24,
    color: Colors.primary,
  },
  currency: {
    ...Fonts.semiBold,
    fontSize: 14,
    color: Colors.primary,
  },
  description: {
    ...Fonts.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  mealsContainer: {
    backgroundColor: Colors.inputBackground,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  mealsLabel: {
    ...Fonts.semiBold,
    fontSize: 12,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  mealsText: {
    ...Fonts.regular,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  durationBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  durationBadgeText: {
    ...Fonts.semiBold,
    fontSize: 11,
    color: Colors.white,
  },
  selectButton: {
    height: 48,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  selectButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectButtonText: {
    ...Fonts.bold,
    fontSize: 15,
    color: Colors.white,
  },
  selectButtonTextSecondary: {
    color: Colors.textPrimary,
  },
});

export default SubscriptionPackagesScreen;
