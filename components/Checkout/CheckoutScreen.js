import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Spacing, BorderRadius } from '../../utils/globalStyles';

const CheckoutScreen = ({ route, navigation }) => {
  const { package: selectedPackage, duration, deliveryPreferences } = route.params;
  const price = duration === 24 ? selectedPackage.price_24 : selectedPackage.price_10;

  // Use delivery preferences from previous screen
  const [deliveryAddress, setDeliveryAddress] = useState(
    deliveryPreferences?.address || {
      name: 'John Doe',
      street: 'King Fahd Road, Al Olaya',
      city: 'Riyadh',
      phone: '+966 50 123 4567',
    }
  );

  const [paymentMethod, setPaymentMethod] = useState({
    type: 'card',
    last4: '4242',
  });

  const getMealsSummary = (meals) => {
    return meals.map((m) => `${m.qty} ${m.meal_name}`).join(', ');
  };

  const handleEditAddress = () => {
    navigation.navigate('AddressSelection', {
      currentAddress: deliveryAddress,
      onAddressSelect: (address) => setDeliveryAddress(address),
    });
  };

  const handleEditPayment = () => {
    navigation.navigate('PaymentMethod', {
      currentMethod: paymentMethod,
      onMethodSelect: (method) => setPaymentMethod(method),
    });
  };

  const handlePlaceOrder = () => {
    navigation.navigate('OrderConfirmation', {
      package: selectedPackage,
      duration,
      price,
      address: deliveryAddress,
      paymentMethod,
      deliveryPreferences,
    });
  };

  const deliveryFee = 0; // Free delivery
  const tax = (price * 0.15).toFixed(2); // 15% VAT
  const total = (parseFloat(price) + parseFloat(tax)).toFixed(2);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.packageCard}>
            <View style={styles.packageHeader}>
              <Text style={styles.packageTitle}>{selectedPackage.package_title}</Text>
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>{duration} Days</Text>
              </View>
            </View>
            {selectedPackage.description && (
              <Text style={styles.description}>{selectedPackage.description}</Text>
            )}
            <Text style={styles.mealsText}>{getMealsSummary(selectedPackage.meals)}</Text>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <TouchableOpacity onPress={handleEditAddress}>
              <Text style={styles.editButton}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.addressName}>{deliveryAddress.name}</Text>
            <Text style={styles.addressText}>{deliveryAddress.street}</Text>
            <Text style={styles.addressText}>{deliveryAddress.city}</Text>
            <Text style={styles.addressPhone}>{deliveryAddress.phone}</Text>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <TouchableOpacity onPress={handleEditPayment}>
              <Text style={styles.editButton}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoCard}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentIcon}>💳</Text>
              <View style={styles.paymentDetails}>
                <Text style={styles.paymentType}>
                  {paymentMethod.type === 'card' ? 'Credit Card' : 'Apple Pay'}
                </Text>
                <Text style={styles.paymentInfo}>•••• {paymentMethod.last4}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Price Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Details</Text>
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Package Price</Text>
              <Text style={styles.priceValue}>{price} SAR</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Delivery Fee</Text>
              <Text style={styles.priceFree}>Free</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tax (15%)</Text>
              <Text style={styles.priceValue}>{tax} SAR</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>{total} SAR</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomContainer}>
        <View style={styles.bottomContent}>
          <View>
            <Text style={styles.bottomLabel}>Total Amount</Text>
            <Text style={styles.bottomPrice}>{total} SAR</Text>
          </View>
          <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder}>
            <LinearGradient
              colors={['#00B14F', '#00D95F']}
              style={styles.placeOrderGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.placeOrderText}>Place Order</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Fonts.bold,
    fontSize: 18,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  editButton: {
    ...Fonts.semiBold,
    fontSize: 14,
    color: Colors.primary,
  },
  packageCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  packageTitle: {
    ...Fonts.bold,
    fontSize: 16,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.md,
  },
  durationBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  durationText: {
    ...Fonts.semiBold,
    fontSize: 11,
    color: Colors.white,
  },
  description: {
    ...Fonts.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  mealsText: {
    ...Fonts.medium,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  infoCard: {
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
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIcon: {
    fontSize: 28,
    marginRight: Spacing.md,
  },
  paymentDetails: {
    flex: 1,
  },
  paymentType: {
    ...Fonts.bold,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  paymentInfo: {
    ...Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  priceCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  priceLabel: {
    ...Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  priceValue: {
    ...Fonts.semiBold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  priceFree: {
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
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  bottomContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomLabel: {
    ...Fonts.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  bottomPrice: {
    ...Fonts.bold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  placeOrderButton: {
    height: 50,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    minWidth: 160,
  },
  placeOrderGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  placeOrderText: {
    ...Fonts.bold,
    fontSize: 15,
    color: Colors.white,
  },
});

export default CheckoutScreen;
