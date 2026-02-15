import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Spacing, BorderRadius } from '../../utils/globalStyles';
import { createAddress, updateAddress } from '../../utils/api';

const ADDRESS_TYPES = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'work', label: 'Work', icon: '🏢' },
  { id: 'other', label: 'Other', icon: '📍' },
];

// Default to Riyadh
const DEFAULT_REGION = {
  latitude: 24.7136,
  longitude: 46.6753,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const AddEditAddressScreen = ({ route, navigation }) => {
  const { address: existingAddress } = route.params || {};
  const isEditing = !!existingAddress;

  const mapRef = useRef(null);

  const [region, setRegion] = useState(
    existingAddress?.latitude && existingAddress?.longitude
      ? {
          latitude: parseFloat(existingAddress.latitude),
          longitude: parseFloat(existingAddress.longitude),
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }
      : DEFAULT_REGION
  );

  const [markerCoord, setMarkerCoord] = useState(
    existingAddress?.latitude && existingAddress?.longitude
      ? {
          latitude: parseFloat(existingAddress.latitude),
          longitude: parseFloat(existingAddress.longitude),
        }
      : {
          latitude: DEFAULT_REGION.latitude,
          longitude: DEFAULT_REGION.longitude,
        }
  );

  const [form, setForm] = useState({
    type: existingAddress?.type || 'home',
    street_address: existingAddress?.street_address || '',
    building_number: existingAddress?.building_number || '',
    apartment_number: existingAddress?.apartment_number || '',
    city: existingAddress?.city || 'Riyadh',
    district: existingAddress?.district || '',
    postal_code: existingAddress?.postal_code || '',
    delivery_notes: existingAddress?.delivery_notes || '',
    is_primary: existingAddress?.is_primary || false,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);

  const searchTimeout = useRef(null);

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (results.length > 0) {
        const place = results[0];
        setForm((prev) => ({
          ...prev,
          street_address: [place.street, place.name].filter(Boolean).join(', ') || prev.street_address,
          city: place.city || place.region || prev.city,
          district: place.district || place.subregion || prev.district,
          postal_code: place.postalCode || prev.postal_code,
        }));
      }
    } catch (error) {
      console.error('Reverse geocode error:', error);
    }
  };

  const handleMapPress = async (e) => {
    const coord = e.nativeEvent.coordinate;
    setMarkerCoord(coord);
    await reverseGeocode(coord.latitude, coord.longitude);
  };

  const handleMarkerDragEnd = async (e) => {
    const coord = e.nativeEvent.coordinate;
    setMarkerCoord(coord);
    await reverseGeocode(coord.latitude, coord.longitude);
  };

  const handleSearchQueryChange = (text) => {
    setSearchQuery(text);

    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Clear results if query is too short
    if (text.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    // Debounce: wait 500ms after user stops typing
    searchTimeout.current = setTimeout(() => {
      performSearch(text.trim());
    }, 500);
  };

  const performSearch = async (query) => {
    if (!query) return;

    try {
      setSearching(true);
      const results = await Location.geocodeAsync(query);

      if (results.length > 0) {
        const topResults = results.slice(0, 5);
        const detailedResults = await Promise.all(
          topResults.map(async (result) => {
            const reverseResults = await Location.reverseGeocodeAsync({
              latitude: result.latitude,
              longitude: result.longitude,
            });
            return {
              ...result,
              address: reverseResults[0] || {},
            };
          })
        );
        setSearchResults(detailedResults);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Geocode error:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectSearchResult = async (result) => {
    const newCoord = {
      latitude: result.latitude,
      longitude: result.longitude,
    };
    setMarkerCoord(newCoord);
    const newRegion = {
      ...newCoord,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    };
    setRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 500);
    setSearchResults([]);
    setSearchQuery('');

    if (result.address) {
      const place = result.address;
      setForm((prev) => ({
        ...prev,
        street_address: [place.street, place.name].filter(Boolean).join(', ') || prev.street_address,
        city: place.city || place.region || prev.city,
        district: place.district || place.subregion || prev.district,
        postal_code: place.postalCode || prev.postal_code,
      }));
    } else {
      await reverseGeocode(newCoord.latitude, newCoord.longitude);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!form.street_address.trim()) {
      Alert.alert('Required', 'Please enter a street address.');
      return;
    }
    if (!form.city.trim()) {
      Alert.alert('Required', 'Please enter a city.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...form,
        latitude: markerCoord.latitude.toString(),
        longitude: markerCoord.longitude.toString(),
      };

      let response;
      if (isEditing) {
        response = await updateAddress(existingAddress.id, payload);
      } else {
        response = await createAddress(payload);
      }

      if (response.code === 201 || response.code === 200) {
        navigation.goBack();
      } else {
        Alert.alert('Error', response.message || 'Failed to save address.');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Error', error.message || 'Failed to save address. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getSearchResultLabel = (result) => {
    const a = result.address;
    if (!a) return `${result.latitude.toFixed(4)}, ${result.longitude.toFixed(4)}`;
    return [a.name, a.street, a.district, a.city, a.region]
      .filter(Boolean)
      .join(', ');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Map Section */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={region}
          onPress={handleMapPress}
          showsUserLocation
          showsMyLocationButton={false}
        >
          <Marker
            coordinate={markerCoord}
            draggable
            onDragEnd={handleMarkerDragEnd}
          />
        </MapView>

        {/* Search Bar Overlay */}
        <View style={styles.searchOverlay}>
          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search location..."
              placeholderTextColor={Colors.textLight}
              value={searchQuery}
              onChangeText={handleSearchQueryChange}
              returnKeyType="search"
            />
            {searching && (
              <View style={styles.searchLoadingContainer}>
                <ActivityIndicator size="small" color={Colors.primary} />
              </View>
            )}
          </View>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <View style={styles.searchResults}>
              {searchResults.map((result, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.searchResultItem}
                  onPress={() => handleSelectSearchResult(result)}
                >
                  <Text style={styles.searchResultIcon}>📍</Text>
                  <Text style={styles.searchResultText} numberOfLines={2}>
                    {getSearchResultLabel(result)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

      </View>

      {/* Form Section */}
      <ScrollView
        contentContainerStyle={styles.formContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Address Type */}
        <Text style={styles.label}>Address Type</Text>
        <View style={styles.typeContainer}>
          {ADDRESS_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeButton,
                form.type === type.id && styles.typeButtonActive,
              ]}
              onPress={() => setForm({ ...form, type: type.id })}
            >
              <Text style={styles.typeIcon}>{type.icon}</Text>
              <Text
                style={[
                  styles.typeLabel,
                  form.type === type.id && styles.typeLabelActive,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Street Address */}
        <Text style={styles.label}>Street Address *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter street address"
          placeholderTextColor={Colors.textLight}
          value={form.street_address}
          onChangeText={(text) => setForm({ ...form, street_address: text })}
        />

        {/* Building & Apartment in row */}
        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Building No.</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 42"
              placeholderTextColor={Colors.textLight}
              value={form.building_number}
              onChangeText={(text) => setForm({ ...form, building_number: text })}
            />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>Apartment No.</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 3A"
              placeholderTextColor={Colors.textLight}
              value={form.apartment_number}
              onChangeText={(text) => setForm({ ...form, apartment_number: text })}
            />
          </View>
        </View>

        {/* City & District in row */}
        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>City *</Text>
            <TextInput
              style={styles.input}
              placeholder="City"
              placeholderTextColor={Colors.textLight}
              value={form.city}
              onChangeText={(text) => setForm({ ...form, city: text })}
            />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>District</Text>
            <TextInput
              style={styles.input}
              placeholder="District"
              placeholderTextColor={Colors.textLight}
              value={form.district}
              onChangeText={(text) => setForm({ ...form, district: text })}
            />
          </View>
        </View>

        {/* Postal Code */}
        <Text style={styles.label}>Postal Code</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 12345"
          placeholderTextColor={Colors.textLight}
          value={form.postal_code}
          onChangeText={(text) => setForm({ ...form, postal_code: text })}
          keyboardType="number-pad"
        />

        {/* Delivery Notes */}
        <Text style={styles.label}>Delivery Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Any special instructions for delivery..."
          placeholderTextColor={Colors.textLight}
          value={form.delivery_notes}
          onChangeText={(text) => setForm({ ...form, delivery_notes: text })}
          multiline
          numberOfLines={3}
        />

        {/* Primary Address Toggle */}
        <TouchableOpacity
          style={styles.primaryToggle}
          onPress={() => setForm({ ...form, is_primary: !form.is_primary })}
        >
          <View
            style={[
              styles.checkbox,
              form.is_primary && styles.checkboxActive,
            ]}
          >
            {form.is_primary && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.primaryLabel}>Set as primary address</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Save Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
        >
          <LinearGradient
            colors={['#00B14F', '#00D95F']}
            style={styles.saveButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {saving ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.saveButtonText}>
                {isEditing ? 'Update Address' : 'Save Address'}
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
  mapContainer: {
    height: 250,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  searchOverlay: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    ...Fonts.regular,
    fontSize: 14,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    height: 44,
  },
  searchLoadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  searchResults: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    maxHeight: 200,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchResultIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  searchResultText: {
    ...Fonts.regular,
    fontSize: 13,
    color: Colors.textPrimary,
    flex: 1,
  },
  formContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  label: {
    ...Fonts.semiBold,
    fontSize: 13,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  input: {
    ...Fonts.regular,
    fontSize: 15,
    color: Colors.textPrimary,
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 48,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfField: {
    flex: 1,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    gap: Spacing.xs,
  },
  typeButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F9F4',
  },
  typeIcon: {
    fontSize: 18,
  },
  typeLabel: {
    ...Fonts.semiBold,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  typeLabelActive: {
    color: Colors.primary,
  },
  primaryToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    ...Fonts.bold,
    fontSize: 14,
    color: Colors.white,
  },
  primaryLabel: {
    ...Fonts.medium,
    fontSize: 14,
    color: Colors.textPrimary,
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
  saveButton: {
    height: 56,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    ...Fonts.bold,
    fontSize: 16,
    color: Colors.white,
  },
});

export default AddEditAddressScreen;
