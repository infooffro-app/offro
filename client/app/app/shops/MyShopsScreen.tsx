import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { AXIS_COLORS } from '../../../constants/colors'
const API_URL = process.env.EXPO_PUBLIC_API_URL;


export default function MyShopsScreen() {
  const router = useRouter();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      fetchMyShops();
    }, [])
  );

  useEffect(() => {
    const getToken = async () => {
      const t = await AsyncStorage.getItem('userToken');
      setToken(t);
    };
    getToken();
  }, []);

  const fetchMyShops = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');

      if (!token) {
        Alert.alert('Error', 'Not authenticated');
        return;
      }

      const response = await fetch(`${API_URL}/api/shop/getShop/myShops`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch shops');
      }

      const data = await response.json();

      // Handle both array and object responses
      const shopsList = Array.isArray(data) ? data : data.data || [];
      setShops(shopsList);

      if (shopsList.length === 0) {
        Alert.alert('Info', 'No shops found. Create your first shop!');
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
      Alert.alert('Error', 'Failed to load your shops');
    } finally {
      setLoading(false);
    }
  };

  const renderShopCard = ({ item }) => (
    <TouchableOpacity
      style={styles.shopCard}
      onPress={() => {
        router.push({
          pathname: '/app/shops/ShopDetailsScreen',
          params: { shopId: item.id },
        });
      }}
      activeOpacity={0.7}
    >
      {/* Left Accent */}
      <View style={styles.cardAccent} />

      {/* Card Content */}
      <View style={styles.cardContent}>
        {/* Shop Name & Status */}
        <View style={styles.cardHeader}>
          <View style={styles.shopInfo}>
            <Text style={styles.shopName} numberOfLines={1}>
              {item.shop_name}
            </Text>
            <Text style={styles.shopCity} numberOfLines={1}>
              {item.city}, {item.state}
            </Text>
          </View>
          <View style={[
            styles.statusDot,
            { backgroundColor: item.is_active ? '#22C55E' : '#EF4444' }
          ]} />
        </View>

        {/* Shop Details */}
        <View style={styles.detailsRow}>
          <Text style={styles.detailItem}>📍 {item.address ? item.address.substring(0, 30) : 'N/A'}...</Text>
        </View>

        <View style={styles.detailsRow}>
          <Text style={styles.detailItem}>📱 {item.phone || 'N/A'}</Text>
        </View>

        {/* Category */}
        {item.category_name && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category_name}</Text>
          </View>
        )}

        {/* Arrow */}
        <Text style={styles.cardArrow}>›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      
       {/* ── Header ── */}
        <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <View style={styles.backRow}>
                    <Text style={styles.backArrow}>←</Text>
                    <Text style={styles.backText}>Dashboard</Text>
                </View>
            </TouchableOpacity>

            <View style={styles.headerContent}>
                <View style={styles.headerIconWrap}>
                    <Text style={styles.headerIcon}>🏪</Text>
                </View>
                <View>
                    <Text style={styles.headerTitle}>My Shops</Text>
                    <Text style={styles.headerSubtitle}>{shops.length} {shops.length === 1 ? 'shop' : 'shops'}</Text>
                </View>
            </View>
        </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={AXIS_COLORS.primary} />
          <Text style={styles.loadingText}>Loading your shops...</Text>
        </View>
      ) : shops.length === 0 ? (
        <View style={styles.centerState}>
          <Text style={styles.emptyIcon}>🏪</Text>
          <Text style={styles.emptyTitle}>No Shops Yet</Text>
          <Text style={styles.emptyText}>Create your first shop to get started</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/app/shops/AddShop')}
          >
            <Text style={styles.createButtonText}>Create First Shop</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        >
          <FlatList
            data={shops}
            renderItem={renderShopCard}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.flatListContent}
          />

          {/* Add New Shop Button */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/app/shops/AddShop')}
          >
            <Text style={styles.addButtonIcon}>➕</Text>
            <Text style={styles.addButtonText}>Add Another Shop</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
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

  headerSubtitle: {
    fontSize: 12,
    color: AXIS_COLORS.muted,
    marginTop: 2,
    fontWeight: '500',
  },

  // ── List ──
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  flatListContent: {
    gap: 12,
  },

  // ── Shop Card ──
  shopCard: {
    backgroundColor: AXIS_COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: AXIS_COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    flexDirection: 'row',
  },
  cardAccent: {
    width: 5,
    backgroundColor: AXIS_COLORS.primary,
  },
  cardContent: {
    flex: 1,
    padding: 14,
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  shopInfo: {
    flex: 1,
    marginRight: 8,
  },
  shopName: {
    fontSize: 15,
    fontWeight: '800',
    color: AXIS_COLORS.text,
  },
  shopCity: {
    fontSize: 12,
    color: AXIS_COLORS.muted,
    marginTop: 2,
    fontWeight: '500',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  detailsRow: {
    marginBottom: 6,
  },
  detailItem: {
    fontSize: 12,
    color: AXIS_COLORS.text,
    fontWeight: '500',
    lineHeight: 16,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: AXIS_COLORS.lightBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
    borderWidth: 1,
    borderColor: AXIS_COLORS.border,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: AXIS_COLORS.primary,
    textTransform: 'capitalize',
  },
  cardArrow: {
    position: 'absolute',
    right: 14,
    top: '50%',
    marginTop: -10,
    fontSize: 24,
    color: AXIS_COLORS.primary,
    fontWeight: '800',
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
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: AXIS_COLORS.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: AXIS_COLORS.muted,
    textAlign: 'center',
    marginBottom: 20,
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

  // ── Add Button ──
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginTop: 20,
    backgroundColor: AXIS_COLORS.lightBg,
    borderWidth: 2,
    borderColor: AXIS_COLORS.primary,
    borderRadius: 12,
  },
  addButtonIcon: {
    fontSize: 18,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: AXIS_COLORS.primary,
  },
});
