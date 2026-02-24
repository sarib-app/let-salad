import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  CreditCard,
  CreditCardConfig,
  PaymentConfig,
  PaymentResponse,
  PaymentStatus,
  TokenResponse,
  NetworkEndpointError,
  NetworkError,
  GeneralError,
} from 'react-native-moyasar-sdk';
import { Colors, Fonts, Spacing, BorderRadius } from '../../utils/globalStyles';
import { purchaseSubscription } from '../../utils/api';
import { useLanguage } from '../../context/LanguageContext';

const VisaPaymentScreen = ({ route, navigation }) => {
  const { t } = useLanguage();
  const {
    amount,
    description,
    metadata,
    subscriptionData,
    orderConfirmationData,
  } = route.params;

  const [isProcessing, setIsProcessing] = useState(false);

  const paymentConfig = new PaymentConfig({
    publishableApiKey: 'pk_test_jJDGuVChg1ztPAozP4RFPswB6cKcTBLW9g2GHvRy',
    amount: amount,
    currency: 'SAR',
    description: description,
    metadata: metadata,
    creditCard: new CreditCardConfig({ saveCard: false, manual: false }),
  });

  function onPaymentResult(paymentResult) {
    console.log('Payment Result:', paymentResult);
    setIsProcessing(false);

    if (paymentResult instanceof PaymentResponse) {
      switch (paymentResult.status) {
        case PaymentStatus.paid:
          console.log('SUCCESS - Payment ID:', paymentResult.id);
          handleSubscriptionPurchase(paymentResult.id);
          break;
        case PaymentStatus.failed:
          console.log('FAILED:', paymentResult.source?.message);
          Alert.alert(t('payment.paymentFailed'), paymentResult.source?.message || t('payment.paymentFailedMsg'));
          break;
        case PaymentStatus.initiated:
          console.log('3DS initiated, waiting...');
          setIsProcessing(true);
          break;
        default:
          console.log('Status:', paymentResult.status);
          Alert.alert(t('payment.paymentStatus'), `Status: ${paymentResult.status}`);
          break;
      }
    } else if (paymentResult instanceof TokenResponse) {
      console.log('Token:', paymentResult.token);
    } else {
      let errorMessage = t('payment.somethingWrong');
      if (paymentResult instanceof NetworkEndpointError) {
        errorMessage = `Network Error: ${paymentResult.message}`;
      } else if (paymentResult instanceof NetworkError) {
        errorMessage = `Connection Error: ${paymentResult.message}`;
      } else if (paymentResult instanceof GeneralError) {
        errorMessage = `Error: ${paymentResult.message}`;
      }
      console.error('Payment Error:', paymentResult);
      Alert.alert(t('common.error'), errorMessage);
    }
  }

  const handleSubscriptionPurchase = async (paymentId) => {
    setIsProcessing(true);
    try {
      const response = await purchaseSubscription({
        subscription_type_id: subscriptionData.subscription_type_id,
        subscription_package_id: subscriptionData.subscription_package_id,
        delivery_address_id: subscriptionData.delivery_address_id,
        payment_method: 'card',
        payment_reference: paymentId,
      });

      if (response.code === 201 || response.code === 200) {
        console.log('Subscription created successfully!');
        navigation.navigate('OrderConfirmation', {
          subscription: response.subscription,
          ...orderConfirmationData,
          paymentMethod: { type: 'visa_pay' },
        });
      } else {
        Alert.alert(t('common.error'), response.message || t('payment.failedPlaceOrder'));
      }
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert(t('common.error'), error.message || t('payment.failedPlaceOrder'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.processingText}>{t('payment.processing')}</Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.title}>{t('payment.payWithCard')}</Text>
        <Text style={styles.subtitle}>{t('payment.amount')} {(amount / 100).toFixed(2)} {t('common.sar')}</Text>
      </View>

      <View style={styles.cardContainer}>
        <CreditCard
          paymentConfig={paymentConfig}
          onPaymentResult={onPaymentResult}
          style={{ textInputs: { borderWidth: 1.25 } }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    ...Fonts.bold,
    fontSize: 22,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    ...Fonts.medium,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  cardContainer: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    marginTop: Spacing.md,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  processingText: {
    ...Fonts.medium,
    marginTop: Spacing.md,
    fontSize: 16,
    color: Colors.textPrimary,
  },
});

export default VisaPaymentScreen;
