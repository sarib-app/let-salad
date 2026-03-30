// Mock nutrition data — simulates weekly nutrition tracking
// Remove this file once backend implements GET /api/v1/mobile/nutrition/summary

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES_AR = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Seeded pseudo-random to avoid re-renders changing data
const seededValues = [
  { calories: 620, protein: 52, carbs: 48, fat: 22 },
  { calories: 580, protein: 45, carbs: 55, fat: 18 },
  { calories: 710, protein: 60, carbs: 42, fat: 30 },
  { calories: 490, protein: 38, carbs: 50, fat: 15 },
  { calories: 650, protein: 55, carbs: 35, fat: 28 },
  { calories: 540, protein: 42, carbs: 60, fat: 20 },
  { calories: 680, protein: 58, carbs: 40, fat: 25 },
];

/**
 * Generates mock weekly nutrition data.
 * In production, backend aggregates from actual delivered meals.
 *
 * @returns {{ dailySummary: Array, weeklyTotals: object }}
 */
export const getMockWeeklyNutrition = () => {
  const now = new Date();
  const dailySummary = [];
  let valIndex = 0;

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dow = d.getDay();

    // Skip Friday (no delivery in Saudi schedule)
    if (dow === 5) continue;

    const vals = seededValues[valIndex % seededValues.length];
    valIndex++;

    dailySummary.push({
      date: formatDate(d),
      dayName: DAY_NAMES[dow],
      dayNameAr: DAY_NAMES_AR[dow],
      calories: vals.calories,
      protein: vals.protein,
      carbs: vals.carbs,
      fat: vals.fat,
      mealCount: 2,
    });
  }

  const count = dailySummary.length || 1;
  const totalCalories = dailySummary.reduce((sum, d) => sum + d.calories, 0);
  const totalProtein = dailySummary.reduce((s, d) => s + d.protein, 0);
  const totalCarbs = dailySummary.reduce((s, d) => s + d.carbs, 0);
  const totalFat = dailySummary.reduce((s, d) => s + d.fat, 0);

  return {
    dailySummary,
    weeklyTotals: {
      totalCalories,
      avgCalories: Math.round(totalCalories / count),
      totalProtein,
      totalCarbs,
      totalFat,
      avgProtein: Math.round(totalProtein / count),
      avgCarbs: Math.round(totalCarbs / count),
      avgFat: Math.round(totalFat / count),
    },
  };
};
