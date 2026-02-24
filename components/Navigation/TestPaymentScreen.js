import React, { useState } from 'react';
import { View, ScrollView, Text, Alert, ActivityIndicator, StyleSheet } from 'react-native';
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

const TestPaymentScreen = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentConfig = new PaymentConfig({
    publishableApiKey: 'pk_test_jJDGuVChg1ztPAozP4RFPswB6cKcTBLW9g2GHvRy',
    amount: 1000,
    currency: 'SAR',
    description: 'Test Payment',
    metadata: { order_id: 'test_001' },
    creditCard: new CreditCardConfig({ saveCard: false, manual: false }),
  });

  function onPaymentResult(paymentResult) {
    console.log('Payment Result:', paymentResult);
    setIsProcessing(false);

    if (paymentResult instanceof PaymentResponse) {
      switch (paymentResult.status) {
        case PaymentStatus.paid:
          console.log('SUCCESS - Payment ID:', paymentResult.id);
          Alert.alert('Success', `Payment ID: ${paymentResult.id}`);
          break;
        case PaymentStatus.failed:
          console.log('FAILED:', paymentResult.source?.message);
          Alert.alert('Failed', paymentResult.source?.message || 'Payment failed.');
          break;
        case PaymentStatus.initiated:
          console.log('3DS initiated, waiting...');
          setIsProcessing(true);
          break;
        default:
          console.log('Status:', paymentResult.status);
          Alert.alert('Payment Status', `Status: ${paymentResult.status}`);
          break;
      }
    } else if (paymentResult instanceof TokenResponse) {
      console.log('Token:', paymentResult.token);
    } else {
      let errorMessage = 'Something went wrong';

      if (paymentResult instanceof NetworkEndpointError) {
        errorMessage = `Network Error: ${paymentResult.message}`;
      } else if (paymentResult instanceof NetworkError) {
        errorMessage = `Connection Error: ${paymentResult.message}`;
      } else if (paymentResult instanceof GeneralError) {
        errorMessage = `Error: ${paymentResult.message}`;
      }

      console.error('Payment Error:', paymentResult);
      Alert.alert('Error', errorMessage);
    }
  }

  return (
    <ScrollView style={styles.container}>
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.processingText}>Processing payment...</Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.title}>Test Payment</Text>
        <Text style={styles.subtitle}>Amount: 10.00 SAR</Text>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  cardContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
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
    marginTop: 16,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});

export default TestPaymentScreen;
