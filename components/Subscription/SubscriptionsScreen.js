import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Spacing, BorderRadius } from '../../utils/globalStyles';

const SubscriptionsScreen = ({ navigation }) => {
  // TODO: Replace with actual subscription state from context/API
  const [hasSubscriptions, setHasSubscriptions] = useState(false);
  const [activeSubscriptions, setActiveSubscriptions] = useState([]);

  const handleChooseSubscription = () => {
    // Navigate to Home tab
    navigation.navigate('Home');
  };

  const handleAddMore = () => {
    // Navigate to SubscriptionPackages screen
    navigation.navigate('SubscriptionPackages');
  };

  // Empty state - no subscriptions
  if (!hasSubscriptions || activeSubscriptions.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Subscriptions</Text>
        </View>

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📋</Text>
          <Text style={styles.emptyTitle}>No Active Subscriptions</Text>
          <Text style={styles.emptySubtitle}>
            You don't have any active subscriptions yet.{'\n'}
            Choose a plan to get started!
          </Text>

          <TouchableOpacity
            style={styles.chooseButton}
            onPress={handleChooseSubscription}
          >
            <LinearGradient
              colors={['#00B14F', '#00D95F']}
              style={styles.chooseButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.chooseButtonText}>Choose a Subscription</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Active subscriptions view
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Subscriptions</Text>
        <Text style={styles.subtitle}>Manage your active meal plans</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeSubscriptions.map((subscription) => (
          <View key={subscription.id} style={styles.subscriptionCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.packageName}>{subscription.package_title}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Active</Text>
              </View>
            </View>

            <View style={styles.cardDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Duration:</Text>
                <Text style={styles.detailValue}>{subscription.duration} Days</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Days Remaining:</Text>
                <Text style={styles.detailValue}>{subscription.days_remaining} Days</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.manageButton}>
              <Text style={styles.manageButtonText}>Manage Subscription</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addMoreButton} onPress={handleAddMore}>
          <Text style={styles.addMoreText}>+ Add More Subscriptions</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  title: {
    ...Fonts.bold,
    fontSize: 32,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    ...Fonts.bold,
    fontSize: 22,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    ...Fonts.regular,
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  chooseButton: {
    width: '100%',
    height: 56,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginTop: Spacing.md,
  },
  chooseButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chooseButtonText: {
    ...Fonts.bold,
    fontSize: 16,
    color: Colors.white,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  subscriptionCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  packageName: {
    ...Fonts.bold,
    fontSize: 18,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.md,
  },
  statusBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    ...Fonts.semiBold,
    fontSize: 12,
    color: Colors.white,
  },
  cardDetails: {
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  detailLabel: {
    ...Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  detailValue: {
    ...Fonts.semiBold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  manageButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
  },
  manageButtonText: {
    ...Fonts.semiBold,
    fontSize: 14,
    color: Colors.primary,
  },
  addMoreButton: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  addMoreText: {
    ...Fonts.semiBold,
    fontSize: 15,
    color: Colors.primary,
  },
});

export default SubscriptionsScreen;
