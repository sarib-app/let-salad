import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Spacing, BorderRadius } from '../../utils/globalStyles';
import { purchaseSubscription, validateAddressCoordinates } from '../../utils/api';

const CheckoutScreen = ({ route, navigation }) => {
  const { package: selectedPackage, subscriptionType, duration, deliveryPreferences } = route.params;
  const price = selectedPackage.price;
  const [submitting, setSubmitting] = useState(false);

  // Use delivery preferences from previous screen
  const [deliveryAddress, setDeliveryAddress] = useState(
    deliveryPreferences?.address || null
  );

  const [paymentMethod, setPaymentMethod] = useState({
    type: 'card',
    last4: '4242',
  });

  // Delivery zone validation state
  const [isInDeliveryZone, setIsInDeliveryZone] = useState(null);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [pricingZone, setPricingZone] = useState(null);
  const [validatingZone, setValidatingZone] = useState(false);

  // Validate address coordinates when address changes
  const validateAddress = useCallback(async (address) => {
    if (!address?.latitude || !address?.longitude) {
      setIsInDeliveryZone(null);
      setDeliveryCharge(0);
      setPricingZone(null);
      return;
    }

    try {
      setValidatingZone(true);
      const response = await validateAddressCoordinates(
        parseFloat(address.latitude),
        parseFloat(address.longitude)
      );

      if (response.code === 200) {
        setIsInDeliveryZone(response.is_in_delivery_zone);
        if (response.is_in_delivery_zone && response.pricing_zone) {
          setDeliveryCharge(response.pricing_zone.price || 0);
          setPricingZone(response.pricing_zone);
        } else {
          setDeliveryCharge(0);
          setPricingZone(null);
        }
      }
    } catch (error) {
      console.error('Error validating address:', error);
      setIsInDeliveryZone(null);
      setDeliveryCharge(0);
      setPricingZone(null);
    } finally {
      setValidatingZone(false);
    }
  }, []);

  useEffect(() => {
    if (deliveryAddress) {
      validateAddress(deliveryAddress);
    }
  }, [deliveryAddress, validateAddress]);

  // Format contents object into readable summary
  const getContentsSummary = (contents) => {
    if (!contents) return '';
    return Object.entries(contents)
      .map(([key, qty]) => {
        const label = key
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
        return `${qty} ${label}`;
      })
      .join(', ');
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

  const handlePlaceOrder = async () => {
    if (!deliveryAddress?.id) {
      Alert.alert('Address Required', 'Please select a delivery address before placing your order.');
      return;
    }
    if (isInDeliveryZone === false) {
      Alert.alert(
        'Out of Delivery Zone',
        'This area is out of our delivery zone. Please select a different address. Thank you!'
      );
      return;
    }
    setSubmitting(true);

    try {
      const response = await purchaseSubscription({
        subscription_type_id: subscriptionType?.id,
        subscription_package_id: selectedPackage.id,
        delivery_address_id: deliveryAddress.id,
        payment_method: paymentMethod.type,
        payment_reference: `PAY-${Date.now()}`,
      });

      if (response.code === 201 || response.code === 200) {
        navigation.navigate('OrderConfirmation', {
          subscription: response.subscription,
          package: selectedPackage,
          subscriptionType,
          duration,
          price,
          address: deliveryAddress,
          paymentMethod,
          deliveryPreferences,
        });
      } else {
        Alert.alert('Error', response.message || 'Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', error.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const deliveryFee = deliveryCharge;
  const tax = (price * 0.15).toFixed(2);
  const total = (parseFloat(price) + parseFloat(tax) + parseFloat(deliveryFee)).toFixed(2);
  const canPlaceOrder = deliveryAddress?.id && isInDeliveryZone === true && !validatingZone;

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
              <Text style={styles.packageTitle}>{selectedPackage.name}</Text>
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>{duration} Days</Text>
              </View>
            </View>
            {selectedPackage.description && (
              <Text style={styles.description} numberOfLines={2}>
                {selectedPackage.description}
              </Text>
            )}
            {selectedPackage.contents && (
              <Text style={styles.mealsText}>
                {getContentsSummary(selectedPackage.contents)}
              </Text>
            )}
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
          <View style={[
            styles.infoCard,
            isInDeliveryZone === false && styles.infoCardError,
          ]}>
            {deliveryAddress ? (
              <>
                <Text style={styles.addressName}>
                  {(deliveryAddress.type || 'Address').charAt(0).toUpperCase() + (deliveryAddress.type || 'address').slice(1)}
                </Text>
                <Text style={styles.addressText}>{deliveryAddress.street_address}</Text>
                <Text style={styles.addressText}>
                  {[deliveryAddress.district, deliveryAddress.city].filter(Boolean).join(', ')}
                </Text>
                {validatingZone && (
                  <View style={styles.zoneValidationRow}>
                    <ActivityIndicator size="small" color={Colors.primary} />
                    <Text style={styles.zoneValidatingText}>Checking delivery zone...</Text>
                  </View>
                )}
                {!validatingZone && isInDeliveryZone === true && pricingZone && (
                  <View style={styles.zoneValidationRow}>
                    <Text style={styles.zoneSuccessIcon}>✓</Text>
                    <Text style={styles.zoneSuccessText}>
                      In delivery zone ({pricingZone.name})
                    </Text>
                  </View>
                )}
                {!validatingZone && isInDeliveryZone === false && (
                  <View style={styles.zoneErrorBanner}>
                    <Text style={styles.zoneErrorIcon}>⚠️</Text>
                    <Text style={styles.zoneErrorText}>
                      This area is out of our delivery zone. Please select a different address.
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <Text style={styles.addressText}>No address selected</Text>
            )}
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
              {validatingZone ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : deliveryFee > 0 ? (
                <Text style={styles.priceValue}>{deliveryFee} SAR</Text>
              ) : (
                <Text style={styles.priceFree}>Free</Text>
              )}
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
        {isInDeliveryZone === false && (
          <View style={styles.bottomWarning}>
            <Text style={styles.bottomWarningText}>
              ⚠️ Selected address is out of delivery zone
            </Text>
          </View>
        )}
        <View style={styles.bottomContent}>
          <View>
            <Text style={styles.bottomLabel}>Total Amount</Text>
            <Text style={styles.bottomPrice}>{total} SAR</Text>
          </View>
          <TouchableOpacity
            style={[styles.placeOrderButton, !canPlaceOrder && styles.placeOrderButtonDisabled]}
            onPress={handlePlaceOrder}
            disabled={submitting || !canPlaceOrder}
          >
            <LinearGradient
              colors={canPlaceOrder && !submitting ? ['#00B14F', '#00D95F'] : ['#CCCCCC', '#CCCCCC']}
              style={styles.placeOrderGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {submitting ? (
                <ActivityIndicator color={Colors.white} />
              ) : validatingZone ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={[styles.placeOrderText, !canPlaceOrder && styles.placeOrderTextDisabled]}>
                  Place Order
                </Text>
              )}
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
  infoCardError: {
    borderColor: Colors.error,
    borderWidth: 2,
    backgroundColor: '#FFF5F5',
  },
  zoneValidationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.xs,
  },
  zoneValidatingText: {
    ...Fonts.medium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  zoneSuccessIcon: {
    ...Fonts.bold,
    fontSize: 14,
    color: Colors.primary,
  },
  zoneSuccessText: {
    ...Fonts.medium,
    fontSize: 13,
    color: Colors.primary,
  },
  zoneErrorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#FFCDD2',
    gap: Spacing.xs,
  },
  zoneErrorIcon: {
    fontSize: 16,
  },
  zoneErrorText: {
    ...Fonts.medium,
    fontSize: 13,
    color: Colors.error,
    flex: 1,
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
  bottomWarning: {
    backgroundColor: '#FFF4E5',
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    alignItems: 'center',
  },
  bottomWarningText: {
    ...Fonts.medium,
    fontSize: 13,
    color: '#E65100',
  },
  placeOrderButton: {
    height: 50,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    minWidth: 160,
  },
  placeOrderButtonDisabled: {
    opacity: 0.7,
  },
  placeOrderTextDisabled: {
    color: Colors.white,
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
