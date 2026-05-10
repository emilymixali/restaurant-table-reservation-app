import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function Profile() {
  const router = useRouter();

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Το προφίλ σου</Text>
      <Text style={styles.subtitle}>Καλωσήρθες! Εδώ μπορείς να αποσυνδεθείς.</Text>
      <View style={styles.buttonContainer}>
        <Button title="Αποσύνδεση" onPress={handleLogout} color="#A566FF" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefefe', // πολύ ανοιχτό φόντο
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textShadowColor: '#e0ccff', // λιλά σκίαση
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    color: '#666',
    fontSize: 16,
    marginBottom: 30,
  },
  buttonContainer: {
    width: '60%',
    borderRadius: 10,
    overflow: 'hidden',
  },
});
