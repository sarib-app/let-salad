import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Fonts, Spacing, BorderRadius } from '../../utils/globalStyles';
import { listAddresses } from '../../utils/api';
import { useLanguage } from '../../context/LanguageContext';

const AddressSelectionScreen = ({ route, navigation }) => {
  const { t } = useLanguage();
  const { currentAddress, onAddressSelect } = route.params;

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(currentAddress?.id || null);
  const [loading, setLoading] = useState(true);

  // Load addresses from API when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadAddresses();
    }, [])
  );

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const response = await listAddresses();
      if (response.code === 200) {
        const addrs = response.addresses || [];
        setSavedAddresses(addrs);
        // Auto-select: current address > primary > first
        if (!selectedAddressId) {
          const primary = addrs.find((a) => a.is_primary);
          if (primary) {
            setSelectedAddressId(primary.id);
          } else if (addrs.length > 0) {
            setSelectedAddressId(addrs[0].id);
          }
        }
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      Alert.alert(t('common.error'), t('addressSelection.noAddresses'));
    } finally{
      setLoading(false);
    }
  };

  const handleSelectAddress = (addressId) => {
    setSelectedAddressId(addressId);
  };

  const handleConfirm = () => {
    const selected = savedAddresses.find((addr) => addr.id === selectedAddressId);
    if (selected && onAddressSelect) {
      onAddressSelect(selected);
    }
    navigation.goBack();
  };

  const handleAddNewAddress = () => {
    navigation.navigate('AddEditAddress', {});
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
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
        <Text style={styles.title}>{t('addressSelection.title')}</Text>

        {savedAddresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {t('addressSelection.noAddresses')}
            </Text>
          </View>
        ) : (
          savedAddresses.map((address) => (
            <TouchableOpacity
              key={address.id}
              style={[
                styles.addressCard,
                selectedAddressId === address.id && styles.addressCardSelected,
              ]}
              onPress={() => handleSelectAddress(address.id)}
            >
              <View style={styles.radioContainer}>
                <View
                  style={[
                    styles.radioOuter,
                    selectedAddressId === address.id && styles.radioOuterSelected,
                  ]}
                >
                  {selectedAddressId === address.id && <View style={styles.radioInner} />}
                </View>
                <View style={styles.addressContent}>
                  <View style={styles.addressHeader}>
                    <Text style={styles.addressName}>
                      {(address.type || 'Address').charAt(0).toUpperCase() + (address.type || 'address').slice(1)}
                    </Text>
                    {address.is_primary && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultText}>{t('common.primary')}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.addressText}>{address.street_address}</Text>
                  <Text style={styles.addressText}>
                    {[address.district, address.city].filter(Boolean).join(', ')}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        <TouchableOpacity
          style={styles.addNewButton}
          onPress={handleAddNewAddress}
        >
          <Text style={styles.addNewIcon}>+</Text>
          <Text style={styles.addNewText}>{t('addressSelection.addNewAddress')}</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.confirmButton, !selectedAddressId && styles.confirmButtonDisabled]}
          onPress={handleConfirm}
          disabled={!selectedAddressId}
        >
          <LinearGradient
            colors={selectedAddressId ? ['#00B14F', '#00D95F'] : ['#CCCCCC', '#CCCCCC']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.confirmButtonText}>{t('addressSelection.confirmAddress')}</Text>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Fonts.medium,
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
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
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...Fonts.medium,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  addressCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  addressCardSelected: {
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
  addressContent: {
    flex: 1,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  addressName: {
    ...Fonts.bold,
    fontSize: 15,
    color: Colors.textPrimary,
    marginRight: Spacing.sm,
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
  addressText: {
    ...Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
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
  },
  confirmButton: {
    height: 56,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  confirmButtonDisabled: {
    opacity: 0.6,
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
});

export default AddressSelectionScreen;
