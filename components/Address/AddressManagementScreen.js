import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Fonts, Spacing, BorderRadius } from '../../utils/globalStyles';
import { listAddresses, deleteAddress, setPrimaryAddress } from '../../utils/api';

const TYPE_ICONS = {
  home: '🏠',
  work: '🏢',
  other: '📍',
};

const AddressManagementScreen = ({ navigation }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // address id being acted on

  // Reload addresses when screen comes into focus
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
        setAddresses(response.addresses || []);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      Alert.alert('Error', 'Failed to load addresses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await listAddresses();
      if (response.code === 200) {
        setAddresses(response.addresses || []);
      }
    } catch (error) {
      console.error('Error refreshing addresses:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddNew = () => {
    navigation.navigate('AddEditAddress', {});
  };

  const handleEdit = (address) => {
    navigation.navigate('AddEditAddress', { address });
  };

  const handleDelete = (address) => {
    Alert.alert(
      'Delete Address',
      `Are you sure you want to delete this ${address.type || ''} address?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(address.id);
              const response = await deleteAddress(address.id);
              if (response.code === 200) {
                setAddresses((prev) => prev.filter((a) => a.id !== address.id));
              } else {
                Alert.alert('Error', response.message || 'Failed to delete address.');
              }
            } catch (error) {
              console.error('Error deleting address:', error);
              Alert.alert('Error', error.message || 'Failed to delete address.');
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  const handleSetPrimary = async (address) => {
    if (address.is_primary) return;
    try {
      setActionLoading(address.id);
      const response = await setPrimaryAddress(address.id);
      if (response.code === 200) {
        setAddresses((prev) =>
          prev.map((a) => ({
            ...a,
            is_primary: a.id === address.id,
          }))
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to set primary address.');
      }
    } catch (error) {
      console.error('Error setting primary:', error);
      Alert.alert('Error', error.message || 'Failed to set primary address.');
    } finally {
      setActionLoading(null);
    }
  };

  const getTypeLabel = (type) => {
    return (type || 'other').charAt(0).toUpperCase() + (type || 'other').slice(1);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading addresses...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📍</Text>
            <Text style={styles.emptyTitle}>No Addresses Yet</Text>
            <Text style={styles.emptySubtitle}>
              Add your first delivery address to get started
            </Text>
          </View>
        ) : (
          addresses.map((address) => {
            const isActing = actionLoading === address.id;

            return (
              <View key={address.id} style={styles.addressCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.headerLeft}>
                    <Text style={styles.typeIcon}>
                      {TYPE_ICONS[address.type] || TYPE_ICONS.other}
                    </Text>
                    <Text style={styles.typeLabel}>{getTypeLabel(address.type)}</Text>
                    {address.is_primary && (
                      <View style={styles.primaryBadge}>
                        <Text style={styles.primaryBadgeText}>Primary</Text>
                      </View>
                    )}
                  </View>
                  {isActing && (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  )}
                </View>

                <Text style={styles.streetAddress}>{address.street_address}</Text>
                {address.building_number && (
                  <Text style={styles.detailText}>
                    Building {address.building_number}
                    {address.apartment_number ? `, Apt ${address.apartment_number}` : ''}
                  </Text>
                )}
                <Text style={styles.detailText}>
                  {[address.district, address.city, address.postal_code]
                    .filter(Boolean)
                    .join(', ')}
                </Text>
                {address.delivery_notes ? (
                  <Text style={styles.notesText}>Note: {address.delivery_notes}</Text>
                ) : null}

                <View style={styles.cardActions}>
                  {!address.is_primary && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleSetPrimary(address)}
                      disabled={isActing}
                    >
                      <Text style={styles.actionButtonText}>Set Primary</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEdit(address)}
                    disabled={isActing}
                  >
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDelete(address)}
                    disabled={isActing}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

        {/* Add New Address Button */}
        <TouchableOpacity style={styles.addNewButton} onPress={handleAddNew}>
          <Text style={styles.addNewIcon}>+</Text>
          <Text style={styles.addNewText}>Add New Address</Text>
        </TouchableOpacity>
      </ScrollView>
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    ...Fonts.bold,
    fontSize: 20,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    ...Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  addressCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  typeIcon: {
    fontSize: 20,
  },
  typeLabel: {
    ...Fonts.bold,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  primaryBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginLeft: Spacing.xs,
  },
  primaryBadgeText: {
    ...Fonts.semiBold,
    fontSize: 10,
    color: Colors.white,
  },
  streetAddress: {
    ...Fonts.semiBold,
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  detailText: {
    ...Fonts.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  notesText: {
    ...Fonts.regular,
    fontSize: 12,
    color: Colors.textLight,
    fontStyle: 'italic',
    marginTop: Spacing.xs,
  },
  cardActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  actionButtonText: {
    ...Fonts.semiBold,
    fontSize: 12,
    color: Colors.primary,
  },
  deleteButton: {
    borderColor: Colors.error,
  },
  deleteButtonText: {
    ...Fonts.semiBold,
    fontSize: 12,
    color: Colors.error,
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
    marginTop: Spacing.sm,
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
});

export default AddressManagementScreen;
