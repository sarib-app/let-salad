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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Spacing, BorderRadius } from '../../utils/globalStyles';
import { useLanguage } from '../../context/LanguageContext';

const Signup = ({ navigation }) => {
  const { t } = useLanguage();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleSignup = () => {
    console.log('Signup pressed');
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
        <View style={styles.header}>
          <Text style={styles.logo}>Let'Salad</Text>
          <Text style={styles.tagline}>{t('auth.freshMeals')}</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>{t('auth.signup')}</Text>
          <Text style={styles.subtitle}>{t('auth.createAccount')}</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('auth.fullName')}</Text>
            <TextInput
              style={[styles.inputWrapper, styles.input]}
              placeholder={t('auth.enterName')}
              placeholderTextColor={Colors.textLight}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('auth.phoneNumber')}</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.countryCode}>+966</Text>
              <TextInput
                style={styles.input}
                placeholder={t('auth.enterPhone')}
                placeholderTextColor={Colors.textLight}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('auth.email')}</Text>
            <TextInput
              style={[styles.inputWrapper, styles.input]}
              placeholder={t('auth.enterEmail')}
              placeholderTextColor={Colors.textLight}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('auth.password')}</Text>
            <TextInput
              style={[styles.inputWrapper, styles.input]}
              placeholder={t('auth.enterPassword')}
              placeholderTextColor={Colors.textLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('auth.confirmPassword')}</Text>
            <TextInput
              style={[styles.inputWrapper, styles.input]}
              placeholder={t('auth.confirmPassword')}
              placeholderTextColor={Colors.textLight}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setAgreeTerms(!agreeTerms)}
          >
            <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
              {agreeTerms && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>{t('auth.agreeTerms')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleSignup}>
            <LinearGradient
              colors={['#00B14F', '#00D95F']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>{t('auth.signup')}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('common.or')}</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.socialButton}>
            <Text style={styles.socialIcon}>G</Text>
            <Text style={styles.socialButtonText}>{t('auth.continueWithGoogle')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton}>
            <Text style={styles.socialIcon}></Text>
            <Text style={styles.socialButtonText}>{t('auth.continueWithApple')}</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('auth.alreadyHaveAccount')} </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>{t('auth.login')}</Text>
            </TouchableOpacity>
          </View>
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
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: Spacing.lg,
  },
  logo: {
    ...Fonts.bold,
    fontSize: 36,
    color: Colors.primary,
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
    marginBottom: Spacing.lg,
  },
  inputContainer: {
    marginBottom: Spacing.md,
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: Colors.white,
    fontSize: 16,
    ...Fonts.bold,
  },
  checkboxLabel: {
    ...Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.md,
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    ...Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
    marginHorizontal: Spacing.md,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  socialIcon: {
    ...Fonts.bold,
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  socialButtonText: {
    ...Fonts.medium,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
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
});

export default Signup;
