// screens/auth/RegisterScreen.js - Jobsly Style
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
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
  View,
} from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const AXIS_COLORS = {
  primary: '#003DA5',
  secondary: '#4A90E2',
  gradient: '#1F3A7D',
  lightBg: '#E8F1F8',
  text: '#1A1A1A',
  white: '#FFFFFF',
  border: '#D0E0F0',
  success: '#00A86B',
  error: '#E74C3C',
};

export default function RegisterScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const recaptchaVerifier = useRef(null);
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Please enter your name');
      return false;
    }
    if (!formData.email.includes('@')) {
      Alert.alert('Validation Error', 'Please enter a valid email');
      return false;
    }
    if (formData.phone.length < 10) {
      Alert.alert('Validation Error', 'Please enter a valid phone number');
      return false;
    }
    if (formData.password.length < 8) {
      Alert.alert('Validation Error', 'Password must be at least 8 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match');
      return false;
    }
    if (!agreeTerms) {
      Alert.alert('Required', 'Please agree to terms and conditions');
      return false;
    }
    return true;
  };

  // const handleRegister = async () => {
  //   if (!validateForm()) return;

  //   setLoading(true);
  //   try {
  //     const response = await fetch(`${API_URL}/api/user/register`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({
  //         name: formData.name,
  //         email: formData.email,
  //         mobile: formData.phone,
  //         password: formData.password,
  //       }),
  //     });

  //     const data = await response.json();
  //     console.log('testing',data);
  //     if (response.ok) {
  //      Alert.alert('Success', 'Account created! Verify OTP');
  //       router.push({
  //         pathname: '/otp',
  //         params: {
  //           email: formData.email,
  //         },
  //       });
  //     } else {
  //       Alert.alert('Error', data.error || 'Registration failed');
  //     }
  //   } catch (error) {
  //     Alert.alert('Error', 'Could not connect to server');
  //   }
  //   setLoading(false);
  // };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
  try {
    const res = await fetch(`${API_URL}/api/user/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        mobile: formData.phone,
        password: formData.password,
      }),
    });

    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      router.push({
        pathname: '/otp',
        params: { email: formData.email },
      });
    } else {
      Alert.alert(data.error);
    }
  } catch (err) {
    Alert.alert('Error');
  }
};
  const inputFields = [
    { label: 'Full Name', field: 'name', icon: '👤', placeholder: 'John Doe' },
    { label: 'Email', field: 'email', icon: '✉️', placeholder: 'john@example.com', keyboard: 'email-address' },
    { label: 'Phone', field: 'phone', icon: '📱', placeholder: '+91 98765 43210', keyboard: 'phone-pad' },
    { label: 'Password', field: 'password', icon: '🔐', placeholder: '8+ characters', secure: true },
    { label: 'Confirm Password', field: 'confirmPassword', icon: '🔐', placeholder: 'Re-enter', secure: true },
  ];

  const passwordStrength = formData.password.length >= 8 ? 'Strong' : formData.password.length >= 6 ? 'Medium' : 'Weak';
  const passwordMatch = formData.confirmPassword === formData.password && formData.confirmPassword.length > 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Gradient Header */}
        <View style={styles.gradientHeader}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.push('/login')}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSubtitle}>Join our community</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
          <Text style={styles.progressText}>Step 1 of 1</Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          {inputFields.map((field) => (
            <View key={field.field} style={styles.inputSection}>
              <Text style={styles.inputLabel}>{field.label}</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedField === field.field && styles.inputContainerFocused,
                ]}
              >
                <Text style={styles.inputIcon}>{field.icon}</Text>
                <TextInput
                  placeholder={field.placeholder}
                  style={styles.input}
                  value={formData[field.field]}
                  onChangeText={(value) => handleChange(field.field, value)}
                  keyboardType={field.keyboard || 'default'}
                  placeholderTextColor="#999"
                  secureTextEntry={field.secure || false}
                  editable={!loading}
                  onFocus={() => setFocusedField(field.field)}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              {field.field === 'password' && formData.password.length > 0 && (
                <View style={styles.validationContainer}>
                  <Text style={[
                    styles.validationText,
                    passwordStrength === 'Strong' ? styles.validationStrong : styles.validationWeak
                  ]}>
                    {passwordStrength === 'Strong' ? '✓' : '!'} {passwordStrength} password
                  </Text>
                </View>
              )}

              {field.field === 'confirmPassword' && formData.confirmPassword.length > 0 && (
                <View style={styles.validationContainer}>
                  <Text style={[
                    styles.validationText,
                    passwordMatch ? styles.validationStrong : styles.validationWeak
                  ]}>
                    {passwordMatch ? '✓' : '✗'} {passwordMatch ? 'Match' : 'Do not match'}
                  </Text>
                </View>
              )}
            </View>
          ))}

          {/* Terms */}
          <View style={styles.termsContainer}>
            <TouchableOpacity
              style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}
              onPress={() => setAgreeTerms(!agreeTerms)}
            >
              {agreeTerms && <Text style={styles.checkboxTick}>✓</Text>}
            </TouchableOpacity>
            <Text style={styles.termsText}>
              I agree to <Text style={styles.termsLink}>Terms</Text> & <Text style={styles.termsLink}>Privacy</Text>
            </Text>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[styles.signUpButton, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={AXIS_COLORS.white} />
            ) : (
              <>
                <Text style={styles.signUpButtonText}>Create Account</Text>
                <Text style={styles.arrow}>→</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Sign In Link */}
          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  backButton: {
    marginBottom: 15,
  },
  backText: {
    fontSize: 16,
    color: AXIS_COLORS.white,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: AXIS_COLORS.white,
  },
  headerSubtitle: {
    fontSize: 14,
    color: AXIS_COLORS.lightBg,
    marginTop: 8,
    fontWeight: '500',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: AXIS_COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    width: '100%',
    backgroundColor: AXIS_COLORS.primary,
  },
  progressText: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: AXIS_COLORS.white,
    marginHorizontal: 20,
    paddingHorizontal: 24,
    paddingVertical: 28,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 20,
  },
  inputSection: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: AXIS_COLORS.text,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AXIS_COLORS.lightBg,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: AXIS_COLORS.border,
    paddingHorizontal: 14,
    height: 52,
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
  validationContainer: {
    marginTop: 6,
  },
  validationText: {
    fontSize: 12,
    fontWeight: '600',
  },
  validationStrong: {
    color: AXIS_COLORS.success,
  },
  validationWeak: {
    color: '#FF9800',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingVertical: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: AXIS_COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: AXIS_COLORS.primary,
    borderColor: AXIS_COLORS.primary,
  },
  checkboxTick: {
    color: AXIS_COLORS.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    flex: 1,
  },
  termsLink: {
    color: AXIS_COLORS.primary,
    fontWeight: '700',
  },
  signUpButton: {
    backgroundColor: AXIS_COLORS.primary,
    height: 54,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: AXIS_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signUpButtonText: {
    color: AXIS_COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  arrow: {
    color: AXIS_COLORS.white,
    fontSize: 18,
    marginLeft: 8,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: AXIS_COLORS.border,
  },
  signInText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  signInLink: {
    fontSize: 13,
    color: AXIS_COLORS.primary,
    fontWeight: '700',
  },
});

