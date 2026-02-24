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
import { Colors, Fonts, Spacing, BorderRadius } from '../../utils/globalStyles';
import { validateAddressCoordinates } from '../../utils/api';

const CheckoutScreen = ({ route, navigation }) => {
  const { package: selectedPackage, subscriptionType, duration, deliveryPreferences } = route.params;
  const price = selectedPackage.price;

  // Use delivery preferences from previous screen
  const [deliveryAddress, setDeliveryAddress] = useState(
    deliveryPreferences?.address || null
  );

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

  const deliveryFee = deliveryCharge;
  const tax = (price * 0.15).toFixed(2);
  const total = (parseFloat(price) + parseFloat(tax) + parseFloat(deliveryFee)).toFixed(2);
  const canPlaceOrder = deliveryAddress?.id && isInDeliveryZone === true && !validatingZone;

  // Amount in Halalas for Moyasar (1 SAR = 100 Halalas)
  const amountInHalalas = Math.round(parseFloat(total) * 100);

  const handlePayWithCard = () => {
    if (!canPlaceOrder) {
      if (!deliveryAddress?.id) {
        Alert.alert('Address Required', 'Please select a delivery address before proceeding.');
      } else if (isInDeliveryZone === false) {
        Alert.alert('Out of Delivery Zone', 'This area is out of our delivery zone. Please select a different address.');
      }
      return;
    }
    navigation.navigate('VisaPayment', {
      amount: amountInHalalas,
      description: `LetSalad - ${selectedPackage.name}`,
      metadata: {
        package_id: selectedPackage.id?.toString(),
        subscription_type_id: subscriptionType?.id?.toString(),
      },
      subscriptionData: {
        subscription_type_id: subscriptionType?.id,
        subscription_package_id: selectedPackage.id,
        delivery_address_id: deliveryAddress.id,
      },
      orderConfirmationData: {
        package: selectedPackage,
        subscriptionType,
        duration,
        price,
        address: deliveryAddress,
        deliveryPreferences,
      },
    });
  };

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

        {/* Payment Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pay Now</Text>

          {/* Pay with Card Button */}
          <TouchableOpacity
            style={[styles.cardPayButton, !canPlaceOrder && styles.payButtonDisabled]}
            onPress={handlePayWithCard}
            disabled={!canPlaceOrder}
          >
            <Text style={styles.cardPayText}>Pay with Card</Text>
          </TouchableOpacity>
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

      {/* Bottom Warning for out-of-zone */}
      {isInDeliveryZone === false && (
        <View style={styles.bottomContainer}>
          <View style={styles.bottomWarning}>
            <Text style={styles.bottomWarningText}>
              Selected address is out of delivery zone
            </Text>
          </View>
        </View>
      )}
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
  cardPayButton: {
    backgroundColor: '#1A1F71',
    borderRadius: BorderRadius.lg,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardPayText: {
    ...Fonts.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  payButtonDisabled: {
    opacity: 0.5,
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
});

export default CheckoutScreen;
