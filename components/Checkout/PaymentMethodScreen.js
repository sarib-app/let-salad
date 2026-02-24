import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Spacing, BorderRadius } from '../../utils/globalStyles';
import { useLanguage } from '../../context/LanguageContext';

const PaymentMethodScreen = ({ route, navigation }) => {
  const { t } = useLanguage();
  const { currentMethod, onMethodSelect } = route.params;

  // Mock saved payment methods
  const [savedMethods] = useState([
    {
      id: '1',
      type: 'card',
      cardType: 'Visa',
      last4: '4242',
      expiry: '12/25',
      isDefault: true,
    },
    {
      id: '2',
      type: 'card',
      cardType: 'Mastercard',
      last4: '8888',
      expiry: '08/26',
      isDefault: false,
    },
    {
      id: '3',
      type: 'applepay',
      last4: '4242',
      isDefault: false,
    },
  ]);

  const [selectedMethodId, setSelectedMethodId] = useState('1');
  const [showAddNew, setShowAddNew] = useState(false);

  // New card form
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    cardHolder: '',
    expiry: '',
    cvv: '',
  });

  const handleSelectMethod = (methodId) => {
    setSelectedMethodId(methodId);
  };

  const handleConfirm = () => {
    const selected = savedMethods.find((method) => method.id === selectedMethodId);
    if (selected && onMethodSelect) {
      onMethodSelect(selected);
    }
    navigation.goBack();
  };

  const handleAddNewCard = () => {
    if (newCard.cardNumber && newCard.cardHolder && newCard.expiry && newCard.cvv) {
      // In real app, tokenize card with payment provider
      const newMethod = {
        id: Date.now().toString(),
        type: 'card',
        cardType: 'Visa', // Would be detected from card number
        last4: newCard.cardNumber.slice(-4),
        expiry: newCard.expiry,
        isDefault: false,
      };

      if (onMethodSelect) {
        onMethodSelect(newMethod);
      }
      navigation.goBack();
    }
  };

  const getPaymentIcon = (method) => {
    if (method.type === 'applepay') return '🍎';
    if (method.cardType === 'Visa') return '💳';
    if (method.cardType === 'Mastercard') return '💳';
    return '💳';
  };

  if (showAddNew) {
    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>{t('paymentMethod.addNewCard')}</Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('paymentMethod.cardNumber')}</Text>
              <TextInput
                style={styles.input}
                placeholder="1234 5678 9012 3456"
                value={newCard.cardNumber}
                onChangeText={(text) =>
                  setNewCard({ ...newCard, cardNumber: text.replace(/\s/g, '') })
                }
                keyboardType="numeric"
                maxLength={16}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('paymentMethod.cardholderName')}</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                value={newCard.cardHolder}
                onChangeText={(text) => setNewCard({ ...newCard, cardHolder: text })}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: Spacing.md }]}>
                <Text style={styles.label}>{t('paymentMethod.expiryDate')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  value={newCard.expiry}
                  onChangeText={(text) => setNewCard({ ...newCard, expiry: text })}
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>{t('paymentMethod.cvv')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  value={newCard.cvv}
                  onChangeText={(text) => setNewCard({ ...newCard, cvv: text })}
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>

            <View style={styles.securityNote}>
              <Text style={styles.securityIcon}>🔒</Text>
              <Text style={styles.securityText}>
                {t('paymentMethod.securePayment')}
              </Text>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setShowAddNew(false)}
          >
            <Text style={styles.secondaryButtonText}>{t('common.cancel')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryButton} onPress={handleAddNewCard}>
            <LinearGradient
              colors={['#00B14F', '#00D95F']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.primaryButtonText}>{t('paymentMethod.addCard')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{t('paymentMethod.selectPaymentMethod')}</Text>

        {savedMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.methodCard,
              selectedMethodId === method.id && styles.methodCardSelected,
            ]}
            onPress={() => handleSelectMethod(method.id)}
          >
            <View style={styles.radioContainer}>
              <View
                style={[
                  styles.radioOuter,
                  selectedMethodId === method.id && styles.radioOuterSelected,
                ]}
              >
                {selectedMethodId === method.id && <View style={styles.radioInner} />}
              </View>

              <View style={styles.methodContent}>
                <View style={styles.methodHeader}>
                  <View style={styles.methodInfo}>
                    <Text style={styles.methodIcon}>{getPaymentIcon(method)}</Text>
                    <View>
                      <Text style={styles.methodName}>
                        {method.type === 'applepay'
                          ? t('paymentMethod.applePay')
                          : `${method.cardType} •••• ${method.last4}`}
                      </Text>
                      {method.type === 'card' && (
                        <Text style={styles.methodExpiry}>{t('paymentMethod.expires')} {method.expiry}</Text>
                      )}
                    </View>
                  </View>
                  {method.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>{t('paymentMethod.default')}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.addNewButton} onPress={() => setShowAddNew(true)}>
          <Text style={styles.addNewIcon}>+</Text>
          <Text style={styles.addNewText}>{t('paymentMethod.addNewCard')}</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <LinearGradient
            colors={['#00B14F', '#00D95F']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.confirmButtonText}>{t('paymentMethod.confirmPaymentMethod')}</Text>
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
  title: {
    ...Fonts.bold,
    fontSize: 24,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  methodCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  methodCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F9F4',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    marginTop: 2,
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  methodContent: {
    flex: 1,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodIcon: {
    fontSize: 28,
    marginRight: Spacing.md,
  },
  methodName: {
    ...Fonts.bold,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  methodExpiry: {
    ...Fonts.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  defaultBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  defaultText: {
    ...Fonts.semiBold,
    fontSize: 10,
    color: Colors.white,
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  addNewIcon: {
    ...Fonts.bold,
    fontSize: 24,
    color: Colors.primary,
    marginRight: Spacing.sm,
  },
  addNewText: {
    ...Fonts.semiBold,
    fontSize: 15,
    color: Colors.primary,
  },
  form: {
    marginTop: Spacing.md,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  label: {
    ...Fonts.semiBold,
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  input: {
    ...Fonts.regular,
    fontSize: 15,
    color: Colors.textPrimary,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    height: 48,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9F4',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  securityIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  securityText: {
    ...Fonts.regular,
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
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
  confirmButton: {
    flex: 1,
    height: 56,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  primaryButton: {
    flex: 1,
    height: 56,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
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
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    ...Fonts.bold,
    fontSize: 16,
    color: Colors.white,
  },
  primaryButtonText: {
    ...Fonts.bold,
    fontSize: 16,
    color: Colors.white,
  },
  secondaryButtonText: {
    ...Fonts.semiBold,
    fontSize: 16,
    color: Colors.textPrimary,
  },
});

export default PaymentMethodScreen;
