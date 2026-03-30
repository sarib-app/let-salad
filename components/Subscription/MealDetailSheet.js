import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Spacing, BorderRadius } from '../../utils/globalStyles';
import { useLanguage } from '../../context/LanguageContext';

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x200/E8F5E9/00B14F?text=Let%27Salad';

const MealDetailSheet = ({ visible, meal, onClose, onAdd, existingSelection }) => {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

  // State for all selections
  const [selections, setSelections] = useState({});
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [specialInstructions, setSpecialInstructions] = useState('');

  // All selectable groups = options + variations (rendered the same way)
  const allGroups = useMemo(() => {
    if (!meal) return [];
    return [...(meal.options || []), ...(meal.variations || [])];
  }, [meal]);

  // Initialize defaults or restore existing selection
  useEffect(() => {
    if (!meal) return;

    if (existingSelection) {
      setSelections(existingSelection.selections || {});
      setSelectedAddOns(existingSelection.add_ons || []);
      setSpecialInstructions(existingSelection.special_instructions || '');
    } else {
      const defaults = {};
      allGroups.forEach((group) => {
        if (group.multi_select) {
          const defaultItems = group.list.filter((item) => item.default).map((item) => item.id);
          defaults[group.id] = defaultItems;
        } else {
          const defaultItem = group.list.find((item) => item.default);
          // Use undefined instead of null so numeric ID 0 doesn't cause issues
          defaults[group.id] = defaultItem ? defaultItem.id : undefined;
        }
      });
      setSelections(defaults);
      setSelectedAddOns([]);
      setSpecialInstructions('');
    }
  }, [meal, existingSelection, allGroups]);

  // Calculate total calories
  const totalCalories = useMemo(() => {
    if (!meal) return 0;
    let total = meal.calories || 0;

    allGroups.forEach((group) => {
      const selected = selections[group.id];
      if (!selected) return;

      if (group.multi_select && Array.isArray(selected)) {
        selected.forEach((itemId) => {
          const item = group.list.find((i) => i.id === itemId);
          if (item?.calories) total += item.calories;
        });
      } else {
        const item = group.list.find((i) => i.id === selected);
        if (item?.calories) total += item.calories;
      }
    });

    (meal.add_ons || []).forEach((addOn) => {
      if (selectedAddOns.includes(addOn.id)) {
        total += addOn.calories || 0;
      }
    });

    return total;
  }, [meal, selections, selectedAddOns, allGroups]);

  // Calculate total extra price from selected options
  const totalExtraPrice = useMemo(() => {
    if (!meal) return 0;
    let total = 0;

    allGroups.forEach((group) => {
      const selected = selections[group.id];
      if (!selected) return;

      if (group.multi_select && Array.isArray(selected)) {
        selected.forEach((itemId) => {
          const item = group.list.find((i) => i.id === itemId);
          if (item?.price) total += item.price;
        });
      } else {
        const item = group.list.find((i) => i.id === selected);
        if (item?.price) total += item.price;
      }
    });

    return total;
  }, [meal, selections, allGroups]);

  // Validate all required groups are filled
  const isValid = useMemo(() => {
    if (!meal) return false;
    return allGroups
      .filter((g) => g.required)
      .every((g) => {
        const val = selections[g.id];
        if (g.multi_select) return Array.isArray(val) && val.length > 0;
        return val != null; // handles numeric IDs (including 0)
      });
  }, [meal, selections, allGroups]);

  // Single-select handler
  const handleSingleSelect = (groupId, itemId) => {
    setSelections((prev) => ({ ...prev, [groupId]: itemId }));
  };

  // Multi-select handler
  const handleMultiSelect = (groupId, itemId, maxCount) => {
    setSelections((prev) => {
      const current = Array.isArray(prev[groupId]) ? [...prev[groupId]] : [];
      if (current.includes(itemId)) {
        return { ...prev, [groupId]: current.filter((id) => id !== itemId) };
      }
      if (maxCount && current.length >= maxCount) return prev;
      return { ...prev, [groupId]: [...current, itemId] };
    });
  };

  // Add-on toggle
  const handleAddOnToggle = (addOnId) => {
    setSelectedAddOns((prev) =>
      prev.includes(addOnId) ? prev.filter((id) => id !== addOnId) : [...prev, addOnId]
    );
  };

  // Submit
  const handleAdd = () => {
    if (!isValid) return;

    // Build summary
    const summaryParts = [];
    allGroups.forEach((group) => {
      const selected = selections[group.id];
      if (selected == null) return;
      if (group.multi_select && Array.isArray(selected)) {
        selected.forEach((itemId) => {
          const item = group.list.find((i) => i.id === itemId);
          if (item) summaryParts.push(isAr ? item.name_ar : item.name);
        });
      } else {
        const item = group.list.find((i) => i.id === selected);
        if (item && !item.default) summaryParts.push(isAr ? item.name_ar : item.name);
      }
    });
    selectedAddOns.forEach((addOnId) => {
      const addOn = (meal.add_ons || []).find((a) => a.id === addOnId);
      if (addOn) summaryParts.push(isAr ? addOn.name_ar : addOn.name);
    });

    onAdd({
      id: meal.id,
      name: meal.name,
      name_ar: meal.name_ar,
      category: meal.category,
      calories: totalCalories,
      selections,
      add_ons: selectedAddOns,
      special_instructions: specialInstructions.trim(),
      customization_summary: summaryParts.join(' • '),
    });
  };

  if (!meal) return null;

  const mealName = isAr && meal.name_ar ? meal.name_ar : meal.name;
  const mealDesc = isAr && meal.description_ar
    ? meal.description_ar
    : (meal.description || t('mealDetail.noDescription'));

  const protein = meal.protein || 0;
  const carbs = meal.carbs || 0;
  const fat = meal.fat || 0;
  const totalMacros = protein + carbs + fat;

  // ---- Render a selection group (works for both options & variations) ----
  const renderGroup = (group) => {
    if (group.multi_select) {
      return renderMultiSelect(group);
    }
    return renderSingleSelect(group);
  };

  // Render the price/calorie badge for an option item
  const renderItemBadge = (item) => {
    // Show price badge if item has price_modifier
    if (item.price && item.price !== 0) {
      return (
        <View style={[styles.calBadge, styles.priceBadge]}>
          <Text style={[styles.calBadgeText, styles.priceBadgeText]}>
            +{item.price} SAR
          </Text>
        </View>
      );
    }
    // Otherwise show calorie badge
    if (item.calories && item.calories !== 0) {
      return (
        <View style={[styles.calBadge, item.calories < 0 && styles.calBadgeNeg]}>
          <Text style={[styles.calBadgeText, item.calories < 0 && styles.calBadgeTextNeg]}>
            {item.calories > 0 ? '+' : ''}{item.calories} {t('common.cal')}
          </Text>
        </View>
      );
    }
    return null;
  };

  // Single-select (radio)
  const renderSingleSelect = (group) => {
    const selected = selections[group.id];
    return (
      <View style={styles.choicesContainer}>
        {group.list.map((item) => {
          const isSelected = selected === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.choiceRow, isSelected && styles.choiceRowSelected]}
              onPress={() => handleSingleSelect(group.id, item.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.radio, isSelected && styles.radioSelected]}>
                {isSelected && <View style={styles.radioDot} />}
              </View>
              <Text style={[styles.choiceName, isSelected && styles.choiceNameSelected]} numberOfLines={1}>
                {isAr ? item.name_ar : item.name}
              </Text>
              {renderItemBadge(item)}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // Multi-select (checkbox)
  const renderMultiSelect = (group) => {
    const selected = Array.isArray(selections[group.id]) ? selections[group.id] : [];
    const max = group.max_count || 999;
    return (
      <View style={styles.choicesContainer}>
        {group.list.map((item) => {
          const isSelected = selected.includes(item.id);
          const isDisabled = !isSelected && selected.length >= max;
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.choiceRow,
                isSelected && styles.choiceRowSelected,
                isDisabled && styles.choiceRowDisabled,
              ]}
              onPress={() => handleMultiSelect(group.id, item.id, max)}
              disabled={isDisabled}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                {isSelected && <Text style={styles.checkIcon}>✓</Text>}
              </View>
              <Text
                style={[
                  styles.choiceName,
                  isSelected && styles.choiceNameSelected,
                  isDisabled && styles.choiceNameDisabled,
                ]}
                numberOfLines={1}
              >
                {isAr ? item.name_ar : item.name}
              </Text>
              {renderItemBadge(item)}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{t('mealDetail.customize')}</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Hero Image */}
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: meal.image_url || PLACEHOLDER_IMAGE }}
              style={styles.heroImage}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.6)']}
              style={styles.imageOverlay}
            >
              <Text style={styles.heroMealName}>{mealName}</Text>
              <Text style={styles.heroMealDesc} numberOfLines={2}>{mealDesc}</Text>
            </LinearGradient>
          </View>

          {/* Nutrition Card */}
          <View style={styles.nutritionCard}>
            <View style={styles.caloriesCenter}>
              <Text style={styles.caloriesNum}>{totalCalories}</Text>
              <Text style={styles.caloriesUnit}>{t('common.cal')}</Text>
            </View>
            {totalMacros > 0 && (
              <View style={styles.macroRow}>
                <View style={styles.macroItem}>
                  <View style={[styles.macroDot, { backgroundColor: '#4CAF50' }]} />
                  <Text style={styles.macroLabel}>{t('mealDetail.protein')}</Text>
                  <Text style={styles.macroValue}>{protein}g</Text>
                </View>
                <View style={styles.macroDivider} />
                <View style={styles.macroItem}>
                  <View style={[styles.macroDot, { backgroundColor: '#FF9800' }]} />
                  <Text style={styles.macroLabel}>{t('mealDetail.carbs')}</Text>
                  <Text style={styles.macroValue}>{carbs}g</Text>
                </View>
                <View style={styles.macroDivider} />
                <View style={styles.macroItem}>
                  <View style={[styles.macroDot, { backgroundColor: '#F44336' }]} />
                  <Text style={styles.macroLabel}>{t('mealDetail.fat')}</Text>
                  <Text style={styles.macroValue}>{fat}g</Text>
                </View>
              </View>
            )}
          </View>

          {/* OPTIONS section */}
          {(meal.options || []).length > 0 && (
            <View style={styles.sectionDivider}>
              <Text style={styles.sectionDividerText}>{t('mealDetail.options')}</Text>
            </View>
          )}
          {(meal.options || []).map((group) => (
            <View key={group.id} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Text style={styles.sectionTitle}>{isAr ? group.name_ar : group.name}</Text>
                  {group.required ? (
                    <View style={styles.requiredBadge}>
                      <Text style={styles.requiredBadgeText}>{t('mealDetail.required')}</Text>
                    </View>
                  ) : (
                    <View style={styles.optionalBadge}>
                      <Text style={styles.optionalBadgeText}>{t('mealDetail.optional')}</Text>
                    </View>
                  )}
                </View>
                {group.multi_select && group.max_count && (
                  <Text style={styles.sectionSubtitle}>
                    {t('mealDetail.selectUpTo')} {group.max_count}
                    {' '}({(Array.isArray(selections[group.id]) ? selections[group.id] : []).length}/{group.max_count})
                  </Text>
                )}
              </View>
              {renderGroup(group)}
            </View>
          ))}

          {/* VARIATIONS section */}
          {(meal.variations || []).length > 0 && (
            <View style={styles.sectionDivider}>
              <Text style={styles.sectionDividerText}>{t('mealDetail.variations')}</Text>
            </View>
          )}
          {(meal.variations || []).map((group) => (
            <View key={group.id} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Text style={styles.sectionTitle}>{isAr ? group.name_ar : group.name}</Text>
                  {group.required ? (
                    <View style={styles.requiredBadge}>
                      <Text style={styles.requiredBadgeText}>{t('mealDetail.required')}</Text>
                    </View>
                  ) : (
                    <View style={styles.optionalBadge}>
                      <Text style={styles.optionalBadgeText}>{t('mealDetail.optional')}</Text>
                    </View>
                  )}
                </View>
                {group.multi_select && group.max_count && (
                  <Text style={styles.sectionSubtitle}>
                    {t('mealDetail.selectUpTo')} {group.max_count}
                    {' '}({(Array.isArray(selections[group.id]) ? selections[group.id] : []).length}/{group.max_count})
                  </Text>
                )}
              </View>
              {renderGroup(group)}
            </View>
          ))}

          {/* ADD-ONS section */}
          {(meal.add_ons || []).length > 0 && (
            <>
              <View style={styles.sectionDivider}>
                <Text style={styles.sectionDividerText}>{t('mealDetail.addOns')}</Text>
              </View>
              <View style={styles.section}>
                <View style={styles.addOnsGrid}>
                  {meal.add_ons.map((addOn) => {
                    const isSelected = selectedAddOns.includes(addOn.id);
                    return (
                      <TouchableOpacity
                        key={addOn.id}
                        style={[styles.addOnCard, isSelected && styles.addOnCardSelected]}
                        onPress={() => handleAddOnToggle(addOn.id)}
                        activeOpacity={0.7}
                      >
                        {isSelected && (
                          <View style={styles.addOnCheckCircle}>
                            <Text style={styles.addOnCheckIcon}>✓</Text>
                          </View>
                        )}
                        <Text style={[styles.addOnName, isSelected && styles.addOnNameSelected]} numberOfLines={2}>
                          {isAr ? addOn.name_ar : addOn.name}
                        </Text>
                        <Text style={styles.addOnCalories}>+{addOn.calories} {t('common.cal')}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </>
          )}

          {/* SPECIAL INSTRUCTIONS */}
          {meal.special_instructions && (
            <>
              <View style={styles.sectionDivider}>
                <Text style={styles.sectionDividerText}>{t('mealDetail.specialInstructions')}</Text>
              </View>
              <View style={styles.section}>
                <TextInput
                  style={styles.instructionsInput}
                  placeholder={t('mealDetail.specialInstructionsPlaceholder')}
                  placeholderTextColor={Colors.textLight}
                  value={specialInstructions}
                  onChangeText={setSpecialInstructions}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  textAlign={isAr ? 'right' : 'left'}
                />
              </View>
            </>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Sticky Bottom */}
        <View style={styles.bottomBar}>
          <View style={styles.bottomCalRow}>
            <Text style={styles.bottomCalLabel}>{t('mealDetail.totalCalories')}</Text>
            <Text style={styles.bottomCalValue}>{totalCalories} {t('common.cal')}</Text>
          </View>
          {totalExtraPrice > 0 && (
            <View style={[styles.bottomCalRow, { marginBottom: 4 }]}>
              <Text style={styles.bottomCalLabel}>{t('mealDetail.extraPrice') || 'Extra price'}</Text>
              <Text style={[styles.bottomCalValue, { color: '#FF9800' }]}>+{totalExtraPrice} SAR</Text>
            </View>
          )}
          <TouchableOpacity
            style={[styles.addBtn, !isValid && styles.addBtnDisabled]}
            onPress={handleAdd}
            disabled={!isValid}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isValid ? ['#00B14F', '#00D95F'] : ['#D5D5D5', '#D5D5D5']}
              style={styles.addBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={[styles.addBtnText, !isValid && styles.addBtnTextDisabled]}>
                {existingSelection ? t('mealDetail.updateSelection') : t('mealDetail.addToSelection')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: 12,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    color: Colors.textPrimary,
    ...Fonts.bold,
  },
  headerTitle: {
    ...Fonts.bold,
    fontSize: 17,
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },

  // Hero
  imageWrapper: {
    height: 220,
    position: 'relative',
    backgroundColor: '#E8F5E9',
  },
  heroImage: { width: '100%', height: '100%' },
  imageOverlay: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    paddingTop: 60,
  },
  heroMealName: {
    ...Fonts.bold, fontSize: 24, color: Colors.white, marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },
  heroMealDesc: {
    ...Fonts.regular, fontSize: 14, color: 'rgba(255,255,255,0.9)', lineHeight: 20,
  },

  // Nutrition Card
  nutritionCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md, marginTop: -20,
    borderRadius: BorderRadius.lg, padding: Spacing.md,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12 },
      android: { elevation: 4 },
    }),
    marginBottom: Spacing.sm,
  },
  caloriesCenter: {
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', marginBottom: Spacing.sm,
  },
  caloriesNum: { ...Fonts.bold, fontSize: 32, color: Colors.primary },
  caloriesUnit: { ...Fonts.medium, fontSize: 16, color: Colors.primary, marginLeft: 4 },
  macroRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  macroItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.sm },
  macroDot: { width: 8, height: 8, borderRadius: 4, marginRight: 4 },
  macroLabel: { ...Fonts.regular, fontSize: 12, color: Colors.textSecondary, marginRight: 3 },
  macroValue: { ...Fonts.semiBold, fontSize: 13, color: Colors.textPrimary },
  macroDivider: { width: 1, height: 16, backgroundColor: Colors.border },

  // Section Divider (Options / Variations / Add-ons headers)
  sectionDivider: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  sectionDividerText: {
    ...Fonts.bold,
    fontSize: 13,
    color: Colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Card sections
  section: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md, marginBottom: Spacing.sm,
    borderRadius: BorderRadius.lg, padding: Spacing.md,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 },
      android: { elevation: 1 },
    }),
  },
  sectionHeader: { marginBottom: Spacing.sm },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { ...Fonts.bold, fontSize: 16, color: Colors.textPrimary },
  sectionSubtitle: { ...Fonts.regular, fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  requiredBadge: {
    backgroundColor: '#FFEBEE', paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.full,
  },
  requiredBadgeText: { ...Fonts.semiBold, fontSize: 10, color: '#D32F2F', textTransform: 'uppercase', letterSpacing: 0.5 },
  optionalBadge: {
    backgroundColor: '#F0F0F0', paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.full,
  },
  optionalBadgeText: { ...Fonts.medium, fontSize: 10, color: Colors.textLight, textTransform: 'uppercase', letterSpacing: 0.5 },

  // Choices (shared single + multi)
  choicesContainer: { gap: 6 },
  choiceRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: '#EFEFEF', backgroundColor: '#FAFAFA',
  },
  choiceRowSelected: { borderColor: Colors.primary, backgroundColor: '#F0F9F4' },
  choiceRowDisabled: { opacity: 0.4 },

  // Radio
  radio: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#D0D0D0',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  radioSelected: { borderColor: Colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },

  // Checkbox
  checkbox: {
    width: 20, height: 20, borderRadius: 5, borderWidth: 2, borderColor: '#D0D0D0',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  checkboxSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  checkIcon: { fontSize: 12, color: Colors.white, ...Fonts.bold },

  choiceName: { ...Fonts.medium, fontSize: 14, color: Colors.textPrimary, flex: 1 },
  choiceNameSelected: { color: Colors.primary, ...Fonts.semiBold },
  choiceNameDisabled: { color: Colors.textLight },

  calBadge: { backgroundColor: '#F0F9F4', paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full },
  calBadgeNeg: { backgroundColor: '#FFF3E0' },
  calBadgeText: { ...Fonts.semiBold, fontSize: 11, color: Colors.primary },
  calBadgeTextNeg: { color: '#E65100' },
  priceBadge: { backgroundColor: '#FFF8E1' },
  priceBadgeText: { color: '#F57C00' },

  // Add-ons
  addOnsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  addOnCard: {
    borderWidth: 1.5, borderColor: '#EFEFEF', borderRadius: BorderRadius.md,
    paddingVertical: 10, paddingHorizontal: 14, backgroundColor: '#FAFAFA',
    minWidth: '30%', position: 'relative', alignItems: 'center',
  },
  addOnCardSelected: { borderColor: Colors.primary, backgroundColor: '#F0F9F4' },
  addOnCheckCircle: {
    position: 'absolute', top: -6, right: -6,
    width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  addOnCheckIcon: { fontSize: 11, color: Colors.white, ...Fonts.bold },
  addOnName: { ...Fonts.medium, fontSize: 12, color: Colors.textPrimary, textAlign: 'center' },
  addOnNameSelected: { color: Colors.primary, ...Fonts.semiBold },
  addOnCalories: { ...Fonts.regular, fontSize: 10, color: Colors.textSecondary, marginTop: 2 },

  // Special Instructions
  instructionsInput: {
    backgroundColor: '#FAFAFA', borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: '#EFEFEF', padding: Spacing.md,
    ...Fonts.regular, fontSize: 14, color: Colors.textPrimary, minHeight: 80,
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.white,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border,
    paddingHorizontal: Spacing.md, paddingTop: Spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? 34 : Spacing.lg,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 8 },
    }),
  },
  bottomCalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  bottomCalLabel: { ...Fonts.medium, fontSize: 14, color: Colors.textSecondary },
  bottomCalValue: { ...Fonts.bold, fontSize: 18, color: Colors.primary },
  addBtn: { height: 52, borderRadius: BorderRadius.full, overflow: 'hidden' },
  addBtnDisabled: { opacity: 0.7 },
  addBtnGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  addBtnText: { ...Fonts.bold, fontSize: 16, color: Colors.white },
  addBtnTextDisabled: { color: '#999' },
});

export default MealDetailSheet;
