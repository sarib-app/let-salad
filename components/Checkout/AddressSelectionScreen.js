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

const AddressSelectionScreen = ({ route, navigation }) => {
  const { currentAddress, onAddressSelect } = route.params;

  // Mock saved addresses
  const [savedAddresses] = useState([
    {
      id: '1',
      name: 'John Doe',
      street: 'King Fahd Road, Al Olaya',
      city: 'Riyadh',
      phone: '+966 50 123 4567',
      isDefault: true,
    },
    {
      id: '2',
      name: 'John Doe',
      street: 'Prince Mohammed Bin Abdulaziz Road',
      city: 'Riyadh',
      phone: '+966 50 123 4567',
      isDefault: false,
    },
    {
      id: '3',
      name: 'Office',
      street: 'King Abdullah Financial District',
      city: 'Riyadh',
      phone: '+966 50 123 4567',
      isDefault: false,
    },
  ]);

  const [selectedAddressId, setSelectedAddressId] = useState('1');
  const [showAddNew, setShowAddNew] = useState(false);

  // New address form
  const [newAddress, setNewAddress] = useState({
    name: '',
    street: '',
    city: 'Riyadh',
    phone: '',
  });

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
    if (newAddress.name && newAddress.street && newAddress.phone) {
      // In real app, save to backend
      const newAddr = {
        id: Date.now().toString(),
        ...newAddress,
        isDefault: false,
      };

      if (onAddressSelect) {
        onAddressSelect(newAddr);
      }
      navigation.goBack();
    }
  };

  if (showAddNew) {
    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Add New Address</Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                value={newAddress.name}
                onChangeText={(text) => setNewAddress({ ...newAddress, name: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Street Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Building, Street, Area"
                value={newAddress.street}
                onChangeText={(text) => setNewAddress({ ...newAddress, street: text })}
                multiline
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.input}
                placeholder="City"
                value={newAddress.city}
                onChangeText={(text) => setNewAddress({ ...newAddress, city: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="+966 50 123 4567"
                value={newAddress.phone}
                onChangeText={(text) => setNewAddress({ ...newAddress, phone: text })}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setShowAddNew(false)}
          >
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryButton} onPress={handleAddNewAddress}>
            <LinearGradient
              colors={['#00B14F', '#00D95F']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.primaryButtonText}>Save Address</Text>
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
        <Text style={styles.title}>Select Delivery Address</Text>

        {savedAddresses.map((address) => (
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
                  <Text style={styles.addressName}>{address.name}</Text>
                  {address.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.addressText}>{address.street}</Text>
                <Text style={styles.addressText}>{address.city}</Text>
                <Text style={styles.addressPhone}>{address.phone}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.addNewButton}
          onPress={() => setShowAddNew(true)}
        >
          <Text style={styles.addNewIcon}>+</Text>
          <Text style={styles.addNewText}>Add New Address</Text>
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
            <Text style={styles.confirmButtonText}>Confirm Address</Text>
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
  addressPhone: {
    ...Fonts.medium,
    fontSize: 14,
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
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
    minHeight: 48,
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

export default AddressSelectionScreen;
