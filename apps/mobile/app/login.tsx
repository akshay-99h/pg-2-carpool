import { Link } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { apiFetch } from '@/lib/api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [stage, setStage] = useState<'EMAIL' | 'OTP'>('EMAIL');
  const [status, setStatus] = useState('');

  const sendOtp = async () => {
    setStatus('Sending OTP...');
    try {
      await apiFetch('/api/auth/request-otp', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setStage('OTP');
      setStatus('OTP sent. Check your email.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to send OTP');
    }
  };

  return (
    <View className="flex-1 bg-surface px-4 py-8">
      <Text className="mb-2 text-xl font-bold text-primary">Pilot Login</Text>
      <Text className="mb-4 text-sm text-gray-600">Email OTP is enabled for pilot users.</Text>

      <TextInput
        className="mb-3 rounded-xl border border-gray-300 bg-white px-3 py-3"
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      {stage === 'OTP' ? (
        <TextInput
          className="mb-3 rounded-xl border border-gray-300 bg-white px-3 py-3"
          placeholder="6-digit OTP"
          keyboardType="number-pad"
          value={otp}
          onChangeText={setOtp}
        />
      ) : null}

      {stage === 'EMAIL' ? (
        <Text
          className="rounded-xl bg-primary px-4 py-3 text-center font-semibold text-white"
          onPress={sendOtp}
        >
          Send OTP
        </Text>
      ) : (
        <Link
          href="/home"
          className="rounded-xl bg-primary px-4 py-3 text-center font-semibold text-white"
        >
          Continue (Web session required)
        </Link>
      )}

      {status ? <Text className="mt-3 text-sm text-gray-600">{status}</Text> : null}
    </View>
  );
}
