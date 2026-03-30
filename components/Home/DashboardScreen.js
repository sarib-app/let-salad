import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Colors, Fonts, Spacing, BorderRadius } from '../../utils/globalStyles';
import { useLanguage } from '../../context/LanguageContext';
import { getCurrentUser, getUserSubscriptions, getDeliveries } from '../../utils/api';
import { getMockDeliveries } from '../../utils/mockDeliveryData';
import { getMockNotifications } from '../../utils/mockNotificationData';

const STATUS_CONFIG = {
  preparing: { icon: '👨‍🍳', color: Colors.warning },
  in_preparation: { icon: '👨‍🍳', color: Colors.warning },
  on_the_way: { icon: '🚚', color: Colors.primary },
  delivered: { icon: '✅', color: Colors.success },
  pending: { icon: '📅', color: Colors.textSecondary },
};

const DashboardScreen = ({ navigation: navProp }) => {
  const { t, language } = useLanguage();
  const navigation = useNavigation();
  const isAr = language === 'ar';

  const [user, setUser] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [todayDeliveries, setTodayDeliveries] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const loadDashboardData = async () => {
    try {
      // Load user
      const userRes = await getCurrentUser().catch(() => null);
      if (userRes?.code === 200 && userRes.user) {
        setUser(userRes.user);
      }

      // Load subscriptions
      let subs = [];
      try {
        const subRes = await getUserSubscriptions();
        if (subRes?.code === 200 && subRes.subscriptions) {
          subs = subRes.subscriptions.filter(s => s.status === 'active');
        }
      } catch {
        subs = [];
      }
      setSubscriptions(subs);

      // Load today's delivery for ALL active subscriptions
      // Try real API first, fall back to mock data
      if (subs.length > 0) {
        const deliveries = [];
        for (const sub of subs) {
          try {
            const response = await getDeliveries(sub.id).catch(() => null);
            if (response && response.code === 200) {
              if (response.today) {
                deliveries.push(response.today);
              }
            } else {
              const mockData = getMockDeliveries(sub);
              if (mockData.today) {
                deliveries.push(mockData.today);
              }
            }
          } catch {
            try {
              const mockData = getMockDeliveries(sub);
              if (mockData.today) {
                deliveries.push(mockData.today);
              }
            } catch {
              // skip failed subscription
            }
          }
        }
        setTodayDeliveries(deliveries);
      } else {
        setTodayDeliveries([]);
      }

      // Load unread notification count
      const notifs = getMockNotifications();
      setUnreadCount(notifs.unread_count);
    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('home.goodMorning');
    if (hour < 17) return t('home.goodAfternoon');
    return t('home.goodEvening');
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'preparing':
      case 'in_preparation': return t('deliveries.preparing');
      case 'on_the_way': return t('deliveries.onTheWay');
      case 'delivered': return t('deliveries.delivered');
      case 'pending': return t('deliveries.scheduled');
      default: return status;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const userName = user?.name || user?.full_name || '';
  const firstName = userName.split(' ')[0];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>
            {getGreeting()}{firstName ? `, ${firstName}` : ''} 👋
          </Text>
        </View>
        <TouchableOpacity
          style={styles.bellButton}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Text style={styles.bellIcon}>🔔</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Today's Deliveries */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('home.todayDelivery')}</Text>
      </View>

      {todayDeliveries.length > 0 ? (
        todayDeliveries.map((delivery, index) => (
          <TouchableOpacity
            key={delivery.id || index}
            style={[
              styles.deliveryCard,
              { borderLeftColor: STATUS_CONFIG[delivery.status]?.color || Colors.primary },
              index < todayDeliveries.length - 1 && { marginBottom: Spacing.sm },
            ]}
            onPress={() => navigation.navigate('MainApp', { screen: 'Deliveries' })}
            activeOpacity={0.7}
          >
            <View style={styles.deliveryHeader}>
              <View style={styles.deliveryStatusRow}>
                <Text style={styles.deliveryStatusIcon}>
                  {STATUS_CONFIG[delivery.status]?.icon || '📦'}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: (STATUS_CONFIG[delivery.status]?.color || Colors.primary) + '20' }]}>
                  <Text style={[styles.statusBadgeText, { color: STATUS_CONFIG[delivery.status]?.color || Colors.primary }]}>
                    {getStatusLabel(delivery.status)}
                  </Text>
                </View>
                {todayDeliveries.length > 1 && (
                  <Text style={styles.deliverySubName} numberOfLines={1}>
                    {isAr ? (delivery.subscription_name_ar || delivery.subscription_name) : delivery.subscription_name}
                  </Text>
                )}
              </View>
              {delivery.estimated_time && (
                <Text style={styles.deliveryTime}>
                  {t('deliveries.estimatedDelivery')} {delivery.estimated_time}
                </Text>
              )}
              {delivery.delivered_time && (
                <Text style={styles.deliveryTime}>
                  {t('deliveries.deliveredAt')} {delivery.delivered_time}
                </Text>
              )}
            </View>
            <View style={styles.deliveryMeals}>
              {delivery.meals?.map((meal, i) => (
                <Text key={i} style={styles.mealName}>
                  • {isAr ? meal.name_ar : meal.name}
                </Text>
              ))}
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.noDeliveryCard}>
          <Text style={styles.noDeliveryIcon}>📦</Text>
          <Text style={styles.noDeliveryText}>{t('home.noDeliveryToday')}</Text>
        </View>
      )}

      {/* Active Subscriptions */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('home.yourSubscriptions')}</Text>
      </View>

      {subscriptions.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subsScrollContent}
        >
          {subscriptions.map((sub, index) => {
            const pkg = sub.subscription_package || {};
            const plan = sub.subscription_type || {};
            const pkgName = isAr ? (pkg.name_ar || pkg.name) : pkg.name;
            const planName = isAr ? (plan.name_ar || plan.name) : plan.name;

            return (
              <TouchableOpacity
                key={sub.id || index}
                style={styles.subCard}
                onPress={() => navigation.navigate('ManageSubscription', { subscriptionId: sub.id })}
                activeOpacity={0.7}
              >
                <Text style={styles.subName} numberOfLines={1}>{pkgName || planName || 'Meal Plan'}</Text>
                <View style={styles.subStats}>
                  <View style={styles.subStat}>
                    <Text style={styles.subStatValue}>{sub.meals_remaining ?? '—'}</Text>
                    <Text style={styles.subStatLabel}>{t('home.mealsRemaining')}</Text>
                  </View>
                  <View style={styles.subStatDivider} />
                  <View style={styles.subStat}>
                    <Text style={styles.subStatValue}>{sub.days_remaining ?? '—'}</Text>
                    <Text style={styles.subStatLabel}>{t('home.daysRemaining')}</Text>
                  </View>
                </View>
                <View style={styles.subActiveBadge}>
                  <Text style={styles.subActiveText}>{t('common.active')}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : (
        <View style={styles.noSubsCard}>
          <Text style={styles.noSubsIcon}>📋</Text>
          <Text style={styles.noSubsTitle}>{t('home.noActiveSubscriptions')}</Text>
          <Text style={styles.noSubsDesc}>{t('home.noActiveSubscriptionsDesc')}</Text>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('home.quickActions')}</Text>
      </View>

      <View style={styles.actionsRow}>
        {subscriptions.length > 0 ? (
          <>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => {
                const sub = subscriptions[0];
                navigation.navigate('MealSelection', {
                  subscriptionId: sub.id,
                  subscription: sub,
                });
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>🍽️</Text>
              <Text style={styles.actionText}>{t('home.selectMeals')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('MainApp', { screen: 'Deliveries' })}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>🚚</Text>
              <Text style={styles.actionText}>{t('home.viewDeliveries')}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.actionCard, styles.actionCardFull]}
            onPress={() => navigation.navigate('SubscriptionPackages')}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionText}>{t('home.browsePlans')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: Spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : Spacing.xl,
    paddingBottom: Spacing.md,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    ...Fonts.bold,
    fontSize: 24,
    color: Colors.textPrimary,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.md,
  },
  bellIcon: {
    fontSize: 22,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    ...Fonts.bold,
    fontSize: 10,
    color: '#FFFFFF',
  },

  // Sections
  sectionHeader: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Fonts.semiBold,
    fontSize: 18,
    color: Colors.textPrimary,
  },

  // Today's Delivery
  deliveryCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderLeftWidth: 4,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  deliveryHeader: {
    marginBottom: Spacing.sm,
  },
  deliveryStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  deliveryStatusIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusBadgeText: {
    ...Fonts.semiBold,
    fontSize: 13,
  },
  deliverySubName: {
    ...Fonts.medium,
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 'auto',
    maxWidth: 120,
  },
  deliveryTime: {
    ...Fonts.medium,
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 28,
  },
  deliveryMeals: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  mealName: {
    ...Fonts.regular,
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 2,
  },

  noDeliveryCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  noDeliveryIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  noDeliveryText: {
    ...Fonts.medium,
    fontSize: 14,
    color: Colors.textSecondary,
  },

  // Subscriptions
  subsScrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  subCard: {
    width: 200,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  subName: {
    ...Fonts.semiBold,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  subStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  subStat: {
    flex: 1,
    alignItems: 'center',
  },
  subStatValue: {
    ...Fonts.bold,
    fontSize: 22,
    color: Colors.primary,
  },
  subStatLabel: {
    ...Fonts.regular,
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  subStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.sm,
  },
  subActiveBadge: {
    backgroundColor: Colors.primary + '15',
    borderRadius: BorderRadius.full,
    paddingVertical: 4,
    alignItems: 'center',
  },
  subActiveText: {
    ...Fonts.semiBold,
    fontSize: 12,
    color: Colors.primary,
  },

  noSubsCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  noSubsIcon: {
    fontSize: 40,
    marginBottom: Spacing.sm,
  },
  noSubsTitle: {
    ...Fonts.semiBold,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  noSubsDesc: {
    ...Fonts.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // Quick Actions
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  actionCardFull: {
    flex: 1,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  actionText: {
    ...Fonts.semiBold,
    fontSize: 14,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
});

export default DashboardScreen;
