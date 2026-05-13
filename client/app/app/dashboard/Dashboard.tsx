import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  ActivityIndicator, Dimensions, FlatList, Modal,
  RefreshControl, ScrollView, StyleSheet, Text,
  TextInput, Alert, TouchableOpacity, View,
} from 'react-native';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AXIS_COLORS } from '../../../constants/colors';
import BannerSlider from './BannerSlider'; // ← Import the updated component

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const { width } = Dimensions.get('window');

const ACCENT_COLORS = ['#003DA5', '#16A34A', '#D97706', '#DC2626', '#7C3AED', '#0891B2'];
const PAGE_LIMIT = 10;

export default function DashboardScreen() {
  const router = useRouter();

  // ── Existing State ──
  const [offers, setOffers] = useState([]);
  const [searchRadius, setSearchRadius] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [hasShop, setHasShop] = useState(false);
  const [userName, setUserName] = useState('Guest');
  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);

  // State and city filter
  const [filterModal, setFilterModal] = useState(false);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);

  const [selectedState, setSelectedState] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  const [appliedState, setAppliedState] = useState(null);
  const [appliedDistrict, setAppliedDistrict] = useState(null);
  const [appliedCity, setAppliedCity] = useState(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const insets = useSafeAreaInsets();

  const isFetchingRef = useRef(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const isLocationFilterApplied =
    selectedState !== null ||
    selectedDistrict !== null ||
    selectedCity !== null;

  // ── Initial load ──
  useEffect(() => {
    loadInitialData();
    fetchStates();
  }, []);

  // ── Fetch when location ready OR filters change ──
  useEffect(() => {
    if (!isLocationLoading && userLat !== null && userLng !== null) {
      resetAndFetch();
    }
  }, [
    isLocationLoading,
    userLat,
    userLng,
    debouncedSearch,
    searchRadius,
    selectedCategory,
    appliedState,
    appliedDistrict,
    appliedCity,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadInitialData = async () => {
    setLoading(true);
    await getCurrentLocation();
    await fetchCategories();
  };

  const resetAndFetch = () => {
    setOffers([]);
    setPage(1);
    setHasMoreData(true);
    fetchOffers(1, true);
  };

  const getCurrentLocation = async () => {
    try {
      setIsLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Allow location access');
        setIsLocationLoading(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 5000,
      });
      if (!location?.coords?.latitude) {
        Alert.alert('Error', 'Unable to fetch location');
        setIsLocationLoading(false);
        return;
      }
      setUserLat(location.coords.latitude);
      setUserLng(location.coords.longitude);
    } catch (error) {
      console.log('LOCATION ERROR:', error);
      Alert.alert('Error', 'Failed to get location');
    } finally {
      setIsLocationLoading(false);
    }
  };

  const fetchOffers = async (pageNum = 1, isReset = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      if (isReset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const token = await AsyncStorage.getItem('userToken');
      const name = await AsyncStorage.getItem('userName');
      if (!token) throw new Error('Not authenticated');
      setUserName(name);

      const url = `${API_URL}/api/dashboard/getOffers?lat=${userLat}&lng=${userLng}&radius=${searchRadius}&search=${debouncedSearch}&category=${selectedCategory || ''}&state=${appliedState || ''}&district=${appliedDistrict || ''}&city=${appliedCity || ''}&page=${pageNum}&limit=${PAGE_LIMIT}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error(await response.text());

      const data = await response.json();
      const newOffers = Array.isArray(data) ? data : (data.data || []);

      if (isReset) {
        setOffers(newOffers);
      } else {
        setOffers(prev => [...prev, ...newOffers]);
      }

      if (newOffers.length < PAGE_LIMIT) {
        setHasMoreData(false);
      } else {
        setHasMoreData(true);
      }
    } catch (error) {
      console.log('API ERROR:', error);
      if (isReset) setOffers([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isFetchingRef.current = false;
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // BANNER HANDLER
  // ═══════════════════════════════════════════════════════════════════════════

  const handleBannerPress = (banner) => {
    try {
      switch (banner.action_type) {
        case 'category':
          // Filter by category
          setSelectedCategory(parseInt(banner.action_value));
          break;
        case 'search':
          // Perform search
          setSearchQuery(banner.action_value);
          break;
        case 'url':
          // Navigate to URL
          router.push(banner.action_value);
          break;
        default:
          console.log('Unknown banner action:', banner.action_type);
      }
    } catch (error) {
      console.log('Error handling banner press:', error);
    }
  };

  const renderOfferCard = ({ item, index }) => {
    const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];
    const isAmber = accent === '#D97706';
    const isGreen = accent === '#16A34A';
    const couponBg = isAmber ? '#FFFBEB' : isGreen ? '#F0FDF4' : '#EFF6FF';
    const couponBorder = isAmber ? '#FCD34D' : isGreen ? '#86EFAC' : '#BFDBFE';
    const couponTextColor = isAmber ? '#B45309' : isGreen ? '#15803D' : '#1D4ED8';

    return (
      <TouchableOpacity
        style={styles.offerCard}
        activeOpacity={0.72}
        onPress={() => {
          router.push({
            pathname: '/app/offers/OfferDetailsScreen',
            params: { offerId: item.id },
          });
        }}
      >
        <View style={[styles.cardStrip, { backgroundColor: accent }]} />
        <View style={styles.cardBody}>
          <View style={styles.cardTopRow}>
            <View style={styles.shopRow}>
              <Text style={styles.byText}>by </Text>
              <Text style={[styles.shopName, { color: accent }]} numberOfLines={1}>
                {item.shop_name}
              </Text>
            </View>
            <View style={[styles.statusDot, { backgroundColor: item.isOpen ? '#22C55E' : '#EF4444' }]} />
          </View>

          <Text style={styles.offerTitle} numberOfLines={2}>
            {item.title}
          </Text>

          <View style={styles.dividerRow}>
            <Text style={styles.scissorIcon}>✂</Text>
            <View style={styles.dashedLine} />
          </View>

          <View style={styles.cardBottomRow}>
            <View style={[styles.discountBlock, { backgroundColor: accent }]}>
              <Text style={styles.discountValue}>
                {item.discount_percentage
                  ? `${item.discount_percentage}%`
                  : `₹${item.discount_amount}`}
              </Text>
              <Text style={styles.discountOff}>OFF</Text>
            </View>

            <View style={styles.cardMeta}>
              {item.coupon_code && (
                <View style={[styles.couponTag, { backgroundColor: couponBg, borderColor: couponBorder }]}>
                  <Text style={[styles.couponLabel, { color: couponTextColor }]}>CODE</Text>
                  <View style={[styles.couponDivider, { backgroundColor: couponBorder }]} />
                  <Text style={[styles.couponCode, { color: couponTextColor }]}>
                    {item.coupon_code}
                  </Text>
                </View>
              )}
              <View style={styles.expiryRow}>
                <Text style={styles.expiryIcon}>📅</Text>
                <Text style={styles.expiryText}>
                  Valid till {formatDate(item.valid_until)}
                </Text>
              </View>
            </View>

            <View style={[styles.arrowBtn, { borderColor: accent }]}>
              <Text style={[styles.arrowBtnText, { color: accent }]}>›</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const fetchStates = async () => {
    try {
      const t = await AsyncStorage.getItem('userToken');
      const res = await fetch(`${API_URL}/api/shop/states`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      const data = await res.json();
      setStates(data);
    } catch {
      Alert.alert('Error', 'Failed to load states');
    }
  };

  const fetchDistricts = async (stateId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const res = await fetch(`${API_URL}/api/shop/districts/${stateId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDistricts(Array.isArray(data) ? data : []);
    } catch {
      Alert.alert('Error', 'Failed to load districts');
    }
  };

  const fetchCities = async (districtId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const res = await fetch(`${API_URL}/api/shop/cities/${districtId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCities(Array.isArray(data) ? data : []);
    } catch {
      Alert.alert('Error', 'Failed to load cities');
    }
  };

  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMoreData || isFetchingRef.current) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchOffers(nextPage, false);
  }, [page, loadingMore, hasMoreData]);

  const fetchCategories = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const res = await fetch(`${API_URL}/api/shop/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(await res.json());
    } catch (e) {}
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-GB', { month: 'short' });
    const year = String(date.getFullYear()).slice(-2);
    return `${day} ${month} '${year}`;
  };

  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={AXIS_COLORS.primary} />
          <Text style={styles.footerText}>Loading more offers...</Text>
        </View>
      );
    }

    if (!hasMoreData && offers.length > 0) {
      return (
        <View style={styles.footerEnd}>
          <View style={styles.footerLine} />
          <Text style={styles.footerEndText}>You've seen all offers nearby</Text>
          <View style={styles.footerLine} />
        </View>
      );
    }

    return null;
  };

  const renderProfileMenu = () => (
    <Modal
      visible={profileMenuVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setProfileMenuVisible(false)}
    >
      <TouchableOpacity
        style={styles.menuOverlay}
        activeOpacity={1}
        onPress={() => setProfileMenuVisible(false)}
      >
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <View style={styles.menuContainer}>
            <View style={styles.menuHandle} />

            <View style={styles.menuHeader}>
              <TouchableOpacity onPress={() => setProfileMenuVisible(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.menuTitle}>Menu</Text>
              <View style={{ width: 24 }} />
            </View>

            <View style={styles.menuUserInfo}>
              <View style={styles.menuAvatar}>
                <Text style={styles.menuAvatarText}>
                  {userName?.[0]?.toUpperCase() || 'G'}
                </Text>
              </View>
              <View>
                <Text style={styles.menuUserName}>{userName}</Text>
                <Text style={styles.menuUserSub}>View Profile →</Text>
              </View>
            </View>

            {[
              {
                icon: '👤',
                label: 'My Profile',
                action: () => router.push('/app/users/ViewProfileScreen'),
              },
              { icon: '🏪', label: 'Add Shop', action: () => router.push('/app/shops/AddShop') },
              {
                icon: '➕',
                label: 'Post Offers',
                action: () => router.push('/app/offers/AddOffer'),
              },
              {
                icon: '🏪',
                label: 'Shop Details',
                action: () => router.push('/app/shops/MyShopsScreen'),
              },
              {
                icon: '📋',
                label: 'My Offers',
                action: () => router.push('/app/offers/MyOffer'),
              },
              {
                icon: '🔐',
                label: 'Change Password',
                action: () => router.push('/app/users/ChangePasswordScreen'),
              },
              { icon: '⚙️', label: 'Settings', action: () => {} },
            ].map(({ icon, label, action }) => (
              <TouchableOpacity
                key={label}
                style={styles.menuItem}
                onPress={() => {
                  action();
                  setProfileMenuVisible(false);
                }}
              >
                <Text style={styles.menuItemIcon}>{icon}</Text>
                <Text style={styles.menuItemText}>{label}</Text>
                <Text style={styles.menuItemArrow}>›</Text>
              </TouchableOpacity>
            ))}

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                AsyncStorage.removeItem('userToken');
                setProfileMenuVisible(false);
                router.push('/preLogin/login');
              }}
            >
              <Text style={styles.menuItemIcon}>🚪</Text>
              <Text style={[styles.menuItemText, { color: '#DC2626' }]}>
                Logout
              </Text>
              <Text style={styles.menuItemArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN RENDER - LAYOUT: HEADER → SEARCH → BANNER → OFFERS
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <>
      {loading || isLocationLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={AXIS_COLORS.primary} />
          <Text style={styles.loadingText}>
            {isLocationLoading ? 'Getting your location...' : 'Loading offers...'}
          </Text>
        </View>
      ) : (
        <View style={styles.container}>
          {/* ── HEADER ── */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Hello, {userName} 👋</Text>
              <Text style={styles.headerSub}>Deals near you</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.postBtn}
                onPress={() => router.push(hasShop ? '/app/AddOffer' : '/app/AddShop')}
              >
                <Text style={styles.postBtnIcon}>
                  {hasShop ? '➕' : '🏪'}
                </Text>
                <Text style={styles.postBtnText}>
                  {hasShop ? 'Post Offer' : 'Add Shop'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.avatarBtn}
                onPress={() => setProfileMenuVisible(true)}
              >
                <Text style={styles.avatarText}>
                  {userName?.[0]?.toUpperCase() || 'G'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── SEARCH BAR (ABOVE BANNER) ── */}
          <View style={styles.searchRow}>
            <View style={styles.searchBar}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search offers or shops..."
                placeholderTextColor={AXIS_COLORS.muted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Text style={styles.clearIcon}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.filterBtn,
                (selectedState || selectedDistrict || selectedCity) &&
                  styles.filterBtnActive,
              ]}
              onPress={() => setFilterModal(true)}
            >
              <MaterialCommunityIcons
                name={
                  appliedState ||
                  appliedDistrict ||
                  appliedCity
                    ? 'filter-check'
                    : 'filter-outline'
                }
                size={22}
                color={
                  appliedState || appliedDistrict || appliedCity
                    ? '#fff'
                    : '#003DA5'
                }
              />
            </TouchableOpacity>
          </View>

          {/* ── FLATLIST: BANNER → FILTERS → OFFERS ── */}
          <FlatList
            data={offers}
            renderItem={renderOfferCard}
            keyExtractor={(item) => item.id.toString()}
            style={{ backgroundColor: AXIS_COLORS.cardBg }}
            contentContainerStyle={{ paddingBottom: 20 }}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={renderFooter}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  setSelectedCategory(null);
                  resetAndFetch();
                  setTimeout(() => setRefreshing(false), 1000);
                }}
                tintColor={AXIS_COLORS.primary}
              />
            }
            // ══════════════════════════════════════════════════════════════
            // 👇 LIST HEADER: BANNER + FILTERS
            // ══════════════════════════════════════════════════════════════
            ListHeaderComponent={() => (
              <View>
                {/* 🎉 BANNER SLIDER - FETCHES FROM SERVER 🎉 */}
                <BannerSlider onBannerPress={handleBannerPress} />

                {/* Radius Filter */}
                {!isLocationFilterApplied && (
                  <View style={styles.filterSection}>
                    <View style={styles.filterHeader}>
                      <Text style={styles.filterLabel}>📍 Search Radius</Text>
                      <Text style={styles.radiusVal}>{searchRadius} km</Text>
                    </View>
                    <View style={styles.radiusPills}>
                      {[1, 2, 5, 10].map((r) => (
                        <TouchableOpacity
                          key={r}
                          style={[
                            styles.radiusPill,
                            searchRadius === r && styles.radiusPillActive,
                          ]}
                          onPress={() => setSearchRadius(r)}
                        >
                          <Text
                            style={[
                              styles.radiusPillText,
                              searchRadius === r &&
                                styles.radiusPillTextActive,
                            ]}
                          >
                            {r} km
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* Categories */}
                {categories.length > 0 && (
                  <View style={styles.filterSection}>
                    <Text style={styles.filterLabel}>Categories</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={{ marginTop: 8 }}
                    >
                      <TouchableOpacity
                        style={[
                          styles.catPill,
                          selectedCategory === null &&
                            styles.catPillActive,
                        ]}
                        onPress={() => setSelectedCategory(null)}
                      >
                        <Text
                          style={[
                            styles.catPillText,
                            selectedCategory === null &&
                              styles.catPillTextActive,
                          ]}
                        >
                          All
                        </Text>
                      </TouchableOpacity>
                      {categories.map((cat) => (
                        <TouchableOpacity
                          key={cat.id}
                          style={[
                            styles.catPill,
                            selectedCategory === cat.id &&
                              styles.catPillActive,
                          ]}
                          onPress={() => setSelectedCategory(cat.id)}
                        >
                          <Text
                            style={[
                              styles.catPillText,
                              selectedCategory === cat.id &&
                                styles.catPillTextActive,
                            ]}
                          >
                            {cat.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Offers Count */}
                <View style={styles.offersHeader}>
                  <Text style={styles.offersLabel}>Nearby Offers</Text>
                  {offers.length > 0 && (
                    <View style={styles.offersBadge}>
                      <Text style={styles.offersBadgeText}>
                        {offers.length} loaded
                      </Text>
                    </View>
                  )}
                </View>

                {/* Empty State */}
                {!loading && offers.length === 0 && (
                  <View style={styles.centerState}>
                    <Text style={styles.emptyIcon}>🗺️</Text>
                    <Text style={styles.emptyTitle}>No offers nearby</Text>
                    <Text style={styles.emptySub}>
                      Try increasing the radius or clear your filters
                    </Text>
                  </View>
                )}
              </View>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            showsVerticalScrollIndicator={false}
            style={styles.flatList}
          />

          {renderProfileMenu()}

          {/* Filter Modal */}
          <Modal
            visible={filterModal}
            transparent
            animationType="slide"
          >
            <View style={styles.modalOverlay}>
              <TouchableOpacity
                style={StyleSheet.absoluteFill}
                onPress={() => setFilterModal(false)}
              />

              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Filter Location</Text>

                {/* STATE */}
                <Text style={styles.sectionTitle}>State</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                >
                  {states.map((s) => (
                    <TouchableOpacity
                      key={s.id}
                      style={[
                        styles.filterChip,
                        selectedState === s.id && styles.filterChipActive,
                      ]}
                      onPress={() => {
                        setSelectedState(s.id);
                        setSelectedDistrict(null);
                        setSelectedCity(null);
                        fetchDistricts(s.id);
                      }}
                    >
                      <Text
                        style={
                          selectedState === s.id && styles.activeText
                        }
                      >
                        {s.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* DISTRICT */}
                <Text style={styles.sectionTitle}>District</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                >
                  {districts.map((d) => (
                    <TouchableOpacity
                      key={d.id}
                      style={[
                        styles.filterChip,
                        selectedDistrict === d.id &&
                          styles.filterChipActive,
                      ]}
                      onPress={() => {
                        setSelectedDistrict(d.id);
                        setSelectedCity(null);
                        fetchCities(d.id);
                      }}
                    >
                      <Text
                        style={
                          selectedDistrict === d.id && styles.activeText
                        }
                      >
                        {d.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* CITY */}
                <Text style={styles.sectionTitle}>City</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                >
                  {cities.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={[
                        styles.filterChip,
                        selectedCity === c.id && styles.filterChipActive,
                      ]}
                      onPress={() => setSelectedCity(c.id)}
                    >
                      <Text
                        style={
                          selectedCity === c.id && styles.activeText
                        }
                      >
                        {c.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* ACTIONS */}
                <View style={{ flexDirection: 'row', marginTop: 20 }}>
                  <TouchableOpacity
                    style={styles.applyBtn}
                    onPress={() => {
                      setAppliedState(selectedState);
                      setAppliedDistrict(selectedDistrict);
                      setAppliedCity(selectedCity);
                      setFilterModal(false);
                    }}
                  >
                    <Text style={{ color: '#fff' }}>Apply</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.clearBtn}
                    onPress={() => {
                      setSelectedState(null);
                      setSelectedDistrict(null);
                      setSelectedCity(null);
                      setDistricts([]);
                      setCities([]);
                      setAppliedState(null);
                      setAppliedDistrict(null);
                      setAppliedCity(null);
                      setFilterModal(false);
                    }}
                  >
                    <Text>Clear</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      )}
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// STYLES (Keep all your existing styles + add new ones below)
// ═════════════════════════════════════════════════════════════════════════════


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AXIS_COLORS.white },
  flatList: { paddingHorizontal: 16 },

  // Header
  header: {
    backgroundColor: AXIS_COLORS.primary,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: { fontSize: 18, fontWeight: '800', color: '#fff' },
  headerSub: {
    fontSize: 12,
    color: '#fff',
    marginTop: 2,
    fontWeight: '500',
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  postBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: AXIS_COLORS.lightBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  postBtnIcon: { fontSize: 14 },
  postBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: AXIS_COLORS.primary,
  },
  avatarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: AXIS_COLORS.primary,
    fontSize: 14,
    fontWeight: '800',
  },

  // Search
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: AXIS_COLORS.border,
    height: 46,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: AXIS_COLORS.text,
    fontWeight: '500',
  },
  clearIcon: {
    fontSize: 16,
    color: AXIS_COLORS.muted,
  },
  filterBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F1F8',
    borderWidth: 1.5,
    borderColor: AXIS_COLORS.border,
  },
  filterBtnActive: {
    backgroundColor: AXIS_COLORS.primary,
    borderColor: AXIS_COLORS.primary,
  },

  // Filters
  filterSection: { paddingHorizontal: 16, marginTop: 14 },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: AXIS_COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  radiusVal: { fontSize: 12, fontWeight: '800', color: AXIS_COLORS.primary },
  radiusPills: { flexDirection: 'row', gap: 8 },
  radiusPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    backgroundColor: AXIS_COLORS.white,
    borderWidth: 1.5,
    borderColor: AXIS_COLORS.border,
    alignItems: 'center',
  },
  radiusPillActive: {
    backgroundColor: AXIS_COLORS.primary,
    borderColor: AXIS_COLORS.primary,
  },
  radiusPillText: { fontSize: 11, fontWeight: '700', color: AXIS_COLORS.muted },
  radiusPillTextActive: { color: '#fff' },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: AXIS_COLORS.white,
    borderRadius: 20,
    marginRight: 7,
    borderWidth: 1.5,
    borderColor: AXIS_COLORS.border,
  },
  catPillActive: {
    backgroundColor: AXIS_COLORS.primary,
    borderColor: AXIS_COLORS.primary,
  },
  catPillText: { fontSize: 12, fontWeight: '600', color: AXIS_COLORS.muted },
  catPillTextActive: { color: '#fff' },

  // Offers
  offersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  offersLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: AXIS_COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  offersBadge: {
    backgroundColor: '#E8F1F8',
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  offersBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: AXIS_COLORS.primary,
  },

  // Offer Card
  offerCard: {
    backgroundColor: AXIS_COLORS.white,
    borderRadius: 14,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: AXIS_COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardStrip: { width: 5 },
  cardBody: { flex: 1, padding: 12 },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  byText: { fontSize: 11, color: AXIS_COLORS.muted },
  shopName: {
    fontSize: 11,
    fontWeight: '800',
    textDecorationLine: 'underline',
    flexShrink: 1,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  offerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: AXIS_COLORS.text,
    lineHeight: 19,
    marginBottom: 9,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 9,
  },
  scissorIcon: { fontSize: 11, color: '#C8D8E8' },
  dashedLine: {
    flex: 1,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#D8E6F5',
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  discountBlock: {
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    minWidth: 52,
  },
  discountValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
    lineHeight: 19,
  },
  discountOff: {
    fontSize: 8,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 1,
  },
  cardMeta: { flex: 1, gap: 4 },
  couponTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  couponLabel: { fontSize: 8, fontWeight: '800', letterSpacing: 0.5 },
  couponDivider: { width: 1, height: 10 },
  couponCode: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  expiryRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  expiryIcon: { fontSize: 10 },
  expiryText: {
    fontSize: 10,
    color: AXIS_COLORS.muted,
    fontWeight: '600',
  },
  arrowBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: AXIS_COLORS.lightBg,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowBtnText: { fontSize: 19, fontWeight: '800', lineHeight: 21 },

  // Pagination
  footerLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  footerText: { fontSize: 12, color: AXIS_COLORS.muted, fontWeight: '600' },
  footerEnd: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 10,
  },
  footerLine: {
    flex: 1,
    height: 1,
    backgroundColor: AXIS_COLORS.border,
  },
  footerEndText: {
    fontSize: 11,
    color: AXIS_COLORS.muted,
    fontWeight: '600',
  },

  // States
  centerState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 30 },
  loadingText: {
    fontSize: 13,
    color: AXIS_COLORS.muted,
    marginTop: 12,
    fontWeight: '500',
  },
  emptyIcon: { fontSize: 52, marginBottom: 12 },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: AXIS_COLORS.text,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 12,
    color: AXIS_COLORS.muted,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Menu
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: AXIS_COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  menuHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: AXIS_COLORS.border,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: AXIS_COLORS.border,
  },
  closeBtn: { fontSize: 22, color: AXIS_COLORS.muted },
  menuTitle: { fontSize: 16, fontWeight: '800', color: AXIS_COLORS.text },
  menuUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: AXIS_COLORS.lightBg,
  },
  menuAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AXIS_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuAvatarText: { color: '#fff', fontSize: 20, fontWeight: '800' },
  menuUserName: {
    fontSize: 15,
    fontWeight: '800',
    color: AXIS_COLORS.text,
  },
  menuUserSub: {
    fontSize: 12,
    color: AXIS_COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: AXIS_COLORS.border,
  },
  menuItemIcon: { fontSize: 18, marginRight: 14, width: 24 },
  menuItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: AXIS_COLORS.text,
  },
  menuItemArrow: { fontSize: 18, color: AXIS_COLORS.muted },
  menuDivider: {
    height: 1,
    backgroundColor: AXIS_COLORS.border,
    marginVertical: 6,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
    color: AXIS_COLORS.text,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: AXIS_COLORS.muted,
    marginTop: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: AXIS_COLORS.border,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  filterChipActive: {
    backgroundColor: AXIS_COLORS.primary,
    borderColor: AXIS_COLORS.primary,
  },
  activeText: { color: '#fff', fontWeight: '600' },
  applyBtn: {
    flex: 1,
    backgroundColor: '#003DA5',
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearBtn: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
