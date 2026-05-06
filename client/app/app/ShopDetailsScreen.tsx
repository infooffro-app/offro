import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const AXIS_COLORS = {
  primary: '#003DA5',
  secondary: '#4A90E2',
  lightBg: '#F0F4FB',
  cardBg: '#F4F6FB',
  text: '#1A1A1A',
  white: '#FFFFFF',
  border: '#D8E6F5',
  muted: '#8A9BB0',
};

export default function ShopDetailsScreen() {
  const router = useRouter();
  const { shopId } = useLocalSearchParams();

  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');

  useEffect(() => {
    const init = async () => {
      const t = await AsyncStorage.getItem('userToken');
      setToken(t);

      if (shopId) {
        fetchShopDetails(t, shopId);
      }
    };

    init();
  }, [shopId]);

  const fetchShopDetails = async (authToken, id) => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/shop/getShop/${id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch shop details');
      }

      const data = await response.json();
      setShop(data.data || data);
    } catch (error) {
      console.error('Error fetching shop:', error);
      Alert.alert('Error', 'Failed to load shop details');
    } finally {
      setLoading(false);
    }
  };

  const handleEditShop = () => {
    router.push({
      pathname: '/app/EditShopScreen',
      params: { 
        shopId: shop?.id,
        mode: 'edit',
        shopData: JSON.stringify(shop)
      },
    });
  };

  const handleDeleteShop = () => {
    Alert.alert(
      'Delete Shop',
      'Are you sure you want to delete this shop? This action cannot be undone.',
      [
        { text: 'Cancel', onPress: () => { }, style: 'cancel' },
        {
          text: 'Delete',
          onPress: deleteShop,
          style: 'destructive',
        },
      ]
    );
  };

  const deleteShop = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/shop/getShop/${shop.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete shop');
      }

      Alert.alert('Success', 'Shop deleted successfully');
      router.push('/app/MyShopsScreen');
    } catch (error) {
      console.error('Error deleting shop:', error);
      Alert.alert('Error', 'Failed to delete shop');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={AXIS_COLORS.primary} />
          <Text style={styles.loadingText}>Loading shop details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!shop) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerState}>
          <Text style={styles.emptyTitle}>Shop Not Found</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/app/MyShopsScreen')}
          >
            <Text style={styles.createButtonText}>Back to Shops</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
            <Text style={styles.headerTitle}>Shop Details</Text>
            <Text style={styles.headerSubtitle}>View and manage your shop information</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Shop Header Card */}
        <View style={styles.shopHeaderCard}>
          <View style={styles.shopHeaderTop}>
            <View style={styles.shopHeaderInfo}>
              <Text style={styles.shopNameBig}>{shop.shop_name}</Text>
              <Text style={styles.shopLocation}>
                {shop.city}, {shop.state}
              </Text>
            </View>
            <View style={[
              styles.statusBadge,
              { backgroundColor: shop.active == 1 ? '#22C55E' : '#EF4444' }
            ]}>
              <Text style={styles.statusText}>
                {shop.active == 1? '● Active' : '● Inactive'}
              </Text>
            </View>
          </View>
        </View>

        {/* Details Sections */}

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📞 Contact Information</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phone</Text>
            <Text style={styles.detailValue}>{shop.phone || 'N/A'}</Text>
          </View>

          {shop.email && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailValue}>{shop.email}</Text>
            </View>
          )}
        </View>

        {/* Location Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Location</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Address</Text>
            <Text style={styles.detailValue}>{shop.address || 'N/A'}</Text>
          </View>

          <View style={styles.locationGrid}>
            <View style={styles.locationCard}>
              <Text style={styles.locationLabel}>City</Text>
              <Text style={styles.locationValue}>{shop.city || 'N/A'}</Text>
            </View>
            <View style={styles.locationCard}>
              <Text style={styles.locationLabel}>District</Text>
              <Text style={styles.locationValue}>{shop.district || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.locationGrid}>
            <View style={styles.locationCard}>
              <Text style={styles.locationLabel}>State</Text>
              <Text style={styles.locationValue}>{shop.state || 'N/A'}</Text>
            </View>
            <View style={styles.locationCard}>
              <Text style={styles.locationLabel}>Pincode</Text>
              <Text style={styles.locationValue}>{shop.pincode || 'N/A'}</Text>
            </View>
          </View>

          {shop.latitude && shop.longitude && (
            <View style={styles.coordinatesBox}>
              <Text style={styles.coordinatesLabel}>Coordinates</Text>
              <Text style={styles.coordinatesValue}>
                📍 {parseFloat(shop.latitude).toFixed(4)}, {parseFloat(shop.longitude).toFixed(4)}
              </Text>
            </View>
          )}
        </View>

        {/* About Shop */}
        {shop.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 About</Text>
            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionText}>{shop.description}</Text>
            </View>
          </View>
        )}

        {/* Category */}
        {shop.category_name && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏷️ Category</Text>
            <View style={styles.categoryBox}>
              <Text style={styles.categoryText}>{shop.category_name}</Text>
            </View>
          </View>
        )}

        {/* Meta Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ Information</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Shop ID</Text>
            <Text style={styles.detailValue}>#{shop.id}</Text>
          </View>

          {shop.created_at && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Created</Text>
              <Text style={styles.detailValue}>
                {new Date(shop.created_at).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleEditShop}
        >
          <Text style={styles.actionButtonIcon}>✏️</Text>
          <Text style={styles.actionButtonText}>Edit Shop</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDeleteShop}
        >
          <Text style={styles.actionButtonIcon}>🗑️</Text>
          <Text style={[styles.actionButtonText, { color: '#DC2626' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AXIS_COLORS.white,
  },

  // ── Header ──
  header: {
        backgroundColor: AXIS_COLORS.primary,
        paddingHorizontal: 20,
        paddingTop: 48,
        paddingBottom: 22,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
    },
    backButton: { marginBottom: 16 },
    backRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    backArrow: { fontSize: 16, color: 'rgba(255,255,255,0.8)', fontWeight: '700' },
    backText: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
    headerContent: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
    headerIconWrap: {
        width: 48, height: 48, borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
    },
    headerIcon: { fontSize: 22 },
    headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
    headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 3, fontWeight: '500', maxWidth: 200 },


  // ── Scroll Content ──
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },

  // ── Shop Header Card ──
  shopHeaderCard: {
    backgroundColor: AXIS_COLORS.primary,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  shopHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  shopHeaderInfo: {
    flex: 1,
    marginRight: 12,
  },
  shopNameBig: {
    fontSize: 22,
    fontWeight: '800',
    color: AXIS_COLORS.white,
    marginBottom: 6,
  },
  shopLocation: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  statusText: {
    color: AXIS_COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },

  // ── Section ──
  section: {
    backgroundColor: AXIS_COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: AXIS_COLORS.border,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: AXIS_COLORS.text,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // ── Detail Row ──
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: AXIS_COLORS.cardBg,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: AXIS_COLORS.muted,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: AXIS_COLORS.text,
    flex: 1,
    textAlign: 'right',
  },

  // ── Location Grid ──
  locationGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  locationCard: {
    flex: 1,
    backgroundColor: AXIS_COLORS.cardBg,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  locationLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: AXIS_COLORS.muted,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  locationValue: {
    fontSize: 14,
    fontWeight: '800',
    color: AXIS_COLORS.text,
  },

  // ── Coordinates ──
  coordinatesBox: {
    backgroundColor: AXIS_COLORS.lightBg,
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: AXIS_COLORS.primary,
  },
  coordinatesLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: AXIS_COLORS.muted,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  coordinatesValue: {
    fontSize: 13,
    fontWeight: '700',
    color: AXIS_COLORS.text,
  },

  // ── Description ──
  descriptionBox: {
    backgroundColor: AXIS_COLORS.cardBg,
    borderRadius: 10,
    padding: 12,
  },
  descriptionText: {
    fontSize: 13,
    color: AXIS_COLORS.text,
    fontWeight: '500',
    lineHeight: 20,
  },

  // ── Category ──
  categoryBox: {
    alignSelf: 'flex-start',
    backgroundColor: AXIS_COLORS.lightBg,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: AXIS_COLORS.primary,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '700',
    color: AXIS_COLORS.primary,
    textTransform: 'capitalize',
  },

  // ── States ──
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  loadingText: {
    fontSize: 14,
    color: AXIS_COLORS.muted,
    marginTop: 12,
    fontWeight: '500',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: AXIS_COLORS.text,
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: AXIS_COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  createButtonText: {
    color: AXIS_COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },

  // ── Action Bar ──
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: AXIS_COLORS.white,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: AXIS_COLORS.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: AXIS_COLORS.primary,
  },
  deleteButton: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderWidth: 1.5,
    borderColor: '#DC2626',
  },
  actionButtonIcon: {
    fontSize: 16,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: AXIS_COLORS.white,
  },
});
