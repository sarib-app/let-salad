import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Spacing, BorderRadius } from '../../utils/globalStyles';
import { getSubscriptionTypes, getSubscriptionPackages } from '../../utils/api';
import { useLanguage } from '../../context/LanguageContext';

const SubscriptionPackagesScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const [subscriptionTypes, setSubscriptionTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [packagesLoading, setPackagesLoading] = useState(false);

  useEffect(() => {
    loadSubscriptionTypes();
  }, []);

  const loadSubscriptionTypes = async () => {
    try {
      setLoading(true);
      const response = await getSubscriptionTypes();

      if (response.code === 200 && response.subscription_types) {
        setSubscriptionTypes(response.subscription_types);

        // Select the first type by default (24-day)
        if (response.subscription_types.length > 0) {
          const defaultType = response.subscription_types[0];
          setSelectedType(defaultType);
          await loadPackagesForType(defaultType.id);
        }
      }
    } catch (error) {
      console.error('Error loading subscription types:', error);
      Alert.alert(t('common.error'), t('packages.failedLoadPackages'));
    } finally {
      setLoading(false);
    }
  };

  const loadPackagesForType = async (typeId) => {
    try {
      setPackagesLoading(true);
      const response = await getSubscriptionPackages(typeId);

      if (response.code === 200 && response.packages) {
        setPackages(response.packages);
      }
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setPackagesLoading(false);
    }
  };

  const handleDurationChange = async (type) => {
    if (type.id === selectedType?.id) return;
    setSelectedType(type);
    await loadPackagesForType(type.id);
  };

  const handlePackageSelect = (pkg) => {
    // Pass package and subscription type info to next screen
    navigation.navigate('DeliveryPreferences', {
      package: pkg,
      subscriptionType: selectedType,
      duration: selectedType?.duration_days,
    });
  };

  // Format contents object into readable summary
  const getContentsSummary = (contents) => {
    if (!contents) return '';

    return Object.entries(contents)
      .map(([key, qty]) => {
        // Format key: "chicken_meals" → "Chicken Meals", "salads" → "Salads"
        const label = key
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
        return `${qty} ${label}`;
      })
      .join(', ');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>{t('packages.loadingPackages')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('packages.title')}</Text>
        <Text style={styles.subtitle}>{t('packages.subtitle')}</Text>

        {/* Duration Toggle */}
        {subscriptionTypes.length > 1 && (
          <View style={styles.durationContainer}>
            {subscriptionTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.durationButton,
                  selectedType?.id === type.id && styles.durationButtonActive,
                ]}
                onPress={() => handleDurationChange(type)}
              >
                <Text
                  style={[
                    styles.durationText,
                    selectedType?.id === type.id && styles.durationTextActive,
                  ]}
                >
                  {type.duration_days} {t('common.days')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {packagesLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>{t('packages.loadingPackages')}</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {packages.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>{t('packages.noPackages')}</Text>
            </View>
          ) : (
            packages.map((pkg, index) => {
              const isFirst = index === 0;

              return (
                <TouchableOpacity
                  key={pkg.id}
                  style={[styles.packageCard, isFirst && styles.packageCardPopular]}
                  onPress={() => handlePackageSelect(pkg)}
                >
                  {isFirst && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularText}>⭐ {t('packages.recommended')}</Text>
                    </View>
                  )}

                  <View style={styles.packageHeader}>
                    <Text style={styles.packageTitle}>{pkg.name}</Text>
                    <View style={styles.priceContainer}>
                      <Text style={styles.price}>{pkg.price}</Text>
                      <Text style={styles.currency}> {t('common.sar')}</Text>
                    </View>
                  </View>

                  {pkg.description && (
                    <Text style={styles.description} numberOfLines={2}>
                      {pkg.description}
                    </Text>
                  )}

                  {pkg.contents && Object.keys(pkg.contents).length > 0 && (
                    <View style={styles.mealsContainer}>
                      <Text style={styles.mealsLabel}>{t('packages.includes')}</Text>
                      <Text style={styles.mealsText}>{getContentsSummary(pkg.contents)}</Text>
                    </View>
                  )}

                  <View style={styles.durationBadge}>
                    <Text style={styles.durationBadgeText}>
                      {selectedType?.duration_days} {t('common.days')}
                    </Text>
                  </View>

                  <View style={styles.selectButton}>
                    <LinearGradient
                      colors={isFirst ? ['#00B14F', '#00D95F'] : ['#F5F5F5', '#F5F5F5']}
                      style={styles.selectButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text
                        style={[
                          styles.selectButtonText,
                          !isFirst && styles.selectButtonTextSecondary,
                        ]}
                      >
                        {t('packages.selectPlan')}
                      </Text>
                    </LinearGradient>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}
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
  emptyState: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  emptyStateText: {
    ...Fonts.medium,
    fontSize: 15,
    color: Colors.textSecondary,
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
