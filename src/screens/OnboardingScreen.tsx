import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';

import { RootStackParamList } from '../../App';
import { useAuth } from '../contexts/AuthContext';
import { StarterRecipeCard } from '../components/native/StarterRecipeCard';

type OnboardingNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const OnboardingScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<OnboardingNavigationProp>();
  const [loading, setLoading] = useState(false);

  const handleCreateFirstLoop = async () => {
    // In a real app, this would create a 'guest' session or open the signup modal/sheet.
    // For this mockup, we'll simulate the "winning" feeling by moving to the auth step 
    // or completing onboarding if already authed.
    
    setLoading(true);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Delay slightly to show button press, then navigate to Home/TemplateLibrary
    setTimeout(() => {
        setLoading(false);
        // For now, we'll redirect to the Login/Auth screen to actually create the account 
        // needed for the loop, but conceptually this button "Starts" the process.
        // Or if we want to bypass auth for the demo (if allowed), we'd do that.
        // We'll stick to navigating to the TemplateLibrary as the "First Loop" destination.
        navigation.replace('TemplateLibrary');
    }, 500);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#F9FAFB' }]}> 
      <View style={styles.contentContainer}>
        <StarterRecipeCard onPress={handleCreateFirstLoop} />
        
        {/* Subtle Login Link below */}
        <TouchableOpacity 
            style={styles.loginLink}
            onPress={() => navigation.replace('Login')}
        >
            <Text style={styles.loginText}>Already have an account? Log in</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loginLink: {
    marginTop: 32,
    padding: 12,
  },
  loginText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
});

