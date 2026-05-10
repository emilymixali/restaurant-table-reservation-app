import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../api';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const validatePassword = (password) => {
    return /[A-Z]/.test(password) && /\d/.test(password);
  };

  const handleRegister = async () => {
    if (!name || !email || !phone || !birthdate || !password) {
      return Alert.alert('❌ Σφάλμα', 'Συμπλήρωσε όλα τα πεδία.');
    }

    if (!validatePassword(password)) {
      return Alert.alert('⚠️ Προσοχή', 'Ο κωδικός πρέπει να περιλαμβάνει τουλάχιστον 1 κεφαλαίο και 1 αριθμό.');
    }

    try {
      await api.post('/signup', {
        name,
        email,
        phone,
        birthdate,
        password,
      });

      Alert.alert('✅ Επιτυχία', 'Η εγγραφή σου ολοκληρώθηκε.');
      router.replace('/login'); // Επιστροφή στο login
    } catch (error) {
      console.error('Σφάλμα εγγραφής:', error);
      Alert.alert('❌ Σφάλμα', 'Κάτι πήγε στραβά. Προσπάθησε ξανά.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput placeholder="Ονοματεπώνυμο" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" />
      <TextInput placeholder="Τηλέφωνο" value={phone} onChangeText={setPhone} style={styles.input} keyboardType="phone-pad" />
      <TextInput placeholder="Ημ/νία Γέννησης (π.χ. 1995-05-30)" value={birthdate} onChangeText={setBirthdate} style={styles.input} />
      <TextInput placeholder="Κωδικός" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />

      <Button title="Εγγραφή" onPress={handleRegister} />

      <TouchableOpacity onPress={() => router.push('/login')}>
        <Text style={styles.link}>Έχεις ήδη λογαριασμό; Σύνδεση</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  input: { backgroundColor: '#eee', padding: 10, marginBottom: 15, borderRadius: 8 },
  link: { color: '#1E90FF', marginTop: 20, textAlign: 'center' },
});
