// screens/auth/LoginScreen.js - Jobsly Style with Axis Bank Colors
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image } from 'react-native';
import logo from '../assets/images/offro_logo.png';

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
  View
} from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Axis Bank Colors
const AXIS_COLORS = {
  primary: '#003DA5',      // Primary Axis Blue
  secondary: '#4A90E2',    // Secondary Blue
  gradient: '#1F3A7D',     // Dark Blue
  lightBg: '#E8F1F8',      // Light Blue Background
  text: '#1A1A1A',         // Dark Text
  white: '#FFFFFF',        // White
  border: '#D0E0F0',       // Light Border
  success: '#00A86B',      // Green
  error: '#E74C3C',        // Red
};

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Required', 'Please enter email and password');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ Save token properly
        await AsyncStorage.setItem('userToken', data.token);
        await AsyncStorage.setItem('userEmail', data.email);
        await AsyncStorage.setItem('userName', data.name);

        Alert.alert('Success', 'Login successful!');

        // ✅ Use replace (correct)
        router.replace('/app');
      } else {
        Alert.alert('Login Failed', data.error || 'Invalid credentials');
      }

    } catch (error) {
      console.log('LOGIN ERROR:', error); // 🔥 Debug
      Alert.alert('Error', 'Could not connect to server');
    }

    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Gradient Header */}
         <View style={styles.gradientHeader}>
          <View style={styles.headerContent}>
            <Text style={styles.appName}>OFFRO</Text>
            <Text style={styles.tagline}>Find Amazing Deals Near You</Text>
          </View>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Welcome Back</Text>
          <Text style={styles.formSubtitle}>Sign in to your account</Text>

          {/* Email Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
            <View
              style={[
                styles.inputContainer,
                emailFocused && styles.inputContainerFocused,
              ]}
            >
              <Text style={styles.inputIcon}>✉️</Text>
              <TextInput
                placeholder="name@example.com"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholderTextColor="#999"
                editable={!loading}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputSection}>
            <View style={styles.passwordHeader}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
              <TouchableOpacity onPress={() => router.push('/ForgotPasswordScreen')} >
                <Text style={styles.forgotLink}>Forgot?</Text>
              </TouchableOpacity>
            </View>
            <View
              style={[
                styles.inputContainer,
                passwordFocused && styles.inputContainerFocused,
              ]}
            >
              <Text style={styles.inputIcon}>🔐</Text>
              <TextInput
                placeholder="••••••••"
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="#999"
                editable={!loading}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Remember Me */}
          <View style={styles.rememberContainer}>
            <View style={styles.checkbox}>
              <Text style={styles.checkboxText}>✓</Text>
            </View>
            <Text style={styles.rememberText}>Remember me</Text>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.signInButton, loading && styles.buttonDisabled]}
            onPress={() => handleLogin()}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color={AXIS_COLORS.white} />
            ) : (
              <>
                <Text style={styles.signInButtonText}>Sign In</Text>
                <Text style={styles.arrow}>→</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Divider */}
          {/* <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View> */}

          {/* Social Login */}
          {/* <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton}>
              <Text style={styles.socialIcon}>📱</Text>
              <Text style={styles.socialLabel}>Apple</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Text style={styles.socialIcon}>📘</Text>
              <Text style={styles.socialLabel}>Facebook</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Text style={styles.socialIcon}>🔵</Text>
              <Text style={styles.socialLabel}>Google</Text>
            </TouchableOpacity>
          </View> */}

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>By signing in, you agree to our Terms & Privacy Policy</Text>
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
  gradientHeader: {
    backgroundColor: AXIS_COLORS.primary,
    paddingTop: 100,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: AXIS_COLORS.white,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: AXIS_COLORS.lightBg,
    marginTop: 10,
    fontWeight: '500',
  },
  formCard: {
    backgroundColor: AXIS_COLORS.white,
    marginHorizontal: 20,
    marginTop: 30,
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  formTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: AXIS_COLORS.text,
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 28,
    fontWeight: '500',
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: AXIS_COLORS.text,
    marginBottom: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AXIS_COLORS.lightBg,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: AXIS_COLORS.border,
    paddingHorizontal: 14,
    height: 56,
  },
  inputContainerFocused: {
    borderColor: AXIS_COLORS.primary,
    backgroundColor: AXIS_COLORS.white,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: AXIS_COLORS.text,
    fontWeight: '500',
  },
  eyeButton: {
    padding: 8,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  forgotLink: {
    fontSize: 13,
    color: AXIS_COLORS.primary,
    fontWeight: '700',
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: AXIS_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxText: {
    color: AXIS_COLORS.white,
    fontWeight: 'bold',
  },
  rememberText: {
    fontSize: 13,
    color: AXIS_COLORS.text,
    fontWeight: '500',
  },
  signInButton: {
    background: `linear-gradient(135deg, ${AXIS_COLORS.primary}, ${AXIS_COLORS.secondary})`,
    backgroundColor: AXIS_COLORS.primary,
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: AXIS_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signInButtonText: {
    color: AXIS_COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  arrow: {
    color: AXIS_COLORS.white,
    fontSize: 18,
    marginLeft: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: AXIS_COLORS.border,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: '#999',
    fontWeight: '700',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  socialButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: AXIS_COLORS.border,
    alignItems: 'center',
    backgroundColor: AXIS_COLORS.lightBg,
  },
  socialIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  socialLabel: {
    fontSize: 11,
    color: AXIS_COLORS.text,
    fontWeight: '700',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: AXIS_COLORS.border,
  },
  signUpText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  signUpLink: {
    fontSize: 13,
    color: AXIS_COLORS.primary,
    fontWeight: '700',
  },
  footer: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    fontWeight: '500',
    lineHeight: 16,
  },
});