// import React, { useEffect, useState } from 'react';
// import { View, Text, Dimensions } from 'react-native';
// import { LineChart } from 'react-native-chart-kit';
// import { useLocalSearchParams } from 'expo-router';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// const API_URL = process.env.EXPO_PUBLIC_API_URL;

// export default function OfferGraph() {
//   const { offerId } = useLocalSearchParams();
//   const [chartData, setChartData] = useState([]);

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     const token = await AsyncStorage.getItem('userToken');
//     const res = await fetch(`${API_URL}/api/offers/offer-analytics/${offerId}`, {
//           method: 'GET',
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         });
//     const data = await res.json();

//     setChartData(data.data || []);
//   };

//   const labels = chartData.map(d => d.date);
//   const values = chartData.map(d => d.clicks);

//   return (
//     <View style={{ flex: 1, padding: 20 }}>
//       <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
//         Offer Click Analytics
//       </Text>

//       {values.length > 0 ? (
//         <LineChart
//           data={{
//             labels,
//             datasets: [{ data: values }]
//           }}
//           width={Dimensions.get('window').width - 40}
//           height={220}
//           yAxisInterval={1}
//           chartConfig={{
//             backgroundGradientFrom: '#fff',
//             backgroundGradientTo: '#fff',
//             decimalPlaces: 0,
//             color: (opacity = 1) => `rgba(0, 61, 165, ${opacity})`,
//           }}
//           style={{ marginTop: 20 }}
//         />
//       ) : (
//         <Text>No data yet</Text>
//       )}
//     </View>
//   );
// }

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { AXIS_COLORS } from '../../../constants/colors';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const SCREEN_WIDTH = Dimensions.get('window').width;

