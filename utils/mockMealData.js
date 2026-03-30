// Mock meal customization data
// Simulates what admin attaches to each meal from the dashboard
//
// BACKEND FORMAT (from GET /mobile/menu/{id}):
//   options[]: { id, name, name_ar, type: "multiple_choice"|"single_choice", is_required, values[] }
//   values[]: { id, name, name_ar, price_modifier }
//
// UI FORMAT (used by MealDetailSheet):
//   options[]: { id, name, name_ar, multi_select, required, max_count?, list[] }
//   list[]:    { id, name, name_ar, calories, price, default? }
//   variations[]: same structure as options
//   add_ons[]: { id, name, name_ar, calories }
//
// transformBackendMeal() converts backend → UI format
// buildMealPlanPayload() converts UI selections → backend POST format

// ============================================================
// Mock customization data keyed by meal ID
// In production, this comes from the API per meal
// ============================================================
const mealCustomizations = {
  // --- Grilled Chicken (id: 9) ---
  9: {
    options: [
      {
        id: 'size',
        name: 'Size',
        name_ar: 'الحجم',
        multi_select: false,
        required: true,
        list: [
          { id: 'regular', name: 'Regular', name_ar: 'عادي', calories: 0, default: true },
          { id: 'large', name: 'Large', name_ar: 'كبير', calories: 150 },
        ],
      },
      {
        id: 'side',
        name: 'Side Dish',
        name_ar: 'طبق جانبي',
        multi_select: false,
        required: true,
        list: [
          { id: 'brown_rice', name: 'Brown Rice', name_ar: 'أرز بني', calories: 0, default: true },
          { id: 'white_rice', name: 'White Rice', name_ar: 'أرز أبيض', calories: 10 },
          { id: 'quinoa', name: 'Quinoa', name_ar: 'كينوا', calories: -20 },
          { id: 'sweet_potato', name: 'Sweet Potato', name_ar: 'بطاطا حلوة', calories: 5 },
          { id: 'steamed_veggies', name: 'Steamed Veggies', name_ar: 'خضار مطبوخة', calories: -50 },
        ],
      },
    ],
    variations: [
      {
        id: 'cooking',
        name: 'Cooking Style',
        name_ar: 'طريقة الطبخ',
        multi_select: false,
        required: true,
        list: [
          { id: 'grilled', name: 'Grilled', name_ar: 'مشوي', calories: 0, default: true },
          { id: 'baked', name: 'Baked', name_ar: 'مخبوز', calories: -15 },
          { id: 'pan_seared', name: 'Pan Seared', name_ar: 'مقلي بالمقلاة', calories: 30 },
        ],
      },
      {
        id: 'sauce',
        name: 'Sauce',
        name_ar: 'الصلصة',
        multi_select: false,
        required: false,
        list: [
          { id: 'none', name: 'No Sauce', name_ar: 'بدون صلصة', calories: 0, default: true },
          { id: 'garlic', name: 'Garlic Sauce', name_ar: 'صلصة الثوم', calories: 45 },
          { id: 'tahini', name: 'Tahini', name_ar: 'طحينة', calories: 60 },
          { id: 'lemon_herb', name: 'Lemon & Herb', name_ar: 'ليمون وأعشاب', calories: 20 },
          { id: 'bbq', name: 'BBQ Sauce', name_ar: 'صلصة باربكيو', calories: 50 },
        ],
      },
    ],
    add_ons: [
      { id: 'extra_protein', name: 'Extra Protein', name_ar: 'بروتين إضافي', calories: 120 },
      { id: 'avocado', name: 'Avocado', name_ar: 'أفوكادو', calories: 80 },
      { id: 'cheese', name: 'Cheese', name_ar: 'جبن', calories: 110 },
      { id: 'extra_veggies', name: 'Extra Veggies', name_ar: 'خضروات إضافية', calories: 25 },
    ],
    special_instructions: true,
  },

  // --- Beef Steak (id: 10) ---
  10: {
    options: [
      {
        id: 'size',
        name: 'Size',
        name_ar: 'الحجم',
        multi_select: false,
        required: true,
        list: [
          { id: 'regular', name: 'Regular', name_ar: 'عادي', calories: 0, default: true },
          { id: 'large', name: 'Large', name_ar: 'كبير', calories: 200 },
        ],
      },
      {
        id: 'side',
        name: 'Side Dish',
        name_ar: 'طبق جانبي',
        multi_select: false,
        required: true,
        list: [
          { id: 'brown_rice', name: 'Brown Rice', name_ar: 'أرز بني', calories: 0, default: true },
          { id: 'white_rice', name: 'White Rice', name_ar: 'أرز أبيض', calories: 10 },
          { id: 'mashed_potato', name: 'Mashed Potato', name_ar: 'بطاطس مهروسة', calories: 40 },
          { id: 'steamed_veggies', name: 'Steamed Veggies', name_ar: 'خضار مطبوخة', calories: -50 },
        ],
      },
    ],
    variations: [
      {
        id: 'doneness',
        name: 'Doneness',
        name_ar: 'درجة النضج',
        multi_select: false,
        required: true,
        list: [
          { id: 'medium', name: 'Medium', name_ar: 'متوسط', calories: 0, default: true },
          { id: 'medium_well', name: 'Medium Well', name_ar: 'متوسط ناضج', calories: -10 },
          { id: 'well_done', name: 'Well Done', name_ar: 'ناضج تماماً', calories: -20 },
        ],
      },
      {
        id: 'sauce',
        name: 'Sauce',
        name_ar: 'الصلصة',
        multi_select: true,
        required: false,
        max_count: 2,
        list: [
          { id: 'garlic', name: 'Garlic Sauce', name_ar: 'صلصة الثوم', calories: 45 },
          { id: 'bbq', name: 'BBQ Sauce', name_ar: 'صلصة باربكيو', calories: 50 },
          { id: 'mushroom', name: 'Mushroom Sauce', name_ar: 'صلصة الفطر', calories: 35 },
          { id: 'pepper', name: 'Pepper Sauce', name_ar: 'صلصة الفلفل', calories: 30 },
        ],
      },
    ],
    add_ons: [
      { id: 'extra_protein', name: 'Extra Protein', name_ar: 'بروتين إضافي', calories: 120 },
      { id: 'avocado', name: 'Avocado', name_ar: 'أفوكادو', calories: 80 },
      { id: 'cheese', name: 'Cheese', name_ar: 'جبن', calories: 110 },
      { id: 'egg', name: 'Fried Egg', name_ar: 'بيض مقلي', calories: 90 },
    ],
    special_instructions: true,
  },

  // --- Salmon (id: 11) ---
  11: {
    options: [
      {
        id: 'size',
        name: 'Size',
        name_ar: 'الحجم',
        multi_select: false,
        required: true,
        list: [
          { id: 'regular', name: 'Regular', name_ar: 'عادي', calories: 0, default: true },
          { id: 'large', name: 'Large', name_ar: 'كبير', calories: 180 },
        ],
      },
      {
        id: 'side',
        name: 'Side Dish',
        name_ar: 'طبق جانبي',
        multi_select: false,
        required: true,
        list: [
          { id: 'brown_rice', name: 'Brown Rice', name_ar: 'أرز بني', calories: 0, default: true },
          { id: 'quinoa', name: 'Quinoa', name_ar: 'كينوا', calories: -20 },
          { id: 'steamed_veggies', name: 'Steamed Veggies', name_ar: 'خضار مطبوخة', calories: -50 },
          { id: 'sweet_potato', name: 'Sweet Potato', name_ar: 'بطاطا حلوة', calories: 5 },
        ],
      },
    ],
    variations: [
      {
        id: 'cooking',
        name: 'Cooking Style',
        name_ar: 'طريقة الطبخ',
        multi_select: false,
        required: true,
        list: [
          { id: 'grilled', name: 'Grilled', name_ar: 'مشوي', calories: 0, default: true },
          { id: 'baked', name: 'Baked', name_ar: 'مخبوز', calories: -10 },
          { id: 'teriyaki', name: 'Teriyaki Glazed', name_ar: 'مغلف بالتيرياكي', calories: 40 },
        ],
      },
      {
        id: 'sauce',
        name: 'Sauce',
        name_ar: 'الصلصة',
        multi_select: false,
        required: false,
        list: [
          { id: 'none', name: 'No Sauce', name_ar: 'بدون صلصة', calories: 0, default: true },
          { id: 'lemon_herb', name: 'Lemon & Herb', name_ar: 'ليمون وأعشاب', calories: 20 },
          { id: 'tahini', name: 'Tahini', name_ar: 'طحينة', calories: 60 },
          { id: 'teriyaki', name: 'Teriyaki', name_ar: 'تيرياكي', calories: 35 },
        ],
      },
    ],
    add_ons: [
      { id: 'avocado', name: 'Avocado', name_ar: 'أفوكادو', calories: 80 },
      { id: 'extra_veggies', name: 'Extra Veggies', name_ar: 'خضروات إضافية', calories: 25 },
      { id: 'nuts', name: 'Mixed Nuts', name_ar: 'مكسرات مشكلة', calories: 95 },
      { id: 'egg', name: 'Boiled Egg', name_ar: 'بيض مسلوق', calories: 70 },
    ],
    special_instructions: true,
  },

  // --- Greek Salad (id: 12) ---
  12: {
    options: [
      {
        id: 'size',
        name: 'Size',
        name_ar: 'الحجم',
        multi_select: false,
        required: true,
        list: [
          { id: 'regular', name: 'Regular', name_ar: 'عادي', calories: 0, default: true },
          { id: 'large', name: 'Large', name_ar: 'كبير', calories: 100 },
        ],
      },
      {
        id: 'base',
        name: 'Salad Base',
        name_ar: 'قاعدة السلطة',
        multi_select: false,
        required: true,
        list: [
          { id: 'mixed_greens', name: 'Mixed Greens', name_ar: 'خضروات مشكلة', calories: 0, default: true },
          { id: 'spinach', name: 'Spinach', name_ar: 'سبانخ', calories: -5 },
          { id: 'kale', name: 'Kale', name_ar: 'كيل', calories: -10 },
          { id: 'romaine', name: 'Romaine', name_ar: 'خس روماني', calories: 0 },
        ],
      },
    ],
    variations: [
      {
        id: 'toppings',
        name: 'Toppings',
        name_ar: 'الإضافات',
        multi_select: true,
        required: true,
        max_count: 4,
        list: [
          { id: 'tomato', name: 'Tomato', name_ar: 'طماطم', calories: 5 },
          { id: 'cucumber', name: 'Cucumber', name_ar: 'خيار', calories: 3 },
          { id: 'onion', name: 'Red Onion', name_ar: 'بصل أحمر', calories: 5 },
          { id: 'olives', name: 'Olives', name_ar: 'زيتون', calories: 15 },
          { id: 'corn', name: 'Sweet Corn', name_ar: 'ذرة حلوة', calories: 20 },
          { id: 'bell_pepper', name: 'Bell Pepper', name_ar: 'فلفل رومي', calories: 5 },
          { id: 'feta', name: 'Feta Cheese', name_ar: 'جبنة فيتا', calories: 40 },
          { id: 'mushroom', name: 'Mushrooms', name_ar: 'فطر', calories: 8 },
        ],
      },
      {
        id: 'dressing',
        name: 'Dressing',
        name_ar: 'التتبيلة',
        multi_select: false,
        required: true,
        list: [
          { id: 'olive_lemon', name: 'Olive Oil & Lemon', name_ar: 'زيت زيتون وليمون', calories: 0, default: true },
          { id: 'balsamic', name: 'Balsamic Vinaigrette', name_ar: 'خل بلسمي', calories: 15 },
          { id: 'caesar', name: 'Caesar', name_ar: 'سيزر', calories: 45 },
          { id: 'ranch', name: 'Ranch', name_ar: 'رانش', calories: 55 },
          { id: 'no_dressing', name: 'No Dressing', name_ar: 'بدون تتبيلة', calories: -30 },
        ],
      },
      {
        id: 'protein_add',
        name: 'Add Protein',
        name_ar: 'إضافة بروتين',
        multi_select: false,
        required: false,
        list: [
          { id: 'none', name: 'No Protein', name_ar: 'بدون بروتين', calories: 0, default: true },
          { id: 'grilled_chicken', name: 'Grilled Chicken', name_ar: 'دجاج مشوي', calories: 130 },
          { id: 'grilled_salmon', name: 'Grilled Salmon', name_ar: 'سلمون مشوي', calories: 150 },
          { id: 'boiled_eggs', name: 'Boiled Eggs', name_ar: 'بيض مسلوق', calories: 70 },
        ],
      },
    ],
    add_ons: [
      { id: 'avocado', name: 'Avocado', name_ar: 'أفوكادو', calories: 80 },
      { id: 'extra_veggies', name: 'Extra Veggies', name_ar: 'خضروات إضافية', calories: 25 },
      { id: 'cheese', name: 'Extra Cheese', name_ar: 'جبن إضافي', calories: 110 },
      { id: 'nuts', name: 'Mixed Nuts', name_ar: 'مكسرات مشكلة', calories: 95 },
    ],
    special_instructions: true,
  },

  // --- Turkey Sandwich (id: 13) ---
  13: {
    options: [
      {
        id: 'bread',
        name: 'Bread Type',
        name_ar: 'نوع الخبز',
        multi_select: false,
        required: true,
        list: [
          { id: 'whole_wheat', name: 'Whole Wheat', name_ar: 'قمح كامل', calories: 0, default: true },
          { id: 'white', name: 'White Bread', name_ar: 'خبز أبيض', calories: 15 },
          { id: 'sourdough', name: 'Sourdough', name_ar: 'خبز العجين المخمر', calories: 10 },
          { id: 'wrap', name: 'Tortilla Wrap', name_ar: 'خبز تورتيلا', calories: -20 },
          { id: 'lettuce_wrap', name: 'Lettuce Wrap', name_ar: 'لفافة خس', calories: -80 },
        ],
      },
    ],
    variations: [
      {
        id: 'fillings',
        name: 'Extra Fillings',
        name_ar: 'حشوات إضافية',
        multi_select: true,
        required: false,
        max_count: 3,
        list: [
          { id: 'lettuce', name: 'Lettuce', name_ar: 'خس', calories: 3 },
          { id: 'tomato', name: 'Tomato', name_ar: 'طماطم', calories: 5 },
          { id: 'pickles', name: 'Pickles', name_ar: 'مخلل', calories: 2 },
          { id: 'onion', name: 'Red Onion', name_ar: 'بصل أحمر', calories: 5 },
          { id: 'jalapeno', name: 'Jalapeño', name_ar: 'هالابينو', calories: 3 },
        ],
      },
      {
        id: 'sauce',
        name: 'Sauce',
        name_ar: 'الصلصة',
        multi_select: true,
        required: false,
        max_count: 2,
        list: [
          { id: 'garlic', name: 'Garlic Sauce', name_ar: 'صلصة الثوم', calories: 45 },
          { id: 'mustard', name: 'Mustard', name_ar: 'خردل', calories: 10 },
          { id: 'mayo', name: 'Light Mayo', name_ar: 'مايونيز خفيف', calories: 35 },
          { id: 'ranch', name: 'Ranch', name_ar: 'رانش', calories: 55 },
          { id: 'spicy', name: 'Spicy Sauce', name_ar: 'صلصة حارة', calories: 30 },
        ],
      },
    ],
    add_ons: [
      { id: 'avocado', name: 'Avocado', name_ar: 'أفوكادو', calories: 80 },
      { id: 'cheese', name: 'Cheese', name_ar: 'جبن', calories: 110 },
      { id: 'egg', name: 'Boiled Egg', name_ar: 'بيض مسلوق', calories: 70 },
      { id: 'extra_veggies', name: 'Extra Veggies', name_ar: 'خضروات إضافية', calories: 25 },
    ],
    special_instructions: true,
  },

  // --- Veggie Bowl (id: 14) ---
  14: {
    options: [
      {
        id: 'size',
        name: 'Size',
        name_ar: 'الحجم',
        multi_select: false,
        required: true,
        list: [
          { id: 'regular', name: 'Regular', name_ar: 'عادي', calories: 0, default: true },
          { id: 'large', name: 'Large', name_ar: 'كبير', calories: 120 },
        ],
      },
      {
        id: 'side',
        name: 'Side Dish',
        name_ar: 'طبق جانبي',
        multi_select: false,
        required: true,
        list: [
          { id: 'brown_rice', name: 'Brown Rice', name_ar: 'أرز بني', calories: 0, default: true },
          { id: 'quinoa', name: 'Quinoa', name_ar: 'كينوا', calories: -20 },
          { id: 'sweet_potato', name: 'Sweet Potato', name_ar: 'بطاطا حلوة', calories: 5 },
        ],
      },
    ],
    variations: [
      {
        id: 'toppings',
        name: 'Toppings',
        name_ar: 'الإضافات',
        multi_select: true,
        required: true,
        max_count: 4,
        list: [
          { id: 'tomato', name: 'Tomato', name_ar: 'طماطم', calories: 5 },
          { id: 'cucumber', name: 'Cucumber', name_ar: 'خيار', calories: 3 },
          { id: 'corn', name: 'Sweet Corn', name_ar: 'ذرة حلوة', calories: 20 },
          { id: 'bell_pepper', name: 'Bell Pepper', name_ar: 'فلفل رومي', calories: 5 },
          { id: 'chickpeas', name: 'Chickpeas', name_ar: 'حمص', calories: 30 },
          { id: 'mushroom', name: 'Mushrooms', name_ar: 'فطر', calories: 8 },
        ],
      },
      {
        id: 'dressing',
        name: 'Dressing',
        name_ar: 'التتبيلة',
        multi_select: false,
        required: false,
        list: [
          { id: 'none', name: 'No Dressing', name_ar: 'بدون تتبيلة', calories: 0, default: true },
          { id: 'olive_lemon', name: 'Olive Oil & Lemon', name_ar: 'زيت زيتون وليمون', calories: 30 },
          { id: 'tahini', name: 'Tahini', name_ar: 'طحينة', calories: 60 },
        ],
      },
    ],
    add_ons: [
      { id: 'avocado', name: 'Avocado', name_ar: 'أفوكادو', calories: 80 },
      { id: 'extra_veggies', name: 'Extra Veggies', name_ar: 'خضروات إضافية', calories: 25 },
      { id: 'cheese', name: 'Cheese', name_ar: 'جبن', calories: 110 },
      { id: 'hummus', name: 'Hummus', name_ar: 'حمص', calories: 90 },
      { id: 'nuts', name: 'Mixed Nuts', name_ar: 'مكسرات مشكلة', calories: 95 },
      { id: 'egg', name: 'Boiled Egg', name_ar: 'بيض مسلوق', calories: 70 },
    ],
    special_instructions: true,
  },
};

