// Mock data for menu items
// This will be replaced with API calls later

export const menuCategories = [
  { id: 'chicken', name: 'Chicken', icon: '🍗' },
  { id: 'sandwich', name: 'Sandwiches', icon: '🥪' },
];

export const menuItems = {
  chicken: [
    {
      id: 'ch1',
      name: 'Grilled Chicken Breast',
      description: 'Tender grilled chicken breast with herbs and spices',
      image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400',
      price: 35,
      calories: 320,
      protein: 45,
      carbs: 8,
      fat: 12,
      allergens: ['dairy'],
      available: true,
      popular: true,
    },
    {
      id: 'ch2',
      name: 'Chicken Tikka Masala',
      description: 'Spicy chicken in creamy tomato sauce with basmati rice',
      image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400',
      price: 42,
      calories: 450,
      protein: 38,
      carbs: 35,
      fat: 18,
      allergens: ['dairy'],
      available: true,
      popular: true,
    },
    {
      id: 'ch3',
      name: 'Lemon Herb Chicken',
      description: 'Zesty lemon chicken with fresh herbs and vegetables',
      image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400',
      price: 38,
      calories: 280,
      protein: 42,
      carbs: 12,
      fat: 10,
      allergens: [],
      available: true,
      popular: false,
    },
    {
      id: 'ch4',
      name: 'BBQ Chicken Wings',
      description: 'Smoky BBQ chicken wings with honey glaze',
      image: 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=400',
      price: 40,
      calories: 380,
      protein: 32,
      carbs: 22,
      fat: 20,
      allergens: ['gluten'],
      available: true,
      popular: false,
    },
    {
      id: 'ch5',
      name: 'Chicken Caesar Bowl',
      description: 'Grilled chicken with romaine, parmesan, and caesar dressing',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      price: 36,
      calories: 340,
      protein: 40,
      carbs: 15,
      fat: 16,
      allergens: ['dairy', 'eggs'],
      available: false,
      popular: true,
    },
    {
      id: 'ch6',
      name: 'Teriyaki Chicken',
      description: 'Sweet teriyaki glazed chicken with stir-fried vegetables',
      image: 'https://images.unsplash.com/photo-1588347818036-4c9dd7d5b164?w=400',
      price: 39,
      calories: 390,
      protein: 36,
      carbs: 28,
      fat: 14,
      allergens: ['soy'],
      available: true,
      popular: false,
    },
  ],
  sandwich: [
    {
      id: 'sw1',
      name: 'Club Sandwich',
      description: 'Triple decker with turkey, bacon, lettuce, and tomato',
      image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400',
      price: 32,
      calories: 420,
      protein: 28,
      carbs: 45,
      fat: 16,
      allergens: ['gluten', 'eggs'],
      available: true,
      popular: true,
    },
    {
      id: 'sw2',
      name: 'Grilled Chicken Sandwich',
      description: 'Grilled chicken with avocado, lettuce, and chipotle mayo',
      image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400',
      price: 34,
      calories: 380,
      protein: 35,
      carbs: 38,
      fat: 14,
      allergens: ['gluten', 'dairy'],
      available: true,
      popular: true,
    },
    {
      id: 'sw3',
      name: 'Veggie Delight',
      description: 'Fresh vegetables with hummus on whole grain bread',
      image: 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=400',
      price: 28,
      calories: 290,
      protein: 12,
      carbs: 42,
      fat: 8,
      allergens: ['gluten'],
      available: true,
      popular: false,
    },
    {
      id: 'sw4',
      name: 'Tuna Melt',
      description: 'Tuna salad with melted cheese on toasted bread',
      image: 'https://images.unsplash.com/photo-1621852004158-f3bc188ace2d?w=400',
      price: 36,
      calories: 440,
      protein: 30,
      carbs: 35,
      fat: 20,
      allergens: ['gluten', 'dairy', 'seafood'],
      available: true,
      popular: false,
    },
    {
      id: 'sw5',
      name: 'BLT Classic',
      description: 'Crispy bacon, lettuce, tomato with mayo',
      image: 'https://images.unsplash.com/photo-1553909489-ec2175ef3870?w=400',
      price: 30,
      calories: 360,
      protein: 18,
      carbs: 32,
      fat: 18,
      allergens: ['gluten', 'eggs'],
      available: true,
      popular: true,
    },
  ],
};

// Function to simulate API call
export const fetchMenuItems = async (category) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (category === 'all') {
    return Object.values(menuItems).flat();
  }

  return menuItems[category] || [];
};

export const fetchCategories = async () => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  return menuCategories;
};
