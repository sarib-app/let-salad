import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Colors, Fonts, Spacing, BorderRadius } from '../../utils/globalStyles';
import { useLanguage } from '../../context/LanguageContext';
import { getUserSubscriptions } from '../../utils/api';
import { getMockCalendarWeek, getMonday } from '../../utils/mockCalendarData';

const MealCalendarScreen = ({ route, navigation }) => {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

  const paramSub = route?.params?.subscription;
  const paramSubs = route?.params?.subscriptions;

  const [subscriptions, setSubscriptions] = useState(paramSubs || (paramSub ? [paramSub] : []));
  const [selectedSub, setSelectedSub] = useState(paramSub || null);
  const [currentWeekStart, setCurrentWeekStart] = useState(getMonday(new Date()));
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  useEffect(() => {
    if (selectedSub) {
      loadCalendarData();
    }
  }, [selectedSub, currentWeekStart]);

  const loadSubscriptions = async () => {
    if (subscriptions.length > 0) {
      if (!selectedSub) setSelectedSub(subscriptions[0]);
      setLoading(false);
      return;
    }

    try {
      const res = await getUserSubscriptions();
      if (res?.code === 200 && res.subscriptions?.length > 0) {
        const activeSubs = res.subscriptions.filter(s => s.status === 'active');
        setSubscriptions(activeSubs);
        setSelectedSub(activeSubs[0]);
      }
    } catch {
      // No subscriptions available
    } finally {
      setLoading(false);
    }
  };

  const loadCalendarData = () => {
    try {
      // TODO: Replace with real API call
      // const res = await getSubscriptionCalendar(selectedSub.id, formatDate(currentWeekStart));
      const data = getMockCalendarWeek(selectedSub, currentWeekStart);
      setCalendarData(data);
    } catch {
      setCalendarData(null);
    }
  };

  const navigateWeek = (direction) => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + (direction * 7));
    setCurrentWeekStart(newStart);
    setSelectedDay(null);
  };

  const goToThisWeek = () => {
    setCurrentWeekStart(getMonday(new Date()));
    setSelectedDay(null);
  };

  const isCurrentWeek = () => {
    const thisMonday = getMonday(new Date());
    return currentWeekStart.getTime() === thisMonday.getTime();
  };

  const formatWeekRange = () => {
    const start = new Date(currentWeekStart);
    const end = new Date(currentWeekStart);
    end.setDate(end.getDate() + 6);

    const opts = { month: 'short', day: 'numeric' };
    const locale = isAr ? 'ar-SA' : 'en-US';
    const startStr = start.toLocaleDateString(locale, opts);
    const endStr = end.toLocaleDateString(locale, { ...opts, year: 'numeric' });
    return `${startStr} - ${endStr}`;
  };

  const handleDayPress = (day) => {
    if (day.isFriday) return;
    setSelectedDay(selectedDay?.date === day.date ? null : day);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📅</Text>
        <Text style={styles.emptyTitle}>{t('deliveries.noSubscriptions')}</Text>
        <Text style={styles.emptyDesc}>{t('deliveries.noSubscriptionsDesc')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Subscription Picker */}
      {subscriptions.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {subscriptions.map((sub, index) => {
            const isSelected = selectedSub?.id === sub.id;
            const name = isAr
              ? (sub.subscription_package?.name_ar || sub.subscription_package?.name)
              : sub.subscription_package?.name;
            return (
              <TouchableOpacity
                key={sub.id || index}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => {
                  setSelectedSub(sub);
                  setSelectedDay(null);
                }}
              >
                <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                  {name || 'Plan'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Week Navigation */}
      <View style={styles.weekNav}>
        <TouchableOpacity onPress={() => navigateWeek(-1)} style={styles.weekArrow}>
          <Text style={styles.weekArrowText}>{isAr ? '›' : '‹'}</Text>
        </TouchableOpacity>
        <View style={styles.weekCenter}>
          <Text style={styles.weekRangeText}>{formatWeekRange()}</Text>
          {!isCurrentWeek() && (
            <TouchableOpacity onPress={goToThisWeek}>
              <Text style={styles.thisWeekButton}>{t('calendar.thisWeek')}</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={() => navigateWeek(1)} style={styles.weekArrow}>
          <Text style={styles.weekArrowText}>{isAr ? '‹' : '›'}</Text>
        </TouchableOpacity>
      </View>

      {/* Calendar Grid */}
      {calendarData && (
        <View style={styles.calendarGrid}>
          {calendarData.days.map((day) => {
            const dateNum = new Date(day.date).getDate();
            const isSelected = selectedDay?.date === day.date;

            return (
              <TouchableOpacity
                key={day.date}
                style={[
                  styles.dayColumn,
                  day.isToday && styles.dayColumnToday,
                  day.isPast && !day.isToday && styles.dayColumnPast,
                  day.isFriday && styles.dayColumnOff,
                  isSelected && styles.dayColumnSelected,
                ]}
                onPress={() => handleDayPress(day)}
                activeOpacity={day.isFriday ? 1 : 0.7}
              >
                <Text style={[styles.dayLabel, day.isToday && styles.dayLabelToday]}>
                  {isAr ? day.dayShortAr : day.dayShort}
                </Text>
                <View style={[styles.dateCircle, day.isToday && styles.dateCircleToday]}>
                  <Text style={[styles.dateNum, day.isToday && styles.dateNumToday]}>{dateNum}</Text>
                </View>

                {day.isFriday ? (
                  <Text style={styles.offText}>{t('calendar.off')}</Text>
                ) : day.meals.length > 0 ? (
                  <View style={styles.mealChips}>
                    {day.meals.map((meal, i) => (
                      <View key={i} style={styles.mealChip}>
                        <Text style={styles.mealChipText} numberOfLines={1}>
                          {isAr ? meal.name_ar : meal.name}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.emptySlot}
                    onPress={() => {
                      if (!day.isPast && selectedSub) {
                        navigation.navigate('MealSelection', {
                          subscriptionId: selectedSub.id,
                          subscription: selectedSub,
                        });
                      }
                    }}
                  >
                    <Text style={styles.emptySlotPlus}>+</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Day Detail */}
      {selectedDay && !selectedDay.isFriday && (
        <View style={styles.dayDetail}>
          <Text style={styles.dayDetailTitle}>
            {t('calendar.mealsFor')} {isAr ? selectedDay.dayNameAr : selectedDay.dayName}
          </Text>

          {selectedDay.meals.length > 0 ? (
            selectedDay.meals.map((meal, i) => (
              <View key={i} style={styles.detailMealRow}>
                <Text style={styles.detailMealName}>
                  {isAr ? meal.name_ar : meal.name}
                </Text>
                <Text style={styles.detailMealCal}>{meal.calories} {t('common.cal')}</Text>
              </View>
            ))
          ) : (
            <View style={styles.detailEmpty}>
              <Text style={styles.detailEmptyText}>{t('calendar.noMeals')}</Text>
              {!selectedDay.isPast && (
                <TouchableOpacity
                  style={styles.detailSelectButton}
                  onPress={() => {
                    navigation.navigate('MealSelection', {
                      subscriptionId: selectedSub.id,
                      subscription: selectedSub,
                    });
                  }}
                >
                  <Text style={styles.detailSelectText}>{t('calendar.selectMeals')}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      )}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.background,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    ...Fonts.bold,
    fontSize: 20,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptyDesc: {
    ...Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // Filter chips
  filterRow: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
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
    color: '#FFFFFF',
  },

  // Week Navigation
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  weekArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekArrowText: {
    ...Fonts.bold,
    fontSize: 22,
    color: Colors.textPrimary,
  },
  weekCenter: {
    alignItems: 'center',
  },
  weekRangeText: {
    ...Fonts.semiBold,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  thisWeekButton: {
    ...Fonts.medium,
    fontSize: 12,
    color: Colors.primary,
    marginTop: 4,
  },

  // Calendar Grid
  calendarGrid: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.sm,
    gap: 4,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: 2,
    minHeight: 160,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayColumnToday: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: Colors.primary + '08',
  },
  dayColumnPast: {
    opacity: 0.6,
  },
  dayColumnOff: {
    backgroundColor: Colors.cardBackground,
    opacity: 0.5,
  },
  dayColumnSelected: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  dayLabel: {
    ...Fonts.medium,
    fontSize: 10,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  dayLabelToday: {
    color: Colors.primary,
    ...Fonts.bold,
  },
  dateCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  dateCircleToday: {
    backgroundColor: Colors.primary,
  },
  dateNum: {
    ...Fonts.semiBold,
    fontSize: 12,
    color: Colors.textPrimary,
  },
  dateNumToday: {
    color: '#FFFFFF',
  },
  offText: {
    ...Fonts.regular,
    fontSize: 10,
    color: Colors.textLight,
    marginTop: Spacing.md,
  },
  mealChips: {
    width: '100%',
    paddingHorizontal: 2,
    gap: 3,
  },
  mealChip: {
    backgroundColor: Colors.primary + '15',
    borderRadius: 4,
    paddingHorizontal: 3,
    paddingVertical: 2,
  },
  mealChipText: {
    ...Fonts.medium,
    fontSize: 8,
    color: Colors.primary,
    textAlign: 'center',
  },
  emptySlot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  emptySlotPlus: {
    ...Fonts.medium,
    fontSize: 16,
    color: Colors.textLight,
  },

  // Day Detail
  dayDetail: {
    margin: Spacing.md,
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
  dayDetailTitle: {
    ...Fonts.semiBold,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  detailMealRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  detailMealName: {
    ...Fonts.medium,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  detailMealCal: {
    ...Fonts.regular,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  detailEmpty: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  detailEmptyText: {
    ...Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  detailSelectButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  detailSelectText: {
    ...Fonts.semiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
});

export default MealCalendarScreen;
