import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, ActivityIndicator, Alert, SafeAreaView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { AXIS_COLORS } from '../../../constants/colors'
const API_URL = process.env.EXPO_PUBLIC_API_URL;

const Field = ({ label, value, onChangeText, placeholder, secureTextEntry, onToggle, showPassword }) => (
  <View style={styles.inputSection}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrap}>
      <Text style={styles.fieldIcon}>🔒</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={AXIS_COLORS.muted}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TouchableOpacity onPress={onToggle} style={styles.eyeBtn}>
        <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function ChangePasswordScreen() {
  const router = useRouter();

  const [current, setCurrent] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password strength
  const getStrength = (pwd) => {
    if (!pwd) return { level: 0, label: '', color: AXIS_COLORS.border };
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    if (s <= 1) return { level: 1, label: 'Weak', color: '#EF4444' };
    if (s === 2) return { level: 2, label: 'Fair', color: '#F59E0B' };
    if (s === 3) return { level: 3, label: 'Good', color: '#3B82F6' };
    return { level: 4, label: 'Strong', color: '#22C55E' };
  };

  const strength = getStrength(newPwd);

  const validate = () => {
    if (!current) { Alert.alert('Required', 'Enter current password'); return false; }
    if (newPwd.length < 6) { Alert.alert('Required', 'New password min 6 characters'); return false; }
    if (newPwd !== confirm) { Alert.alert('Mismatch', 'Passwords do not match'); return false; }
    if (current === newPwd) { Alert.alert('Error', 'New password must differ from current'); return false; }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const res = await fetch(`${API_URL}/api/user/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword: current, newPassword: newPwd }),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('Success', 'Password changed successfully', [
          { text: 'OK', onPress: () => router.back() },
        ]);
        setCurrent('');
        setNewPwd('');
        setConfirm('');
      } else {
        Alert.alert('Error', data.message || 'Failed to change password');
      }
    } catch {
      Alert.alert('Error', 'Server error. Try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >

        {/* ── Header ── */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <View style={styles.backRow}>
              <Text style={styles.backArrow}>←</Text>
              <Text style={styles.backText}>Dashboard</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <View style={styles.headerIconWrap}>
              <Text style={styles.headerIcon}>🔐</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>
                Change Password
              </Text>
              <Text style={styles.headerSubtitle}>
                Keep your account secure
              </Text>
            </View>
          </View>
        </View>


        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          style={{ backgroundColor: AXIS_COLORS.cardBg }}
          keyboardShouldPersistTaps="handled"
        >

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>💡</Text>
            <Text style={styles.infoText}>
              Use at least 8 characters with uppercase, numbers and symbols for a strong password.
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>

            {/* ✅ Pass all values as props — no internal state in Field */}
            <Field
              label="CURRENT PASSWORD"
              value={current}
              onChangeText={setCurrent}
              placeholder="Enter current password"
              secureTextEntry={!showCurrent}
              showPassword={showCurrent}
              onToggle={() => setShowCurrent(p => !p)}
            />

            <View style={styles.sectionDivider} />

            <Field
              label="NEW PASSWORD"
              value={newPwd}
              onChangeText={setNewPwd}
              placeholder="Enter new password"
              secureTextEntry={!showNew}
              showPassword={showNew}
              onToggle={() => setShowNew(p => !p)}
            />

            {/* Strength Bar */}
            {newPwd.length > 0 && (
              <View style={styles.strengthRow}>
                <View style={styles.strengthBars}>
                  {[1, 2, 3, 4].map(i => (
                    <View
                      key={i}
                      style={[
                        styles.strengthBar,
                        { backgroundColor: i <= strength.level ? strength.color : AXIS_COLORS.border },
                      ]}
                    />
                  ))}
                </View>
                <Text style={[styles.strengthLabel, { color: strength.color }]}>
                  {strength.label}
                </Text>
              </View>
            )}

            <Field
              label="CONFIRM NEW PASSWORD"
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Re-enter new password"
              secureTextEntry={!showConfirm}
              showPassword={showConfirm}
              onToggle={() => setShowConfirm(p => !p)}
            />

            {/* Match Indicator */}
            {confirm.length > 0 && (
              <Text style={[
                styles.matchText,
                { color: newPwd === confirm ? '#22C55E' : '#EF4444' },
              ]}>
                {newPwd === confirm ? '✓ Passwords match' : '✕ Passwords do not match'}
              </Text>
            )}

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.submitBtnText}>Update Password</Text>
              }
            </TouchableOpacity>

            {/* Forgot Link */}
            <TouchableOpacity
              style={styles.forgotLink}
              onPress={() => router.push('/preLogin/ForgotPasswordScreen')}
            >
              <Text style={styles.forgotLinkText}>Forgot current password?</Text>
            </TouchableOpacity>

          </View>

          <View style={{ height: 30 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AXIS_COLORS.white },

  // ── Header ──
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
  scroll: { padding: 16 },

  // ── Info Box ──
  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: '#EFF6FF', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#BFDBFE', marginBottom: 16,
  },
  infoIcon: { fontSize: 16, marginTop: 1 },
  infoText: { flex: 1, fontSize: 12, color: '#1D4ED8', fontWeight: '500', lineHeight: 18 },

  // ── Form Card ──
  formCard: {
    backgroundColor: AXIS_COLORS.white, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: AXIS_COLORS.border,
  },

  // ── Input ──
  inputSection: { marginBottom: 16 },
  label: {
    fontSize: 11, fontWeight: '700', color: AXIS_COLORS.text,
    marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.6,
  },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: AXIS_COLORS.lightBg,
    borderRadius: 10, borderWidth: 1.5, borderColor: AXIS_COLORS.border,
    paddingHorizontal: 12, height: 50,
  },
  fieldIcon: { fontSize: 16, marginRight: 8 },
  input: { flex: 1, fontSize: 14, color: AXIS_COLORS.text, fontWeight: '500' },
  eyeBtn: { padding: 6 },
  eyeIcon: { fontSize: 16 },

  sectionDivider: { height: 1, backgroundColor: AXIS_COLORS.border, marginVertical: 4 },

  // ── Strength ──
  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: -8, marginBottom: 16 },
  strengthBars: { flexDirection: 'row', gap: 4, flex: 1 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: { fontSize: 11, fontWeight: '700', minWidth: 42, textAlign: 'right' },

  // ── Match ──
  matchText: { fontSize: 12, fontWeight: '600', marginTop: -8, marginBottom: 12, marginLeft: 2 },

  // ── Submit ──
  submitBtn: {
    backgroundColor: AXIS_COLORS.primary, height: 50,
    borderRadius: 10, justifyContent: 'center', alignItems: 'center',
    marginTop: 8, elevation: 4,
    shadowColor: AXIS_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8,
  },
  submitBtnText: { color: AXIS_COLORS.white, fontSize: 15, fontWeight: '700' },

  // ── Forgot ──
  forgotLink: { alignItems: 'center', marginTop: 14, paddingVertical: 4 },
  forgotLinkText: { fontSize: 13, color: AXIS_COLORS.primary, fontWeight: '700', textDecorationLine: 'underline' },
});
