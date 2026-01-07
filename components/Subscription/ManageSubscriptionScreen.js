import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Spacing, BorderRadius } from '../../utils/globalStyles';
import { updateSubscription, getActiveSubscriptions } from '../../utils/storage';

const ManageSubscriptionScreen = ({ route, navigation }) => {
  const { subscriptionId } = route.params;
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    const subs = await getActiveSubscriptions();
    const sub = subs.find((s) => s.id === subscriptionId);
    setSubscription(sub);
    setLoading(false);
  };

  const getMealsSummary = (meals) => {
    return meals.map((m) => `${m.qty} ${m.meal_name}`).join(', ');
  };

  const handlePauseSubscription = () => {
    // Calculate max pause days based on subscription duration
    const maxPauseDays = subscription.duration === 24 ? 5 : 3;
    const usedPauseDays = subscription.total_pause_days_used || 0;
    const remainingPauseDays = maxPauseDays - usedPauseDays;

    if (remainingPauseDays <= 0) {
      Alert.alert(
        'Pause Limit Reached',
        `You have already used all ${maxPauseDays} pause days for this subscription.`
      );
      return;
    }

    // Build pause options based on remaining days
    const pauseOptions = [
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ];

    for (let i = 1; i <= Math.min(remainingPauseDays, 5); i++) {
      pauseOptions.push({
        text: `${i} ${i === 1 ? 'Day' : 'Days'}`,
        onPress: () => pauseSubscription(i),
      });
    }

    Alert.alert(
      'Pause Subscription',
      `You have ${remainingPauseDays} pause ${remainingPauseDays === 1 ? 'day' : 'days'} remaining (${maxPauseDays} total for ${subscription.duration}-day subscription)`,
      pauseOptions
    );
  };

  const pauseSubscription = async (days) => {
    const pauseEndDate = new Date();
    pauseEndDate.setDate(pauseEndDate.getDate() + days);

    const currentUsedDays = subscription.total_pause_days_used || 0;

    const updated = await updateSubscription(subscriptionId, {
      status: 'paused',
      pause_days: days,
      pause_start: new Date().toISOString(),
      pause_end: pauseEndDate.toISOString(),
      total_pause_days_used: currentUsedDays + days,
    });

    if (updated) {
      const maxPauseDays = subscription.duration === 24 ? 5 : 3;
      const remainingAfterPause = maxPauseDays - (currentUsedDays + days);

      Alert.alert(
        'Subscription Paused',
        `Your subscription has been paused for ${days} ${days === 1 ? 'day' : 'days'}.\n\nRemaining pause days: ${remainingAfterPause}`,
        [
          {
            text: 'OK',
            onPress: () => {
              loadSubscription();
            },
          },
        ]
      );
    }
  };

  const handleResumeSubscription = async () => {
    const updated = await updateSubscription(subscriptionId, {
      status: 'active',
      pause_days: 0,
      pause_start: null,
      pause_end: null,
    });

    if (updated) {
      Alert.alert('Subscription Resumed', 'Your subscription is now active again.', [
        {
          text: 'OK',
          onPress: () => {
            loadSubscription();
          },
        },
      ]);
    }
  };

  const handleSelectMeals = () => {
    navigation.navigate('MealSelection', {
      subscription,
      onMealsSelected: () => loadSubscription(),
    });
  };

  const getDaysRemaining = () => {
    if (!subscription) return 0;
    return subscription.days_remaining || 0;
  };

  const getPauseInfo = () => {
    if (!subscription || subscription.status !== 'paused') return null;

    const pauseEnd = new Date(subscription.pause_end);
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
        <Text style={styles.loadingText}>Loading...</Text>
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
              <Text style={styles.pausedTitle}>Subscription Paused</Text>
              <Text style={styles.pausedText}>
                Resumes in {pauseInfo.daysLeft} {pauseInfo.daysLeft === 1 ? 'day' : 'days'} on{' '}
                {pauseInfo.endDate}
              </Text>
            </View>
          </View>
        )}

        {/* Subscription Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription Details</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Package</Text>
              <Text style={styles.detailValue}>{subscription.package_title}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>{subscription.duration} Days</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Days Remaining</Text>
              <Text style={styles.detailValue}>{getDaysRemaining()} Days</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Meals</Text>
              <Text style={styles.detailValue}>{getMealsSummary(subscription.meals)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Start Date</Text>
              <Text style={styles.detailValue}>{formatDate(subscription.start_date)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status</Text>
              <View
                style={[
                  styles.statusBadge,
                  isPaused ? styles.statusBadgePaused : styles.statusBadgeActive,
                ]}
              >
                <Text style={styles.statusText}>
                  {isPaused ? 'Paused' : 'Active'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Delivery Preferences */}
        {subscription.delivery_preferences && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Preferences</Text>
            <View style={styles.preferencesCard}>
              <View style={styles.preferenceRow}>
                <Text style={styles.preferenceIcon}>📍</Text>
                <View style={styles.preferenceContent}>
                  <Text style={styles.preferenceLabel}>Delivery Address</Text>
                  <Text style={styles.preferenceValue}>
                    {subscription.delivery_address.street}
                  </Text>
                </View>
              </View>
              <View style={styles.preferenceRow}>
                <Text style={styles.preferenceIcon}>⏰</Text>
                <View style={styles.preferenceContent}>
                  <Text style={styles.preferenceLabel}>Time Slot</Text>
                  <Text style={styles.preferenceValue}>
                    {subscription.delivery_preferences.timeSlot?.label} (
                    {subscription.delivery_preferences.timeSlot?.time})
                  </Text>
                </View>
              </View>
              <View style={styles.preferenceRow}>
                <Text style={styles.preferenceIcon}>📅</Text>
                <View style={styles.preferenceContent}>
                  <Text style={styles.preferenceLabel}>Delivery Days</Text>
                  <Text style={styles.preferenceValue}>
                    {subscription.delivery_preferences.daysPerWeek} days per week
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Meal Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meal Planning</Text>
          <TouchableOpacity style={styles.mealSelectionCard} onPress={handleSelectMeals}>
            <View style={styles.mealSelectionContent}>
              <Text style={styles.mealSelectionIcon}>🍽️</Text>
              <View style={styles.mealSelectionText}>
                <Text style={styles.mealSelectionTitle}>Select Your Meals</Text>
                <Text style={styles.mealSelectionSubtitle}>
                  Choose meals for the next 5 days
                </Text>
              </View>
            </View>
            <Text style={styles.mealSelectionArrow}>›</Text>
          </TouchableOpacity>
          <Text style={styles.mealSelectionNote}>
            💡 You can update meal selections up to 11:00 PM the day before delivery
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>

          {!isPaused ? (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handlePauseSubscription}
            >
              <Text style={styles.actionIcon}>⏸️</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Pause Subscription</Text>
                <Text style={styles.actionSubtitle}>Pause for up to 5 days</Text>
              </View>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.resumeButton]}
              onPress={handleResumeSubscription}
            >
              <Text style={styles.actionIcon}>▶️</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Resume Subscription</Text>
                <Text style={styles.actionSubtitle}>Resume deliveries now</Text>
              </View>
              <Text style={styles.actionArrow}>›</Text>
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
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  loadingText: {
    ...Fonts.medium,
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xxl,
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
