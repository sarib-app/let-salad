import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Colors, Fonts, Spacing, BorderRadius } from '../../utils/globalStyles';
import { useLanguage } from '../../context/LanguageContext';
import { getMockWeeklyNutrition } from '../../utils/mockNutritionData';

const MAX_BAR_HEIGHT = 140;
const BAR_WIDTH = 32;

const NutritionDashboardScreen = () => {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

  const [weeklyData, setWeeklyData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  useEffect(() => {
    const data = getMockWeeklyNutrition();
    setWeeklyData(data);
  }, []);

  if (!weeklyData) return null;

  const { dailySummary, weeklyTotals } = weeklyData;
  const maxCalories = Math.max(...dailySummary.map(d => d.calories), 1);
  const totalMacros = weeklyTotals.avgProtein + weeklyTotals.avgCarbs + weeklyTotals.avgFat || 1;

  const macros = [
    {
      label: t('nutrition.protein'),
      value: weeklyTotals.avgProtein,
      color: Colors.primary,
      percent: Math.round((weeklyTotals.avgProtein / totalMacros) * 100),
    },
    {
      label: t('nutrition.carbs'),
      value: weeklyTotals.avgCarbs,
      color: Colors.secondary,
      percent: Math.round((weeklyTotals.avgCarbs / totalMacros) * 100),
    },
    {
      label: t('nutrition.fat'),
      value: weeklyTotals.avgFat,
      color: Colors.warning,
      percent: Math.round((weeklyTotals.avgFat / totalMacros) * 100),
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Period Toggle */}
      <View style={styles.periodToggle}>
        <TouchableOpacity
          style={[styles.periodButton, selectedPeriod === 'week' && styles.periodButtonActive]}
          onPress={() => setSelectedPeriod('week')}
        >
          <Text style={[styles.periodText, selectedPeriod === 'week' && styles.periodTextActive]}>
            {t('nutrition.thisWeek')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodButton, selectedPeriod === 'month' && styles.periodButtonActive]}
          onPress={() => setSelectedPeriod('month')}
        >
          <Text style={[styles.periodText, selectedPeriod === 'month' && styles.periodTextActive]}>
            {t('nutrition.thisMonth')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Weekly Calorie Bar Chart */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('nutrition.weeklyCalories')}</Text>

        {/* Average line label */}
        <View style={styles.avgLabelRow}>
          <View style={styles.avgLine} />
          <Text style={styles.avgLabelText}>
            {t('nutrition.avgDaily')}: {weeklyTotals.avgCalories} {t('nutrition.cal')}
          </Text>
        </View>

        <View style={styles.chartContainer}>
          {dailySummary.map((day, index) => {
            const barHeight = (day.calories / maxCalories) * MAX_BAR_HEIGHT;
            const avgHeight = (weeklyTotals.avgCalories / maxCalories) * MAX_BAR_HEIGHT;

            return (
              <View key={index} style={styles.barColumn}>
                <Text style={styles.barValue}>{day.calories}</Text>
                <View style={styles.barBackground}>
                  {/* Average reference line */}
                  <View style={[styles.avgRefLine, { bottom: avgHeight }]} />
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: day.calories >= weeklyTotals.avgCalories
                          ? Colors.primary
                          : Colors.primary + '60',
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>
                  {isAr ? day.dayNameAr : day.dayName}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Weekly Summary */}
      <View style={styles.card}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{weeklyTotals.totalCalories.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>{t('nutrition.totalCalories')}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{weeklyTotals.avgCalories}</Text>
            <Text style={styles.summaryLabel}>{t('nutrition.avgDaily')}</Text>
          </View>
        </View>
      </View>

      {/* Macro Breakdown */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('nutrition.macroBreakdown')}</Text>
        {macros.map((macro, index) => (
          <View key={index} style={styles.macroRow}>
            <View style={styles.macroLabelRow}>
              <View style={[styles.macroDot, { backgroundColor: macro.color }]} />
              <Text style={styles.macroLabel}>{macro.label}</Text>
              <Text style={styles.macroValue}>
                {macro.value}{t('nutrition.grams')} ({macro.percent}%)
              </Text>
            </View>
            <View style={styles.macroBarBackground}>
              <View
                style={[
                  styles.macroBar,
                  {
                    width: `${macro.percent}%`,
                    backgroundColor: macro.color,
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>

      {/* Daily Breakdown */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('nutrition.dailyBreakdown')}</Text>
        {dailySummary.map((day, index) => (
          <View key={index} style={[styles.dayRow, index < dailySummary.length - 1 && styles.dayRowBorder]}>
            <View style={styles.dayInfo}>
              <Text style={styles.dayName}>{isAr ? day.dayNameAr : day.dayName}</Text>
              <Text style={styles.dayDate}>{day.date}</Text>
            </View>
            <View style={styles.dayStats}>
              <Text style={styles.dayCalories}>{day.calories} {t('nutrition.cal')}</Text>
              <Text style={styles.dayMeals}>{day.mealCount} {t('nutrition.meals')}</Text>
            </View>
          </View>
        ))}
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
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },

  // Period Toggle
  periodToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.full,
    padding: 3,
    marginBottom: Spacing.md,
  },
  periodButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.full,
  },
  periodButtonActive: {
    backgroundColor: Colors.white,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
      android: { elevation: 2 },
    }),
  },
  periodText: {
    ...Fonts.medium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  periodTextActive: {
    ...Fonts.semiBold,
    color: Colors.primary,
  },

  // Card
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  cardTitle: {
    ...Fonts.semiBold,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },

  // Bar Chart
  avgLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  avgLine: {
    width: 16,
    height: 2,
    backgroundColor: Colors.textLight,
    marginRight: Spacing.sm,
    borderStyle: 'dashed',
  },
  avgLabelText: {
    ...Fonts.regular,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: Spacing.sm,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barValue: {
    ...Fonts.medium,
    fontSize: 10,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  barBackground: {
    width: BAR_WIDTH,
    height: MAX_BAR_HEIGHT,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  avgRefLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: Colors.textLight,
    zIndex: 1,
  },
  bar: {
    width: BAR_WIDTH,
    borderRadius: BorderRadius.sm,
  },
  barLabel: {
    ...Fonts.medium,
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 6,
  },

  // Summary
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    ...Fonts.bold,
    fontSize: 28,
    color: Colors.primary,
  },
  summaryLabel: {
    ...Fonts.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },

  // Macro Breakdown
  macroRow: {
    marginBottom: Spacing.md,
  },
  macroLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  macroDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.sm,
  },
  macroLabel: {
    ...Fonts.medium,
    fontSize: 14,
    color: Colors.textPrimary,
    flex: 1,
  },
  macroValue: {
    ...Fonts.medium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  macroBarBackground: {
    height: 8,
    backgroundColor: Colors.cardBackground,
    borderRadius: 4,
    overflow: 'hidden',
  },
  macroBar: {
    height: 8,
    borderRadius: 4,
  },

  // Daily Breakdown
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  dayRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dayInfo: {
    flex: 1,
  },
  dayName: {
    ...Fonts.medium,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  dayDate: {
    ...Fonts.regular,
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  dayStats: {
    alignItems: 'flex-end',
  },
  dayCalories: {
    ...Fonts.semiBold,
    fontSize: 15,
    color: Colors.primary,
  },
  dayMeals: {
    ...Fonts.regular,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});

export default NutritionDashboardScreen;
