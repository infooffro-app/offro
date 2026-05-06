import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import * as Location from 'expo-location';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const AXIS_COLORS = {
  primary: '#003DA5',
  secondary: '#4A90E2',
  lightBg: '#E8F1F8',
  text: '#1A1A1A',
  white: '#FFFFFF',
  border: '#D0E0F0',
  muted: '#8A9BB0',
};

export default function EditShopScreen() {
  const router = useRouter();
  const { shopId } = useLocalSearchParams();

  const [token, setToken] = useState('');
  const [pageLoading, setPageLoading] = useState(true); // loading entire page
  const [saving, setSaving] = useState(false);           // loading for save button

  const [formData, setFormData] = useState({
    shopName: '',
    description: '',
    address: '',
    pincode: '',
    phone: '',
    email: '',
    latitude: '',
    longitude: '',
    category_id: null,
    state_id: null,
    district_id: null,
    city_id: null,
    state: '',
    district: '',
    city: '',
  });

  // Dropdown options
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);

  // ─────────────────────────────────────────────────────────────────────────
  // INIT - Load everything in sequence
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        setPageLoading(true);

        const t = await AsyncStorage.getItem('userToken');
        if (!t) {
          Alert.alert('Error', 'Not authenticated');
          router.back();
          return;
        }
        setToken(t);

        // 1. Load states and categories in parallel
        const [statesData, categoriesData] = await Promise.all([
          fetchStates(t),
          fetchCategories(t),
        ]);

        // 2. Load shop details
        const shop = await fetchShopDetails(t);
        if (!shop) {
          Alert.alert('Error', 'Shop not found');
          router.back();
          return;
        }

        // 3. Pre-fill form data
        setFormData({
          shopName: shop.shop_name || '',
          description: shop.description || '',
          address: shop.address || '',
          pincode: shop.pincode || '',
          phone: shop.phone || '',
          email: shop.email || '',
          latitude: shop.latitude?.toString() || '',
          longitude: shop.longitude?.toString() || '',
          category_id: shop.category_id || null,
          state_id: shop.state_id || null,
          district_id: shop.district_id || null,
          city_id: shop.city_id || null,
          state: shop.state || '',
          district: shop.district || '',
          city: shop.city || '',
        });

        // 4. Load districts for saved state (if state_id exists)
        if (shop.state_id) {
          const districtData = await fetchDistricts(t, shop.state_id);

          // 5. Load cities for saved district (if district_id exists)
          if (shop.district_id) {
            await fetchCities(t, shop.district_id);
          }
        }

      } catch (error) {
        console.error('Init error:', error);
        Alert.alert('Error', 'Failed to load shop data');
      } finally {
        setPageLoading(false);
      }
    };

    if (shopId) init();
  }, [shopId]);

  // ─────────────────────────────────────────────────────────────────────────
  // API CALLS
  // ─────────────────────────────────────────────────────────────────────────

  const fetchShopDetails = async (t) => {
    const res = await fetch(`${API_URL}/api/shop/getShop/${shopId}`, {
      headers: { Authorization: `Bearer ${t}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || data;
  };

  const fetchStates = async (t) => {
    const res = await fetch(`${API_URL}/api/shop/states`, {
      headers: { Authorization: `Bearer ${t}` },
    });
    const data = await res.json();
    setStates(Array.isArray(data) ? data : []);
    return data;
  };

  const fetchCategories = async (t) => {
    const res = await fetch(`${API_URL}/api/shop/categories`, {
      headers: { Authorization: `Bearer ${t}` },
    });
    const data = await res.json();
    setCategories(Array.isArray(data) ? data : []);
    return data;
  };

  const fetchDistricts = async (t, stateId) => {
    const res = await fetch(`${API_URL}/api/shop/districts/${stateId}`, {
      headers: { Authorization: `Bearer ${t}` },
    });
    const data = await res.json();
    setDistricts(Array.isArray(data) ? data : []);
    return data;
  };

  const fetchCities = async (t, districtId) => {
    const res = await fetch(`${API_URL}/api/shop/cities/${districtId}`, {
      headers: { Authorization: `Bearer ${t}` },
    });
    const data = await res.json();
    setCities(Array.isArray(data) ? data : []);
    return data;
  };

  // ─────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────────────────

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStateChange = async (item) => {
    // Reset district and city
    setDistricts([]);
    setCities([]);
    setFormData(prev => ({
      ...prev,
      state_id: item.id,
      state: item.name,
      district_id: null,
      district: '',
      city_id: null,
      city: '',
    }));
    await fetchDistricts(token, item.id);
  };

  const handleDistrictChange = async (item) => {
    setCities([]);
    setFormData(prev => ({
      ...prev,
      district_id: item.id,
      district: item.name,
      city_id: null,
      city: '',
    }));
    await fetchCities(token, item.id);
  };

  const handleCityChange = (item) => {
    setFormData(prev => ({
      ...prev,
      city_id: item.id,
      city: item.name,
    }));
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Allow location access');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setFormData(prev => ({
        ...prev,
        latitude: location.coords.latitude.toString(),
        longitude: location.coords.longitude.toString(),
      }));
      Alert.alert('Success', 'Location updated');
    } catch {
      Alert.alert('Error', 'Failed to get location');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // VALIDATION & SUBMIT
  // ─────────────────────────────────────────────────────────────────────────

  const validateForm = () => {
    if (!formData.shopName.trim()) { Alert.alert('Required', 'Enter shop name'); return false; }
    if (!formData.phone.trim()) { Alert.alert('Required', 'Enter phone number'); return false; }
    if (!formData.state_id) { Alert.alert('Required', 'Select a state'); return false; }
    if (!formData.district_id) { Alert.alert('Required', 'Select a district'); return false; }
    if (!formData.city_id) { Alert.alert('Required', 'Select a city'); return false; }
    return true;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        shopName: formData.shopName,
        description: formData.description,
        address: formData.address,
        pincode: formData.pincode,
        phone: formData.phone,
        email: formData.email,
        latitude: formData.latitude,
        longitude: formData.longitude,
        category_id: formData.category_id,
        state_id: formData.state_id,
        district_id: formData.district_id,
        city_id: formData.city_id,
        state: formData.state,
        district: formData.district,
        city: formData.city,
      };

      const res = await fetch(`${API_URL}/api/shop/updateShop/${shopId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (res.ok) {
        Alert.alert('Success', 'Shop updated successfully', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('Error', data.message || data.error || 'Update failed');
      }
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Server error');
    } finally {
      setSaving(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER - Full page loading
  // ─────────────────────────────────────────────────────────────────────────

  if (pageLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={AXIS_COLORS.primary} />
        <Text style={styles.loadingText}>Loading shop details...</Text>
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER - Form
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <View style={styles.backRow}>
              <Text style={styles.backArrow}>←</Text>
              <Text style={styles.backText}>Shop Details</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <View style={styles.headerIconWrap}>
              <Text style={styles.headerIcon}>🏪</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>Edit Shop Details</Text>
              <Text style={styles.headerSubtitle}>Update your shop information</Text>
            </View>
          </View>
        </View>

        {/* ── Form Card ── */}
        <View style={styles.formCard}>

          {/* Shop Name */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>SHOP NAME</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={formData.shopName}
                onChangeText={(v) => handleChange('shopName', v)}
                placeholder="Enter shop name"
                placeholderTextColor={AXIS_COLORS.muted}
              />
            </View>
          </View>

          {/* Category */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>CATEGORY</Text>
            <View style={styles.inputContainer}>
              <Dropdown
                style={styles.dropdown}
                data={categories}
                labelField="name"
                valueField="id"
                placeholder="Select Category"
                placeholderStyle={styles.dropdownPlaceholder}
                selectedTextStyle={styles.dropdownSelected}
                value={formData.category_id}
                onChange={(item) => handleChange('category_id', item.id)}
              />
            </View>
          </View>

          {/* Phone */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>PHONE</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(v) => handleChange('phone', v)}
                placeholder="Enter phone number"
                placeholderTextColor={AXIS_COLORS.muted}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>EMAIL (Optional)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                keyboardType="email-address"
                value={formData.email}
                onChangeText={(v) => handleChange('email', v)}
                placeholder="Enter email address"
                placeholderTextColor={AXIS_COLORS.muted}
              />
            </View>
          </View>

          {/* Description */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>DESCRIPTION (Optional)</Text>
            <View style={[styles.inputContainer, { alignItems: 'flex-start', minHeight: 90 }]}>
              <TextInput
                style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
                value={formData.description}
                onChangeText={(v) => handleChange('description', v)}
                placeholder="Describe your shop"
                placeholderTextColor={AXIS_COLORS.muted}
                multiline
                numberOfLines={4}
              />
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <Text style={styles.dividerLabel}>📍 Location</Text>
          </View>

          {/* STATE */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>STATE</Text>
            <View style={styles.inputContainer}>
              <Dropdown
                style={styles.dropdown}
                data={states}
                labelField="name"
                valueField="id"
                placeholder="Select State"
                placeholderStyle={styles.dropdownPlaceholder}
                selectedTextStyle={styles.dropdownSelected}
                value={formData.state_id}   // ✅ Uses ID for pre-selection
                onChange={handleStateChange}
                search
                searchPlaceholder="Search state..."
              />
            </View>
          </View>

          {/* DISTRICT */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>DISTRICT</Text>
            <View style={[
              styles.inputContainer,
              !formData.state_id && styles.inputDisabled
            ]}>
              <Dropdown
                style={styles.dropdown}
                data={districts}
                labelField="name"
                valueField="id"
                placeholder={formData.state_id ? 'Select District' : 'Select state first'}
                placeholderStyle={styles.dropdownPlaceholder}
                selectedTextStyle={styles.dropdownSelected}
                value={formData.district_id}   // ✅ Uses ID for pre-selection
                onChange={handleDistrictChange}
                disable={!formData.state_id}
                search
                searchPlaceholder="Search district..."
              />
            </View>
          </View>

          {/* CITY */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>CITY</Text>
            <View style={[
              styles.inputContainer,
              !formData.district_id && styles.inputDisabled
            ]}>
              <Dropdown
                style={styles.dropdown}
                data={cities}
                labelField="name"
                valueField="id"
                placeholder={formData.district_id ? 'Select City' : 'Select district first'}
                placeholderStyle={styles.dropdownPlaceholder}
                selectedTextStyle={styles.dropdownSelected}
                value={formData.city_id}    // ✅ Uses ID for pre-selection
                onChange={handleCityChange}
                disable={!formData.district_id}
                search
                searchPlaceholder="Search city..."
              />
            </View>
          </View>

          {/* Address */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>ADDRESS</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={formData.address}
                onChangeText={(v) => handleChange('address', v)}
                placeholder="Enter shop address"
                placeholderTextColor={AXIS_COLORS.muted}
              />
            </View>
          </View>

          {/* Pincode */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>PINCODE (Optional)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={formData.pincode}
                onChangeText={(v) => handleChange('pincode', v)}
                placeholder="Enter pincode"
                placeholderTextColor={AXIS_COLORS.muted}
              />
            </View>
          </View>

          {/* ── Get Location ── */}
          <TouchableOpacity
            style={[styles.locationButton]}
            onPress={getCurrentLocation}
          >
            <Text style={styles.locationButtonText}>📍 Update Current Location</Text>
          </TouchableOpacity>

          {formData.latitude ? (
            <View style={styles.locationInfo}>
              <Text style={styles.locationInfoText}>
                📍 Lat: {parseFloat(formData.latitude).toFixed(4)} | Lng: {parseFloat(formData.longitude).toFixed(4)}
              </Text>
            </View>
          ) : null}

          {/* ── Update Button ── */}
          <TouchableOpacity
            style={[styles.submitButton, saving && styles.buttonDisabled]}
            onPress={handleUpdate}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>✓ Update Shop</Text>
            )}
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AXIS_COLORS.lightBg,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // ── Loading ──
  loadingScreen: {
    flex: 1,
    backgroundColor: AXIS_COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: AXIS_COLORS.muted,
    fontWeight: '500',
  },

  // ── Header ──
  header: {
    backgroundColor: AXIS_COLORS.primary,
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    marginBottom: 16,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backArrow: {
    fontSize: 20,
    color: AXIS_COLORS.white,
    fontWeight: '800',
  },
  backText: {
    fontSize: 14,
    fontWeight: '700',
    color: AXIS_COLORS.white,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: AXIS_COLORS.white,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    fontWeight: '500',
  },

  // ── Form Card ──
  formCard: {
    backgroundColor: AXIS_COLORS.white,
    marginHorizontal: 16,
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },

  // ── Input ──
  inputSection: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: AXIS_COLORS.text,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AXIS_COLORS.lightBg,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: AXIS_COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputDisabled: {
    opacity: 0.5,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: AXIS_COLORS.text,
    fontWeight: '500',
  },

  // ── Dropdown ──
  dropdown: {
    flex: 1,
    height: 24,
  },
  dropdownPlaceholder: {
    fontSize: 14,
    color: AXIS_COLORS.muted,
  },
  dropdownSelected: {
    fontSize: 14,
    color: AXIS_COLORS.text,
    fontWeight: '600',
  },

  // ── Divider ──
  divider: {
    borderTopWidth: 1,
    borderTopColor: AXIS_COLORS.border,
    paddingTop: 16,
    marginBottom: 14,
  },
  dividerLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: AXIS_COLORS.primary,
  },

  // ── Location ──
  locationButton: {
    backgroundColor: '#059669',
    height: 46,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  locationButtonText: {
    color: AXIS_COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  locationInfo: {
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  locationInfoText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '600',
  },

  // ── Submit ──
  submitButton: {
    backgroundColor: AXIS_COLORS.primary,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: AXIS_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: AXIS_COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
