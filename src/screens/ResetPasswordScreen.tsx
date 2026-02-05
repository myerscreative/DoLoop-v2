import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { RootStackParamList } from '../../App';
import { useTheme } from '../contexts/ThemeContext';
import { DoLoopLogo } from '../components/native/DoLoopLogo';

type ResetPasswordScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

// Web-compatible alert
const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export const ResetPasswordScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<ResetPasswordScreenNavigationProp>();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Optional: Check if we actually have a session (i.e. did the link work?)
  // If not, we might want to warn the user, but for now we'll just try the update.

  const handleUpdatePassword = async () => {
    setError('');

    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw error;
      }

      showAlert('Success', 'Your password has been updated. Please sign in with your new password.');
      navigation.replace('Login');
    } catch (error: any) {
      console.error('[ResetPassword] Error:', error);
      setError(error.message || 'Failed to update password');
      showAlert('Error', error.message || 'Failed to update password');
    } finally {
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
            <DoLoopLogo size={80} color={colors.primary} showText={true} />
            <Text style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: colors.text,
              marginTop: 16,
              marginBottom: 8,
            }}>
              Reset Password
            </Text>
            <Text style={{
              fontSize: 16,
              color: colors.textSecondary,
              textAlign: 'center',
            }}>
              Enter your new password below.
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
                <Text style={{ color: '#c00', fontSize: 14 }}>
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
              placeholder="New Password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
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
              placeholder="Confirm New Password"
              placeholderTextColor={colors.textSecondary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
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
            onPress={handleUpdatePassword}
            disabled={loading}
          >
            <Text style={{
              color: 'white',
              fontSize: 16,
              fontWeight: 'bold',
            }}>
              {loading ? 'Updating...' : 'Update Password'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ alignItems: 'center' }}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
              Back to Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
