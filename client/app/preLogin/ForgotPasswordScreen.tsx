import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, ActivityIndicator, Alert, SafeAreaView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
import { AXIS_COLORS } from '../../constants/colors'

const STEPS = { EMAIL: 1, OTP: 2, RESET: 3 };

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [step, setStep]                   = useState(STEPS.EMAIL);
  const [email, setEmail]                 = useState('');
  const [otp, setOtp]                     = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew]             = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [loading, setLoading]             = useState(false);
  const [resendTimer, setResendTimer]     = useState(0);
  const otpRefs = useRef([]);

  // ── Step 1: Send OTP ──
  const handleSendOtp = async () => {
    if (!email || !email.includes('@')) { Alert.alert('Invalid', 'Enter a valid email'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/user/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) { setStep(STEPS.OTP); startTimer(); }
      else Alert.alert('Error', data.message || 'Failed to send OTP');
    } catch { Alert.alert('Error', 'Server error'); }
    finally { setLoading(false); }
  };

  // ── Step 2: Verify OTP ──
  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length < 6) { Alert.alert('Required', 'Enter the 6-digit OTP'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/user/forgot-verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      if (res.ok) setStep(STEPS.RESET);
      else Alert.alert('Error', data.message || 'Invalid OTP');
    } catch { Alert.alert('Error', 'Server error'); }
    finally { setLoading(false); }
  };

  // ── Step 3: Reset Password ──
  const handleResetPassword = async () => {
    if (newPassword.length < 6) { Alert.alert('Required', 'At least 6 characters'); return; }
    if (newPassword !== confirmPassword) { Alert.alert('Mismatch', 'Passwords do not match'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/user/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otp.join(''), newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('Success', 'Password reset! Please login.', [{ text: 'Login', onPress: () => router.push('/preLogin/login') }]);
      } else {
        Alert.alert('Error', data.message || 'Reset failed');
      }
    } catch { Alert.alert('Error', 'Server error'); }
    finally { setLoading(false); }
  };

  // ── OTP box handler ──
  const handleOtpChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKey = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // ── Resend timer ──
  const startTimer = () => {
    setResendTimer(30);
    const t = setInterval(() => {
      setResendTimer(prev => { if (prev <= 1) { clearInterval(t); return 0; } return prev - 1; });
    }, 1000);
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/user/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) { setOtp(['', '', '', '', '', '']); startTimer(); Alert.alert('Sent', 'OTP resent'); }
    } catch { }
    finally { setLoading(false); }
  };

  // ── Step indicator ──
  const StepBar = () => (
    <View>
      <View style={styles.stepRow}>
        {[STEPS.EMAIL, STEPS.OTP, STEPS.RESET].map((s, i) => (
          <React.Fragment key={s}>
            <View style={[styles.stepDot, step >= s && styles.stepDotActive]}>
              {step > s
                ? <Text style={styles.stepCheck}>✓</Text>
                : <Text style={[styles.stepNum, step >= s && styles.stepNumActive]}>{s}</Text>
              }
            </View>
            {i < 2 && <View style={[styles.stepLine, step > s && styles.stepLineActive]} />}
          </React.Fragment>
        ))}
      </View>
      <View style={styles.stepLabels}>
        {['Email', 'Verify', 'Reset'].map(l => (
          <Text key={l} style={styles.stepLabel}>{l}</Text>
        ))}
      </View>
    </View>
  );

  const stepIcons    = { [STEPS.EMAIL]: '📧', [STEPS.OTP]: '🔑', [STEPS.RESET]: '🔐' };
  const stepTitles   = { [STEPS.EMAIL]: 'Forgot Password', [STEPS.OTP]: 'Enter OTP', [STEPS.RESET]: 'New Password' };
  const stepSubtitles = { [STEPS.EMAIL]: 'Enter your email to receive a reset code', [STEPS.OTP]: `Code sent to ${email}`, [STEPS.RESET]: 'Set your new password' };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>

        {/* ── Header ── */}
        <View style={styles.gradientHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => step === STEPS.EMAIL ? router.back() : setStep(prev => prev - 1)}
          >
            <View style={styles.backRow}>
              <Text style={styles.backArrow}>←</Text>
              <Text style={styles.backText}>{step === STEPS.EMAIL ? 'Login' : 'Back'}</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.headerIconWrap}>
              <Text style={styles.headerIcon}>{stepIcons[step]}</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>{stepTitles[step]}</Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>{stepSubtitles[step]}</Text>
            </View>
          </View>
        </View>

          

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          style={{ backgroundColor: AXIS_COLORS.cardBg }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Step bar */}
          <View style={styles.stepContainer}>
            <StepBar />
          </View>

          {/* Form card */}
          <View style={styles.formCard}>

            {/* ── STEP 1: Email ── */}
            {step === STEPS.EMAIL && (
              <View>
                <View style={styles.inputSection}>
                  <Text style={styles.label}>EMAIL ADDRESS</Text>
                  <View style={styles.inputBox}>
                    <Text style={styles.inputIcon}>📧</Text>
                    <TextInput
                      style={styles.input}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Enter your email"
                      placeholderTextColor={AXIS_COLORS.muted}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>
                <TouchableOpacity style={[styles.submitBtn, loading && { opacity: 0.6 }]} onPress={handleSendOtp} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Send Reset Code</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={styles.bottomLink} onPress={() => router.push('/preLogin/login')}>
                  <Text style={styles.bottomLinkText}>Back to Login</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── STEP 2: OTP ── */}
            {step === STEPS.OTP && (
              <View>
                <Text style={styles.otpHint}>
                  Enter the 6-digit code sent to{'\n'}
                  <Text style={{ fontWeight: '800', color: AXIS_COLORS.primary }}>{email}</Text>
                </Text>

                <View style={styles.otpRow}>
                  {otp.map((digit, i) => (
                    <TextInput
                      key={i}
                      ref={r => otpRefs.current[i] = r}
                      style={[styles.otpBox, digit && styles.otpBoxFilled]}
                      value={digit}
                      onChangeText={v => handleOtpChange(v, i)}
                      onKeyPress={e => handleOtpKey(e, i)}
                      keyboardType="number-pad"
                      maxLength={1}
                      textAlign="center"
                    />
                  ))}
                </View>

                <View style={styles.resendRow}>
                  <Text style={styles.resendHint}>Didn't receive code? </Text>
                  <TouchableOpacity onPress={handleResend} disabled={resendTimer > 0}>
                    <Text style={[styles.resendBtn, resendTimer > 0 && { color: AXIS_COLORS.muted, textDecorationLine: 'none' }]}>
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={[styles.submitBtn, loading && { opacity: 0.6 }]} onPress={handleVerifyOtp} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Verify OTP</Text>}
                </TouchableOpacity>
              </View>
            )}

            {/* ── STEP 3: New Password ── */}
            {step === STEPS.RESET && (
              <View>
                <View style={styles.inputSection}>
                  <Text style={styles.label}>NEW PASSWORD</Text>
                  <View style={styles.inputBox}>
                    <Text style={styles.inputIcon}>🔒</Text>
                    <TextInput
                      style={styles.input}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      placeholder="Enter new password"
                      placeholderTextColor={AXIS_COLORS.muted}
                      secureTextEntry={!showNew}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                      <Text style={styles.eyeIcon}>{showNew ? '🙈' : '👁️'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.label}>CONFIRM PASSWORD</Text>
                  <View style={styles.inputBox}>
                    <Text style={styles.inputIcon}>🔒</Text>
                    <TextInput
                      style={styles.input}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Re-enter new password"
                      placeholderTextColor={AXIS_COLORS.muted}
                      secureTextEntry={!showConfirm}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                      <Text style={styles.eyeIcon}>{showConfirm ? '🙈' : '👁️'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {confirmPassword.length > 0 && (
                  <Text style={[styles.matchText, { color: newPassword === confirmPassword ? '#22C55E' : '#EF4444' }]}>
                    {newPassword === confirmPassword ? '✓ Passwords match' : '✕ Passwords do not match'}
                  </Text>
                )}

                <TouchableOpacity style={[styles.submitBtn, loading && { opacity: 0.6 }]} onPress={handleResetPassword} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Reset Password</Text>}
                </TouchableOpacity>
              </View>
            )}

          </View>
          <View style={{ height: 30 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AXIS_COLORS.white },

  // ── Header: white bg + border + lightBg icon box ──
  header: {
    backgroundColor: AXIS_COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: AXIS_COLORS.border,
  },
  gradientHeader: {
    backgroundColor: AXIS_COLORS.primary,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  backButton: { marginBottom: 12 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backArrow: { fontSize: 20, color: '#fff', fontWeight: '800' },
  backText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  headerContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIconWrap: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: AXIS_COLORS.lightBg,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: AXIS_COLORS.border,
  },
  headerIcon: { fontSize: 24 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  headerSubtitle: { fontSize: 12, color: AXIS_COLORS.muted, marginTop: 2, fontWeight: '500' },

  scroll: { padding: 16 },

  // Step bar
  stepContainer: { marginBottom: 16 },
  stepRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  stepDot: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: AXIS_COLORS.white,
    borderWidth: 2, borderColor: AXIS_COLORS.border,
    justifyContent: 'center', alignItems: 'center',
  },
  stepDotActive: { backgroundColor: AXIS_COLORS.primary, borderColor: AXIS_COLORS.primary },
  stepCheck: { fontSize: 14, color: '#fff', fontWeight: '800' },
  stepNum: { fontSize: 13, fontWeight: '700', color: AXIS_COLORS.muted },
  stepNumActive: { color: '#fff' },
  stepLine: { flex: 1, height: 2, backgroundColor: AXIS_COLORS.border, marginHorizontal: 6 },
  stepLineActive: { backgroundColor: AXIS_COLORS.primary },
  stepLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8, marginTop: 8 },
  stepLabel: { fontSize: 10, fontWeight: '700', color: AXIS_COLORS.muted, textAlign: 'center', flex: 1 },

  // Form
  formCard: {
    backgroundColor: AXIS_COLORS.white, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: AXIS_COLORS.border,
  },
  inputSection: { marginBottom: 16 },
  label: {
    fontSize: 11, fontWeight: '700', color: AXIS_COLORS.text,
    marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.6,
  },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: AXIS_COLORS.lightBg,
    borderRadius: 10, borderWidth: 1.5, borderColor: AXIS_COLORS.border,
    paddingHorizontal: 12, height: 48,
  },
  inputIcon: { fontSize: 16, marginRight: 8 },
  input: { flex: 1, fontSize: 14, color: AXIS_COLORS.text, fontWeight: '500' },
  eyeIcon: { fontSize: 16, padding: 4 },

  // OTP
  otpHint: {
    fontSize: 13, color: AXIS_COLORS.muted, fontWeight: '500',
    textAlign: 'center', lineHeight: 20, marginBottom: 20,
  },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 16 },
  otpBox: {
    flex: 1, height: 52, borderRadius: 10,
    backgroundColor: AXIS_COLORS.lightBg,
    borderWidth: 2, borderColor: AXIS_COLORS.border,
    fontSize: 20, fontWeight: '800', color: AXIS_COLORS.text,
  },
  otpBoxFilled: { borderColor: AXIS_COLORS.primary, backgroundColor: '#EFF6FF' },
  resendRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  resendHint: { fontSize: 12, color: AXIS_COLORS.muted, fontWeight: '500' },
  resendBtn: { fontSize: 12, color: AXIS_COLORS.primary, fontWeight: '700', textDecorationLine: 'underline' },

  matchText: { fontSize: 12, fontWeight: '600', marginTop: -8, marginBottom: 12, marginLeft: 4 },

  submitBtn: {
    backgroundColor: AXIS_COLORS.primary, height: 50,
    borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 4,
    shadowColor: AXIS_COLORS.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  submitBtnText: { color: AXIS_COLORS.white, fontSize: 15, fontWeight: '700' },

  bottomLink: { alignItems: 'center', marginTop: 14, paddingVertical: 4 },
  bottomLinkText: { fontSize: 13, color: AXIS_COLORS.primary, fontWeight: '700', textDecorationLine: 'underline' },
});
