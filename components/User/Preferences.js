import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Spacing, BorderRadius } from '../../utils/globalStyles';
import { useLanguage } from '../../context/LanguageContext';
import { saveUserPreferences } from '../../utils/storage';
import { savePreferences } from '../../utils/api';

const Preferences = ({ navigation, onComplete }) => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    subscribingFor: '',
    gender: '',
    hasAllergies: '',
    goal: '',
    mealType: '',
  });

  const subscribingOptions = [
    {
      id: 'me',
      titleKey: 'preferences.forMe',
      subtitleKey: 'preferences.forMeDesc',
      emoji: '🎒',
    },
    {
      id: 'kids',
      titleKey: 'preferences.forKids',
      subtitleKey: 'preferences.forKidsDesc',
      emoji: '🥗',
    },
  ];

  const genderOptions = [
    { id: 'male', nameKey: 'common.male', emoji: '👨' },
    { id: 'female', nameKey: 'common.female', emoji: '👩' },
  ];

  const allergyOptions = [
    { id: 'yes', nameKey: 'common.yes', emoji: '👍' },
    { id: 'no', nameKey: 'common.no', emoji: '👎' },
  ];

  const goalOptions = [
    {
      id: 'healthy',
      nameKey: 'preferences.eatHealthy',
      descKey: 'preferences.eatHealthyDesc',
      emoji: '😊',
    },
    {
      id: 'lose',
      nameKey: 'preferences.loseWeight',
      descKey: 'preferences.loseWeightDesc',
      emoji: '🏃',
    },
    {
      id: 'gain',
      nameKey: 'preferences.gainWeight',
      descKey: 'preferences.gainWeightDesc',
      emoji: '💪',
    },
    {
      id: 'muscle',
      nameKey: 'preferences.buildMuscle',
      descKey: 'preferences.buildMuscleDesc',
      emoji: '🏋️',
    },
    {
      id: 'maintain',
      nameKey: 'preferences.maintainWeight',
      descKey: 'preferences.maintainWeightDesc',
      emoji: '🧘',
    },
  ];

  const mealTypeOptions = [
    {
      id: 'balanced',
      nameKey: 'preferences.balanced',
      descKey: 'preferences.balancedDesc',
      emoji: '⚖️',
      macros: [
        { nameKey: 'preferences.protein', percentage: '20-35%', color: '#9C27B0' },
        { nameKey: 'preferences.carbs', percentage: '40-55%', color: '#2196F3' },
        { nameKey: 'preferences.fat', percentage: '20-30%', color: '#FF9800' },
      ],
    },
    {
      id: 'lowcarb',
      nameKey: 'preferences.lowCarb',
      descKey: 'preferences.lowCarbDesc',
      emoji: '🥑',
      macros: [
        { nameKey: 'preferences.protein', percentage: '25-35%', color: '#9C27B0' },
        { nameKey: 'preferences.carbs', percentage: '10-20%', color: '#2196F3' },
        { nameKey: 'preferences.fat', percentage: '40-50%', color: '#FF9800' },
      ],
    },
    {
      id: 'highprotein',
      nameKey: 'preferences.highProtein',
      descKey: 'preferences.highProteinDesc',
      emoji: '🍗',
      macros: [
        { nameKey: 'preferences.protein', percentage: '40-50%', color: '#9C27B0' },
        { nameKey: 'preferences.carbs', percentage: '35-40%', color: '#2196F3' },
        { nameKey: 'preferences.fat', percentage: '10-25%', color: '#FF9800' },
      ],
    },
  ];

  const handleSelect = (field, value) => {
    setPreferences({ ...preferences, [field]: value });
  };

  const handleNext = async () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      console.log('Preferences completed:', preferences);
      setLoading(true);

      try {
        // Backend expects: {subscribing_for, gender, has_allergies, goal, meal_type}
        // has_allergies must be string "yes" or "no", not boolean
        // meal_type uses underscore format like "low_carb"
        const mealTypeMap = {
          'lowcarb': 'low_carb',
          'highprotein': 'high_protein',
          'balanced': 'balanced',
        };

        const preferencesData = {
          subscribing_for: preferences.subscribingFor,
          gender: preferences.gender,
          has_allergies: preferences.hasAllergies, // Send as string "yes" or "no"
          goal: preferences.goal,
          meal_type: mealTypeMap[preferences.mealType] || preferences.mealType,
        };

        const response = await savePreferences(preferencesData);

        // Backend returns: {code: 200, message: "...", preferences: {...}}
        if (response.code === 200) {
          // Also save locally
          await saveUserPreferences(preferences);

          // Call onComplete if provided (for HomeScreen)
          if (onComplete) {
            onComplete();
          } else {
            // Navigate to MainApp after onboarding
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainApp' }],
            });
          }
        } else {
          Alert.alert(t('common.error'), response.message || t('preferences.failedSavePreferences'));
        }
      } catch (error) {
        console.error('Save Preferences Error:', error);
        Alert.alert(
          t('common.error'),
          error.message || t('preferences.failedSavePreferencesRetry')
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return preferences.subscribingFor !== '';
      case 2:
        return preferences.gender !== '';
      case 3:
        return preferences.hasAllergies !== '';
      case 4:
        return preferences.goal !== '';
      case 5:
        return preferences.mealType !== '';
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>{t('preferences.subscribingForTitle')}</Text>
            <Text style={styles.subtitle}>{t('preferences.subscribingForSubtitle')}</Text>

            {subscribingOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionCard,
                  preferences.subscribingFor === option.id && styles.optionCardActive,
                ]}
                onPress={() => handleSelect('subscribingFor', option.id)}
              >
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>{t(option.titleKey)}</Text>
                  <Text style={styles.optionSubtitle}>{t(option.subtitleKey)}</Text>
                </View>
                <Text style={styles.optionEmoji}>{option.emoji}</Text>
                {preferences.subscribingFor === option.id && (
                  <View style={styles.checkmarkCircle}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>{t('preferences.genderTitle')}</Text>
            <Text style={styles.subtitle}>{t('preferences.genderSubtitle')}</Text>

            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.simpleCard,
                  preferences.gender === option.id && styles.simpleCardActive,
                ]}
                onPress={() => handleSelect('gender', option.id)}
              >
                <Text style={styles.simpleCardText}>{t(option.nameKey)}</Text>
                <Text style={styles.simpleCardEmoji}>{option.emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>{t('preferences.allergiesTitle')}</Text>

            {allergyOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.simpleCard,
                  preferences.hasAllergies === option.id && styles.simpleCardActive,
                ]}
                onPress={() => handleSelect('hasAllergies', option.id)}
              >
                <Text style={styles.simpleCardText}>{t(option.nameKey)}</Text>
                <Text style={styles.simpleCardEmoji}>{option.emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>{t('preferences.goalTitle')}</Text>

            {goalOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.goalCard,
                  preferences.goal === option.id && styles.goalCardActive,
                ]}
                onPress={() => handleSelect('goal', option.id)}
              >
                <View style={styles.goalContent}>
                  <Text style={styles.goalTitle}>{t(option.nameKey)}</Text>
                  <Text style={styles.goalDesc}>{t(option.descKey)}</Text>
                </View>
                <Text style={styles.goalEmoji}>{option.emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>{t('preferences.mealTypeTitle')}</Text>
            <Text style={styles.subtitle}>
              {t('preferences.mealTypeSubtitle')}
            </Text>

            {mealTypeOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.mealCard,
                  preferences.mealType === option.id && styles.mealCardActive,
                ]}
                onPress={() => handleSelect('mealType', option.id)}
              >
                <View style={styles.mealHeader}>
                  <View style={styles.mealTitleContainer}>
                    <Text style={styles.mealTitle}>{t(option.nameKey)}</Text>
                    <Text style={styles.mealEmoji}>{option.emoji}</Text>
                  </View>
                  {preferences.mealType === option.id && (
                    <View style={styles.mealCheckmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.mealDesc}>{t(option.descKey)}</Text>
                <View style={styles.macroContainer}>
                  {option.macros.map((macro, index) => (
                    <View key={index} style={styles.macroItem}>
                      <View style={[styles.macroBar, { backgroundColor: macro.color }]} />
                      <Text style={styles.macroPercentage}>{macro.percentage}</Text>
                      <Text style={styles.macroName}>{t(macro.nameKey)}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {currentStep > 1 && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.supportButton}>
          <Text style={styles.supportIcon}>🎧</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderStep()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, (!canProceed() || loading) && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!canProceed() || loading}
        >
          <LinearGradient
            colors={canProceed() && !loading ? ['#00B14F', '#00D95F'] : ['#E5E5E5', '#E5E5E5']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={[styles.buttonText, !canProceed() && styles.buttonTextDisabled]}>
                {currentStep === 5 ? t('preferences.complete') : t('common.continue')}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: Colors.textPrimary,
  },
  supportButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  supportIcon: {
    fontSize: 24,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
  },
  stepContainer: {
    paddingBottom: Spacing.xl,
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
    lineHeight: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border,
    position: 'relative',
  },
  optionCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#E8F5E9',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    ...Fonts.semiBold,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  optionSubtitle: {
    ...Fonts.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  optionEmoji: {
    fontSize: 40,
    marginLeft: Spacing.md,
  },
  checkmarkCircle: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: Colors.white,
    fontSize: 14,
    ...Fonts.bold,
  },
  simpleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  simpleCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#E8F5E9',
  },
  simpleCardText: {
    ...Fonts.semiBold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  simpleCardEmoji: {
    fontSize: 36,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  goalCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#E8F5E9',
  },
  goalContent: {
    flex: 1,
  },
  goalTitle: {
    ...Fonts.semiBold,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  goalDesc: {
    ...Fonts.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  goalEmoji: {
    fontSize: 32,
    marginLeft: Spacing.md,
  },
  mealCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  mealCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#E8F5E9',
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  mealTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealTitle: {
    ...Fonts.semiBold,
    fontSize: 16,
    color: Colors.textPrimary,
    marginRight: Spacing.sm,
  },
  mealEmoji: {
    fontSize: 20,
  },
  mealCheckmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealDesc: {
    ...Fonts.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  macroContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  macroItem: {
    flex: 1,
  },
  macroBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
  },
  macroPercentage: {
    ...Fonts.semiBold,
    fontSize: 11,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  macroName: {
    ...Fonts.regular,
    fontSize: 10,
    color: Colors.textSecondary,
  },
  footer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: BorderRadius.full,
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

export default Preferences;
