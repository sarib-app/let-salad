// Mock delivery data — simulates what backend would return
// Remove this file once backend implements GET /api/v1/deliveries

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_NAMES_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

const MOCK_MEALS = [
  { name: 'Grilled Chicken', name_ar: 'دجاج مشوي' },
  { name: 'Beef Steak', name_ar: 'ستيك لحم' },
  { name: 'Greek Salad', name_ar: 'سلطة يونانية' },
  { name: 'Salmon Fillet', name_ar: 'فيليه سلمون' },
  { name: 'Turkey Sandwich', name_ar: 'ساندويتش ديك رومي' },
  { name: 'Veggie Bowl', name_ar: 'طبق خضار' },
  { name: 'Quinoa Bowl', name_ar: 'طبق كينوا' },
  { name: 'Caesar Salad', name_ar: 'سلطة سيزر' },
];

const randomMeals = (count = 2) => {
  const shuffled = [...MOCK_MEALS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Generates mock delivery data for a subscription.
 * Simulates what GET /api/v1/deliveries?subscription_id=X would return.
 *
 * @param {object} subscription - User's subscription object
 * @returns {{ today: object|null, upcoming: object[], past: object[] }}
 */
export const getMockDeliveries = (subscription) => {
  const now = new Date();
  const subName = subscription?.subscription_package?.name
    || subscription?.subscription_type?.name
    || 'Meal Plan';
  const subId = subscription?.id || 1;

  // --- Today's delivery ---
  const todayDate = formatDate(now);
  const todayDow = now.getDay();
  const hour = now.getHours();

  let todayStatus = 'preparing';
  let estimatedTime = '12:30 PM';
  let deliveredTime = null;

  if (hour >= 13) {
    todayStatus = 'delivered';
    deliveredTime = '12:22 PM';
    estimatedTime = null;
  } else if (hour >= 10) {
    todayStatus = 'on_the_way';
    estimatedTime = '12:30 PM';
  }

  const today = {
    id: 1000,
    date: todayDate,
    day_name: DAY_NAMES[todayDow],
    day_name_ar: DAY_NAMES_AR[todayDow],
    status: todayStatus,
    estimated_time: estimatedTime,
    delivered_time: deliveredTime,
    subscription_id: subId,
    subscription_name: subName,
    meals: randomMeals(2),
    meals_selected: true,
  };

  // --- Upcoming (next 5 days) ---
  const upcoming = [];
  for (let i = 1; i <= 5; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const dow = d.getDay();
    // Skip Friday (5) in Saudi schedule
    if (dow === 5) continue;

    const hasMeals = i <= 2; // first 2 days have meals selected
    upcoming.push({
      id: 1000 + i,
      date: formatDate(d),
      day_name: DAY_NAMES[dow],
      day_name_ar: DAY_NAMES_AR[dow],
      status: 'scheduled',
      estimated_time: null,
      delivered_time: null,
      subscription_id: subId,
      subscription_name: subName,
      meals: hasMeals ? randomMeals(2) : [],
      meals_selected: hasMeals,
    });
  }

  // --- Past deliveries (last 7 days) ---
  const past = [];
  const times = ['12:15 PM', '12:30 PM', '11:50 AM', '1:05 PM', '12:45 PM', '12:10 PM', '1:20 PM'];
  for (let i = 1; i <= 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dow = d.getDay();
    if (dow === 5) continue; // skip Friday

    past.push({
      id: 1000 - i,
      date: formatDate(d),
      day_name: DAY_NAMES[dow],
      day_name_ar: DAY_NAMES_AR[dow],
      status: 'delivered',
      estimated_time: null,
      delivered_time: times[i % times.length],
      subscription_id: subId,
      subscription_name: subName,
      meals: randomMeals(2),
      meals_selected: true,
    });
  }

  return { today, upcoming, past };
};
