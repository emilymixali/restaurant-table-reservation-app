import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../api';


export default function RestaurantListScreen() {
  const [restaurants, setRestaurants] = useState([]);
  const router = useRouter();

  const images = {
    4: require('../assets/images/pizza.jpg'),
    5: require('../assets/images/taverna.jpg'),
    6: require('../assets/images/burger.jpg'),
  };

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await api.get('/restaurants');
        const data = Array.isArray(response.data) ? response.data : [response.data];
        setRestaurants(data);
        console.log('🍽️ Εστιατόρια:', data);
      } catch (error) {
        console.error('❌ Σφάλμα φόρτωσης:', error);
      }
    };

    fetchRestaurants();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => router.push({ pathname: '/(tabs)/restaurantBooking', params: {
        restaurant_id: item.restaurant_id,
        name: item.name,
        opening_hours: item.opening_hours,
        email: item.email,
        phone: item.phone
      }
       })}
      style={styles.card}
    >
      <Image
        source={images[item.restaurant_id] || require('../assets/images/default.jpg')}
        style={styles.image}
      />
      <Text style={styles.name}>{item.name || 'Χωρίς όνομα'}</Text>
      <Text style={styles.details}>📍 {item.location || 'Άγνωστη τοποθεσία'}</Text>
      <Text style={styles.details}>🍽️ Κουζίνα: {item.cuisine || 'Μη καθορισμένη'}</Text>
      <Text style={styles.details}>⭐ Αξιολόγηση: {item.rating || 'N/A'}</Text>
      <Text style={styles.details}>🕒 Ωράριο: {item.opening_hours || 'Μη διαθέσιμο'}</Text>
      <Text style={styles.details}>📞 Τηλέφωνο: {item.phone || '—'}</Text>
      <Text style={styles.details}>📧 Email: {item.email || '—'}</Text>
      <Text style={styles.description}>{item.description || 'Δεν υπάρχει περιγραφή.'}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Διαθέσιμα Εστιατόρια</Text>
      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.restaurant_id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 15,
  },
  title: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#1f1f1f',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  details: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 2,
  },
  description: {
    fontSize: 13,
    color: '#aaa',
    marginTop: 8,
  },
});
