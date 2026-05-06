import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

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

export default function ViewProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) { router.push('/login'); return; }

      const res = await fetch(`${API_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setUser(data.data || data);
    } catch (e) {
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const Row = ({ label, value }) => (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value || 'N/A'}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={AXIS_COLORS.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
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
            <Text style={styles.headerIcon}>👤</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>View Profile</Text>
            <Text style={styles.headerSubtitle}>Your account information</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Avatar Card ── */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.avatarName}>{user?.name || 'User'}</Text>
          <Text style={styles.avatarEmail}>{user?.email || ''}</Text>
          <View style={styles.memberBadge}>
            <Text style={styles.memberBadgeText}>● Active Member</Text>
          </View>
        </View>

        {/* ── Personal Info ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Personal Information</Text>
          <Row label="Full Name" value={user?.name} />
          <Row label="Email" value={user?.email} />
          <Row label="Phone" value={user?.mobile} />
        </View>

        {/* ── Account Info ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ Account Details</Text>
          <Row label="User ID" value={`#${user?.id}`} />
          <Row label="Role" value={user?.role || 'User'} />
          <Row
            label="Member Since"
            value={user?.created_at
              ? new Date(user.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
              : 'N/A'}
          />
        </View>

        {/* ── Actions ── */}
        <View style={styles.actionsCard}>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => router.push('/app/ChangePassword')}
          >
            <View style={styles.actionLeft}>
              <View style={styles.actionIconBox}>
                <Text style={styles.actionIcon}>🔐</Text>
              </View>
              <Text style={styles.actionLabel}>Change Password</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.actionDivider} />

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => router.push('/app/MyShopsScreen')}
          >
            <View style={styles.actionLeft}>
              <View style={styles.actionIconBox}>
                <Text style={styles.actionIcon}>🏪</Text>
              </View>
              <Text style={styles.actionLabel}>My Shops</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.actionDivider} />

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => router.push('/app/MyOffer')}
          >
            <View style={styles.actionLeft}>
              <View style={styles.actionIconBox}>
                <Text style={styles.actionIcon}>📋</Text>
              </View>
              <Text style={styles.actionLabel}>My Offers</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ── Logout ── */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={async () => {
            await AsyncStorage.removeItem('userToken');
            router.push('/login');
          }}
        >
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AXIS_COLORS.white },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 13, color: AXIS_COLORS.muted, fontWeight: '500' },

  // ── Header ──
  // header: {
  //   backgroundColor: AXIS_COLORS.primary,
  //   paddingHorizontal: 16,
  //   paddingTop: 50,
  //   paddingBottom: 20,
  // },
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
    //marginBottom:100,
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
  scroll: { paddingHorizontal: 16, paddingTop: 20 },

  // ── Avatar Card ──
  avatarCard: {
    backgroundColor: AXIS_COLORS.primary,
    borderRadius: 16, padding: 24,
    alignItems: 'center', marginBottom: 16,
  },
  avatarCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)',
    marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: AXIS_COLORS.white },
  avatarName: { fontSize: 20, fontWeight: '800', color: AXIS_COLORS.white, marginBottom: 4 },
  avatarEmail: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '500', marginBottom: 12 },
  memberBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  memberBadgeText: { fontSize: 12, fontWeight: '700', color: '#fff' },

  // ── Section ──
  section: {
    backgroundColor: AXIS_COLORS.white,
    borderRadius: 12, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: AXIS_COLORS.border,
  },
  sectionTitle: {
    fontSize: 13, fontWeight: '800', color: AXIS_COLORS.text,
    marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: AXIS_COLORS.cardBg,
  },
  rowLabel: { fontSize: 13, fontWeight: '600', color: AXIS_COLORS.muted },
  rowValue: { fontSize: 13, fontWeight: '700', color: AXIS_COLORS.text, flex: 1, textAlign: 'right' },

  // ── Actions Card ──
  actionsCard: {
    backgroundColor: AXIS_COLORS.white,
    borderRadius: 12, marginBottom: 16,
    borderWidth: 1, borderColor: AXIS_COLORS.border, overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  actionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  actionIconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: AXIS_COLORS.lightBg,
    justifyContent: 'center', alignItems: 'center',
  },
  actionIcon: { fontSize: 18 },
  actionLabel: { fontSize: 14, fontWeight: '600', color: AXIS_COLORS.text },
  actionArrow: { fontSize: 20, color: AXIS_COLORS.muted, fontWeight: '600' },
  actionDivider: { height: 1, backgroundColor: AXIS_COLORS.border, marginHorizontal: 16 },

  // ── Logout ──
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 12,
    backgroundColor: 'rgba(220,38,38,0.08)',
    borderWidth: 1.5, borderColor: '#FCA5A5', marginBottom: 16,
  },
  logoutIcon: { fontSize: 18 },
  logoutText: { fontSize: 14, fontWeight: '700', color: '#DC2626' },
});
