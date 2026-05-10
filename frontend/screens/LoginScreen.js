import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // <== Προσθήκη Navigation
import AsyncStorage from '@react-native-async-storage/async-storage'; // <== Αποθήκευση token
import api from '../api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation(); // <== Navigation για μετάβαση σε άλλη οθόνη

  const handleLogin = async () => {
    console.log('Login pressed', email, password); // Debug

    try {
      const response = await api.post('/login', 
  { email, password },
  { headers: { 'Content-Type': 'application/json' } }
);

      const token = response.data.token;

      // Αποθήκευση του token
      await AsyncStorage.setItem('token', token);
      
      Alert.alert('Επιτυχία!', 'Συνδέθηκες!');
      console.log('Token:', token);

      // ✅ Μετάβαση στη σελίδα με τα εστιατόρια
      navigation.navigate('restaurants'); 
    } catch (error) {
      Alert.alert('Σφάλμα', 'Λάθος στοιχεία σύνδεσης.');
      console.error('API error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        secureTextEntry
        style={styles.input}
        placeholder="Κωδικός"
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Σύνδεση" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#000',
  },
  input: {
    height: 45,
    backgroundColor: '#fff',
    color: '#000',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
});
