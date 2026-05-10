import { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../api';

const images = {
  4: require('../../assets/images/pizza.jpg'),
  5: require('../../assets/images/taverna.jpg'),
  6: require('../../assets/images/burger.jpg'),
};

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await api.get('/restaurants');
        setRestaurants(Array.isArray(response.data) ? response.data : [response.data]);
        console.log('🍽️ Εστιατόρια:', response.data);
      } catch (error) {
        console.error('❌ Σφάλμα φόρτωσης:', error);
      }
    };
    fetchRestaurants();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() =>
        router.push({
          pathname: 'restaurantBooking',
          params: { restaurant: JSON.stringify(item) },
        })
      }
    >
      <Image
        source={images[item.restaurant_id] || require('../../assets/images/default.jpg')}
        style={styles.image}
      />
      <Text style={styles.name}>{item.name}</Text>
      <View style={styles.infoRow}>
        <Text style={styles.icon}>📍</Text>
        <Text style={styles.text}>{item.location}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.icon}>🍽️</Text>
        <Text style={styles.text}>{item.cuisine}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.icon}>⭐</Text>
        <Text style={styles.text}>{item.rating}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.icon}>🕒</Text>
        <Text style={styles.text}>{item.opening_hours}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.icon}>📞</Text>
        <Text style={styles.text}>{item.phone}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.icon}>📧</Text>
        <Text style={styles.text}>{item.email}</Text>
      </View>
      <Text style={styles.description}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🍴 Εστιατόρια</Text>
      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.restaurant_id.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f0fa', // απαλό λιλά
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000', // μαύρο χρώμα
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: '#b9aeea', // απαλή λιλά σκιά
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  
  
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: '#777',
    marginTop: 8,
    lineHeight: 18,
  },
});

