import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../App';

import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { BeeIcon } from '../components/native/BeeIcon';
import { DoLoopLogo } from '../components/native/DoLoopLogo';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

// Web-compatible alert
const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export const LoginScreen: React.FC = () => {
  const { colors } = useTheme();
  const { signIn, signUp, devModeLogin } = useAuth();
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async () => {
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = isSignUp
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        console.error('[Login] Auth error:', error);
        const errorMessage = error.message || 'Authentication failed';
        setError(errorMessage);
        showAlert('Error', errorMessage);
      } else {
        navigation.replace('Home');
      }
    } catch (error: any) {
      console.error('[Login] Unexpected error:', error);
      const errorMessage = error?.message || 'An unexpected error occurred';
      setError(errorMessage);
      showAlert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDevLogin = async () => {
    // Use a fresh test account to avoid "Wrong Password" conflicts with old dev data
    const devEmail = 'admin@doloop.com';
    const devPass = 'doloop123';
    
    setEmail(devEmail);
    setPassword(devPass);
    setLoading(true);
    setError('');

    try {
      console.log('[Login] Attempting Dev Login with:', devEmail);
      // 1. Try Sign In
      let { error } = await signIn(devEmail, devPass);

      // 2. If Sign In invalid (user missing or wrong pass), Try Sign Up
      if (error) {
        console.log('[Login] Sign In failed:', error.message);
        if (error.message.includes('Invalid login credentials') || error.message.includes('not found')) {
            console.log('[Login] Attempting Sign Up...');
            const signUpResult = await signUp(devEmail, devPass);
            
            if (signUpResult.error) {
                // If Sign Up failed (maybe user DID exist but password was wrong?), show that error
                console.error('[Login] Sign Up failed:', signUpResult.error);
                error = signUpResult.error;
            } else {
                console.log('[Login] Sign Up successful');
                error = undefined; // Clear error, we strictly succeeded
                
                // If auto-confirm is off, we might need to sign in again, 
                // but usually the session is established if no confirm needed.
                // Let's retry sign in just in case?
                const retrySignIn = await signIn(devEmail, devPass);
                if (!retrySignIn.error) {
                    error = undefined;
                }
            }
        }
      }

      if (error) {
        console.error('[Login] Final Dev Auth error:', error);
        const errorMessage = error.message || 'Dev login failed';
        setError(errorMessage + ' (Check console)');
        showAlert('Error', errorMessage);
      } else {
        console.log('[Login] Dev Login successful');
        // Small delay to ensure AuthContext updates
        setTimeout(() => {
            navigation.replace('Home');
        }, 500);
      }
    } catch (error: any) {
      console.error('[Login] Unexpected error:', error);
      setError(error.message);
      showAlert('Error', error.message);
    } finally {
      if (Platform.OS !== 'web') {
           setLoading(false); // On web we might navigate away, so avoid state update warning? 
           // actually safer to just always set false, react handles unmount gracefully mostly 
      }
       setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}
      >
        <View style={{ width: '100%', maxWidth: 600 }}>
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <DoLoopLogo size={112} color={colors.primary} showText={true} />
          <Text style={{
            fontSize: 16,
            color: colors.textSecondary,
            textAlign: 'center',
            marginTop: 16,
          }}>
            Your daily loops, simplified
          </Text>
        </View>

        <View style={{ marginBottom: 20 }}>
          {error ? (
            <View style={{
              backgroundColor: '#fee',
              borderWidth: 1,
              borderColor: '#fcc',
              borderRadius: 8,
              padding: 12,
              marginBottom: 12,
            }}>
              <Text style={{
                color: '#c00',
                fontSize: 14,
              }}>
                ⚠️ {error}
              </Text>
            </View>
          ) : null}

          <TextInput
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              padding: 16,
              fontSize: 16,
              color: colors.text,
              marginBottom: 12,
            }}
            placeholder="Email"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              padding: 16,
              fontSize: 16,
              color: colors.text,
            }}
            placeholder="Password"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            paddingVertical: 16,
            borderRadius: 8,
            alignItems: 'center',
            marginBottom: 16,
          }}
          onPress={() => handleAuth()}
          disabled={loading}
        >
          <Text style={{
            color: 'white',
            fontSize: 16,
            fontWeight: 'bold',
          }}>
            {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ alignItems: 'center' }}
          onPress={() => setIsSignUp(!isSignUp)}
        >
          <Text style={{
            color: colors.textSecondary,
            fontSize: 14,
          }}>
            {isSignUp
              ? 'Already have an account? Sign In'
              : "Don't have an account? Sign Up"
            }
          </Text>
        </TouchableOpacity>

        {/* Development Mode Section */}
        <View style={{ marginTop: 32, alignItems: 'center' }}>
          <View style={{
            backgroundColor: colors.surface,
            padding: 16,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: 12,
          }}>
            <Text style={{
              color: colors.textSecondary,
              fontSize: 12,
              textAlign: 'center',
              marginBottom: 8,
            }}>
              Dev Credentials (Sign Up first time):
            </Text>
            <Text style={{
              color: colors.text,
              fontSize: 14,
              fontWeight: 'bold',
              textAlign: 'center',
            }}>
              dev@dev.com
            </Text>
            <Text style={{
              color: colors.text,
              fontSize: 14,
              fontWeight: 'bold',
              textAlign: 'center',
            }}>
              dev123
            </Text>
          </View>
          
          <TouchableOpacity
            style={{
              paddingVertical: 12,
              paddingHorizontal: 20,
              backgroundColor: '#FFE066',
              borderRadius: 8,
              borderWidth: 2,
              borderColor: '#FFD700',
            }}
            onPress={handleDevLogin}
          >
            <Text style={{
              color: '#000',
              fontSize: 14,
              fontWeight: 'bold',
            }}>
              🚀 Auto-Fill Login
            </Text>
          </TouchableOpacity>
        </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
