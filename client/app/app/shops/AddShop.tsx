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
import { AXIS_COLORS } from '../../../constants/colors'


export default function AddShopScreen() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [formData, setFormData] = useState({
    shopName: '',
    description: '',
    address: '',
    city: '',
    district: '',
    state: '',
    city_id: '',
    district_id: '',
    state_id: '',
    pincode: '',
    phone: '',
    email: '',
    latitude: '',
    longitude: '',
    category_id: ''
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedState, setSelectedState] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  useEffect(() => {
    const init = async () => {
      const t = await AsyncStorage.getItem('userToken');

      if (!t) {
        Alert.alert('Error', 'Token not found. Please login again');
        return;
      }

      setToken(t);
      await fetchStates(t);
      await fetchCategories(t);
      setInitialLoading(false);
    };

    init();
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // ────────── API ──────────

  const fetchStates = async (t) => {
    try {
      const res = await fetch(`${API_URL}/api/shop/states`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      const data = await res.json();
      setStates(data);
    } catch {
      Alert.alert('Error', 'Failed to load states');
    }
  };

  const fetchCategories = async (t) => {
    try {
      const res = await fetch(`${API_URL}/api/shop/categories`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      const data = await res.json();
      setCategories(data);
    } catch {
      Alert.alert('Error', 'Failed to load categories');
    }
  };

  const fetchDistricts = async (authToken, stateId) => {
    try {
      const res = await fetch(`${API_URL}/api/shop/districts/${stateId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();

      if (Array.isArray(data)) {
        setDistricts(data);
      } else {
        setDistricts([]);
      }
    } catch {
      Alert.alert('Error', 'Failed to load districts');
    }
  };

  const fetchCities = async (authToken, districtId) => {
    try {
      const res = await fetch(`${API_URL}/api/shop/cities/${districtId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setCities(data);
      } else {
        setCities([]);
      }
    } catch {
      Alert.alert('Error', 'Failed to load cities');
    }
  };

  // ────────── VALIDATION ──────────

  const validateForm = () => {
    if (!formData.shopName) return Alert.alert('Required', 'Enter shop name');
    if (!formData.phone) return Alert.alert('Required', 'Enter phone');
    if (!formData.state) return Alert.alert('Required', 'Select state');
    if (!formData.district) return Alert.alert('Required', 'Select district');
    if (!formData.city) return Alert.alert('Required', 'Select city');
    if (!formData.latitude) return Alert.alert('Required', 'Get current location');
    return true;
  };

  // ────────── SUBMIT ──────────

  const handleSaveShop = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const url = `${API_URL}/api/shop/addShops`

      const method = 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (response.ok) {
        Alert.alert(
          'Success', 'Shop added successfully'
        );
        router.push('/app/dashboard/Dashboard');
      } else {
        Alert.alert('Error', data.error || data.message || 'Failed');
      }
    } catch (error) {
      console.error('ERROR:', error);
      Alert.alert('Error', 'Server error');
    }

    setLoading(false);
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Allow location access');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});

      const lat = location.coords.latitude;
      const lng = location.coords.longitude;

      setFormData(prev => ({
        ...prev,
        latitude: lat.toString(),
        longitude: lng.toString(),
      }));

      Alert.alert('Success', 'Location fetched');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to get location');
    }
  };

  // ────────── UI ──────────

  if (initialLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={AXIS_COLORS.primary} />
        <Text style={{ textAlign: 'center', marginTop: 12, color: AXIS_COLORS.text }}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <View style={styles.backRow}>
              <Text style={styles.backArrow}>←</Text>
              <Text style={styles.backText}>My Shops</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <View style={styles.headerIconWrap}>
              <Text style={styles.headerIcon}>🏪</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>
                Register Your Shop
              </Text>
              <Text style={styles.headerSubtitle}>
                Create a new shop profile
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.formCard}>
          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>💡</Text>
            <Text style={styles.infoText}>
              To ensure accuracy, please add the shop while you are physically present at the location.
            </Text>
          </View>
          {/* Shop Name */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>SHOP NAME</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={formData.shopName}
                onChangeText={(v) => handleChange('shopName', v)}
                placeholder="Enter shop name"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Category */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Shop Category</Text>
            <View style={styles.inputContainer}>
              <Dropdown
                style={{ flex: 1 }}
                data={categories}
                labelField="name"
                valueField="id"
                placeholder="Select Category"
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
                placeholderTextColor="#999"
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
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Description */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>DESCRIPTION (Optional)</Text>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(v) => handleChange('description', v)}
                placeholder="Describe your shop"
                multiline
                numberOfLines={4}
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* STATE */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>STATE</Text>
            <View style={styles.inputContainer}>
              <Dropdown
                style={{ flex: 1 }}
                data={states}
                labelField="name"
                valueField="id"
                placeholder="Select State"
                value={selectedState}
                onChange={(item) => {
                  setSelectedState(item.id);
                  handleChange('state', item.name);
                  handleChange('state_id', item.id);      // ✅ ADD

                  setSelectedDistrict(null);
                  setDistricts([]);
                  setCities([]);
                  handleChange('district', '');
                  handleChange('district_id', '');        // ✅ ADD
                  handleChange('city', '');
                  handleChange('city_id', '');
                  fetchDistricts(token, item.id);          // ✅ ADD
                }}
              />
            </View>
          </View>

          {/* DISTRICT */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>DISTRICT</Text>
            <View style={styles.inputContainer}>
              <Dropdown
                style={{ flex: 1 }}
                data={districts}
                labelField="name"
                valueField="id"
                placeholder="Select District"
                value={selectedDistrict}
                onChange={(item) => {
                  setSelectedDistrict(item.id);
                  handleChange('district', item.name);
                  handleChange('district_id', item.id);   // ✅ ADD

                  setCities([]);
                  handleChange('city', '');
                  handleChange('city_id', '');            // ✅ ADD

                  fetchCities(token, item.id);
                }}
              />
            </View>
          </View>

          {/* CITY */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>💡</Text>
            <Text style={styles.infoText}>
              Choose your city so customers can find your shop easily.
            </Text>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>CITY</Text>
            <View style={styles.inputContainer}>
              <Dropdown
                style={{ flex: 1 }}
                data={cities}
                labelField="name"
                valueField="id"
                placeholder="Select City"
                value={formData.city}
                onChange={(item) => {
                  handleChange('city', item.name);
                  handleChange('city_id', item.id);       // ✅ ADD
                }}
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
                placeholderTextColor="#999"
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
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Get Location Button */}

          <TouchableOpacity
            style={[styles.submitButton, { marginTop: 10, backgroundColor: '#059669' }]}
            onPress={getCurrentLocation}
          >
            <Text style={styles.submitButtonText}>📍 Get Current Location</Text>
          </TouchableOpacity>

          {formData.latitude ? (
            <View style={styles.locationInfo}>
              <Text style={styles.locationInfoText}>
                📍 Lat: {formData.latitude} | Lng: {formData.longitude}
              </Text>
            </View>
          ) : null}


          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSaveShop}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                Register Shop
              </Text>
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

  header: {
    backgroundColor: AXIS_COLORS.primary,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
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
  textAreaContainer: {
    alignItems: 'flex-start',
    minHeight: 90,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: AXIS_COLORS.text,
    fontWeight: '500',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingVertical: 8,
  },

  // ── Location Info ──
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

  // ── Buttons ──
  submitButton: {
    backgroundColor: AXIS_COLORS.primary,
    height: 48,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: AXIS_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  submitButtonText: {
    color: AXIS_COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },

  // ── Info Box ──
  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: '#EFF6FF', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#BFDBFE', marginBottom: 16,
  },
  infoIcon: { fontSize: 16, marginTop: 1 },
  infoText: { flex: 1, fontSize: 12, color: '#1D4ED8', fontWeight: '500', lineHeight: 18 },


});
