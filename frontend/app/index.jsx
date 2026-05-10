import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import api from '../api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await api.post('/login', { email, password });
      const token = response.data.token;
      await AsyncStorage.setItem('token', token);
      Alert.alert('✅ Επιτυχής Σύνδεση');
      router.push('restaurants');
    } catch (error) {
      Alert.alert('❌ Σφάλμα', 'Λάθος στοιχεία σύνδεσης.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Καλωσόρισες στην εφαρμογή κρατήσεων!</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        placeholderTextColor="#555"
      />
      <TextInput
        placeholder="Κωδικός"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        placeholderTextColor="#555"
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Σύνδεση</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/screens/signup')}>
        <Text style={styles.link}>Δεν έχεις λογαριασμό; Κάνε εγγραφή</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d8b4f8', // απαλό λιλά
    justifyContent: 'center',
    padding: 20,
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 30,
    color: '#4b0082', // σκούρο μοβ
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#f5e6ff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    color: '#000',
  },
  button: {
    backgroundColor: '#8a2be2',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  link: {
    color: '#4b0082',
    textAlign: 'center',
    marginTop: 10,
  },
});
