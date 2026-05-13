import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AXIS_COLORS } from '../../constants/colors'

export default function OTP() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [otp, setOtp] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const verifyOTP = async () => {
    try {
      const res = await fetch(`${API_URL}/api/user/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert('Success');
        router.replace('/preLogin/login'); // Dashboard
      } else {
        Alert.alert(data.error);
      }
    } catch (err) {
      Alert.alert('Error');
    }
  };

  // 🔁 RESEND OTP
  const resendOTP = async () => {
    await fetch(`${API_URL}/api/user/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    Alert.alert('OTP resent');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter OTP</Text>

      <Text style={styles.subText}>Sent to {email}</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter OTP"
        keyboardType="number-pad"
        value={otp}
        onChangeText={setOtp}
      />

      <TouchableOpacity style={styles.button} onPress={verifyOTP}>
        <Text style={styles.buttonText}>
          {loading ? "Verifying..." : "Verify"}
        </Text>
      </TouchableOpacity>

      {timer > 0 ? (
        <Text style={styles.timer}>Resend in {timer}s</Text>
      ) : (
        <TouchableOpacity onPress={resendOTP}>
          <Text style={styles.resend}>Resend OTP</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold' },
  subText: { marginBottom: 20, color: '#666' },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 10
  },
  button: {
    backgroundColor: '#003DA5',
    padding: 12,
    borderRadius: 8
  },
  buttonText: { color: '#fff', textAlign: 'center' },
  timer: { marginTop: 10, textAlign: 'center', color: '#999' },
  resend: { marginTop: 10, textAlign: 'center', color: '#003DA5' }
});