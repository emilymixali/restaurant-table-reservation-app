import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import api from '../../api';

export default function EditReservation() {
  const { reservation } = useLocalSearchParams();
  const router = useRouter();
  const parsed = JSON.parse(reservation || '{}');

  const [date, setDate] = useState(parsed.date);
  const [time, setTime] = useState(parsed.time);
  const [peopleCount, setPeopleCount] = useState(parsed.people_count.toString());
  const [comments, setComments] = useState(parsed.comments || '');
  const [availableSlots, setAvailableSlots] = useState([]);

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimeModalVisible, setTimeModalVisible] = useState(false);

  const now = new Date();

  const normalizeDate = (input) => {
    if (typeof input === 'string' && input.includes('T')) {
      return input.split('T')[0];
    }
    if (input instanceof Date) {
      return input.toISOString().split('T')[0];
    }
    return input.trim?.() || input;
  };

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleDateConfirm = (selected) => {
    setDate(normalizeDate(selected));
    hideDatePicker();
  };

  const toggleTimeModal = () => setTimeModalVisible(!isTimeModalVisible);

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      try {
        const res = await api.get('/reservations/available', {
          params: {
            restaurant_id: parsed.restaurant_id,
            date: normalizeDate(date),
          },
        });
        setAvailableSlots(res.data.availableSlots || []);
      } catch (err) {
        console.error('❌ Σφάλμα διαθέσιμων ωρών:', err);
      }
    };
    if (date) fetchAvailableSlots();
  }, [date]);

  const handleUpdate = async () => {
    if (!date || !time || !peopleCount) {
      Alert.alert('❌ Συμπλήρωσε όλα τα πεδία!');
      return;
    }

    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('⚠️ Σφάλμα', 'Δεν βρέθηκε token.');
      return;
    }

    const cleanDate = normalizeDate(date);

    try {
      await api.put(
        `/reservations/${parsed.reservation_id}`,
        {
          date: cleanDate,
          time,
          people_count: parseInt(peopleCount),
          comments,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Alert.alert('✅ Επιτυχής ενημέρωση');
      router.push('/(tabs)/history');
    } catch (err) {
      console.error('❌ Σφάλμα ενημέρωσης:', err);
      Alert.alert('Σφάλμα', err.response?.data?.error || 'Προσπάθησε ξανά.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>✏️ Επεξεργασία Κράτησης</Text>

      <Text style={styles.label}>📅 Ημερομηνία:</Text>
      <TouchableOpacity onPress={showDatePicker} style={styles.input}>
        <Text>{date ? normalizeDate(date) : 'Επίλεξε ημερομηνία'}</Text>
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
        <Text>{time || 'Επίλεξε ώρα'}</Text>
      </TouchableOpacity>
      <Modal visible={isTimeModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Διαθέσιμες Ώρες</Text>
            <FlatList
              data={availableSlots}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setTime(item);
                    toggleTimeModal();
                  }}
                >
                  <Text>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={toggleTimeModal} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Κλείσιμο</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Text style={styles.label}>👥 Άτομα:</Text>
      <TextInput
        keyboardType="numeric"
        value={peopleCount}
        onChangeText={setPeopleCount}
        placeholder="π.χ. 2"
        style={styles.input}
      />

      <Text style={styles.label}>💬 Σχόλια:</Text>
      <TextInput
        value={comments}
        onChangeText={setComments}
        multiline
        style={styles.textarea}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
        <Text style={styles.saveButtonText}>💾 Αποθήκευση Αλλαγών</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push('/(tabs)/history')}
      >
        <Text style={styles.backButtonText}>↩️ Επιστροφή στο Ιστορικό</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: '#d1b3ff',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  label: { marginTop: 10, fontSize: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#fdfdfd',
  },
  textarea: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 10,
    height: 100,
    textAlignVertical: 'top',
    backgroundColor: '#fdfdfd',
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#A566FF',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#e8d7ff',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#6b24b6',
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
