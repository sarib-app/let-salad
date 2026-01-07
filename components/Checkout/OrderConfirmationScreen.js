import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Spacing, BorderRadius } from '../../utils/globalStyles';
import { saveActiveSubscription } from '../../utils/storage';

const OrderConfirmationScreen = ({ route, navigation }) => {
  const {
    package: selectedPackage,
    duration,
    price,
    address,
    paymentMethod,
    deliveryPreferences,
  } = route.params;

  const scaleAnim = new Animated.Value(0);

  // Generate order ID
  const orderId = `LS${Date.now().toString().slice(-8)}`;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Save subscription to AsyncStorage
    const saveSubscription = async () => {
      const subscription = {
        id: orderId,
        package_title: selectedPackage.package_title,
        package_id: selectedPackage.id,
        duration,
        price,
        meals: selectedPackage.meals,
        description: selectedPackage.description,
        delivery_address: address,
        payment_method: paymentMethod,
        delivery_preferences: deliveryPreferences,
        start_date: new Date().toISOString(),
        days_remaining: duration,
        status: 'active',
        created_at: new Date().toISOString(),
      };

      const saved = await saveActiveSubscription(subscription);
      if (saved) {
        console.log('Subscription saved successfully:', orderId);
      }
    };

    saveSubscription();
  }, []);

  const getMealsSummary = (meals) => {
    return meals.map((m) => `${m.qty} ${m.meal_name}`).join(', ');
  };

  const handleBackToHome = () => {
    // Navigate back to Home and reset stack
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainApp' }],
    });
  };

  const handleViewSubscription = () => {
    // Navigate to Subscriptions tab
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'MainApp',
          state: {
            routes: [{ name: 'Subscriptions' }],
            index: 0,
          },
        },
      ],
    });
  };

  const estimatedDelivery = new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString(
    'en-US',
    {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }
  );

  const tax = (price * 0.15).toFixed(2);
  const total = (parseFloat(price) + parseFloat(tax)).toFixed(2);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Animation */}
        <Animated.View
          style={[styles.successContainer, { transform: [{ scale: scaleAnim }] }]}
        >
          <View style={styles.checkmarkCircle}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Order Confirmed!</Text>
          <Text style={styles.successSubtitle}>
            Your subscription has been successfully activated
          </Text>
        </Animated.View>

        {/* Order Details */}
        <View style={styles.section}>
          <View style={styles.orderIdContainer}>
            <Text style={styles.orderIdLabel}>Order ID</Text>
            <Text style={styles.orderId}>{orderId}</Text>
          </View>
        </View>

        {/* Package Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription Details</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Package</Text>
              <Text style={styles.detailValue}>{selectedPackage.package_title}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>{duration} Days</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Meals</Text>
              <Text style={styles.detailValue}>{getMealsSummary(selectedPackage.meals)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>First Delivery</Text>
              <Text style={styles.detailValue}>{estimatedDelivery}</Text>
            </View>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.addressCard}>
            <Text style={styles.addressName}>{address.name}</Text>
            <Text style={styles.addressText}>{address.street}</Text>
            <Text style={styles.addressText}>{address.city}</Text>
            <Text style={styles.addressPhone}>{address.phone}</Text>
          </View>
        </View>

        {/* Payment Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.paymentCard}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Package Price</Text>
              <Text style={styles.paymentValue}>{price} SAR</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Delivery Fee</Text>
              <Text style={styles.paymentFree}>Free</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Tax (15%)</Text>
              <Text style={styles.paymentValue}>{tax} SAR</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.paymentRow}>
              <Text style={styles.totalLabel}>Total Paid</Text>
              <Text style={styles.totalValue}>{total} SAR</Text>
            </View>
            <View style={styles.paymentMethodRow}>
              <Text style={styles.paidViaLabel}>Paid via</Text>
              <Text style={styles.paidViaValue}>
                {paymentMethod.type === 'card'
                  ? `Card •••• ${paymentMethod.last4}`
                  : 'Apple Pay'}
              </Text>
            </View>
          </View>
        </View>

        {/* What's Next */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's Next?</Text>
          <View style={styles.nextStepsCard}>
            <View style={styles.stepRow}>
              <Text style={styles.stepIcon}>📦</Text>
              <Text style={styles.stepText}>
                Your first delivery will arrive on {estimatedDelivery}
              </Text>
            </View>
            <View style={styles.stepRow}>
              <Text style={styles.stepIcon}>📧</Text>
              <Text style={styles.stepText}>
                You'll receive an email with order details and tracking
              </Text>
            </View>
            <View style={styles.stepRow}>
              <Text style={styles.stepIcon}>🔔</Text>
              <Text style={styles.stepText}>
                We'll notify you when your meals are on the way
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Fixed Bottom Buttons */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleBackToHome}>
          <Text style={styles.secondaryButtonText}>Back to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryButton} onPress={handleViewSubscription}>
          <LinearGradient
            colors={['#00B14F', '#00D95F']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.primaryButtonText}>View Subscription</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  checkmarkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  checkmark: {
    fontSize: 60,
    color: Colors.white,
    fontWeight: 'bold',
  },
  successTitle: {
    ...Fonts.bold,
    fontSize: 28,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  successSubtitle: {
    ...Fonts.regular,
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Fonts.bold,
    fontSize: 18,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  orderIdContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  orderIdLabel: {
    ...Fonts.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  orderId: {
    ...Fonts.bold,
    fontSize: 20,
    color: Colors.primary,
    letterSpacing: 1,
  },
  detailsCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
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
    textAlign: 'right',
    flex: 1,
    marginLeft: Spacing.md,
  },
  addressCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addressName: {
    ...Fonts.bold,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  addressText: {
    ...Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  addressPhone: {
    ...Fonts.medium,
    fontSize: 14,
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  paymentCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  paymentLabel: {
    ...Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  paymentValue: {
    ...Fonts.semiBold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  paymentFree: {
    ...Fonts.semiBold,
    fontSize: 14,
    color: Colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  totalLabel: {
    ...Fonts.bold,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  totalValue: {
    ...Fonts.bold,
    fontSize: 18,
    color: Colors.primary,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.inputBackground,
  },
  paidViaLabel: {
    ...Fonts.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    marginRight: Spacing.xs,
  },
  paidViaValue: {
    ...Fonts.semiBold,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  nextStepsCard: {
    backgroundColor: '#F0F9F4',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  stepIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  stepText: {
    ...Fonts.regular,
    fontSize: 14,
    color: Colors.textPrimary,
    flex: 1,
    lineHeight: 20,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    flexDirection: 'row',
    gap: Spacing.md,
  },
  secondaryButton: {
    flex: 1,
    height: 56,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  primaryButton: {
    flex: 1,
    height: 56,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...Fonts.semiBold,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  primaryButtonText: {
    ...Fonts.bold,
    fontSize: 16,
    color: Colors.white,
  },
});

export default OrderConfirmationScreen;
