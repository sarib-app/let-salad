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
import { getAvailableMeals, getSubscriptionMealPlans, saveMealPlan, getMenu } from '../../utils/api';

const MealSelectionScreen = ({ route, navigation }) => {
  const { subscription, onMealsSelected } = route.params;

  const [availableMenus, setAvailableMenus] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedMeals, setSelectedMeals] = useState([]);
  const [mealPlans, setMealPlans] = useState([]);
  const [availableDays, setAvailableDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [canSelectForDate, setCanSelectForDate] = useState(false);
  const [deadlineTime, setDeadlineTime] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load available meals/days, menu items, and subscription meal plans in parallel
      const [availableResponse, menuResponse, mealPlansResponse] = await Promise.all([
        getAvailableMeals().catch(() => ({ code: 0 })),
        getMenu(),
        getSubscriptionMealPlans(subscription.id),
      ]);

      // Process available meals - group by category
      // First try from getAvailableMeals, fall back to getMenu
      let mealsToGroup = [];

      if (availableResponse.code === 200 && availableResponse.meals && availableResponse.meals.length > 0) {
        setAvailableDays(availableResponse.days || []);
        mealsToGroup = availableResponse.meals;
      } else if (menuResponse.code === 200 && menuResponse.meals && menuResponse.meals.length > 0) {
        mealsToGroup = menuResponse.meals;
      }

      // Group meals by category
      const groupedMenus = {};
      mealsToGroup.forEach((meal) => {
        const category = meal.category.toLowerCase();
        if (!groupedMenus[category]) {
          groupedMenus[category] = [];
        }
        groupedMenus[category].push(meal);
      });
      setAvailableMenus(groupedMenus);

      // Process subscription meal plans from backend
      if (mealPlansResponse.code === 200) {
        setMealPlans(mealPlansResponse.meal_plans || []);

        // Find the first selectable date
        const selectableDate = mealPlansResponse.meal_plans?.find(
          (plan) => plan.can_select
        );

        if (selectableDate) {
          setSelectedDate(selectableDate.date);
          setCanSelectForDate(selectableDate.can_select);
          setDeadlineTime(selectableDate.deadline);

          // If meals already selected for this date, load them
          if (selectableDate.meal_plan && selectableDate.meal_plan.items) {
            const existingMeals = selectableDate.meal_plan.items.map((item) => ({
              id: item.meal_id,
              name: item.meal?.name || item.name,
              category: item.meal?.category || item.category,
              calories: item.meal?.calories || 0,
              quantity: item.quantity,
            }));
            setSelectedMeals(existingMeals);
          }
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load meal data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format date string (e.g., "Feb 10")
  const formatDateStr = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Helper function to calculate time until deadline
  const getTimeUntilDeadline = () => {
    if (!deadlineTime) return { hours: 0, minutes: 0 };

    const now = new Date();
    // Handle both formats: "2026-02-09 20:00:00" and "2026-02-09T20:00:00.000000Z"
    const deadline = new Date(deadlineTime.replace(' ', 'T'));
    const diff = deadline - now;

    if (diff <= 0) return { hours: 0, minutes: 0 };

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { hours, minutes };
  };

  const getMealRequirements = () => {
    // Get meal requirements from subscription
    const requirements = {};

    // Try subscription.meals array first (if backend provides it)
    if (subscription.meals && subscription.meals.length > 0) {
      subscription.meals.forEach((meal) => {
        const mealType = meal.meal_name.toLowerCase();
        requirements[mealType] = meal.qty;
      });
      return requirements;
    }

    // Fall back to subscription_package.contents object
    // e.g. { chicken_meals: 24, salad: 10 } → { chicken: 24, salad: 10 }
    const contents = subscription.subscription_package?.contents;
    if (contents && typeof contents === 'object') {
      Object.entries(contents).forEach(([key, qty]) => {
        // Strip common suffixes like "_meals" to match menu category
        const category = key.replace(/_meals$/i, '').toLowerCase();
        requirements[category] = qty;
      });
      return requirements;
    }

    // If still no requirements, derive from available menu categories
    // so at least the user can see and pick meals
    const menuCategories = Object.keys(availableMenus);
    if (menuCategories.length > 0) {
      menuCategories.forEach((cat) => {
        requirements[cat] = 1; // default 1 per category
      });
    }

    return requirements;
  };

  const isSelectionComplete = () => {
    const requirements = getMealRequirements();
    const selected = {};

    selectedMeals.forEach((meal) => {
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

  const handleSelectMeal = (meal) => {
    if (!canSelectForDate) {
      Alert.alert(
        'Selection Closed',
        'The selection window for this date has closed.'
      );
      return;
    }

    const requirements = getMealRequirements();
    const categoryType = meal.category.toLowerCase();

    // Count current selections for this category
    const currentCount = selectedMeals.filter(
      (m) => m.category.toLowerCase() === categoryType
    ).length;

    // Check if we can add more of this category
    if (currentCount >= (requirements[categoryType] || 0)) {
      Alert.alert(
        'Limit Reached',
        `You can only select ${requirements[categoryType]} ${meal.category} meal(s).`
      );
      return;
    }

    // Add meal to selections
    setSelectedMeals([
      ...selectedMeals,
      {
        id: meal.id,
        name: meal.name,
        category: meal.category,
        calories: meal.calories,
      },
    ]);
  };

  const handleRemoveMeal = (mealIndex) => {
    if (!canSelectForDate) {
      Alert.alert(
        'Selection Closed',
        'The selection window for this date has closed.'
      );
      return;
    }

    const updatedMeals = selectedMeals.filter((_, index) => index !== mealIndex);
    setSelectedMeals(updatedMeals);
  };

  const handleSelectDate = (day) => {
    // Find the meal plan for this date from subscription meal plans
    const planForDate = mealPlans.find((p) => p.date === day.date);

    setSelectedDate(day.date);
    setCanSelectForDate(day.can_select);
    setDeadlineTime(day.deadline);

    // Load existing meals if any
    if (planForDate?.meal_plan?.items) {
      const existingMeals = planForDate.meal_plan.items.map((item) => ({
        id: item.meal_id,
        name: item.meal?.name || item.name,
        category: item.meal?.category || item.category,
        calories: item.meal?.calories || 0,
        quantity: item.quantity,
      }));
      setSelectedMeals(existingMeals);
    } else {
      setSelectedMeals([]);
    }
  };

  const handleSubmitSelection = async () => {
    if (!isSelectionComplete()) {
      Alert.alert(
        'Incomplete Selection',
        'Please select all required meals before submitting.'
      );
      return;
    }

    if (!canSelectForDate) {
      Alert.alert(
        'Selection Closed',
        'The selection window has closed for this date.'
      );
      return;
    }

    const selectedDateFormatted = new Date(selectedDate).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });

    Alert.alert(
      'Confirm Meal Selection',
      `Confirm meals for ${selectedDateFormatted}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: async () => {
            setSubmitting(true);

            try {
              // Prepare meals payload for backend
              const mealsPayload = selectedMeals.map((meal) => ({
                meal_id: meal.id,
                quantity: 1,
              }));

              const response = await saveMealPlan(subscription.id, {
                delivery_date: selectedDate,
                meals: mealsPayload,
              });

              if (response.code === 200) {
                Alert.alert('Success', 'Your meals have been confirmed!', [
                  {
                    text: 'OK',
                    onPress: () => {
                      if (onMealsSelected) onMealsSelected();
                      navigation.goBack();
                    },
                  },
                ]);
              } else {
                Alert.alert('Error', response.message || 'Failed to save meal selection.');
              }
            } catch (error) {
              console.error('Error saving meal plan:', error);
              Alert.alert('Error', error.message || 'Failed to save meal selection. Please try again.');
            } finally {
              setSubmitting(false);
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
      case 'pending':
        return { text: 'Pending', color: '#9E9E9E', icon: '📅' };
      case 'scheduled':
        return { text: 'Scheduled', color: Colors.textSecondary, icon: '📅' };
      default:
        return { text: status || 'Unknown', color: Colors.textSecondary, icon: '' };
    }
  };

  const requirements = getMealRequirements();
  const isComplete = isSelectionComplete();
  const timeUntil = getTimeUntilDeadline();
  const totalRequired = Object.values(requirements).reduce((a, b) => a + b, 0);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading meals...</Text>
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
        <View style={[styles.infoBanner, !canSelectForDate && styles.infoBannerClosed]}>
          <Text style={styles.infoIcon}>{canSelectForDate ? '⏰' : '🔒'}</Text>
          <View style={styles.infoContent}>
            {canSelectForDate ? (
              <>
                <Text style={styles.infoTitle}>Selection Window Open</Text>
                <Text style={styles.infoText}>
                  {timeUntil.hours}h {timeUntil.minutes}m until deadline
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

        {/* Selected Date Meal Selection */}
        {selectedDate && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </Text>

            <View style={styles.selectedMealsCard}>
              <Text style={styles.selectedMealsTitle}>
                Selected Meals ({selectedMeals.length}/{totalRequired})
              </Text>

              {selectedMeals.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    {canSelectForDate ? 'No meals selected yet' : 'No meals selected'}
                  </Text>
                </View>
              ) : (
                selectedMeals.map((meal, index) => (
                  <View key={index} style={styles.selectedMealCard}>
                    <View style={styles.selectedMealInfo}>
                      <Text style={styles.selectedMealName}>{meal.name}</Text>
                      <Text style={styles.selectedMealCategory}>{meal.category}</Text>
                    </View>
                    {canSelectForDate && (
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
        )}

        {/* Available Menus */}
        {canSelectForDate && Object.keys(availableMenus).length > 0 && (
          <>
            {Object.entries(requirements).map(([category, qty]) => {
              // Match category to available menus - try exact match, then partial
              let categoryMeals = availableMenus[category] || [];
              if (categoryMeals.length === 0) {
                // Try partial match (e.g. "chicken" matches "chicken_meals" category key)
                const matchKey = Object.keys(availableMenus).find(
                  (k) => k.includes(category) || category.includes(k)
                );
                if (matchKey) categoryMeals = availableMenus[matchKey];
              }
              if (qty <= 0 || categoryMeals.length === 0) return null;

              const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);
              const selectedCount = selectedMeals.filter(
                (m) => m.category.toLowerCase() === category
              ).length;

              return (
                <View key={category} style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    {categoryLabel} ({selectedCount}/{qty})
                  </Text>
                  <View style={styles.menuGrid}>
                    {categoryMeals.map((meal) => {
                      const isSelected = selectedMeals.some((m) => m.id === meal.id);
                      return (
                        <TouchableOpacity
                          key={meal.id}
                          style={[styles.mealCard, isSelected && styles.mealCardSelected]}
                          onPress={() => handleSelectMeal(meal)}
                        >
                          <Text style={[styles.mealName, isSelected && styles.mealNameSelected]}>
                            {meal.name}
                          </Text>
                          <Text style={styles.mealCalories}>{meal.calories} cal</Text>
                          {isSelected && (
                            <View style={styles.selectedBadge}>
                              <Text style={styles.selectedBadgeText}>✓</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}

            {/* Fallback: if no requirements matched, show all available meals */}
            {Object.entries(requirements).every(([category]) => {
              let categoryMeals = availableMenus[category] || [];
              if (categoryMeals.length === 0) {
                const matchKey = Object.keys(availableMenus).find(
                  (k) => k.includes(category) || category.includes(k)
                );
                if (matchKey) categoryMeals = availableMenus[matchKey];
              }
              return categoryMeals.length === 0;
            }) && Object.entries(availableMenus).map(([category, meals]) => {
              const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);
              return (
                <View key={category} style={styles.section}>
                  <Text style={styles.sectionTitle}>{categoryLabel}</Text>
                  <View style={styles.menuGrid}>
                    {meals.map((meal) => {
                      const isSelected = selectedMeals.some((m) => m.id === meal.id);
                      return (
                        <TouchableOpacity
                          key={meal.id}
                          style={[styles.mealCard, isSelected && styles.mealCardSelected]}
                          onPress={() => handleSelectMeal(meal)}
                        >
                          <Text style={[styles.mealName, isSelected && styles.mealNameSelected]}>
                            {meal.name}
                          </Text>
                          <Text style={styles.mealCalories}>{meal.calories} cal</Text>
                          {isSelected && (
                            <View style={styles.selectedBadge}>
                              <Text style={styles.selectedBadgeText}>✓</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </>
        )}

        {/* Meal Plans / History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Meals</Text>

          {mealPlans.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No meal plans yet</Text>
            </View>
          ) : (
            mealPlans.map((day, index) => {
              const status = day.meal_plan?.status || (day.meal_plan ? 'pending' : 'scheduled');
              const statusInfo = getStatusBadge(status);
              const hasMeals = day.meal_plan && day.meal_plan.items && day.meal_plan.items.length > 0;
              const isCurrentSelection = day.date === selectedDate;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.historyCard,
                    isCurrentSelection && styles.historyCardActive,
                  ]}
                  onPress={() => handleSelectDate(day)}
                  disabled={!day.can_select && !hasMeals}
                >
                  <View style={styles.historyHeader}>
                    <View>
                      <Text style={styles.historyDay}>{day.day_name}</Text>
                      <Text style={styles.historyDate}>
                        {day.dateStr || formatDateStr(day.date)}
                      </Text>
                    </View>
                    {hasMeals && (
                      <View style={[styles.historyStatusBadge, { backgroundColor: statusInfo.color }]}>
                        <Text style={styles.historyStatusIcon}>{statusInfo.icon}</Text>
                        <Text style={styles.historyStatusText}>{statusInfo.text}</Text>
                      </View>
                    )}
                  </View>

                  {day.deliveryTime && (
                    <Text style={styles.historyTime}>Delivered at {day.deliveryTime}</Text>
                  )}
                  {day.estimatedTime && (
                    <Text style={styles.historyTime}>Estimated delivery: {day.estimatedTime}</Text>
                  )}

                  {hasMeals ? (
                    <View style={styles.historyMeals}>
                      {day.meal_plan.items.map((item, mealIndex) => (
                        <View key={mealIndex} style={styles.historyMealItem}>
                          <Text style={styles.historyMealBullet}>•</Text>
                          <Text style={styles.historyMealText}>
                            {item.meal?.name || item.name}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={styles.noMealsState}>
                      <Text style={styles.noMealsText}>
                        {day.can_select ? 'Tap to select meals' : 'No meals selected'}
                      </Text>
                    </View>
                  )}

                  {day.can_select && !isCurrentSelection && (
                    <View style={styles.tapIndicator}>
                      <Text style={styles.tapIndicatorText}>
                        {hasMeals ? 'Tap to modify' : 'Tap to select'}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Submit Button (only if window is open) */}
      {canSelectForDate && (
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
                <Text style={styles.submitText}>Confirm Meal Selection</Text>
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
    position: 'relative',
  },
  mealCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F9F4',
  },
  mealName: {
    ...Fonts.semiBold,
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  mealNameSelected: {
    color: Colors.primary,
  },
  mealCalories: {
    ...Fonts.regular,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  historyCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  historyCardActive: {
    borderColor: Colors.primary,
    borderWidth: 2,
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
  noMealsState: {
    paddingVertical: Spacing.sm,
  },
  noMealsText: {
    ...Fonts.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  tapIndicator: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  tapIndicatorText: {
    ...Fonts.medium,
    fontSize: 12,
    color: Colors.primary,
    textAlign: 'center',
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
