import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Spacing, BorderRadius } from '../../utils/globalStyles';
import {
  getSubscriptionDetails,
  pauseSubscription as pauseSubscriptionAPI,
  resumeSubscription as resumeSubscriptionAPI,
} from '../../utils/api';
import { useLanguage } from '../../context/LanguageContext';

const ManageSubscriptionScreen = ({ route, navigation }) => {
  const { t } = useLanguage();
  const { subscriptionId } = route.params;
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const response = await getSubscriptionDetails(subscriptionId);

      if (response.code === 200) {
        setSubscription(response.subscription);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
      Alert.alert(t('common.error'), t('manageSubscription.failedLoadDetails'));
    } finally {
      setLoading(false);
    }
  };

  const handlePauseSubscription = () => {
    const maxPauseDays = subscription.subscription_type?.duration_days === 24 ? 5 : 3;
    const usedPauseDays = subscription.total_days_paused || 0;
    const remainingPauseDays = maxPauseDays - usedPauseDays;

    if (remainingPauseDays <= 0) {
      Alert.alert(
        t('manageSubscription.pauseLimitReached'),
        `${t('manageSubscription.pauseLimitMessage')} ${maxPauseDays} ${t('manageSubscription.pauseDaysForSub')}`
      );
      return;
    }

    // Build pause options based on remaining days
    const pauseOptions = [
      {
        text: t('common.cancel'),
        style: 'cancel',
      },
    ];

    for (let i = 1; i <= Math.min(remainingPauseDays, 5); i++) {
      pauseOptions.push({
        text: `${i} ${i === 1 ? t('common.day') : t('common.days')}`,
        onPress: () => executePause(i),
      });
    }

    Alert.alert(
      t('manageSubscription.pauseSubscription'),
      `${t('manageSubscription.youHave')} ${remainingPauseDays} ${remainingPauseDays === 1 ? t('common.day') : t('common.days')} ${t('manageSubscription.pauseRemaining')}`,
      pauseOptions
    );
  };

  const executePause = async (days) => {
    try {
      setActionLoading(true);

      // Calculate pause until date
      const pauseUntil = new Date();
      pauseUntil.setDate(pauseUntil.getDate() + days);
      const pauseUntilStr = pauseUntil.toISOString().split('T')[0];

      const response = await pauseSubscriptionAPI(subscriptionId, {
        paused_until: pauseUntilStr,
        reason: 'Paused from app',
      });

      if (response.code === 200) {
        setSubscription(response.subscription);

        Alert.alert(
          t('manageSubscription.subscriptionPaused'),
          response.message || `${t('manageSubscription.subscriptionPausedFor')} ${days} ${days === 1 ? t('common.day') : t('common.days')}.`,
          [{ text: t('common.ok') }]
        );
      } else {
        Alert.alert(t('common.error'), response.message || t('manageSubscription.failedPause'));
      }
    } catch (error) {
      console.error('Error pausing subscription:', error);
      Alert.alert(t('common.error'), error.message || t('manageSubscription.failedPauseRetry'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleResumeSubscription = async () => {
    try {
      setActionLoading(true);

      const response = await resumeSubscriptionAPI(subscriptionId);

      if (response.code === 200) {
        setSubscription(response.subscription);

        Alert.alert(
          t('manageSubscription.subscriptionResumed'),
          response.message || t('manageSubscription.subscriptionActive'),
          [{ text: t('common.ok') }]
        );
      } else {
        Alert.alert(t('common.error'), response.message || t('manageSubscription.failedResume'));
      }
    } catch (error) {
      console.error('Error resuming subscription:', error);
      Alert.alert(t('common.error'), error.message || t('manageSubscription.failedResumeRetry'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectMeals = () => {
    navigation.navigate('MealSelection', {
      subscription,
      onMealsSelected: () => loadSubscription(),
    });
  };

  const getPauseInfo = () => {
    if (!subscription || subscription.status !== 'paused' || !subscription.paused_until) return null;

    const pauseEnd = new Date(subscription.paused_until);
    const daysLeft = Math.ceil((pauseEnd - new Date()) / (1000 * 60 * 60 * 24));

    return {
      daysLeft: Math.max(0, daysLeft),
      endDate: pauseEnd.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading || !subscription) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>{t('manageSubscription.loadingSubscription')}</Text>
        </View>
      </View>
    );
  }

  const pauseInfo = getPauseInfo();
  const isPaused = subscription.status === 'paused';

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Banner */}
        {isPaused && pauseInfo && (
          <View style={styles.pausedBanner}>
            <Text style={styles.pausedIcon}>⏸️</Text>
            <View style={styles.pausedContent}>
              <Text style={styles.pausedTitle}>{t('manageSubscription.subscriptionPaused')}</Text>
              <Text style={styles.pausedText}>
                {t('manageSubscription.resumesIn')} {pauseInfo.daysLeft} {pauseInfo.daysLeft === 1 ? t('common.day') : t('common.days')} {t('manageSubscription.on')}{' '}
                {pauseInfo.endDate}
              </Text>
            </View>
          </View>
        )}

        {/* Subscription Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('manageSubscription.subscriptionDetails')}</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('manageSubscription.package')}</Text>
              <Text style={styles.detailValue}>
                {subscription.subscription_package?.name || '-'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('manageSubscription.plan')}</Text>
              <Text style={styles.detailValue}>
                {subscription.subscription_type?.name || '-'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('manageSubscription.duration')}</Text>
              <Text style={styles.detailValue}>
                {subscription.subscription_type?.duration_days || 0} {t('common.days')}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('manageSubscription.daysRemaining')}</Text>
              <Text style={styles.detailValue}>{subscription.remaining_days || 0} {t('common.days')}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('manageSubscription.mealsRemaining')}</Text>
              <Text style={styles.detailValue}>{subscription.meals_remaining || 0}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('manageSubscription.startDate')}</Text>
              <Text style={styles.detailValue}>{formatDate(subscription.start_date)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('manageSubscription.endDate')}</Text>
              <Text style={styles.detailValue}>{formatDate(subscription.end_date)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('manageSubscription.pauseDaysUsed')}</Text>
              <Text style={styles.detailValue}>{subscription.total_days_paused || 0}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('manageSubscription.status')}</Text>
              <View
                style={[
                  styles.statusBadge,
                  isPaused ? styles.statusBadgePaused : styles.statusBadgeActive,
                ]}
              >
                <Text style={styles.statusText}>
                  {isPaused ? t('common.paused') : t('common.active')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Delivery Info */}
        {subscription.delivery_address && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('manageSubscription.deliveryInfo')}</Text>
            <View style={styles.preferencesCard}>
              <View style={styles.preferenceRow}>
                <Text style={styles.preferenceIcon}>📍</Text>
                <View style={styles.preferenceContent}>
                  <Text style={styles.preferenceLabel}>{t('manageSubscription.deliveryAddress')}</Text>
                  <Text style={styles.preferenceValue}>
                    {subscription.delivery_address.street_address}, {subscription.delivery_address.district}
                  </Text>
                  <Text style={styles.preferenceValue}>
                    {subscription.delivery_address.city}
                  </Text>
                </View>
              </View>
              {subscription.delivery_zone && (
                <View style={styles.preferenceRow}>
                  <Text style={styles.preferenceIcon}>🗺️</Text>
                  <View style={styles.preferenceContent}>
                    <Text style={styles.preferenceLabel}>{t('manageSubscription.deliveryZone')}</Text>
                    <Text style={styles.preferenceValue}>
                      {subscription.delivery_zone.name}
                    </Text>
                  </View>
                </View>
              )}
              <View style={styles.preferenceRow}>
                <Text style={styles.preferenceIcon}>💳</Text>
                <View style={styles.preferenceContent}>
                  <Text style={styles.preferenceLabel}>{t('manageSubscription.payment')}</Text>
                  <Text style={styles.preferenceValue}>
                    {subscription.total_amount} {t('common.sar')} ({subscription.payment_method}) - {subscription.payment_status}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Meal Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('manageSubscription.mealPlanning')}</Text>
          <TouchableOpacity style={styles.mealSelectionCard} onPress={handleSelectMeals}>
            <View style={styles.mealSelectionContent}>
              <Text style={styles.mealSelectionIcon}>🍽️</Text>
              <View style={styles.mealSelectionText}>
                <Text style={styles.mealSelectionTitle}>{t('manageSubscription.selectMeals')}</Text>
                <Text style={styles.mealSelectionSubtitle}>
                  {t('manageSubscription.selectMealsDesc')}
                </Text>
              </View>
            </View>
            <Text style={styles.mealSelectionArrow}>›</Text>
          </TouchableOpacity>
          <Text style={styles.mealSelectionNote}>
            💡 {t('manageSubscription.mealUpdateNote')}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('manageSubscription.actions')}</Text>

          {!isPaused ? (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handlePauseSubscription}
              disabled={actionLoading}
            >
              <Text style={styles.actionIcon}>⏸️</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>{t('manageSubscription.pauseSubscription')}</Text>
                <Text style={styles.actionSubtitle}>
                  {subscription.total_days_paused || 0} {t('manageSubscription.pauseDaysUsedAction')}
                </Text>
              </View>
              {actionLoading ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Text style={styles.actionArrow}>›</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.resumeButton]}
              onPress={handleResumeSubscription}
              disabled={actionLoading}
            >
              <Text style={styles.actionIcon}>▶️</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>{t('manageSubscription.resumeSubscription')}</Text>
                <Text style={styles.actionSubtitle}>{t('manageSubscription.resumeDesc')}</Text>
              </View>
              {actionLoading ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Text style={styles.actionArrow}>›</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  pausedBanner: {
    backgroundColor: '#FFF4E5',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD580',
  },
  pausedIcon: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  pausedContent: {
    flex: 1,
  },
  pausedTitle: {
    ...Fonts.bold,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  pausedText: {
    ...Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Fonts.bold,
    fontSize: 18,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  detailsCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
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
    textAlign: 'right',
    flex: 1,
    marginLeft: Spacing.md,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusBadgeActive: {
    backgroundColor: Colors.primary,
  },
  statusBadgePaused: {
    backgroundColor: '#FFB020',
  },
  statusText: {
    ...Fonts.semiBold,
    fontSize: 12,
    color: Colors.white,
  },
  preferencesCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  preferenceIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  preferenceContent: {
    flex: 1,
  },
  preferenceLabel: {
    ...Fonts.semiBold,
    fontSize: 13,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  preferenceValue: {
    ...Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  mealSelectionCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  mealSelectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mealSelectionIcon: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  mealSelectionText: {
    flex: 1,
  },
  mealSelectionTitle: {
    ...Fonts.bold,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  mealSelectionSubtitle: {
    ...Fonts.regular,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  mealSelectionArrow: {
    ...Fonts.bold,
    fontSize: 24,
    color: Colors.primary,
  },
  mealSelectionNote: {
    ...Fonts.regular,
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  resumeButton: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F9F4',
  },
  actionIcon: {
    fontSize: 28,
    marginRight: Spacing.md,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    ...Fonts.bold,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  actionSubtitle: {
    ...Fonts.regular,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  actionArrow: {
    ...Fonts.bold,
    fontSize: 24,
    color: Colors.textSecondary,
  },
});

export default ManageSubscriptionScreen;
