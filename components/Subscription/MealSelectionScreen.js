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
import { fetchMenuItems } from '../../data/mockMenuData';
import { updateSubscription } from '../../utils/storage';

const MealSelectionScreen = ({ route, navigation }) => {
  const { subscription, onMealsSelected } = route.params;

  const [availableMenus, setAvailableMenus] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tomorrowMeals, setTomorrowMeals] = useState([]);

  // Mock daily meal delivery data (would come from backend)
  const [mealHistory, setMealHistory] = useState([
    {
      date: '2025-12-28',
      dateStr: 'Dec 28',
      dayName: 'Saturday',
      status: 'delivered',
      deliveryTime: '10:30 AM',
      meals: [
        { name: 'Grilled Chicken Breast', category: 'Chicken' },
        { name: 'Chicken Tikka Masala', category: 'Chicken' },
        { name: 'Club Sandwich', category: 'Sandwich' },
      ],
    },
    {
      date: '2025-12-29',
      dateStr: 'Dec 29',
      dayName: 'Sunday',
      status: 'in_preparation',
      estimatedTime: '9:00 AM',
      meals: [
        { name: 'Lemon Herb Chicken', category: 'Chicken' },
        { name: 'BBQ Chicken Wings', category: 'Chicken' },
        { name: 'Grilled Chicken Sandwich', category: 'Sandwich' },
      ],
    },
  ]);

  // Get tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDateStr = tomorrow.toISOString().split('T')[0];

  useEffect(() => {
    loadMenus();
    loadTomorrowMeals();
  }, []);

  const loadMenus = async () => {
    try {
      const chicken = await fetchMenuItems('chicken');
      const sandwich = await fetchMenuItems('sandwich');

      setAvailableMenus({
        chicken: chicken.filter((item) => item.available),
        sandwich: sandwich.filter((item) => item.available),
      });
      setLoading(false);
    } catch (error) {
      console.error('Error loading menus:', error);
      setLoading(false);
    }
  };

  const loadTomorrowMeals = () => {
    // Load existing selection for tomorrow if available
    if (subscription.meal_selections && subscription.meal_selections[tomorrowDateStr]) {
      setTomorrowMeals(subscription.meal_selections[tomorrowDateStr].meals || []);
    }
  };

  const getMealRequirements = () => {
    // Get meal requirements from subscription
    const requirements = {};
    subscription.meals.forEach((meal) => {
      const mealType = meal.meal_name.toLowerCase();
      requirements[mealType] = meal.qty;
    });
    return requirements;
  };

  const canUpdateTomorrow = () => {
    // Check if current time is before 8:00 PM today
    const now = new Date();
    const cutoffTime = new Date();
    cutoffTime.setHours(20, 0, 0, 0); // 8:00 PM today

    return now < cutoffTime;
  };

  const isSelectionComplete = () => {
    const requirements = getMealRequirements();
    const selected = {};

    tomorrowMeals.forEach((meal) => {
      const type = meal.category.toLowerCase();
      selected[type] = (selected[type] || 0) + 1;
    });

    // Check if all requirements are met
    for (const [type, qty] of Object.entries(requirements)) {
      if ((selected[type] || 0) !== qty) {
        return false;
      }
    }

    return true;
  };

  const handleSelectMeal = (meal, category) => {
    if (!canUpdateTomorrow()) {
      Alert.alert(
        'Selection Closed',
        "You can only select tomorrow's meals before 8:00 PM today. The selection window has closed."
      );
      return;
    }

    const requirements = getMealRequirements();
    const categoryType = category.toLowerCase();

    // Count current selections for this category
    const currentCount = tomorrowMeals.filter(
      (m) => m.category.toLowerCase() === categoryType
    ).length;

    // Check if we can add more of this category
    if (currentCount >= (requirements[categoryType] || 0)) {
      Alert.alert(
        'Limit Reached',
        `You can only select ${requirements[categoryType]} ${category} meal(s) for tomorrow.`
      );
      return;
    }

    // Add meal to selections
    setTomorrowMeals([
      ...tomorrowMeals,
      {
        ...meal,
        category,
      },
    ]);
  };

  const handleRemoveMeal = (mealIndex) => {
    if (!canUpdateTomorrow()) {
      Alert.alert(
        'Selection Closed',
        "You can only modify tomorrow's meals before 8:00 PM today. The selection window has closed."
      );
      return;
    }

    const updatedMeals = tomorrowMeals.filter((_, index) => index !== mealIndex);
    setTomorrowMeals(updatedMeals);
  };

  const handleSubmitSelection = async () => {
    if (!isSelectionComplete()) {
      Alert.alert(
        'Incomplete Selection',
        "Please select all required meals for tomorrow before submitting."
      );
      return;
    }

    if (!canUpdateTomorrow()) {
      Alert.alert(
        'Selection Closed',
        "The selection window has closed. You can only update tomorrow's meals before 8:00 PM today."
      );
      return;
    }

    Alert.alert(
      'Confirm Meal Selection',
      `Confirm meals for ${tomorrow.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: async () => {
            setSubmitting(true);

            // Update meal selections for tomorrow
            const currentSelections = subscription.meal_selections || {};
            currentSelections[tomorrowDateStr] = {
              meals: tomorrowMeals,
              selected_at: new Date().toISOString(),
            };

            const updated = await updateSubscription(subscription.id, {
              meal_selections: currentSelections,
              last_meal_selection_update: new Date().toISOString(),
            });

            setSubmitting(false);

            if (updated) {
              Alert.alert('Success', "Tomorrow's meals have been confirmed!", [
                {
                  text: 'OK',
                  onPress: () => {
                    if (onMealsSelected) onMealsSelected();
                    navigation.goBack();
                  },
                },
              ]);
            }
          },
        },
      ]
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
        return { text: 'Delivered', color: Colors.primary, icon: '✓' };
      case 'in_preparation':
        return { text: 'Preparing', color: '#FFB020', icon: '👨‍🍳' };
      case 'out_for_delivery':
        return { text: 'On the Way', color: '#00B4D8', icon: '🚗' };
      case 'scheduled':
        return { text: 'Scheduled', color: Colors.textSecondary, icon: '📅' };
      default:
        return { text: status, color: Colors.textSecondary, icon: '' };
    }
  };

  const requirements = getMealRequirements();
  const canUpdate = canUpdateTomorrow();
  const isComplete = isSelectionComplete();

  const now = new Date();
  const cutoffTime = new Date();
  cutoffTime.setHours(20, 0, 0, 0);
  const hoursUntilCutoff = Math.max(0, Math.floor((cutoffTime - now) / (1000 * 60 * 60)));
  const minutesUntilCutoff = Math.max(0, Math.floor(((cutoffTime - now) % (1000 * 60 * 60)) / (1000 * 60)));

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading menu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Selection Window Info */}
        <View style={[styles.infoBanner, !canUpdate && styles.infoBannerClosed]}>
          <Text style={styles.infoIcon}>{canUpdate ? '⏰' : '🔒'}</Text>
          <View style={styles.infoContent}>
            {canUpdate ? (
              <>
                <Text style={styles.infoTitle}>Selection Window Open</Text>
                <Text style={styles.infoText}>
                  {hoursUntilCutoff}h {minutesUntilCutoff}m until 8:00 PM cutoff
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.infoTitle}>Selection Window Closed</Text>
                <Text style={styles.infoText}>
                  Come back before 8:00 PM to select meals for the next day
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Tomorrow's Meal Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Tomorrow - {tomorrow.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </Text>

          <View style={styles.selectedMealsCard}>
            <Text style={styles.selectedMealsTitle}>
              Selected Meals ({tomorrowMeals.length}/{Object.values(requirements).reduce((a, b) => a + b, 0)})
            </Text>

            {tomorrowMeals.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  {canUpdate ? 'No meals selected yet' : 'No meals selected for tomorrow'}
                </Text>
              </View>
            ) : (
              tomorrowMeals.map((meal, index) => (
                <View key={index} style={styles.selectedMealCard}>
                  <View style={styles.selectedMealInfo}>
                    <Text style={styles.selectedMealName}>{meal.name}</Text>
                    <Text style={styles.selectedMealCategory}>{meal.category}</Text>
                  </View>
                  {canUpdate && (
                    <TouchableOpacity onPress={() => handleRemoveMeal(index)}>
                      <Text style={styles.removeButton}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}

            {isComplete && (
              <View style={styles.completeBanner}>
                <Text style={styles.completeText}>✓ All meals selected</Text>
              </View>
            )}
          </View>
        </View>

        {/* Available Menus (only if window is open) */}
        {canUpdate && (
          <>
            {requirements.chicken > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Chicken Meals (Select {requirements.chicken})
                </Text>
                <View style={styles.menuGrid}>
                  {availableMenus.chicken.map((meal) => (
                    <TouchableOpacity
                      key={meal.id}
                      style={styles.mealCard}
                      onPress={() => handleSelectMeal(meal, 'Chicken')}
                    >
                      <Text style={styles.mealName}>{meal.name}</Text>
                      <Text style={styles.mealCalories}>{meal.calories} cal</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {requirements.sandwich > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Sandwiches (Select {requirements.sandwich})
                </Text>
                <View style={styles.menuGrid}>
                  {availableMenus.sandwich.map((meal) => (
                    <TouchableOpacity
                      key={meal.id}
                      style={styles.mealCard}
                      onPress={() => handleSelectMeal(meal, 'Sandwich')}
                    >
                      <Text style={styles.mealName}>{meal.name}</Text>
                      <Text style={styles.mealCalories}>{meal.calories} cal</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </>
        )}

        {/* Meal History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meal History</Text>

          {mealHistory.map((day, index) => {
            const statusInfo = getStatusBadge(day.status);
            return (
              <View key={index} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <View>
                    <Text style={styles.historyDay}>{day.dayName}</Text>
                    <Text style={styles.historyDate}>{day.dateStr}</Text>
                  </View>
                  <View style={[styles.historyStatusBadge, { backgroundColor: statusInfo.color }]}>
                    <Text style={styles.historyStatusIcon}>{statusInfo.icon}</Text>
                    <Text style={styles.historyStatusText}>{statusInfo.text}</Text>
                  </View>
                </View>

                {day.deliveryTime && (
                  <Text style={styles.historyTime}>Delivered at {day.deliveryTime}</Text>
                )}
                {day.estimatedTime && (
                  <Text style={styles.historyTime}>Estimated delivery: {day.estimatedTime}</Text>
                )}

                <View style={styles.historyMeals}>
                  {day.meals.map((meal, mealIndex) => (
                    <View key={mealIndex} style={styles.historyMealItem}>
                      <Text style={styles.historyMealBullet}>•</Text>
                      <Text style={styles.historyMealText}>{meal.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Submit Button (only if window is open) */}
      {canUpdate && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmitSelection}
            disabled={submitting}
          >
            <LinearGradient
              colors={['#00B14F', '#00D95F']}
              style={styles.submitGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {submitting ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.submitText}>Confirm Tomorrow's Meals</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
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
    backgroundColor: Colors.background,
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
  infoBanner: {
    backgroundColor: '#F0F9F4',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  infoBannerClosed: {
    backgroundColor: '#FFF4E5',
    borderColor: '#FFB020',
  },
  infoIcon: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...Fonts.bold,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  infoText: {
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
  selectedMealsCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedMealsTitle: {
    ...Fonts.bold,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptyState: {
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.md,
  },
  emptyStateText: {
    ...Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  selectedMealCard: {
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedMealInfo: {
    flex: 1,
  },
  selectedMealName: {
    ...Fonts.semiBold,
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  selectedMealCategory: {
    ...Fonts.regular,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  removeButton: {
    ...Fonts.bold,
    fontSize: 20,
    color: Colors.error,
    paddingHorizontal: Spacing.sm,
  },
  completeBanner: {
    backgroundColor: '#F0F9F4',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  completeText: {
    ...Fonts.semiBold,
    fontSize: 13,
    color: Colors.primary,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  mealCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    width: '48%',
  },
  mealName: {
    ...Fonts.semiBold,
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  mealCalories: {
    ...Fonts.regular,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  historyCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  historyDay: {
    ...Fonts.bold,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  historyDate: {
    ...Fonts.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  historyStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  historyStatusIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  historyStatusText: {
    ...Fonts.semiBold,
    fontSize: 12,
    color: Colors.white,
  },
  historyTime: {
    ...Fonts.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  historyMeals: {
    marginTop: Spacing.xs,
  },
  historyMealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyMealBullet: {
    ...Fonts.bold,
    fontSize: 16,
    color: Colors.primary,
    marginRight: Spacing.xs,
  },
  historyMealText: {
    ...Fonts.regular,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  submitButton: {
    height: 56,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  submitGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitText: {
    ...Fonts.bold,
    fontSize: 16,
    color: Colors.white,
  },
});

export default MealSelectionScreen;
