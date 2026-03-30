// Mock notification data — simulates what backend would return
// Remove this file once backend implements GET /api/v1/mobile/notifications

const now = new Date();

const hoursAgo = (h) => {
  const d = new Date(now);
  d.setHours(d.getHours() - h);
  return d.toISOString();
};

const daysAgo = (days) => {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: 'delivery_update',
    title: 'Delivery On Its Way',
    title_ar: 'التوصيل في الطريق',
    message: 'Your lunch is being delivered. Estimated arrival: 12:30 PM',
    message_ar: 'يتم توصيل غدائك. الوصول المتوقع: 12:30 مساءً',
    is_read: false,
    created_at: hoursAgo(1),
    data: { delivery_id: 1000 },
  },
  {
    id: 2,
    type: 'order_confirmation',
    title: 'Meals Confirmed',
    title_ar: 'تم تأكيد الوجبات',
    message: 'Your meal selections for tomorrow have been confirmed.',
    message_ar: 'تم تأكيد اختياراتك للوجبات لليوم التالي.',
    is_read: false,
    created_at: hoursAgo(3),
    data: { subscription_id: 1 },
  },
  {
    id: 3,
    type: 'meal_reminder',
    title: "Select Tomorrow's Meals",
    title_ar: 'اختر وجبات الغد',
    message: "Don't forget to select your meals for tomorrow before 10 PM tonight.",
    message_ar: 'لا تنسَ اختيار وجباتك لليوم التالي قبل الساعة 10 مساءً.',
    is_read: false,
    created_at: daysAgo(1),
    data: {},
  },
  {
    id: 4,
    type: 'delivery_update',
    title: 'Delivery Completed',
    title_ar: 'تم التوصيل',
    message: 'Your meals have been delivered successfully. Enjoy your meal!',
    message_ar: 'تم توصيل وجباتك بنجاح. بالعافية!',
    is_read: true,
    created_at: daysAgo(1),
    data: { delivery_id: 999 },
  },
  {
    id: 5,
    type: 'promotion',
    title: 'Weekend Special!',
    title_ar: 'عرض نهاية الأسبوع!',
    message: 'Get 20% off your next subscription upgrade. Use code WEEKEND20.',
    message_ar: 'احصل على خصم 20% على ترقية اشتراكك التالي. استخدم الرمز WEEKEND20.',
    is_read: true,
    created_at: daysAgo(2),
    data: { promo_code: 'WEEKEND20' },
  },
  {
    id: 6,
    type: 'order_confirmation',
    title: 'Subscription Activated',
    title_ar: 'تم تفعيل الاشتراك',
    message: 'Your Premium Plan subscription is now active. First delivery arrives tomorrow!',
    message_ar: 'اشتراكك في الخطة المميزة نشط الآن. أول توصيل يصل غداً!',
    is_read: true,
    created_at: daysAgo(3),
    data: { subscription_id: 1 },
  },
  {
    id: 7,
    type: 'meal_reminder',
    title: 'Meal Selection Open',
    title_ar: 'اختيار الوجبات مفتوح',
    message: 'The meal selection window for next week is now open. Choose your favorites!',
    message_ar: 'نافذة اختيار الوجبات للأسبوع القادم مفتوحة الآن. اختر المفضلة لديك!',
    is_read: true,
    created_at: daysAgo(5),
    data: {},
  },
];

/**
 * Returns mock notification list.
 * Simulates GET /api/v1/mobile/notifications
 * @returns {{ notifications: Array, unread_count: number }}
 */
export const getMockNotifications = () => {
  const unread_count = MOCK_NOTIFICATIONS.filter(n => !n.is_read).length;
  return { notifications: MOCK_NOTIFICATIONS, unread_count };
};
