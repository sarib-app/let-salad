import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { Colors, Fonts, Spacing, BorderRadius } from '../../utils/globalStyles';
import { useLanguage } from '../../context/LanguageContext';
import { getUserSubscriptions, getDeliveries } from '../../utils/api';
import { getMockDeliveries } from '../../utils/mockDeliveryData';

const STEP_PREPARING = 0;
const STEP_ON_THE_WAY = 1;
const STEP_DELIVERED = 2;

const getStatusStep = (status) => {
  switch (status) {
    case 'preparing':
    case 'in_preparation': return STEP_PREPARING;
    case 'on_the_way': return STEP_ON_THE_WAY;
    case 'delivered': return STEP_DELIVERED;
    default: return -1;
  }
};

const DeliveriesScreen = () => {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedSubId, setSelectedSubId] = useState(null);
  const [today, setToday] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const subsResponse = await getUserSubscriptions();
      if (subsResponse.code === 200 && subsResponse.subscriptions?.length > 0) {
        const activeSubs = subsResponse.subscriptions.filter(
          (s) => s.status === 'active' || s.status === 'paused'
        );
        setSubscriptions(activeSubs);

        if (activeSubs.length > 0) {
          const firstSub = activeSubs[0];
          setSelectedSubId(firstSub.id);
          await loadDeliveries(firstSub);
        }
      }
    } catch (error) {
      console.error('Error loading deliveries:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDeliveries = async (subscription) => {
    try {
      // Try real API first, fall back to mock data
      const response = await getDeliveries(subscription.id).catch(() => null);

      if (response && response.code === 200) {
        setToday(response.today || null);
        setUpcoming(response.upcoming || []);
        setPast(response.past || []);
      } else {
        // Use mock data until backend is ready
        const mock = getMockDeliveries(subscription);
        setToday(mock.today);
        setUpcoming(mock.upcoming);
        setPast(mock.past);
      }
    } catch {
      const mock = getMockDeliveries(subscription);
      setToday(mock.today);
      setUpcoming(mock.upcoming);
      setPast(mock.past);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const sub = subscriptions.find((s) => s.id === selectedSubId);
    if (sub) await loadDeliveries(sub);
    setRefreshing(false);
  }, [subscriptions, selectedSubId]);

  const handleSelectSubscription = async (sub) => {
    setSelectedSubId(sub.id);
    await loadDeliveries(sub);
  };

  const formatDateDisplay = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'preparing':
      case 'in_preparation':
        return { label: t('deliveries.preparing'), color: '#FF9800', icon: '👨‍🍳' };
      case 'on_the_way':
        return { label: t('deliveries.onTheWay'), color: '#00B4D8', icon: '🚚' };
      case 'delivered':
        return { label: t('deliveries.delivered'), color: Colors.primary, icon: '✅' };
      case 'pending':
      case 'scheduled':
        return { label: t('deliveries.scheduled'), color: Colors.textSecondary, icon: '📅' };
      case 'skipped':
        return { label: t('deliveries.skipped'), color: '#9E9E9E', icon: '⏭️' };
      default:
        return { label: status || '', color: Colors.textSecondary, icon: '' };
    }
  };

  // ========== RENDER: Progress Stepper ==========
  const renderProgressStepper = (status) => {
    const currentStep = getStatusStep(status);
    const steps = [
      { label: t('deliveries.preparingStep'), icon: '👨‍🍳' },
      { label: t('deliveries.enRouteStep'), icon: '🚚' },
      { label: t('deliveries.deliveredStep'), icon: '📦' },
    ];

    return (
      <View style={styles.stepper}>
        {steps.map((step, index) => {
          const isCompleted = index <= currentStep;
          const isActive = index === currentStep;
          return (
            <React.Fragment key={index}>
              {index > 0 && (
                <View style={[styles.stepLine, isCompleted && styles.stepLineCompleted]} />
              )}
              <View style={styles.stepItem}>
                <View style={[
                  styles.stepCircle,
                  isCompleted && styles.stepCircleCompleted,
                  isActive && styles.stepCircleActive,
                ]}>
                  <Text style={styles.stepIcon}>
                    {isCompleted ? (index < currentStep ? '✓' : step.icon) : step.icon}
                  </Text>
                </View>
                <Text style={[
                  styles.stepLabel,
                  isCompleted && styles.stepLabelCompleted,
                  isActive && styles.stepLabelActive,
                ]}>
                  {step.label}
                </Text>
              </View>
            </React.Fragment>
          );
        })}
      </View>
    );
  };

  // ========== RENDER: Today's Delivery ==========
  const renderTodayCard = () => {
    if (!today) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('deliveries.todayDelivery')}</Text>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>{t('deliveries.noDeliveriesToday')}</Text>
          </View>
        </View>
      );
    }

    const statusInfo = getStatusInfo(today.status);
    const dayName = isAr ? today.day_name_ar : today.day_name;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('deliveries.todayDelivery')}</Text>
        <View style={[styles.todayCard, { borderColor: statusInfo.color }]}>
          {/* Header */}
          <View style={styles.todayHeader}>
            <View>
              <Text style={styles.todayDate}>{dayName}, {formatDateDisplay(today.date)}</Text>
              <Text style={styles.todaySubName}>{today.subscription_name}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
              <Text style={styles.statusBadgeIcon}>{statusInfo.icon}</Text>
              <Text style={styles.statusBadgeText}>{statusInfo.label}</Text>
            </View>
          </View>

          {/* Progress Stepper */}
          {renderProgressStepper(today.status)}

          {/* Time */}
          <View style={styles.todayTimeRow}>
            {today.delivered_time ? (
              <Text style={styles.todayTime}>
                {t('deliveries.deliveredAt')} {today.delivered_time}
              </Text>
            ) : today.estimated_time ? (
              <Text style={styles.todayTime}>
                {t('deliveries.estimatedDelivery')} {today.estimated_time}
              </Text>
            ) : null}
          </View>

          {/* Meals */}
          <View style={styles.mealsList}>
            {today.meals.map((meal, i) => (
              <View key={i} style={styles.mealRow}>
                <Text style={styles.mealBullet}>•</Text>
                <Text style={styles.mealName}>{isAr ? meal.name_ar : meal.name}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  // ========== RENDER: Upcoming ==========
  const renderUpcoming = () => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('deliveries.upcoming')}</Text>
        {upcoming.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyText}>{t('deliveries.noUpcoming')}</Text>
          </View>
        ) : (
          upcoming.map((delivery) => {
            const dayName = isAr ? delivery.day_name_ar : delivery.day_name;
            return (
              <View key={delivery.id} style={styles.upcomingCard}>
                <View style={styles.upcomingHeader}>
                  <View style={styles.upcomingDateBlock}>
                    <Text style={styles.upcomingDay}>{dayName}</Text>
                    <Text style={styles.upcomingDate}>{formatDateDisplay(delivery.date)}</Text>
                  </View>
                  <View style={[styles.statusBadgeSmall, { backgroundColor: '#F0F0F0' }]}>
                    <Text style={styles.statusBadgeSmallText}>{t('deliveries.scheduled')}</Text>
                  </View>
                </View>
                {delivery.meals_selected && delivery.meals.length > 0 ? (
                  <View style={styles.mealsList}>
                    {delivery.meals.map((meal, i) => (
                      <View key={i} style={styles.mealRow}>
                        <Text style={styles.mealBullet}>•</Text>
                        <Text style={styles.mealName}>{isAr ? meal.name_ar : meal.name}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.noMealsText}>{t('deliveries.mealsNotSelected')}</Text>
                )}
              </View>
            );
          })
        )}
      </View>
    );
  };

  // ========== RENDER: Past Deliveries ==========
  const renderPast = () => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('deliveries.pastDeliveries')}</Text>
        {past.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>{t('deliveries.noPastDeliveries')}</Text>
          </View>
        ) : (
          past.map((delivery) => {
            const dayName = isAr ? delivery.day_name_ar : delivery.day_name;
            return (
              <View key={delivery.id} style={styles.pastCard}>
                <View style={styles.pastHeader}>
                  <View>
                    <Text style={styles.pastDay}>{dayName}</Text>
                    <Text style={styles.pastDate}>{formatDateDisplay(delivery.date)}</Text>
                  </View>
                  <View style={styles.pastRight}>
                    <View style={[styles.statusBadgeSmall, { backgroundColor: '#E8F5E9' }]}>
                      <Text style={[styles.statusBadgeSmallText, { color: Colors.primary }]}>
                        ✓ {t('deliveries.delivered')}
                      </Text>
                    </View>
                    {delivery.delivered_time && (
                      <Text style={styles.pastTime}>{delivery.delivered_time}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.pastMeals}>
                  {delivery.meals.map((meal, i) => (
                    <Text key={i} style={styles.pastMealText}>
                      {isAr ? meal.name_ar : meal.name}{i < delivery.meals.length - 1 ? '  •  ' : ''}
                    </Text>
                  ))}
                </View>
              </View>
            );
          })
        )}
      </View>
    );
  };

  // ========== LOADING STATE ==========
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  // ========== NO SUBSCRIPTIONS ==========
  if (subscriptions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ fontSize: 48, marginBottom: Spacing.md }}>📭</Text>
        <Text style={styles.emptyTitle}>{t('deliveries.noSubscriptions')}</Text>
        <Text style={styles.emptySubtitle}>{t('deliveries.noSubscriptionsDesc')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Page Title */}
        <Text style={styles.pageTitle}>{t('deliveries.title')}</Text>

        {/* Subscription Filter (if multiple) */}
        {subscriptions.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {subscriptions.map((sub) => {
              const isActive = sub.id === selectedSubId;
              const subName = sub.subscription_package?.name || sub.subscription_type?.name || 'Plan';
              return (
                <TouchableOpacity
                  key={sub.id}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => handleSelectSubscription(sub)}
                >
                  <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                    {subName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {renderTodayCard()}
        {renderUpcoming()}
        {renderPast()}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F6F8',
  },
  loadingText: {
    ...Fonts.medium,
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  emptyTitle: {
    ...Fonts.bold,
    fontSize: 20,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    ...Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingTop: Platform.OS === 'ios' ? 60 : Spacing.lg,
  },
  pageTitle: {
    ...Fonts.bold,
    fontSize: 28,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },

  // Filter chips
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    paddingRight: Spacing.md,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    ...Fonts.medium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.white,
  },

  // Sections
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Fonts.bold,
    fontSize: 18,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },

  // Empty states
  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 },
      android: { elevation: 1 },
    }),
  },
  emptyIcon: { fontSize: 32, marginBottom: Spacing.sm },
  emptyText: { ...Fonts.regular, fontSize: 14, color: Colors.textSecondary },

  // Today's card
  todayCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 2,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12 },
      android: { elevation: 4 },
    }),
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  todayDate: {
    ...Fonts.bold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  todaySubName: {
    ...Fonts.regular,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Status badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  statusBadgeIcon: { fontSize: 14, marginRight: 4 },
  statusBadgeText: { ...Fonts.semiBold, fontSize: 12, color: Colors.white },

  statusBadgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusBadgeSmallText: {
    ...Fonts.medium,
    fontSize: 11,
    color: Colors.textSecondary,
  },

  // Stepper
  stepper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  stepItem: {
    alignItems: 'center',
    width: 80,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepCircleCompleted: {
    backgroundColor: '#E8F5E9',
  },
  stepCircleActive: {
    backgroundColor: Colors.primary,
  },
  stepIcon: {
    fontSize: 18,
  },
  stepLine: {
    flex: 1,
    height: 3,
    backgroundColor: '#E0E0E0',
    marginTop: 20,
    marginHorizontal: -4,
  },
  stepLineCompleted: {
    backgroundColor: Colors.primary,
  },
  stepLabel: {
    ...Fonts.regular,
    fontSize: 10,
    color: Colors.textLight,
    textAlign: 'center',
  },
  stepLabelCompleted: {
    color: Colors.textSecondary,
  },
  stepLabelActive: {
    color: Colors.primary,
    ...Fonts.semiBold,
  },

  // Time row
  todayTimeRow: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  todayTime: {
    ...Fonts.medium,
    fontSize: 13,
    color: Colors.textSecondary,
  },

  // Meals
  mealsList: {
    marginTop: Spacing.xs,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  mealBullet: {
    ...Fonts.bold,
    fontSize: 16,
    color: Colors.primary,
    marginRight: 6,
  },
  mealName: {
    ...Fonts.medium,
    fontSize: 14,
    color: Colors.textPrimary,
  },

  // Upcoming cards
  upcomingCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 },
      android: { elevation: 1 },
    }),
  },
  upcomingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  upcomingDateBlock: {},
  upcomingDay: {
    ...Fonts.bold,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  upcomingDate: {
    ...Fonts.regular,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  noMealsText: {
    ...Fonts.regular,
    fontSize: 13,
    color: Colors.textLight,
    fontStyle: 'italic',
    marginTop: 4,
  },

  // Past cards
  pastCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4 },
      android: { elevation: 1 },
    }),
  },
  pastHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pastDay: {
    ...Fonts.semiBold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  pastDate: {
    ...Fonts.regular,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  pastRight: {
    alignItems: 'flex-end',
  },
  pastTime: {
    ...Fonts.regular,
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  pastMeals: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.sm,
  },
  pastMealText: {
    ...Fonts.regular,
    fontSize: 13,
    color: Colors.textSecondary,
  },
});

export default DeliveriesScreen;
