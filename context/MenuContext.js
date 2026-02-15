import React, { createContext, useState, useContext } from 'react';
import { getMenu, getMenuCategories } from '../utils/api';

const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('chicken');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load categories
  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await getMenuCategories();

      // Backend returns: {code: 200, categories: [{value, label, label_ar}, ...]}
      if (response.code === 200) {
        setCategories(response.categories);
        setError(null);
      } else {
        setError('Failed to load categories');
      }
    } catch (err) {
      setError('Failed to load categories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load menu items (all items, then filter by category if needed)
  const loadMenuItems = async (category) => {
    try {
      setLoading(true);
      setSelectedCategory(category);
      const response = await getMenu();

      // Backend returns: {code: 200, meals: [{id, name, category, ...}, ...]}
      if (response.code === 200) {
        // Filter by category if specified
        const filteredMeals = category
          ? response.meals.filter(meal => meal.category === category)
          : response.meals;

        setMenuItems(filteredMeals);
        setError(null);
      } else {
        setError('Failed to load menu items');
      }
    } catch (err) {
      setError('Failed to load menu items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    menuItems,
    categories,
    selectedCategory,
    loading,
    error,
    loadCategories,
    loadMenuItems,
  };

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};