// ─── Types ────────────────────────────────────────────────────────────────────
interface DayData {
    date: string;
    clicks: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const shortDate = (iso: string) => {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, '0')} ${d.toLocaleString('en-GB', { month: 'short' })}`;
};

export default function OfferGraph() {
    const { offerId } = useLocalSearchParams();
    const router = useRouter();
    const [chartData, setChartData] = useState<DayData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(false);
            const token = await AsyncStorage.getItem('userToken');
            const res = await fetch(`${API_URL}/api/offers/offer-analytics/${offerId}`, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            });
            const data = await res.json();
            setChartData(data.data || []);
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    // ─── Derived Stats ───────────────────────────────────────────────────────
    const totalClicks = chartData.reduce((s, d) => s + d.clicks, 0);
    const maxClicks   = chartData.length ? Math.max(...chartData.map(d => d.clicks)) : 0;
    const avgClicks   = chartData.length ? Math.round(totalClicks / chartData.length) : 0;
    const peakDay     = chartData.find(d => d.clicks === maxClicks);
    const todayClicks = chartData[chartData.length - 1]?.clicks ?? 0;

    // ─── Chart prep (max 7 labels to avoid crowding) ─────────────────────────
    const step       = Math.max(1, Math.floor(chartData.length / 7));
    const labels     = chartData.map((d, i) => (i % step === 0 ? shortDate(d.date) : ''));
    const values     = chartData.map(d => d.clicks);
    const chartWidth = SCREEN_WIDTH - 48;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: AXIS_COLORS.primary }}>
            <View style={styles.container}>

                {/* ── Header ─────────────────────────────────────────────── */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <View style={styles.backRow}>
                            <Text style={styles.backArrow}>←</Text>
                            <Text style={styles.backText}>My Offers</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={styles.headerContent}>
                        <View style={styles.headerIconWrap}>
                            <Text style={styles.headerIcon}>📊</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.headerTitle}>Click Analytics</Text>
                            <Text style={styles.headerSubtitle}>
                                Track how customers engage with your offer
                            </Text>
                        </View>
                    </View>

                    {/* Stats banner */}
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <Text style={styles.statNum}>{totalClicks}</Text>
                            <Text style={styles.statLabel}>Total Clicks</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statCard}>
                            <Text style={[styles.statNum, { color: '#4ADE80' }]}>{maxClicks}</Text>
                            <Text style={styles.statLabel}>Peak Day</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statCard}>
                            <Text style={[styles.statNum, { color: '#FCD34D' }]}>{avgClicks}</Text>
                            <Text style={styles.statLabel}>Daily Avg</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statCard}>
                            <Text style={[styles.statNum, { color: '#93C5FD' }]}>{todayClicks}</Text>
                            <Text style={styles.statLabel}>Today</Text>
                        </View>
                    </View>
                </View>

                {/* ── Body ───────────────────────────────────────────────── */}
                <ScrollView
                    style={{ flex: 1, backgroundColor: AXIS_COLORS.cardBg }}
                    contentContainerStyle={styles.body}
                    showsVerticalScrollIndicator={false}
                >
                    {loading ? (
                        <View style={styles.centerState}>
                            <ActivityIndicator size="large" color={AXIS_COLORS.primary} />
                            <Text style={styles.loadingText}>Fetching analytics…</Text>
                        </View>

                    ) : error ? (
                        <View style={styles.centerState}>
                            <Text style={styles.emptyIcon}>⚠️</Text>
                            <Text style={styles.emptyTitle}>Couldn't load data</Text>
                            <TouchableOpacity style={styles.retryBtn} onPress={fetchData}>
                                <Text style={styles.retryText}>Retry</Text>
                            </TouchableOpacity>
                        </View>

                    ) : values.length === 0 ? (
                        <View style={styles.centerState}>
                            <Text style={styles.emptyIcon}>📭</Text>
                            <Text style={styles.emptyTitle}>No clicks yet</Text>
                            <Text style={styles.emptySub}>
                                Analytics will appear once customers start viewing your offer.
                            </Text>
                        </View>

                    ) : (
                        <>
                            {/* ── Chart card ── */}
                            <View style={styles.chartCard}>
                                <View style={styles.chartCardHeader}>
                                    <View>
                                        <Text style={styles.chartCardTitle}>Daily Clicks</Text>
                                        <Text style={styles.chartCardSub}>Last {chartData.length} days</Text>
                                    </View>
                                    <View style={styles.legendDot}>
                                        <View style={[styles.dot, { backgroundColor: AXIS_COLORS.primary }]} />
                                        <Text style={styles.legendText}>Clicks</Text>
                                    </View>
                                </View>

                                <LineChart
                                    data={{ labels, datasets: [{ data: values }] }}
                                    width={chartWidth}
                                    height={200}
                                    yAxisInterval={1}
                                    withDots={values.length <= 14}
                                    withInnerLines={true}
                                    withOuterLines={false}
                                    withShadow={false}
                                    chartConfig={{
                                        backgroundColor: '#fff',
                                        backgroundGradientFrom: '#fff',
                                        backgroundGradientTo: '#fff',
                                        decimalPlaces: 0,
                                        color: (opacity = 1) => `rgba(0, 61, 165, ${opacity})`,
                                        labelColor: () => AXIS_COLORS.muted,
                                        propsForLabels: { fontSize: 9, fontWeight: '600' },
                                        propsForDots: {
                                            r: '3',
                                            strokeWidth: '2',
                                            stroke: AXIS_COLORS.primary,
                                        },
                                        propsForBackgroundLines: {
                                            stroke: AXIS_COLORS.border,
                                            strokeDasharray: '4 3',
                                            strokeWidth: 1,
                                        },
                                    }}
                                    bezier
                                    style={styles.chart}
                                />
                            </View>

                            {/* ── Insight cards ── */}
                            <Text style={styles.sectionTitle}>Highlights</Text>
                            <View style={styles.insightRow}>
                                <View style={[styles.insightCard, { borderLeftColor: '#16A34A' }]}>
                                    <Text style={styles.insightIcon}>🏆</Text>
                                    <Text style={styles.insightVal}>{maxClicks}</Text>
                                    <Text style={styles.insightLabel}>Best Day</Text>
                                    {peakDay && (
                                        <Text style={styles.insightSub}>{shortDate(peakDay.date)}</Text>
                                    )}
                                </View>

                                <View style={[styles.insightCard, { borderLeftColor: '#D97706' }]}>
                                    <Text style={styles.insightIcon}>📈</Text>
                                    <Text style={styles.insightVal}>{avgClicks}</Text>
                                    <Text style={styles.insightLabel}>Avg / Day</Text>
                                    <Text style={styles.insightSub}>over {chartData.length} days</Text>
                                </View>

                                <View style={[styles.insightCard, { borderLeftColor: AXIS_COLORS.primary }]}>
                                    <Text style={styles.insightIcon}>🎯</Text>
                                    <Text style={styles.insightVal}>{totalClicks}</Text>
                                    <Text style={styles.insightLabel}>Total</Text>
                                    <Text style={styles.insightSub}>all-time clicks</Text>
                                </View>
                            </View>

                            {/* ── Per-day table ── */}
                            <Text style={styles.sectionTitle}>Day-by-Day</Text>
                            <View style={styles.tableCard}>
                                <View style={styles.tableHeader}>
                                    <Text style={[styles.tableHeaderText, { flex: 1 }]}>Date</Text>
                                    <Text style={[styles.tableHeaderText, { width: 70, textAlign: 'right' }]}>Clicks</Text>
                                    <Text style={[styles.tableHeaderText, { width: 80, textAlign: 'right' }]}>Share</Text>
                                </View>
                                {[...chartData].reverse().map((d, i) => {
                                    const pct = totalClicks > 0 ? Math.round((d.clicks / totalClicks) * 100) : 0;
                                    const isPeak = d.clicks === maxClicks && maxClicks > 0;
                                    return (
                                        <View
                                            key={d.date}
                                            style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}
                                        >
                                            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                {isPeak && <Text style={{ fontSize: 10 }}>🏆</Text>}
                                                <Text style={styles.tableDate}>{shortDate(d.date)}</Text>
                                            </View>
                                            <Text style={[styles.tableClicks, { width: 70, textAlign: 'right', color: isPeak ? '#16A34A' : AXIS_COLORS.text }]}>
                                                {d.clicks}
                                            </Text>
                                            <View style={{ width: 80, alignItems: 'flex-end' }}>
                                                <View style={styles.barTrack}>
                                                    <View style={[styles.barFill, {
                                                        width: `${pct}%`,
                                                        backgroundColor: isPeak ? '#16A34A' : AXIS_COLORS.primary,
                                                    }]} />
                                                </View>
                                                <Text style={styles.pctText}>{pct}%</Text>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        </>
                    )}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: AXIS_COLORS.cardBg },

    // ── Header ──────────────────────────────────────────────────────────────
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
    headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 3, fontWeight: '500' },

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
    statNum: { fontSize: 18, fontWeight: '800', color: '#fff' },
    statLabel: { fontSize: 9, color: 'rgba(255,255,255,0.65)', marginTop: 2, fontWeight: '600', textAlign: 'center' },
    statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },

    // ── Body ────────────────────────────────────────────────────────────────
    body: { padding: 16, paddingBottom: 40, gap: 14 },

    sectionTitle: {
        fontSize: 11,
        fontWeight: '800',
        color: AXIS_COLORS.muted,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginTop: 4,
        marginBottom: -4,
    },

    // ── Chart card ──────────────────────────────────────────────────────────
    chartCard: {
        backgroundColor: AXIS_COLORS.white,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: AXIS_COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
    },
    chartCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 14,
    },
    chartCardTitle: { fontSize: 14, fontWeight: '800', color: AXIS_COLORS.text },
    chartCardSub: { fontSize: 11, color: AXIS_COLORS.muted, marginTop: 2, fontWeight: '500' },
    legendDot: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    legendText: { fontSize: 11, color: AXIS_COLORS.muted, fontWeight: '600' },
    chart: { borderRadius: 10, marginLeft: -16 },

    // ── Insight cards ────────────────────────────────────────────────────────
    insightRow: { flexDirection: 'row', gap: 10 },
    insightCard: {
        flex: 1,
        backgroundColor: AXIS_COLORS.white,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: AXIS_COLORS.border,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
        alignItems: 'center',
    },
    insightIcon: { fontSize: 18, marginBottom: 4 },
    insightVal: { fontSize: 20, fontWeight: '900', color: AXIS_COLORS.text, lineHeight: 24 },
    insightLabel: { fontSize: 10, fontWeight: '700', color: AXIS_COLORS.muted, marginTop: 2 },
    insightSub: { fontSize: 9, color: AXIS_COLORS.muted, marginTop: 1, textAlign: 'center' },

    // ── Table ────────────────────────────────────────────────────────────────
    tableCard: {
        backgroundColor: AXIS_COLORS.white,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: AXIS_COLORS.border,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 5,
        elevation: 2,
    },
    tableHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        backgroundColor: AXIS_COLORS.lightBg,
        borderBottomWidth: 1,
        borderBottomColor: AXIS_COLORS.border,
    },
    tableHeaderText: {
        fontSize: 10,
        fontWeight: '800',
        color: AXIS_COLORS.muted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: AXIS_COLORS.border,
    },
    tableRowAlt: { backgroundColor: '#FAFBFF' },
    tableDate: { fontSize: 12, fontWeight: '600', color: AXIS_COLORS.text },
    tableClicks: { fontSize: 13, fontWeight: '800' },
    barTrack: {
        width: 48, height: 5, borderRadius: 3,
        backgroundColor: AXIS_COLORS.lightBg,
        overflow: 'hidden',
        marginBottom: 2,
    },
    barFill: { height: '100%', borderRadius: 3 },
    pctText: { fontSize: 9, color: AXIS_COLORS.muted, fontWeight: '700' },

    // ── States ───────────────────────────────────────────────────────────────
    centerState: { alignItems: 'center', paddingVertical: 60 },
    loadingText: { fontSize: 13, color: AXIS_COLORS.muted, marginTop: 12, fontWeight: '500' },
    emptyIcon: { fontSize: 50, marginBottom: 12 },
    emptyTitle: { fontSize: 16, fontWeight: '800', color: AXIS_COLORS.text, marginBottom: 6 },
    emptySub: { fontSize: 12, color: AXIS_COLORS.muted, textAlign: 'center', lineHeight: 18, maxWidth: 240 },
    retryBtn: {
        marginTop: 16,
        paddingHorizontal: 24,
        paddingVertical: 10,
        backgroundColor: AXIS_COLORS.primary,
        borderRadius: 10,
    },
    retryText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
