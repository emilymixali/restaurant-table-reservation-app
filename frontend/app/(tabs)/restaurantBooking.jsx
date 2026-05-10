import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Alert, TextInput, TouchableOpacity, Modal, FlatList
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

export default function RestaurantBooking() {
  const { restaurant } = useLocalSearchParams();
  const parsed = JSON.parse(restaurant || '{}');
  const { restaurant_id, name, opening_hours, email, phone } = parsed;

  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [peopleCount, setPeopleCount] = useState('');
  const [comments, setComments] = useState('');
  const [user, setUser] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [reservationData, setReservationData] = useState(null);
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimeModalVisible, setTimeModalVisible] = useState(false);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleDateConfirm = (date) => {
    setSelectedDate(date);
    hideDatePicker();
  };

  const toggleTimeModal = () => setTimeModalVisible(!isTimeModalVisible);

  useEffect(() => {
    const fetchUser = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Αποσύνδεση', 'Παρακαλώ συνδέσου ξανά.');
        return;
      }
      try {
        const res = await api.get('/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data);
      } catch (err) {
        Alert.alert('Αποσύνδεση', 'Το session έληξε. Παρακαλώ συνδέσου ξανά.');
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchAvailable = async () => {
      if (!selectedDate) return;
      const dateStr = selectedDate.toISOString().split('T')[0];
      try {
        const res = await api.get('/reservations/available', {
          params: {
            restaurant_id: parseInt(restaurant_id),
            date: dateStr,
          },
        });
        setAvailableSlots(res.data.availableSlots || []);
      } catch (err) {
        console.error('❌ Σφάλμα διαθέσιμων ωρών:', err);
      }
    };
    fetchAvailable();
  }, [selectedDate]);

  const handleBooking = async () => {
    const people = parseInt(peopleCount);

    if (!selectedDate || !selectedTime || !peopleCount) {
      Alert.alert('❌ Παρακαλώ επίλεξε ημερομηνία, ώρα και αριθμό ατόμων!');
      return;
    }

    const token = await AsyncStorage.getItem('token');
    const dateStr = selectedDate.toISOString().split('T')[0];

    try {
      const response = await api.post(
        '/reservations',
        {
          restaurant_id: parseInt(restaurant_id),
          date: dateStr,
          time: selectedTime,
          comments,
          people_count: people,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReservationData({
        restaurantName: name,
        restaurantEmail: email,
        restaurantPhone: phone,
        userName: user?.name || 'Χρήστης',
        userEmail: user?.email || '-',
        date: dateStr,
        time: selectedTime,
        comments,
        peopleCount: people,
      });

      setShowConfirmation(true);
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        'Παρουσιάστηκε σφάλμα.';

      if (message.toLowerCase().includes('jwt expired')) {
        Alert.alert('⏳ Συνεδρία έληξε', 'Παρακαλώ συνδέσου ξανά.');
        await AsyncStorage.removeItem('token');
        router.replace('/(screens)/index');
        return;
      }

      Alert.alert('❌ Αποτυχία κράτησης', message);
    }
  };

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const isToday = selectedDate instanceof Date && !isNaN(selectedDate)
    ? selectedDate.toISOString().split('T')[0] === todayStr
    : false;

  const filteredSlots = isToday
    ? availableSlots.filter(slot => {
        const [h, m] = slot.split(':');
        const slotTime = new Date();
        slotTime.setHours(h, m, 0, 0);
        return slotTime > now;
      })
    : availableSlots;

  return (
    <View style={styles.container}>
      {showConfirmation && reservationData ? (
        <View style={styles.confirmBox}>
          <Text style={styles.confirmTitle}>✅ Η κράτησή σου επιβεβαιώθηκε!</Text>
          <Text style={styles.confirmText}>🍽️ {reservationData.restaurantName}</Text>
          <Text style={styles.confirmText}>📅 {reservationData.date} ⏰ {reservationData.time}</Text>
          <Text style={styles.confirmText}>👥 Άτομα: {reservationData.peopleCount}</Text>
          <Text style={styles.confirmText}>📝 Σχόλια: {reservationData.comments || '–'}</Text>
          <Text style={styles.confirmText}>👤 {reservationData.userName}</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.push('restaurants')}>
            <Text style={styles.buttonText}>Επιστροφή στα Εστιατόρια</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.title}>Κράτηση για: {name}</Text>
          <View style={styles.restaurantInfo}>
            <Text style={styles.infoTitle}>📌 Στοιχεία Εστιατορίου</Text>
            <Text style={styles.infoText}>🍽️  {name}</Text>
            <Text style={styles.infoText}>🕒 {opening_hours}</Text>
            <Text style={styles.infoText}>📧 {email}</Text>
            <Text style={styles.infoText}>📞 {phone}</Text>
          </View>

          <Text style={styles.label}>📅 Ημερομηνία:</Text>
          <TouchableOpacity onPress={showDatePicker} style={styles.input}>
            <Text>{selectedDate ? selectedDate.toDateString() : 'Επίλεξε ημερομηνία'}</Text>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            minimumDate={new Date()}
            onConfirm={handleDateConfirm}
            onCancel={hideDatePicker}
          />

          <Text style={styles.label}>⏰ Ώρα:</Text>
          <TouchableOpacity onPress={toggleTimeModal} style={styles.input}>
            <Text>{selectedTime ? selectedTime : 'Επίλεξε ώρα'}</Text>
          </TouchableOpacity>
          <Modal visible={isTimeModalVisible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Διαθέσιμες Ώρες</Text>
                <FlatList
                  data={filteredSlots}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.modalItem}
                      onPress={() => {
                        setSelectedTime(item);
                        toggleTimeModal();
                      }}
                    >
                      <Text>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
                <TouchableOpacity onPress={toggleTimeModal} style={styles.button}>
                  <Text style={styles.buttonText}>Κλείσιμο</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <Text style={styles.label}>👥 Άτομα:</Text>
          <TextInput
            keyboardType="numeric"
            placeholder="π.χ. 2"
            value={peopleCount}
            onChangeText={(text) => {
              setPeopleCount(text);
              const num = parseInt(text);
              setShowLimitWarning(num > 20);
            }}
            style={[
              styles.input,
              showLimitWarning && styles.inputWarning
            ]}
          />
          {showLimitWarning && (
            <Text style={styles.warningText}>
              Για περισσότερα από 20 άτομα, παρακαλούμε καλέστε το εστιατόριο.
            </Text>
          )}

          <Text style={styles.label}>📝 Σχόλια:</Text>
          <TextInput
            style={styles.textarea}
            multiline
            placeholder="Οποιαδήποτε σχόλια..."
            value={comments}
            onChangeText={setComments}
          />

          <TouchableOpacity style={styles.button} onPress={handleBooking}>
            <Text style={styles.buttonText}>Καταχώριση Κράτησης</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f1f1f',
    marginBottom: 16,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderColor: '#A566FF',
    paddingBottom: 8,
  },
  label: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
    color: '#444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fafafa',
    marginBottom: 12,
  },
  textarea: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 10,
    padding: 10,
    height: 100,
    textAlignVertical: 'top',
    backgroundColor: '#fafafa',
    marginBottom: 20,
  },
  restaurantInfo: {
    backgroundColor: '#f5ecff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#A566FF',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#A566FF',
  },
  infoTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#6b24b6',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  confirmBox: {
    backgroundColor: '#f8f0ff',
    padding: 20,
    borderRadius: 14,
    borderLeftColor: '#A566FF',
    borderLeftWidth: 5,
    marginTop: 20,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  confirmText: {
    fontSize: 16,
    color: '#444',
    marginBottom: 6,
  },
  inputWarning: {
    borderColor: '#ff4d4d',
    backgroundColor: '#fff5f5',
  },
  warningText: {
    color: '#ff4d4d',
    fontSize: 13,
    marginTop: -8,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#A566FF',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});
