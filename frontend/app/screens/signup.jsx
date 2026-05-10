import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import api from '../../api';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    try {
      const response = await api.post('/register', {
        name,
        email,
        phone,
        birth_date: birthDate,
        password,
      });

      Alert.alert('✅ Εγγραφή επιτυχής', 'Τώρα μπορείς να συνδεθείς!');
      router.push('/');
    } catch (error) {
      console.error('❌ Σφάλμα εγγραφής:', error);
      Alert.alert('Σφάλμα', error?.response?.data?.error || 'Κάτι πήγε στραβά.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Δημιούργησε λογαριασμό </Text>
      <TextInput
        placeholder="Ονοματεπώνυμο"
        value={name}
        onChangeText={setName}
        style={styles.input}
        placeholderTextColor="#555"
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        placeholderTextColor="#555"
      />
      <TextInput
        placeholder="Τηλέφωνο"
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
        keyboardType="phone-pad"
        placeholderTextColor="#555"
      />
      <TextInput
        placeholder="Ημερομηνία γέννησης (YYYY-MM-DD)"
        value={birthDate}
        onChangeText={setBirthDate}
        style={styles.input}
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
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Εγγραφή</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/')}>
        <Text style={styles.link}>Έχεις ήδη λογαριασμό; Κάνε σύνδεση</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d8b4f8',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 30,
    color: '#4b0082',
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
