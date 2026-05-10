import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import api from '../../api';

export default function History() {
  const [reservations, setReservations] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchReservations = async () => {
      const token = await AsyncStorage.getItem('token');
      try {
        const res = await api.get('/user/reservations', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReservations(res.data);
      } catch (error) {
        console.error('❌ Σφάλμα κράτησης:', error);
      }
    };

    fetchReservations();
  }, []);

  const formatDate = (dateValue) => {
    if (!dateValue) return '';
  
    const localDate = new Date(dateValue); 
    const day = localDate.getDate().toString().padStart(2, '0');
    const month = (localDate.getMonth() + 1).toString().padStart(2, '0');
    const year = localDate.getFullYear();
  
    return `${day}/${month}/${year}`;
  };
  
  

  const formatTime = (timeString) => timeString?.slice(0, 5);

  const isPastReservation = (date) => {
    const today = new Date();
    const resDate = new Date(date);
    
    
    today.setHours(0, 0, 0, 0);
    resDate.setHours(0, 0, 0, 0);
  
    return resDate < today;
  };
  
  
  

  const handleDelete = async (id) => {
    const token = await AsyncStorage.getItem('token');
    try {
      await api.delete(`/reservations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReservations((prev) => prev.filter(r => r.reservation_id !== id));
      Alert.alert('✅ Επιτυχία', 'Η κράτηση διαγράφηκε με επιτυχία!');
    } catch (error) {
      console.error('❌ Σφάλμα διαγραφής:', error);
      Alert.alert('❌ Σφάλμα', 'Η διαγραφή απέτυχε.');
    }
  };

  const handleEdit = (reservation) => {
    router.push({
      pathname: '/screens/editReservation',
      params: { reservation: JSON.stringify(reservation) },
    });
  };

  const renderItem = ({ item }) => {
    const past = isPastReservation(item.date); 
    console.log('✅ raw date:', item.date, '🕒', item.time);
    console.log('➡️ isPastReservation:', isPastReservation(item.date, item.time));
    console.log('📅 Raw date:', item.date);
console.log('📅 Μετατροπή:', formatDate(item.date));

    return (
      <View style={styles.card}>
        <Text style={styles.restaurant}>{item.restaurant_name}</Text>
        <Text>📅 {formatDate(item.date)}</Text>
        <Text>🕒 {formatTime(item.time)}</Text>
        <Text>👥 Άτομα: {item.people_count}</Text>
        <Text>💬 Σχόλια: {item.comments || '–'}</Text>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, past && styles.disabledButton]}
            onPress={() => {
              if (!past) handleEdit(item);
            }}
            activeOpacity={past ? 1 : 0.7}
          >
            <Text style={[styles.buttonText, past && styles.disabledText]}>
              ✏️ Επεξεργασία
            </Text>
          </TouchableOpacity>
  
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: '#ff4d4d' },
              past && styles.disabledButton,
            ]}
            onPress={() => {
              if (!past) handleDelete(item.reservation_id);
            }}
            activeOpacity={past ? 1 : 0.7}
          >
            <Text style={[styles.buttonText, past && styles.disabledText]}>
              🗑️ Διαγραφή
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🕒 Ιστορικό Κρατήσεων</Text>
      {reservations.length === 0 ? (
        <Text style={styles.empty}>Δεν έχεις κάνει ακόμα κάποια κράτηση.</Text>
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={(item) => item.reservation_id.toString()}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: '#c7b7f7',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  card: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  restaurant: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#8b5cf6',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  disabledText: {
    color: '#666',
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#666',
  },
});
