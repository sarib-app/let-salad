import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { Colors, Fonts, Spacing, BorderRadius } from '../../utils/globalStyles';

const { width } = Dimensions.get('window');
const itemWidth = (width - Spacing.md * 4) / 2;

const MenuItem = ({ item, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.container, !item.available && styles.unavailable]}
      onPress={() => onPress(item)}
      disabled={!item.available}
    >
      <Image source={{ uri: item.image }} style={styles.image} />

      {item.popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>⭐</Text>
        </View>
      )}

      {!item.available && (
        <View style={styles.unavailableBadge}>
          <Text style={styles.unavailableText}>Out of Stock</Text>
        </View>
      )}

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
  unavailable: {
    opacity: 0.5,
  },
  image: {
    width: '100%',
    height: 120,
    backgroundColor: Colors.inputBackground,
  },
  popularBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popularText: {
    fontSize: 16,
  },
  unavailableBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: Colors.error,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  unavailableText: {
    ...Fonts.semiBold,
    fontSize: 10,
    color: Colors.white,
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