/**
 * Enriches a meal object from the API with mock customization data.
 * FALLBACK ONLY — used when backend doesn't return options on the meal.
 * If the meal already has options from backend, use transformBackendMeal() instead.
 *
 * @param {object} meal - Meal object from API
 * @returns {object} Meal with options, variations, add_ons, special_instructions
 */
export const enrichMealWithMockData = (meal) => {
  // If meal already has backend options, transform them instead
  if (meal.options && meal.options.length > 0 && meal.options[0].values) {
    return transformBackendMeal(meal);
  }

  const customization = mealCustomizations[meal.id];

  if (!customization) {
    return {
      ...meal,
      options: [],
      variations: [],
      add_ons: [],
      special_instructions: false,
    };
  }

  return {
    ...meal,
    options: customization.options || [],
    variations: customization.variations || [],
    add_ons: customization.add_ons || [],
    special_instructions: customization.special_instructions || false,
  };
};

/**
 * Transforms a meal from BACKEND format to UI format.
 * Backend returns: options[].values[] with price_modifier, type, is_required
 * UI expects:      options[].list[] with calories, multi_select, required
 *
 * @param {object} meal - Meal from backend (GET /mobile/menu/{id})
 * @returns {object} Meal with UI-compatible options structure
 */
export const transformBackendMeal = (meal) => {
  const backendOptions = meal.options || [];

  const uiOptions = backendOptions.map((group) => ({
    id: group.id,
    name: group.name,
    name_ar: group.name_ar,
    multi_select: group.type === 'multiple_choice',
    required: group.is_required === true || group.is_required === 1,
    max_count: group.type === 'multiple_choice' ? (group.max_count || group.values?.length || 999) : undefined,
    list: (group.values || []).map((val, index) => ({
      id: val.id,
      name: val.name,
      name_ar: val.name_ar,
      calories: 0,
      price: val.price_modifier || 0,
      default: index === 0 && group.type !== 'multiple_choice',
    })),
  }));

  return {
    ...meal,
    options: uiOptions,
    variations: [],
    add_ons: [],
    special_instructions: true,
  };
};

