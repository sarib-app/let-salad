import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Fonts, Spacing, BorderRadius } from '../../utils/globalStyles';
import { getUserSubscriptions } from '../../utils/api';
import { useLanguage } from '../../context/LanguageContext';

const SubscriptionsScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load subscriptions when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadSubscriptions();
    }, [])
  );

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await getUserSubscriptions();

      if (response.code === 200) {
        setSubscriptions(response.subscriptions || []);
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      Alert.alert(t('common.error'), t('subscription.failedLoadSubscriptions'));
    } finally {
      setLoading(false);
    }
  };

  const handleChooseSubscription = () => {
    navigation.navigate('SubscriptionPackages');
  };

  const handleAddMore = () => {
    navigation.navigate('SubscriptionPackages');
  };

  const handleManageSubscription = (subscription) => {
    navigation.navigate('ManageSubscription', {
      subscriptionId: subscription.id,
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'active':
        return { bg: Colors.primary, text: t('common.active') };
      case 'paused':
        return { bg: '#FFB020', text: t('common.paused') };
      case 'expired':
        return { bg: '#9E9E9E', text: t('common.expired') };
      case 'cancelled':
        return { bg: '#E53935', text: t('common.cancelled') };
      default:
        return { bg: Colors.textSecondary, text: status };
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('subscription.mySubscriptions')}</Text>
        </View>
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={[styles.emptySubtitle, { marginTop: Spacing.md }]}>
            {t('subscription.loadingSubscriptions')}
          </Text>
        </View>
      </View>
    );
  }

  // Empty state - no subscriptions
  if (subscriptions.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('subscription.mySubscriptions')}</Text>
        </View>

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📋</Text>
          <Text style={styles.emptyTitle}>{t('subscription.noSubscriptions')}</Text>
          <Text style={styles.emptySubtitle}>
            {t('subscription.noSubscriptionsDesc')}{'\n'}
            {t('subscription.chooseToStart')}
          </Text>

          <TouchableOpacity
            style={styles.chooseButton}
            onPress={handleChooseSubscription}
          >
            <LinearGradient
              colors={['#00B14F', '#00D95F']}
              style={styles.chooseButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.chooseButtonText}>{t('subscription.chooseSubscription')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Active subscriptions view
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('subscription.mySubscriptions')}</Text>
        <Text style={styles.subtitle}>{t('subscription.manageSubtitle')}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {subscriptions.map((subscription) => {
          const statusInfo = getStatusStyle(subscription.status);

          return (
            <View key={subscription.id} style={styles.subscriptionCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.packageName}>
                  {subscription.subscription_package?.name || 'Subscription'}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                  <Text style={styles.statusText}>{statusInfo.text}</Text>
                </View>
              </View>

              <View style={styles.cardDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t('subscription.plan')}</Text>
                  <Text style={styles.detailValue}>
                    {subscription.subscription_type?.name} ({subscription.subscription_type?.duration_days} {t('common.days')})
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t('subscription.mealsRemaining')}</Text>
                  <Text style={styles.detailValue}>{subscription.meals_remaining || 0}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t('subscription.daysRemaining')}</Text>
                  <Text style={styles.detailValue}>{subscription.remaining_days || 0} {t('common.days')}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.manageButton}
                onPress={() => handleManageSubscription(subscription)}
              >
                <Text style={styles.manageButtonText}>{t('subscription.manageSubscription')}</Text>
              </TouchableOpacity>
            </View>
          );
        })}

        <TouchableOpacity style={styles.addMoreButton} onPress={handleAddMore}>
          <Text style={styles.addMoreText}>{t('subscription.addMore')}</Text>
        </TouchableOpacity>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    ...Fonts.bold,
    fontSize: 22,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    ...Fonts.regular,
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  chooseButton: {
    width: '100%',
    height: 56,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginTop: Spacing.md,
  },
  chooseButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chooseButtonText: {
    ...Fonts.bold,
    fontSize: 16,
    color: Colors.white,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  subscriptionCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  packageName: {
    ...Fonts.bold,
    fontSize: 18,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.md,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    ...Fonts.semiBold,
    fontSize: 12,
    color: Colors.white,
  },
  cardDetails: {
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  detailLabel: {
    ...Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  detailValue: {
    ...Fonts.semiBold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  manageButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
  },
  manageButtonText: {
    ...Fonts.semiBold,
    fontSize: 14,
    color: Colors.primary,
  },
  addMoreButton: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  addMoreText: {
    ...Fonts.semiBold,
    fontSize: 15,
    color: Colors.primary,
  },
});

export default SubscriptionsScreen;
