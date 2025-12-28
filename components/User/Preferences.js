import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Spacing, BorderRadius } from '../../utils/globalStyles';

const Preferences = ({ navigation, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
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
      title: 'For me',
      subtitle: 'Personalized meal plans for your fitness goals',
      emoji: '🎒',
    },
    {
      id: 'kids',
      title: 'For kids',
      subtitle: 'Healthy meal plans for kids aged 2-12',
      emoji: '🥗',
    },
  ];

  const genderOptions = [
    { id: 'male', name: 'Male', emoji: '👨' },
    { id: 'female', name: 'Female', emoji: '👩' },
  ];

  const allergyOptions = [
    { id: 'yes', name: 'Yes', emoji: '👍' },
    { id: 'no', name: 'No', emoji: '👎' },
  ];

  const goalOptions = [
    {
      id: 'healthy',
      name: 'Eat healthy',
      desc: 'Here to make it easier to eat healthier',
      emoji: '😊',
    },
    {
      id: 'lose',
      name: 'Lose Weight',
      desc: 'Safe and healthy rate of weight & fat loss',
      emoji: '🏃',
    },
    {
      id: 'gain',
      name: 'Gain Weight',
      desc: 'Safe and healthy rate of weight gain',
      emoji: '💪',
    },
    {
      id: 'muscle',
      name: 'Build Muscle',
      desc: 'Gain strength while minimizing fat gain',
      emoji: '🏋️',
    },
    {
      id: 'maintain',
      name: 'Maintain Weight',
      desc: 'Stay in shape with the right calories',
      emoji: '🧘',
    },
  ];

  const mealTypeOptions = [
    {
      id: 'balanced',
      name: 'Balanced',
      desc: 'Provides the nutrients your body needs to thrive',
      emoji: '⚖️',
      macros: [
        { name: 'Protein', percentage: '20-35%', color: '#9C27B0' },
        { name: 'Carbs', percentage: '40-55%', color: '#2196F3' },
        { name: 'Fat', percentage: '20-30%', color: '#FF9800' },
      ],
    },
    {
      id: 'lowcarb',
      name: 'Low-Carb',
      desc: 'Low in carbs, but high in healthy fats, and non-starchy veggies',
      emoji: '🥑',
      macros: [
        { name: 'Protein', percentage: '25-35%', color: '#9C27B0' },
        { name: 'Carbs', percentage: '10-20%', color: '#2196F3' },
        { name: 'Fat', percentage: '40-50%', color: '#FF9800' },
      ],
    },
    {
      id: 'highprotein',
      name: 'High Protein',
      desc: 'Boosts muscle strength and vitality with lean proteins',
      emoji: '🍗',
      macros: [
        { name: 'Protein', percentage: '40-50%', color: '#9C27B0' },
        { name: 'Carbs', percentage: '35-40%', color: '#2196F3' },
        { name: 'Fat', percentage: '10-25%', color: '#FF9800' },
      ],
    },
  ];

  const handleSelect = (field, value) => {
    setPreferences({ ...preferences, [field]: value });
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      console.log('Preferences completed:', preferences);
      // Call onComplete if provided (for HomeScreen)
      if (onComplete) {
        onComplete();
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
            <Text style={styles.title}>Who are you subscribing for?</Text>
            <Text style={styles.subtitle}>Let's tailor the experience to meet your needs</Text>

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
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
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
            <Text style={styles.title}>What's your gender?</Text>
            <Text style={styles.subtitle}>We will use this to calculate your daily calorie needs</Text>

            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.simpleCard,
                  preferences.gender === option.id && styles.simpleCardActive,
                ]}
                onPress={() => handleSelect('gender', option.id)}
              >
                <Text style={styles.simpleCardText}>{option.name}</Text>
                <Text style={styles.simpleCardEmoji}>{option.emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Do you have any food allergies?</Text>

            {allergyOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.simpleCard,
                  preferences.hasAllergies === option.id && styles.simpleCardActive,
                ]}
                onPress={() => handleSelect('hasAllergies', option.id)}
              >
                <Text style={styles.simpleCardText}>{option.name}</Text>
                <Text style={styles.simpleCardEmoji}>{option.emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>What's your goal?</Text>

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
                  <Text style={styles.goalTitle}>{option.name}</Text>
                  <Text style={styles.goalDesc}>{option.desc}</Text>
                </View>
                <Text style={styles.goalEmoji}>{option.emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>What kind of meals do you prefer?</Text>
            <Text style={styles.subtitle}>
              You'll have access to the full menu but select one to personalise your experience
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
                    <Text style={styles.mealTitle}>{option.name}</Text>
                    <Text style={styles.mealEmoji}>{option.emoji}</Text>
                  </View>
                  {preferences.mealType === option.id && (
                    <View style={styles.mealCheckmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.mealDesc}>{option.desc}</Text>
                <View style={styles.macroContainer}>
                  {option.macros.map((macro, index) => (
                    <View key={index} style={styles.macroItem}>
                      <View style={[styles.macroBar, { backgroundColor: macro.color }]} />
                      <Text style={styles.macroPercentage}>{macro.percentage}</Text>
                      <Text style={styles.macroName}>{macro.name}</Text>
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
          style={[styles.button, !canProceed() && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!canProceed()}
        >
          <LinearGradient
            colors={canProceed() ? ['#00B14F', '#00D95F'] : ['#E5E5E5', '#E5E5E5']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={[styles.buttonText, !canProceed() && styles.buttonTextDisabled]}>
              {currentStep === 5 ? 'Complete' : 'Continue'}
            </Text>
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
