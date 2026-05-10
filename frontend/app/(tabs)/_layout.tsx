import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="restaurants"
        options={{
          title: 'Εστιατόρια',
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>🍽️</Text>,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Ιστορικό',
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>🕒</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Προφίλ',
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>👤</Text>,
        }}
      />
      <Tabs.Screen
        name="restaurantBooking"
        options={{ href: null }} 
      />
    </Tabs>
  );
}
