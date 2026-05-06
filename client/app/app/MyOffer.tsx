// screens/app/MyOffersScreen.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator, FlatList, RefreshControl, SafeAreaView,
    ScrollView, StyleSheet, Text, TextInput,
    TouchableOpacity, View,
} from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const AXIS_COLORS = {
    primary: '#003DA5',
    lightBg: '#F0F4FB',
    cardBg: '#F4F6FB',
    text: '#1A1A1A',
    white: '#FFFFFF',
    border: '#D8E6F5',
    muted: '#8A9BB0',
};

const ACCENT_COLORS = ['#003DA5', '#16A34A', '#D97706', '#DC2626', '#7C3AED', '#0891B2'];

export default function MyOffersScreen() {
    const [offers, setOffers] = useState([]);
    const router = useRouter();
    const [filteredOffers, setFilteredOffers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [shop, setShop] = useState([]);
    const [selectedShop, setSelectedShop] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'expired'

    useEffect(() => { loadOffers(1, true); fetchShop(); }, []);

    // Local filter whenever search/category/status changes
    useEffect(() => {
        applyFilters();
    }, [search, selectedShop, statusFilter, offers]);

    const applyFilters = () => {
        let result = [...offers];
        if (search.trim()) {
            result = result.filter(o =>
                o.title?.toLowerCase().includes(search.toLowerCase()) ||
                o.shop_name?.toLowerCase().includes(search.toLowerCase())
            );
        }
        if (selectedShop) {
            result = result.filter(o => o.category_id === selectedShop);
        }
        if (statusFilter === 'active') {
            result = result.filter(o => !isExpired(o.valid_until));
        } else if (statusFilter === 'expired') {
            result = result.filter(o => isExpired(o.valid_until));
        }
        setFilteredOffers(result);
    };

    const fetchShop = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const res = await fetch(`${API_URL}/api/shop/getShop/myShops`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            console.log('shop', data);
            setShop(data.data);
        } catch (e) { }
    };
    const loadOffers = async (pageNumber = 1, reset = false) => {
    try {
        if (reset) setLoading(true);

        const token = await AsyncStorage.getItem('userToken');
        const url = `${API_URL}/api/offers/myOffers?page=${pageNumber}&limit=10&sort=desc`;

        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        const dataArray = Array.isArray(data)
            ? data
            : data.offers || data.data || [];

        let updatedOffers = [];

        if (reset) {
            updatedOffers = dataArray;
        } else {
            // ✅ REMOVE DUPLICATES HERE
            const existingIds = new Set(offers.map(o => o.id));

            const uniqueNew = dataArray.filter(o => !existingIds.has(o.id));

            updatedOffers = [...offers, ...uniqueNew];
        }

        setOffers(updatedOffers);
        setHasMore(dataArray.length >= 10);
        setPage(pageNumber);

    } catch (err) {
        console.log(err);
        setOffers([]);
    } finally {
        setLoading(false);
        setRefreshing(false);
    }
};
    const onRefresh = () => {
        setRefreshing(true);
        setHasMore(true);
        loadOffers(1, true);
    };

    const loadMore = () => {
        if (!loading && hasMore) loadOffers(page + 1);
    };

    const isExpired = (date) => new Date(date).toDateString() < new Date().toDateString();

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = date.toLocaleString('en-GB', { month: 'short' });
        const year = String(date.getFullYear()).slice(-2);
        return `${day} ${month} '${year}`;
    };

    const getDaysLeft = (date) => {
        const diff = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
        if (diff <= 0) return null;
        if (diff === 1) return '1 day left';
        return `${diff} days left`;
    };

    // ─── Stats Banner ─────────────────────────────────────────────────────────
    const totalOffers = offers.length;
    const activeCount = offers.filter(o => !isExpired(o.valid_until)).length;
    const expiredCount = offers.filter(o => isExpired(o.valid_until)).length;

    const formatLocalDate = (isoDate) => {
        if (!isoDate) return '';
        const date = new Date(isoDate);
        return date.getFullYear() + '-' +
            String(date.getMonth() + 1).padStart(2, '0') + '-' +
            String(date.getDate()).padStart(2, '0');
    };

    // ─── Offer Card ───────────────────────────────────────────────────────────
    const renderOfferCard = ({ item, index }) => {

        const expired = isExpired(item.valid_until);
        const accent = expired ? '#9CA3AF' : ACCENT_COLORS[index % ACCENT_COLORS.length];
        const daysLeft = getDaysLeft(item.valid_until);
        const isUrgent = daysLeft && parseInt(daysLeft) <= 3;

        const couponBg = accent === '#16A34A' ? '#F0FDF4'
            : accent === '#D97706' ? '#FFFBEB'
                : accent === '#DC2626' ? '#FEF2F2'
                    : '#EFF6FF';
        const couponBorder = accent === '#16A34A' ? '#86EFAC'
            : accent === '#D97706' ? '#FCD34D'
                : accent === '#DC2626' ? '#FECACA'
                    : '#BFDBFE';

        return (
            <TouchableOpacity
                activeOpacity={expired ? 1 : 0.72}
                style={[styles.card, expired && styles.cardExpired]}
            >
                {/* Left strip */}
                <View style={[styles.cardStrip, { backgroundColor: accent }]} />

                <View style={styles.cardBody}>
                    {/* Top: shop + status badge */}
                    <View style={styles.cardTopRow}>
                        <View style={styles.shopRow}>
                            <Text style={styles.byText}>by </Text>
                            <Text style={[styles.shopName, { color: expired ? AXIS_COLORS.muted : accent }]}
                                numberOfLines={1}>
                                {item.shop_name}
                            </Text>
                        </View>
                        {expired ? (
                            <View style={styles.expiredBadge}>
                                <Text style={styles.expiredBadgeText}>Expired</Text>
                            </View>
                        ) : isUrgent ? (
                            <View style={styles.urgentBadge}>
                                <Text style={styles.urgentBadgeText}>⚡ {daysLeft}</Text>
                            </View>
                        ) : (
                            <View style={styles.activeBadge}>
                                <Text style={styles.activeBadgeText}>Active</Text>
                            </View>
                        )}
                    </View>

                    {/* Title */}
                    <Text style={[styles.offerTitle, expired && { color: AXIS_COLORS.muted }]}
                        numberOfLines={2}>
                        {item.title}
                    </Text>

                    {/* Divider */}
                    <View style={styles.dividerRow}>
                        <Text style={styles.scissorIcon}>✂</Text>
                        <View style={styles.dashedLine} />
                    </View>

                    {/* Bottom row */}
                    <View style={styles.cardBottomRow}>
                        {/* Discount block */}
                        <View style={[styles.discountBlock, { backgroundColor: expired ? '#9CA3AF' : accent }]}>
                            <Text style={styles.discountValue}>
                                {item.discount_percentage ? `${item.discount_percentage}%` : `₹${item.discount_amount}`}
                            </Text>
                            <Text style={styles.discountOff}>OFF</Text>
                        </View>

                        {/* Meta */}
                        <View style={styles.cardMeta}>
                            {item.coupon_code && (
                                <View style={[styles.couponTag,
                                {
                                    backgroundColor: expired ? '#F3F4F6' : couponBg,
                                    borderColor: expired ? '#D1D5DB' : couponBorder
                                }]}>
                                    <Text style={[styles.couponLabel, { color: expired ? '#9CA3AF' : accent }]}>
                                        CODE
                                    </Text>
                                    <View style={[styles.couponSep, { backgroundColor: expired ? '#D1D5DB' : couponBorder }]} />
                                    <Text style={[styles.couponCode, { color: expired ? '#9CA3AF' : accent }]}>
                                        {item.coupon_code}
                                    </Text>
                                </View>
                            )}
                            <View style={styles.expiryRow}>
                                <Text style={styles.expiryIcon}>📅</Text>
                                <Text style={[styles.expiryText, expired && { color: '#EF4444' }]}>
                                    {expired ? `Expired ${formatDate(item.valid_until)}` : `Valid till ${formatDate(item.valid_until)}`}
                                </Text>
                            </View>
                        </View>
                        {/*Graph */}
                        <TouchableOpacity
                            style={[styles.editBtn, { borderColor: '#16A34A' }]}
                            onPress={() => router.push({
                                pathname: '/app/OfferGraph',
                                params: { offerId: item.id }
                            })}
                        >
                            <Text style={{ color: '#16A34A' }}>📊</Text>
                        </TouchableOpacity>
                        {/* Edit btn */}
                        {!expired && (
                            <TouchableOpacity
                                style={[styles.editBtn, { borderColor: accent }]}
                                onPress={() => router.push({
                                    pathname: '/app/AddOffer',
                                    params: {
                                        editMode: 'true',
                                        offerId: String(item.id),
                                        shop_id: String(item.shop_id),          // Dropdown converts back via Number()
                                        shop_name: item.shop_name,
                                        title: item.title,
                                        description: item.description || '',
                                        discountType: item.discount_percentage ? 'percentage' : 'amount',
                                        discountValue: item.discount_percentage
                                            ? String(item.discount_percentage)
                                            : String(item.discount_amount),
                                        couponCode: item.coupon_code || '',
                                        validFrom: formatLocalDate(item.valid_from),
                                        validUntil: formatLocalDate(item.valid_until),
                                    },
                                })}
                            >
                                <Text style={[styles.editBtnText, { color: accent }]}>✏</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    // ─── Empty State ──────────────────────────────────────────────────────────
    const renderEmpty = () => (
        <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No offers found</Text>
            <Text style={styles.emptySub}>
                {search ? 'Try a different search term' : 'You haven\'t posted any offers yet'}
            </Text>
        </View>
    );

    // ─── Main Render ──────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: AXIS_COLORS.primary }}>
            <View style={styles.container}>

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
                            <Text style={styles.headerTitle}>My Offer </Text>
                            <Text style={styles.headerSubtitle}>Post an amazing deal for nearby customers</Text>
                        </View>
                    </View>

                    {/* Stats row */}
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <Text style={styles.statNum}>{totalOffers}</Text>
                            <Text style={styles.statLabel}>Total</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statCard}>
                            <Text style={[styles.statNum, { color: '#4ADE80' }]}>{activeCount}</Text>
                            <Text style={styles.statLabel}>Active</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statCard}>
                            <Text style={[styles.statNum, { color: '#FCA5A5' }]}>{expiredCount}</Text>
                            <Text style={styles.statLabel}>Expired</Text>
                        </View>
                    </View>
                </View>

                {/* ── Body ── */}
                <View style={{ flex: 1, backgroundColor: AXIS_COLORS.cardBg }}>

                    {/* Search */}
                    <View style={styles.searchWrap}>
                        <View style={styles.searchBar}>
                            <Text style={styles.searchIcon}>🔍</Text>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search by offer name or shop..."
                                placeholderTextColor={AXIS_COLORS.muted}
                                value={search}
                                onChangeText={setSearch}
                            />
                            {search.length > 0 && (
                                <TouchableOpacity onPress={() => setSearch('')}>
                                    <Text style={styles.clearBtn}>✕</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Status filter pills */}
                    <View style={styles.statusRow}>
                        {[
                            { key: 'all', label: 'All', count: totalOffers },
                            { key: 'active', label: 'Active', count: activeCount },
                            { key: 'expired', label: 'Expired', count: expiredCount },
                        ].map(({ key, label, count }) => (
                            <TouchableOpacity
                                key={key}
                                style={[styles.statusPill, statusFilter === key && styles.statusPillActive]}
                                onPress={() => setStatusFilter(key)}
                            >
                                <Text style={[styles.statusPillText, statusFilter === key && styles.statusPillTextActive]}>
                                    {label}
                                </Text>
                                <View style={[styles.statusCount, statusFilter === key && styles.statusCountActive]}>
                                    <Text style={[styles.statusCountText, statusFilter === key && styles.statusCountTextActive]}>
                                        {count}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Category pills */}
                    {shop.length > 0 && (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.catScroll}
                            contentContainerStyle={{ paddingHorizontal: 16, gap: 7 }}
                        >
                            <TouchableOpacity
                                style={[styles.catPill, selectedShop === null && styles.catPillActive]}
                                onPress={() => setSelectedShop(null)}
                            >
                                <Text style={[styles.catPillText, selectedShop === null && styles.catPillTextActive]}>
                                    All
                                </Text>
                            </TouchableOpacity>
                            {shop.map((cat) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[styles.catPill, selectedShop === cat.id && styles.catPillActive]}
                                    onPress={() => setSelectedShop(cat.id)}
                                >
                                    <Text style={[styles.catPillText, selectedShop === cat.id && styles.catPillTextActive]}>
                                        {cat.shop_name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}

                    {/* Result count */}
                    {!loading && (
                        <View style={styles.resultRow}>
                            <Text style={styles.resultText}>
                                {filteredOffers.length} offer{filteredOffers.length !== 1 ? 's' : ''}
                                {search ? ` for "${search}"` : ''}
                            </Text>
                        </View>
                    )}

                    {/* List */}
                    {loading && offers.length === 0 ? (
                        <View style={styles.centerState}>
                            <ActivityIndicator size="large" color={AXIS_COLORS.primary} />
                            <Text style={styles.loadingText}>Loading your offers...</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={filteredOffers}
                            renderItem={renderOfferCard}
                            keyExtractor={(item) => item.id.toString()}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                            onEndReached={loadMore}
                            onEndReachedThreshold={0.5}
                            ListEmptyComponent={renderEmpty}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                    tintColor={AXIS_COLORS.primary}
                                />
                            }
                            ListFooterComponent={
                                hasMore && !loading ? (
                                    <ActivityIndicator style={{ marginVertical: 16 }} color={AXIS_COLORS.primary} />
                                ) : null
                            }
                        />
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: AXIS_COLORS.cardBg },

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


    // Stats
    statsRow: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    statCard: { flex: 1, alignItems: 'center' },
    statNum: { fontSize: 20, fontWeight: '800', color: '#fff' },
    statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 2, fontWeight: '600' },
    statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },

    // Search
    searchWrap: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
    searchBar: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: AXIS_COLORS.white,
        borderRadius: 12, paddingHorizontal: 14,
        borderWidth: 1.5, borderColor: AXIS_COLORS.border, height: 44,
    },
    searchIcon: { fontSize: 15, marginRight: 8 },
    searchInput: { flex: 1, fontSize: 13, color: AXIS_COLORS.text, fontWeight: '500' },
    clearBtn: { fontSize: 14, color: AXIS_COLORS.muted, paddingLeft: 8 },

    // Status filter
    statusRow: {
        flexDirection: 'row', gap: 8,
        paddingHorizontal: 16, paddingVertical: 10,
    },
    statusPill: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        paddingHorizontal: 12, paddingVertical: 7,
        backgroundColor: AXIS_COLORS.white, borderRadius: 20,
        borderWidth: 1.5, borderColor: AXIS_COLORS.border,
    },
    statusPillActive: { backgroundColor: AXIS_COLORS.primary, borderColor: AXIS_COLORS.primary },
    statusPillText: { fontSize: 12, fontWeight: '700', color: AXIS_COLORS.muted },
    statusPillTextActive: { color: '#fff' },
    statusCount: {
        backgroundColor: AXIS_COLORS.lightBg,
        borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1,
    },
    statusCountActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
    statusCountText: { fontSize: 10, fontWeight: '700', color: AXIS_COLORS.muted },
    statusCountTextActive: { color: '#fff' },

    // Category pills
    catScroll: { paddingVertical: 6 },
    catPill: {
        height: 34,                          // fixed height — no more jumping
        paddingHorizontal: 14,
        justifyContent: 'center',           // vertically center text inside fixed height
        alignItems: 'center',
        backgroundColor: AXIS_COLORS.white,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: AXIS_COLORS.border,
        marginBottom: 10,
    },
    catPillActive: {
        backgroundColor: AXIS_COLORS.primary,
        borderColor: AXIS_COLORS.primary,
    },
    catPillText: {
        fontSize: 12,
        fontWeight: '600',
        color: AXIS_COLORS.muted,
        lineHeight: 16,                      // explicit lineHeight prevents bottom clipping
        includeFontPadding: false,           // Android fix — removes extra internal padding
        textAlignVertical: 'center',         // Android vertical centering
    },
    catPillTextActive: {
        color: '#fff',
        // no fontWeight change here — keeps layout stable
    },

    // Result count
    resultRow: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 6 },
    resultText: { fontSize: 11, color: AXIS_COLORS.muted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },

    listContent: { paddingHorizontal: 16, paddingBottom: 30, gap: 10 },

    // ── Card ──
    card: {
        backgroundColor: AXIS_COLORS.white,
        borderRadius: 14, flexDirection: 'row',
        overflow: 'hidden', borderWidth: 1,
        borderColor: AXIS_COLORS.border,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
    },
    cardExpired: {
        backgroundColor: '#FAFAFA',
        borderColor: '#E5E7EB',
    },
    cardStrip: { width: 5 },
    cardBody: { flex: 1, padding: 12 },
    cardTopRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 4,
    },
    shopRow: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
    byText: { fontSize: 10, color: AXIS_COLORS.muted },
    shopName: { fontSize: 11, fontWeight: '800', textDecorationLine: 'underline', flexShrink: 1 },

    // Badges
    activeBadge: {
        backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#86EFAC',
        borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2,
    },
    activeBadgeText: { fontSize: 9, fontWeight: '800', color: '#16A34A' },
    expiredBadge: {
        backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA',
        borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2,
    },
    expiredBadgeText: { fontSize: 9, fontWeight: '800', color: '#EF4444' },
    urgentBadge: {
        backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FCD34D',
        borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2,
    },
    urgentBadgeText: { fontSize: 9, fontWeight: '800', color: '#D97706' },

    offerTitle: {
        fontSize: 13, fontWeight: '700',
        color: AXIS_COLORS.text, lineHeight: 19, marginBottom: 9,
    },
    dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 9 },
    scissorIcon: { fontSize: 11, color: '#C8D8E8' },
    dashedLine: { flex: 1, borderTopWidth: 1, borderStyle: 'dashed', borderColor: '#D8E6F5' },
    cardBottomRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    discountBlock: {
        borderRadius: 9, paddingHorizontal: 10, paddingVertical: 6,
        alignItems: 'center', minWidth: 52,
    },
    discountValue: { fontSize: 15, fontWeight: '900', color: '#fff', lineHeight: 18 },
    discountOff: { fontSize: 8, fontWeight: '800', color: 'rgba(255,255,255,0.75)', letterSpacing: 1 },
    cardMeta: { flex: 1, gap: 4 },
    couponTag: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        borderWidth: 1, borderRadius: 6, alignSelf: 'flex-start',
        paddingHorizontal: 7, paddingVertical: 3,
    },
    couponLabel: { fontSize: 8, fontWeight: '800', letterSpacing: 0.5 },
    couponSep: { width: 1, height: 10 },
    couponCode: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
    expiryRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    expiryIcon: { fontSize: 10 },
    expiryText: { fontSize: 10, color: AXIS_COLORS.muted, fontWeight: '600' },
    editBtn: {
        width: 28, height: 28, borderRadius: 8,
        backgroundColor: AXIS_COLORS.lightBg,
        borderWidth: 1.5, justifyContent: 'center', alignItems: 'center',
    },
    editBtnText: { fontSize: 12 },

    // States
    centerState: { alignItems: 'center', paddingVertical: 60 },
    loadingText: { fontSize: 13, color: AXIS_COLORS.muted, marginTop: 12, fontWeight: '500' },
    emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 30 },
    emptyIcon: { fontSize: 50, marginBottom: 12 },
    emptyTitle: { fontSize: 16, fontWeight: '800', color: AXIS_COLORS.text, marginBottom: 6 },
    emptySub: { fontSize: 12, color: AXIS_COLORS.muted, textAlign: 'center', lineHeight: 18 },
});