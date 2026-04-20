import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Spacing, BorderRadius } from '../../utils/globalStyles';
import { useLanguage } from '../../context/LanguageContext';
import { sendOTP } from '../../utils/api';

const Login = ({ navigation }) => {
  const { t, language, setLanguage } = useLanguage();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (phoneNumber.length >= 9) {
      setLoading(true);
      try {
        const fullPhoneNumber = `+966${phoneNumber}`;
        const response = await sendOTP(fullPhoneNumber);

        // Backend returns: {code: 200, message: "OTP sent successfully", otp: "803483"}
        if (response.code === 200) {
          // Log OTP for testing
          if (response.otp) {
            console.log('==========================================');
            console.log('🔐 OTP CODE:', response.otp);
            console.log('==========================================');
          }

          navigation.navigate('OTPVerification', {
            phoneNumber: fullPhoneNumber,
            devOtp: response.otp || null, // Auto-fill for testing
          });
        } else {
          Alert.alert(t('common.error'), response.message || t('auth.failedSendOtp'));
        }
      } catch (error) {
        console.error('Send OTP Error:', error);
        Alert.alert(
          t('common.error'),
          error.message || t('auth.failedSendOtpRetry')
        );
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.langSwitchRow}>
          <TouchableOpacity
            style={styles.langSwitchButton}
            onPress={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          >
            <Text style={styles.langSwitchText}>
              {language === 'en' ? 'العربية' : 'English'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.header}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.tagline}>{t('auth.freshMeals')}</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>{t('auth.welcome')}</Text>
          <Text style={styles.subtitle}>{t('auth.enterPhoneSubtitle')}</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('auth.phoneNumber')}</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.countryCode}>+966</Text>
              <TextInput
                style={styles.input}
                placeholder="5XX XXX XXX"
                placeholderTextColor={Colors.textLight}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                maxLength={9}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, (phoneNumber.length < 9 || loading) && styles.buttonDisabled]}
            onPress={handleSendOTP}
            disabled={phoneNumber.length < 9 || loading}
          >
            <LinearGradient
              colors={phoneNumber.length >= 9 && !loading ? ['#00B14F', '#00D95F'] : ['#E5E5E5', '#E5E5E5']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={[styles.buttonText, phoneNumber.length < 9 && styles.buttonTextDisabled]}>
                  {t('common.continue')}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

        </View>

        <View style={styles.legalContainer}>
          <Text style={styles.legalText}>{t('auth.byContinuing')} </Text>
          <TouchableOpacity onPress={() => navigation.navigate('TermsAndConditions')}>
            <Text style={styles.legalLink}>{t('profileScreen.termsConditions')}</Text>
          </TouchableOpacity>
          <Text style={styles.legalText}> {t('common.and')} </Text>
          <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy')}>
            <Text style={styles.legalLink}>{t('profileScreen.privacyPolicy')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    flexGrow: 1,
  },
  langSwitchRow: {
    alignItems: 'flex-end',
    paddingTop: 50,
    paddingHorizontal: Spacing.xl,
  },
  langSwitchButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  langSwitchText: {
    ...Fonts.medium,
    fontSize: 14,
    color: Colors.primary,
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  logoImage: {
    width: 160,
    height: 80,
    marginBottom: Spacing.sm,
  },
  tagline: {
    ...Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  formContainer: {
    paddingHorizontal: Spacing.xl,
  },
  title: {
    ...Fonts.bold,
    fontSize: 28,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  label: {
    ...Fonts.medium,
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 56,
  },
  countryCode: {
    ...Fonts.medium,
    fontSize: 16,
    color: Colors.textPrimary,
    marginRight: Spacing.sm,
    paddingRight: Spacing.sm,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  input: {
    flex: 1,
    ...Fonts.regular,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.xl,
  },
  forgotPasswordText: {
    ...Fonts.medium,
    fontSize: 14,
    color: Colors.primary,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    ...Fonts.bold,
    fontSize: 16,
    color: Colors.white,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  footerText: {
    ...Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  footerLink: {
    ...Fonts.semiBold,
    fontSize: 14,
    color: Colors.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonTextDisabled: {
    color: Colors.textLight,
  },
  legalContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
  },
  legalText: {
    ...Fonts.regular,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  legalLink: {
    ...Fonts.semiBold,
    fontSize: 12,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
});

export default Login;
