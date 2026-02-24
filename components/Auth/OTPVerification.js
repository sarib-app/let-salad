import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Spacing, BorderRadius } from '../../utils/globalStyles';
import { useLanguage } from '../../context/LanguageContext';
import { verifyOTP, sendOTP } from '../../utils/api';

const OTPVerification = ({ navigation, route }) => {
  const { t } = useLanguage();
  const { phoneNumber } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleOTPChange = (value, index) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const enteredOTP = otp.join('');
    if (enteredOTP.length === 6) {
      setLoading(true);
      try {
        const response = await verifyOTP(phoneNumber, enteredOTP);

        // Backend returns: {code: 200, message: "...", user: {...}, token: "...", onboarding_status: {...}}
        if (response.code === 200) {
          const onboardingStatus = response.onboarding_status || {};

          // Check onboarding status flags
          if (!onboardingStatus.has_completed_profile) {
            // Navigate to profile completion
            navigation.navigate('CompleteProfile');
          } else if (!onboardingStatus.has_completed_preferences) {
            // Navigate to preferences
            navigation.navigate('Preferences');
          } else {
            // User has completed everything, go to main app
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainApp' }],
            });
          }
        } else {
          Alert.alert(t('common.error'), response.message || t('otp.invalidOtp'));
        }
      } catch (error) {
        console.error('Verify OTP Error:', error);
        const errorMessage = error.code === 422
          ? t('otp.invalidOtpMessage')
          : error.message || t('otp.incorrectOtp');
        Alert.alert(t('otp.invalidOtp'), errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleResendOTP = async () => {
    if (canResend) {
      try {
        const response = await sendOTP(phoneNumber);
        if (response.code === 200) {
          setTimer(60);
          setCanResend(false);
          setOtp(['', '', '', '', '', '']);

          // Log OTP for testing
          if (response.otp) {
            console.log('==========================================');
            console.log('🔐 NEW OTP CODE:', response.otp);
            console.log('==========================================');
          }

          Alert.alert(t('common.success'), t('otp.otpResent'));
        } else {
          Alert.alert(t('common.error'), response.message || t('otp.failedResend'));
        }
      } catch (error) {
        console.error('Resend OTP Error:', error);
        Alert.alert(t('common.error'), t('otp.failedResendRetry'));
      }
    }
  };

  const isOTPComplete = otp.every((digit) => digit !== '');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={['#00B14F', '#00D95F']}
            style={styles.iconGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.iconText}>📱</Text>
          </LinearGradient>
        </View>

        <Text style={styles.title}>{t('otp.title')}</Text>
        <Text style={styles.subtitle}>
          {t('otp.sentTo')}{'\n'}
          <Text style={styles.phoneNumber}>{phoneNumber}</Text>
        </Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[styles.otpInput, digit && styles.otpInputFilled]}
              value={digit}
              onChangeText={(value) => handleOTPChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        <View style={styles.resendContainer}>
          {!canResend ? (
            <Text style={styles.timerText}>
              {t('otp.resendIn')} <Text style={styles.timerNumber}>{timer}s</Text>
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResendOTP}>
              <Text style={styles.resendText}>{t('otp.resendCode')}</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.button, (!isOTPComplete || loading) && styles.buttonDisabled]}
          onPress={handleVerifyOTP}
          disabled={!isOTPComplete || loading}
        >
          <LinearGradient
            colors={isOTPComplete && !loading ? ['#00B14F', '#00D95F'] : ['#E5E5E5', '#E5E5E5']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={[styles.buttonText, !isOTPComplete && styles.buttonTextDisabled]}>
                {t('otp.verify')}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
  },
  iconContainer: {
    alignSelf: 'center',
    marginBottom: Spacing.xl,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 48,
  },
  title: {
    ...Fonts.bold,
    fontSize: 28,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  subtitle: {
    ...Fonts.regular,
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
    lineHeight: 22,
  },
  phoneNumber: {
    ...Fonts.semiBold,
    color: Colors.textPrimary,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  otpInput: {
    flex: 1,
    height: 56,
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.inputBackground,
    textAlign: 'center',
    fontSize: 24,
    ...Fonts.bold,
    color: Colors.textPrimary,
  },
  otpInputFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  timerText: {
    ...Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  timerNumber: {
    ...Fonts.semiBold,
    color: Colors.primary,
  },
  resendText: {
    ...Fonts.semiBold,
    fontSize: 14,
    color: Colors.primary,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
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
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonTextDisabled: {
    color: Colors.textLight,
  },
});

export default OTPVerification;
