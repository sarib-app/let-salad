// Mock data for subscription packages
// This will be replaced with API calls later

export const subscriptionPackages = [
  // Chicken Packages
  {
    id: 'pkg1',
    package_title: 'Chicken Single Meal',
    duration: 24,
    price_24: 648,
    price_10: 270, // estimated
    meals: [{ meal_type: 1, meal_name: 'Chicken', qty: 1 }],
    popular: false,
  },
  {
    id: 'pkg2',
    package_title: 'Chicken 2 Meals',
    duration: 24,
    price_24: 1296,
    price_10: 540, // estimated
    meals: [{ meal_type: 1, meal_name: 'Chicken', qty: 2 }],
    popular: true,
  },
  {
    id: 'pkg3',
    package_title: 'Chicken 1 Meal + Sandwich',
    duration: 24,
    price_24: 1068,
    price_10: 445, // estimated
    meals: [
      { meal_type: 1, meal_name: 'Chicken', qty: 1 },
      { meal_type: 2, meal_name: 'Sandwich', qty: 1 },
    ],
    popular: false,
  },
  {
    id: 'pkg4',
    package_title: 'Chicken 2 Meals + Sandwich',
    duration: 24,
    price_24: 1716,
    price_10: 715, // estimated
    meals: [
      { meal_type: 1, meal_name: 'Chicken', qty: 2 },
      { meal_type: 2, meal_name: 'Sandwich', qty: 1 },
    ],
    popular: true,
  },
  {
    id: 'pkg5',
    package_title: 'Chicken 1 Meal + Salad',
    duration: 24,
    price_24: 1320,
    price_10: 550, // estimated
    meals: [
      { meal_type: 1, meal_name: 'Chicken', qty: 1 },
      { meal_type: 3, meal_name: 'Salad', qty: 1 },
    ],
    popular: false,
  },
  {
    id: 'pkg6',
    package_title: 'Chicken 2 Meals + Salad',
    duration: 24,
    price_24: 1968,
    price_10: 820, // estimated
    meals: [
      { meal_type: 1, meal_name: 'Chicken', qty: 2 },
      { meal_type: 3, meal_name: 'Salad', qty: 1 },
    ],
    popular: false,
  },

  // Mix Meal Packages
  {
    id: 'pkg7',
    package_title: 'Mix Meal Single',
    duration: 24,
    price_24: 732,
    price_10: 305, // estimated
    description: '12 Chicken, 6 Beef, 6 Salmon',
    meals: [
      { meal_type: 1, meal_name: 'Chicken', qty: 12 },
      { meal_type: 4, meal_name: 'Beef', qty: 6 },
      { meal_type: 5, meal_name: 'Salmon', qty: 6 },
    ],
    popular: false,
  },
  {
    id: 'pkg8',
    package_title: 'Mix Meal Double',
    duration: 24,
    price_24: 1464,
    price_10: 610, // estimated
    description: '24 Chicken, 12 Beef, 12 Salmon',
    meals: [
      { meal_type: 1, meal_name: 'Chicken', qty: 24 },
      { meal_type: 4, meal_name: 'Beef', qty: 12 },
      { meal_type: 5, meal_name: 'Salmon', qty: 12 },
    ],
    popular: true,
  },
  {
    id: 'pkg9',
    package_title: 'Mix Meal Single + Sandwich',
    duration: 24,
    price_24: 1152,
    price_10: 480, // estimated
    meals: [
      { meal_type: 1, meal_name: 'Chicken', qty: 12 },
      { meal_type: 4, meal_name: 'Beef', qty: 6 },
      { meal_type: 5, meal_name: 'Salmon', qty: 6 },
      { meal_type: 2, meal_name: 'Sandwich', qty: 1 },
    ],
    popular: false,
  },
  {
    id: 'pkg10',
    package_title: 'Mix Meal Double + Sandwich',
    duration: 24,
    price_24: 1884,
    price_10: 785, // estimated
    meals: [
      { meal_type: 1, meal_name: 'Chicken', qty: 24 },
      { meal_type: 4, meal_name: 'Beef', qty: 12 },
      { meal_type: 5, meal_name: 'Salmon', qty: 12 },
      { meal_type: 2, meal_name: 'Sandwich', qty: 1 },
    ],
    popular: false,
  },
  {
    id: 'pkg11',
    package_title: 'Mix Meal Single + Salad',
    duration: 24,
    price_24: 1404,
    price_10: 585, // estimated
    meals: [
      { meal_type: 1, meal_name: 'Chicken', qty: 12 },
      { meal_type: 4, meal_name: 'Beef', qty: 6 },
      { meal_type: 5, meal_name: 'Salmon', qty: 6 },
      { meal_type: 3, meal_name: 'Salad', qty: 1 },
    ],
    popular: false,
  },
  {
    id: 'pkg12',
    package_title: 'Mix Meal Double + Salad',
    duration: 24,
    price_24: 2136,
    price_10: 890, // estimated
    meals: [
      { meal_type: 1, meal_name: 'Chicken', qty: 24 },
      { meal_type: 4, meal_name: 'Beef', qty: 12 },
      { meal_type: 5, meal_name: 'Salmon', qty: 12 },
      { meal_type: 3, meal_name: 'Salad', qty: 1 },
    ],
    popular: false,
  },
];

// Function to simulate API call
export const fetchSubscriptionPackages = async () => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return subscriptionPackages;
};
