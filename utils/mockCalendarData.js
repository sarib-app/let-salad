// Mock calendar data — simulates meal plan calendar view
// Remove this file once backend implements GET /api/v1/mobile/subscriptions/{id}/calendar

const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_NAMES_FULL_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES_SHORT_AR = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

const MOCK_MEALS = [
  { id: 9, name: 'Grilled Chicken', name_ar: 'دجاج مشوي', calories: 450 },
  { id: 10, name: 'Beef Steak', name_ar: 'ستيك لحم', calories: 550 },
  { id: 11, name: 'Salmon Fillet', name_ar: 'فيليه سلمون', calories: 420 },
  { id: 12, name: 'Greek Salad', name_ar: 'سلطة يونانية', calories: 280 },
  { id: 13, name: 'Turkey Sandwich', name_ar: 'ساندويتش ديك رومي', calories: 380 },
  { id: 14, name: 'Veggie Bowl', name_ar: 'طبق خضار', calories: 320 },
];

const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Simple seeded selection to avoid random changes on re-render
const getMealsForDay = (dateStr, mealCount) => {
  const seed = dateStr.split('-').reduce((sum, n) => sum + parseInt(n, 10), 0);
  const startIdx = seed % MOCK_MEALS.length;
  const meals = [];
  for (let i = 0; i < mealCount; i++) {
    meals.push(MOCK_MEALS[(startIdx + i) % MOCK_MEALS.length]);
  }
  return meals;
};

/**
 * Gets the Monday of the week containing the given date.
 * @param {Date} date
 * @returns {Date}
 */
export const getMonday = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Generates mock calendar data for a given week.
 * Simulates GET /api/v1/mobile/subscriptions/{id}/calendar?week_start=YYYY-MM-DD
 *
 * @param {object} subscription
 * @param {Date} weekStart - Monday of the target week
 * @returns {{ days: Array }}
 */
export const getMockCalendarWeek = (subscription, weekStart) => {
  const days = [];
  const now = new Date();
  const todayStr = formatDate(now);
  const mealCount = subscription?.subscription_package?.meals_per_day || 2;

  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const dow = d.getDay();
    const dateStr = formatDate(d);
    const isFriday = dow === 5;
    const isToday = dateStr === todayStr;
    const isPast = d < new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Friday = no delivery, past/today always have meals, future days have ~70% chance
    const hasMeals = !isFriday && (isPast || isToday || (dateStr.charCodeAt(dateStr.length - 1) % 3 !== 0));
    const meals = hasMeals ? getMealsForDay(dateStr, mealCount) : [];

    days.push({
      date: dateStr,
      dayName: DAY_NAMES_FULL[dow],
      dayNameAr: DAY_NAMES_FULL_AR[dow],
      dayShort: DAY_NAMES_SHORT[dow],
      dayShortAr: DAY_NAMES_SHORT_AR[dow],
      isToday,
      isPast,
      isFriday,
      meals,
      isEmpty: meals.length === 0,
    });
  }

  return { days };
};
