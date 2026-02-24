import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Spacing, BorderRadius } from '../../utils/globalStyles';
import { useLanguage } from '../../context/LanguageContext';
import { updateProfile, getCurrentUser } from '../../utils/api';

const EditProfile = ({ navigation }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    sex: '',
    weight: '',
    height: '',
    age: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await getCurrentUser();
      if (response.code === 200 && response.user) {
        const user = response.user;
        setFormData({
          name: user.name || '',
          email: user.email || '',
          sex: user.sex || '',
          weight: user.weight ? String(user.weight) : '',
          height: user.height ? String(user.height) : '',
          age: user.age ? String(user.age) : '',
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setFetchingUser(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const isFormValid = () => {
    return (
      formData.name &&
      formData.email &&
      formData.sex &&
      formData.weight &&
      formData.height &&
      formData.age
    );
  };

  const handleSave = async () => {
    if (isFormValid()) {
      setLoading(true);
      try {
        const profileData = {
          name: formData.name,
          email: formData.email,
          sex: formData.sex,
          weight: parseFloat(formData.weight),
          height: parseInt(formData.height),
          age: parseInt(formData.age),
          language: 'en',
        };

        const response = await updateProfile(profileData);

        if (response.code === 200) {
          Alert.alert(t('common.success'), t('profile.profileUpdated'), [
            { text: t('common.ok'), onPress: () => navigation.goBack() },
          ]);
        } else {
          Alert.alert(t('common.error'), response.message || t('profile.failedUpdateProfile'));
        }
      } catch (error) {
        console.error('Profile Update Error:', error);
        Alert.alert(
          t('common.error'),
          error.message || t('profile.failedUpdateProfileRetry')
        );
      } finally {
        setLoading(false);
      }
    }
  };

  if (fetchingUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('profile.fullName')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('profile.enterFullName')}
                placeholderTextColor={Colors.textLight}
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('profile.emailAddress')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('profile.emailPlaceholder')}
                placeholderTextColor={Colors.textLight}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('profile.sex')}</Text>
              <View style={styles.genderContainer}>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    formData.sex === 'male' && styles.genderButtonActive,
                  ]}
                  onPress={() => handleInputChange('sex', 'male')}
                >
                  <Text
                    style={[
                      styles.genderButtonText,
                      formData.sex === 'male' && styles.genderButtonTextActive,
                    ]}
                  >
                    {t('common.male')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    formData.sex === 'female' && styles.genderButtonActive,
                  ]}
                  onPress={() => handleInputChange('sex', 'female')}
                >
                  <Text
                    style={[
                      styles.genderButtonText,
                      formData.sex === 'female' && styles.genderButtonTextActive,
                    ]}
                  >
                    {t('common.female')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>{t('profile.weightKg')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="70"
                  placeholderTextColor={Colors.textLight}
                  value={formData.weight}
                  onChangeText={(value) => handleInputChange('weight', value)}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>{t('profile.heightCm')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="175"
                  placeholderTextColor={Colors.textLight}
                  value={formData.height}
                  onChangeText={(value) => handleInputChange('height', value)}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('profile.age')}</Text>
              <TextInput
                style={styles.input}
                placeholder="25"
                placeholderTextColor={Colors.textLight}
                value={formData.age}
                onChangeText={(value) => handleInputChange('age', value)}
                keyboardType="numeric"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, (!isFormValid() || loading) && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={!isFormValid() || loading}
          >
            <LinearGradient
              colors={isFormValid() && !loading ? ['#00B14F', '#00D95F'] : ['#E5E5E5', '#E5E5E5']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={[styles.buttonText, !isFormValid() && styles.buttonTextDisabled]}>
                  {t('profile.saveChanges')}
                </Text>
              )}
            </LinearGradient>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  formContainer: {
    marginBottom: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    ...Fonts.medium,
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 56,
    ...Fonts.regular,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  genderButton: {
    flex: 1,
    height: 56,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  genderButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: '#E8F5E9',
  },
  genderButtonText: {
    ...Fonts.medium,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  genderButtonTextActive: {
    color: Colors.primary,
    ...Fonts.semiBold,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
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

export default EditProfile;
