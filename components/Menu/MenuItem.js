import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { Colors, Fonts, Spacing, BorderRadius } from '../../utils/globalStyles';

const { width } = Dimensions.get('window');
const itemWidth = (width - Spacing.md * 4) / 2;

// Placeholder image when image_url is null
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/200x120/E8F5E9/00B14F?text=Let%27Salad';

const MenuItem = ({ item, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(item)}
    >
      <Image
        source={{ uri: item.image_url || PLACEHOLDER_IMAGE }}
        style={styles.image}
      />

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.calorieContainer}>
          <Text style={styles.calorieValue}>{item.calories}</Text>
          <Text style={styles.calorieLabel}> cal</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: itemWidth,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  image: {
    width: '100%',
    height: 120,
    backgroundColor: Colors.inputBackground,
  },
  content: {
    padding: Spacing.sm,
  },
  name: {
    ...Fonts.semiBold,
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 4,
    lineHeight: 18,
  },
  calorieContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  calorieValue: {
    ...Fonts.bold,
    fontSize: 16,
    color: Colors.primary,
  },
  calorieLabel: {
    ...Fonts.regular,
    fontSize: 12,
    color: Colors.textSecondary,
  },
});

export default MenuItem;
