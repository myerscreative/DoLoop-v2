/**
 * MINIMAL TEST APP
 * Use this to verify the app boots correctly BEFORE adding Supabase/Auth complexity
 * 
 * TO USE: Rename this file to App.tsx (backup the current App.tsx first)
 * 
 * Expected: See "Doloop Works! ✅" on iOS simulator
 */

import 'react-native-url-polyfill/auto';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

function HomeScreen() {
  const [count, setCount] = useState(0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <Text style={styles.emoji}>🐝</Text>
        <Text style={styles.title}>Doloop Works! ✅</Text>
        <Text style={styles.subtitle}>
          React Native + Expo prebuild successful
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setCount(count + 1)}
        >
          <Text style={styles.buttonText}>
            Tap Count: {count}
          </Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>✓ Navigation: Working</Text>
          <Text style={styles.infoText}>✓ Touch Events: Working</Text>
          <Text style={styles.infoText}>✓ State Management: Working</Text>
        </View>

        <Text style={styles.footer}>
          Next: Test full App.tsx with Supabase
        </Text>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#F0FDF4',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#86EFAC',
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#15803D',
    marginBottom: 8,
    fontWeight: '500',
  },
  footer: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});

