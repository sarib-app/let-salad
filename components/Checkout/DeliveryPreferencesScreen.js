import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Spacing, BorderRadius } from '../../utils/globalStyles';

const DeliveryPreferencesScreen = ({ route, navigation }) => {
  const { package: selectedPackage, duration } = route.params;

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

  // Time slots
  const timeSlots = [
    { id: 'morning', label: 'Morning', time: '7:00 AM - 10:00 AM', icon: '🌅' },
    { id: 'afternoon', label: 'Afternoon', time: '12:00 PM - 3:00 PM', icon: '☀️' },
    { id: 'evening', label: 'Evening', time: '6:00 PM - 9:00 PM', icon: '🌆' },
  ];
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('morning');

  // Days of the week
  const daysOfWeek = [
    { id: 'sun', label: 'Sun', fullName: 'Sunday' },
    { id: 'mon', label: 'Mon', fullName: 'Monday' },
    { id: 'tue', label: 'Tue', fullName: 'Tuesday' },
    { id: 'wed', label: 'Wed', fullName: 'Wednesday' },
    { id: 'thu', label: 'Thu', fullName: 'Thursday' },
    { id: 'fri', label: 'Fri', fullName: 'Friday' },
    { id: 'sat', label: 'Sat', fullName: 'Saturday' },
  ];

  // Default to all days selected
  const [selectedDays, setSelectedDays] = useState(
    daysOfWeek.map((day) => day.id)
  );

  const handleSelectAddress = (addressId) => {
    setSelectedAddressId(addressId);
  };

  const handleAddNewAddress = () => {
    navigation.navigate('AddressSelection', {
      currentAddress: savedAddresses.find((addr) => addr.id === selectedAddressId),
      onAddressSelect: (address) => {
        // In real app, would add to saved addresses
        console.log('New address:', address);
      },
    });
  };

  const handleToggleDay = (dayId) => {
    if (selectedDays.includes(dayId)) {
      // Don't allow deselecting if it's the last day
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((id) => id !== dayId));
      }
    } else {
      setSelectedDays([...selectedDays, dayId]);
    }
  };

  const handleSelectAllDays = () => {
    setSelectedDays(daysOfWeek.map((day) => day.id));
  };

  const handleContinue = () => {
    const selectedAddress = savedAddresses.find(
      (addr) => addr.id === selectedAddressId
    );

    const deliveryPreferences = {
      address: selectedAddress,
      timeSlot: timeSlots.find((slot) => slot.id === selectedTimeSlot),
      deliveryDays: selectedDays,
      daysPerWeek: selectedDays.length,
    };

    navigation.navigate('Checkout', {
      package: selectedPackage,
      duration,
      deliveryPreferences,
    });
  };

  const daysPerWeek = selectedDays.length;
  const maxDeliveries = duration;
  const estimatedWeeks = Math.ceil(maxDeliveries / daysPerWeek);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Delivery Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <Text style={styles.sectionSubtitle}>
            Where should we deliver your meals?
          </Text>

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
                </View>
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.addNewButton} onPress={handleAddNewAddress}>
            <Text style={styles.addNewIcon}>+</Text>
            <Text style={styles.addNewText}>Add New Address</Text>
          </TouchableOpacity>
        </View>

        {/* Time Slot Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferred Delivery Time</Text>
          <Text style={styles.sectionSubtitle}>
            When would you like to receive your meals?
          </Text>

          <View style={styles.timeSlotsContainer}>
            {timeSlots.map((slot) => (
              <TouchableOpacity
                key={slot.id}
                style={[
                  styles.timeSlotCard,
                  selectedTimeSlot === slot.id && styles.timeSlotCardSelected,
                ]}
                onPress={() => setSelectedTimeSlot(slot.id)}
              >
                <Text style={styles.timeSlotIcon}>{slot.icon}</Text>
                <Text
                  style={[
                    styles.timeSlotLabel,
                    selectedTimeSlot === slot.id && styles.timeSlotLabelSelected,
                  ]}
                >
                  {slot.label}
                </Text>
                <Text
                  style={[
                    styles.timeSlotTime,
                    selectedTimeSlot === slot.id && styles.timeSlotTimeSelected,
                  ]}
                >
                  {slot.time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Days Selection Section */}
        <View style={styles.section}>
          <View style={styles.daysHeader}>
            <View>
              <Text style={styles.sectionTitle}>Delivery Days</Text>
              <Text style={styles.sectionSubtitle}>
                Select the days you want deliveries ({duration} days total)
              </Text>
            </View>
            <TouchableOpacity onPress={handleSelectAllDays} style={styles.selectAllButton}>
              <Text style={styles.selectAllText}>Select All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.daysGrid}>
            {daysOfWeek.map((day) => (
              <TouchableOpacity
                key={day.id}
                style={[
                  styles.dayButton,
                  selectedDays.includes(day.id) && styles.dayButtonSelected,
                ]}
                onPress={() => handleToggleDay(day.id)}
              >
                <Text
                  style={[
                    styles.dayLabel,
                    selectedDays.includes(day.id) && styles.dayLabelSelected,
                  ]}
                >
                  {day.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.deliveryInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📅</Text>
              <Text style={styles.infoText}>
                {daysPerWeek} {daysPerWeek === 1 ? 'day' : 'days'} per week
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📦</Text>
              <Text style={styles.infoText}>
                Estimated {estimatedWeeks} {estimatedWeeks === 1 ? 'week' : 'weeks'} of
                deliveries
              </Text>
            </View>
            {selectedDays.length < 7 && (
              <View style={styles.skipNote}>
                <Text style={styles.skipNoteText}>
                  You can skip up to {7 - selectedDays.length}{' '}
                  {7 - selectedDays.length === 1 ? 'day' : 'days'} per week
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <LinearGradient
            colors={['#00B14F', '#00D95F']}
            style={styles.continueGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.continueText}>Continue to Checkout</Text>
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
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Fonts.bold,
    fontSize: 20,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    ...Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  addressCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
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
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  addressContent: {
    flex: 1,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  addressName: {
    ...Fonts.bold,
    fontSize: 14,
    color: Colors.textPrimary,
    marginRight: Spacing.sm,
  },
  defaultBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  defaultText: {
    ...Fonts.semiBold,
    fontSize: 9,
    color: Colors.white,
  },
  addressText: {
    ...Fonts.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    marginTop: Spacing.xs,
  },
  addNewIcon: {
    ...Fonts.bold,
    fontSize: 20,
    color: Colors.primary,
    marginRight: Spacing.xs,
  },
  addNewText: {
    ...Fonts.semiBold,
    fontSize: 14,
    color: Colors.primary,
  },
  timeSlotsContainer: {
    gap: Spacing.sm,
  },
  timeSlotCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeSlotCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F9F4',
  },
  timeSlotIcon: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  timeSlotLabel: {
    ...Fonts.bold,
    fontSize: 16,
    color: Colors.textPrimary,
    flex: 1,
  },
  timeSlotLabelSelected: {
    color: Colors.primary,
  },
  timeSlotTime: {
    ...Fonts.regular,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  timeSlotTimeSelected: {
    color: Colors.primary,
  },
  daysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  selectAllButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  selectAllText: {
    ...Fonts.semiBold,
    fontSize: 13,
    color: Colors.primary,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  dayButton: {
    width: (100 / 7 - 1) + '%',
    aspectRatio: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 48,
  },
  dayButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  dayLabel: {
    ...Fonts.semiBold,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  dayLabelSelected: {
    color: Colors.white,
  },
  deliveryInfo: {
    backgroundColor: '#F0F9F4',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  infoIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },
  infoText: {
    ...Fonts.medium,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  skipNote: {
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  skipNoteText: {
    ...Fonts.regular,
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
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
  continueButton: {
    height: 56,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  continueGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueText: {
    ...Fonts.bold,
    fontSize: 16,
    color: Colors.white,
  },
});

export default DeliveryPreferencesScreen;