/**
 * Converts UI selections back to backend POST format for saveMealPlan.
 *
 * UI format (from MealDetailSheet onAdd):
 *   { id, selections: { groupId: valueId | [valueId, ...] }, add_ons: [], special_instructions }
 *
 * Backend expects:
 *   { meal_id, quantity, options: [{ option_group_id, option_value_id }] }
 *
 * @param {object} customizedMeal - Meal with selections from MealDetailSheet
 * @returns {object} Backend-compatible payload for one meal
 */
export const buildMealPayload = (customizedMeal) => {
  const options = [];

  // Convert selections object to options array
  // Only include options with valid numeric IDs (from real backend data)
  // Skip mock string IDs like 'size', 'protein', 'regular' etc.
  if (customizedMeal.selections) {
    Object.entries(customizedMeal.selections).forEach(([groupId, value]) => {
      const numericGroupId = Number(groupId);
      if (!Number.isInteger(numericGroupId)) return; // skip mock string IDs

      if (Array.isArray(value)) {
        // Multi-select: each selected value becomes a separate entry
        value.forEach((valueId) => {
          const numericValueId = Number(valueId);
          if (!Number.isInteger(numericValueId)) return; // skip mock string IDs
          options.push({
            option_group_id: numericGroupId,
            option_value_id: numericValueId,
          });
        });
      } else if (value != null) {
        // Single-select
        const numericValueId = Number(value);
        if (!Number.isInteger(numericValueId)) return; // skip mock string IDs
        options.push({
          option_group_id: numericGroupId,
          option_value_id: numericValueId,
        });
      }
    });
  }

  return {
    meal_id: customizedMeal.id,
    quantity: customizedMeal.quantity || 1,
    options,
  };
};
