import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AXIS_COLORS } from '../../../constants/colors'
const API_URL = process.env.EXPO_PUBLIC_API_URL;
const OfferDetailsScreen = () => {
  const router = useRouter();
  const { offerId } = useLocalSearchParams();

  const [offer, setOffer] = useState(null);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (offerId) {
      fetchOfferDetails();
    }
  }, [offerId]);

  const fetchOfferDetails = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');

      if (!token) {
        Alert.alert('Error', 'Not authenticated');
        return;
      }

      // Fetch offer details
      const offerRes = await fetch(`${API_URL}/api/offers/getOffers/${offerId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!offerRes.ok) {
        throw new Error('Failed to fetch offer');
      }

      const offerData = await offerRes.json();
      setOffer(offerData.data);

      // Fetch shop details if shop_id exists
      if (offerData.data.shop_id) {
  
        const shopRes = await fetch(`${API_URL}/api/offers/getShops/${offerData.data.shop_id}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (shopRes.ok) {
          const shopData = await shopRes.json();
          setShop(shopData.data);
        }
      }
    } catch (error) {
      console.log('Error fetching offer:', error);
      Alert.alert('Error', 'Failed to load offer details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-GB', { month: 'short' });
    const year = String(date.getFullYear()).slice(-2);
    return `${day} ${month} '${year}`;
  };

  const daysRemaining = () => {
    if (!offer?.valid_until) return 0;
    const today = new Date();
    const endDate = new Date(offer.valid_until);
    const diff = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const copyCoupon = () => {
    if (offer?.coupon_code) {
      setIsCopied(true);
      Alert.alert('Copied!', `Coupon code ${offer.coupon_code} copied to clipboard`);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={AXIS_COLORS.primary} />
        <Text style={styles.loadingText}>Loading offer details...</Text>
      </SafeAreaView>
    );
  }

  if (!offer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Offer Details</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Offer not found</Text>
        </View>
      </SafeAreaView>
    );
  }

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
                                    <Text style={styles.headerIcon}>🏷️</Text>
                                </View>
                                <View>
                                    <Text style={styles.headerTitle}>Offer Details</Text>
                                    <Text style={styles.headerSubtitle}>Post an amazing deal for nearby customers</Text>
                                </View>
                            </View>
                        </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: AXIS_COLORS.cardBg }}>
        
        {/* Offer Title & Description */}
        <View style={styles.section}>
          <Text style={styles.offerTitle}>{offer.title}</Text>
          {offer.description && (
            <Text style={styles.offerDescription}>{offer.description}</Text>
          )}
        </View>

        {/* Discount Info */}
        <View style={styles.discountSection}>
          <View style={styles.discountCard}>
            {offer.discount_percentage ? (
              <>
                <Text style={styles.discountValue}>{offer.discount_percentage}%</Text>
                <Text style={styles.discountLabel}>OFF</Text>
              </>
            ) : (
              <>
                <Text style={styles.discountValue}>₹{offer.discount_amount}</Text>
                <Text style={styles.discountLabel}>OFF</Text>
              </>
            )}
          </View>

          {offer.coupon_code && (
            <View style={styles.couponContainer}>
              <Text style={styles.couponLabel}>Coupon Code</Text>
              <TouchableOpacity style={styles.couponBox} onPress={copyCoupon}>
                <Text style={styles.couponCode}>{offer.coupon_code}</Text>
                <Text style={styles.copyIcon}>{isCopied ? '✓' : '📋'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Validity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Validity</Text>
          <View style={styles.dateRow}>
            <View style={styles.dateCard}>
              <Text style={styles.dateLabel}>Valid From</Text>
              <Text style={styles.dateValue}>{formatDate(offer.valid_from)}</Text>
            </View>
            <View style={styles.dateCard}>
              <Text style={styles.dateLabel}>Valid Till</Text>
              <Text style={styles.dateValue}>{formatDate(offer.valid_until)}</Text>
            </View>
            <View style={[styles.dateCard, { backgroundColor: AXIS_COLORS.primary }]}>
              <Text style={[styles.dateLabel, { color: '#fff' }]}>Days Left</Text>
              <Text style={[styles.dateValue, { color: '#fff' }]}>{daysRemaining()}</Text>
            </View>
          </View>
        </View>

        {/* Shop Info */}
        {shop && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏪 Shop Information</Text>
            <View style={styles.shopCard}>
              <Text style={styles.shopName}>{shop.name || 'Shop'}</Text>
              {shop.address && (
                <Text style={styles.shopDetail}>📍 {shop.address}</Text>
              )}
              {shop.phone && (
                <TouchableOpacity onPress={() => Linking.openURL(`tel:${shop.phone}`)}>
                  <Text style={styles.shopDetail}>📱 {shop.phone}</Text>
                </TouchableOpacity>
              )}
              {shop.latitude && shop.longitude && (
                <TouchableOpacity 
                  onPress={() => Linking.openURL(`https://maps.google.com/?q=${shop.latitude},${shop.longitude}`)}
                >
                  <Text style={styles.shopDetail}>🗺️ View on Map</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Additional Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ Additional Information</Text>
          {offer.discount_percentage && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Discount Percentage</Text>
              <Text style={styles.infoValue}>{offer.discount_percentage}%</Text>
            </View>
          )}
          {offer.discount_amount && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Discount Amount</Text>
              <Text style={styles.infoValue}>₹{offer.discount_amount}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Offer ID</Text>
            <Text style={styles.infoValue}>#{offer.id}</Text>
          </View>
          {offer.created_at && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Posted On</Text>
              <Text style={styles.infoValue}>{formatDate(offer.created_at)}</Text>
            </View>
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Action Bar */}
      {offer.coupon_code && (
        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.actionButton} onPress={copyCoupon}>
            <Text style={styles.actionIcon}>✂️</Text>
            <Text style={styles.actionText}>Copy Code</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AXIS_COLORS.white,
  },

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


    
  // ── Title Section ──
  section: {
    backgroundColor: AXIS_COLORS.white,
    marginHorizontal: 14,
    marginVertical: 10,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: AXIS_COLORS.border,
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: AXIS_COLORS.text,
    lineHeight: 26,
    marginBottom: 8,
  },
  offerDescription: {
    fontSize: 13,
    color: AXIS_COLORS.muted,
    lineHeight: 20,
  },

  // ── Discount Section ──
  discountSection: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  discountCard: {
    backgroundColor: AXIS_COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    minWidth: 100,
    justifyContent: 'center',
  },
  discountValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    lineHeight: 36,
  },
  discountLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    letterSpacing: 1.5,
  },
  couponContainer: {
    flex: 1,
    gap: 8,
    justifyContent: 'center',
  },
  couponLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: AXIS_COLORS.muted,
    textTransform: 'uppercase',
  },
  couponBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: AXIS_COLORS.lightBg,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: AXIS_COLORS.primary,
  },
  couponCode: {
    fontSize: 14,
    fontWeight: '800',
    color: AXIS_COLORS.primary,
    letterSpacing: 1,
  },
  copyIcon: {
    fontSize: 18,
  },

  // ── Section ──
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: AXIS_COLORS.text,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // ── Date Cards ──
  dateRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateCard: {
    flex: 1,
    backgroundColor: AXIS_COLORS.cardBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: AXIS_COLORS.muted,
    marginBottom: 6,
  },
  dateValue: {
    fontSize: 12,
    fontWeight: '800',
    color: AXIS_COLORS.text,
    textAlign: 'center',
  },

  // ── Shop Card ──
  shopCard: {
    backgroundColor: AXIS_COLORS.cardBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  shopName: {
    fontSize: 14,
    fontWeight: '800',
    color: AXIS_COLORS.primary,
    marginBottom: 4,
  },
  shopDetail: {
    fontSize: 12,
    fontWeight: '600',
    color: AXIS_COLORS.text,
    lineHeight: 18,
  },

  // ── Info Rows ──
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: AXIS_COLORS.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: AXIS_COLORS.cardBg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: AXIS_COLORS.muted,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '800',
    color: AXIS_COLORS.text,
  },

  // ── Action Bar ──
  actionBar: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: AXIS_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: AXIS_COLORS.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: AXIS_COLORS.primary,
  },
  actionIcon: {
    fontSize: 18,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },

  // ── States ──
  loadingText: {
    fontSize: 13,
    color: AXIS_COLORS.muted,
    marginTop: 12,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '700',
    color: AXIS_COLORS.text,
  },
});

export default OfferDetailsScreen;
