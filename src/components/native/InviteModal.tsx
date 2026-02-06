import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { sendInvitation } from '../../lib/invitationHelpers';

interface InviteModalProps {
  visible: boolean;
  onClose: () => void;
  loopId: string;
  loopName: string;
  onInviteSent?: () => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  visible,
  onClose,
  loopId,
  loopName,
  onInviteSent,
}) => {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'sous-chef' | 'viewer'>('sous-chef');
  const [sending, setSending] = useState(false);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSend = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    if (!isValidEmail(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setSending(true);
    try {
      const result = await sendInvitation(loopId, email.trim(), role);
      
      if (result.success) {
        Alert.alert('Invitation Sent! 🎉', `An invitation has been sent to ${email}`);
        setEmail('');
        setRole('sous-chef');
        onInviteSent?.();
        onClose();
      } else {
        Alert.alert('Error', result.error || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      Alert.alert('Error', 'Failed to send invitation');
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlayPressable}
          activeOpacity={1}
          onPress={onClose}
        >
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={styles.modalContainer}
          >
            <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ width: '100%' }}
              >
                {/* Header */}
                <View style={styles.header}>
                  <View style={styles.headerIcon}>
                    <Ionicons name="person-add" size={24} color="#FEC00F" />
                  </View>
                  <Text style={styles.headerTitle}>Invite to Loop</Text>
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color="#94a3b8" />
                  </TouchableOpacity>
                </View>

                {/* Loop Name */}
                <Text style={styles.loopName}>"{loopName}"</Text>

                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="colleague@example.com"
                    placeholderTextColor="#94a3b8"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus
                  />
                </View>

                {/* Role Selection */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Role</Text>
                  <View style={styles.roleContainer}>
                    <TouchableOpacity
                      style={[
                        styles.roleOption,
                        role === 'sous-chef' && styles.roleOptionSelected,
                      ]}
                      onPress={() => setRole('sous-chef')}
                    >
                      <Ionicons
                        name="create-outline"
                        size={20}
                        color={role === 'sous-chef' ? '#FEC00F' : '#64748b'}
                      />
                      <View style={styles.roleTextContainer}>
                        <Text
                          style={[
                            styles.roleTitle,
                            role === 'sous-chef' && styles.roleTitleSelected,
                          ]}
                        >
                          Sous-Chef
                        </Text>
                        <Text style={styles.roleDescription}>
                          Can complete tasks & edit
                        </Text>
                      </View>
                      {role === 'sous-chef' && (
                        <Ionicons name="checkmark-circle" size={20} color="#FEC00F" />
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.roleOption,
                        role === 'viewer' && styles.roleOptionSelected,
                      ]}
                      onPress={() => setRole('viewer')}
                    >
                      <Ionicons
                        name="eye-outline"
                        size={20}
                        color={role === 'viewer' ? '#FEC00F' : '#64748b'}
                      />
                      <View style={styles.roleTextContainer}>
                        <Text
                          style={[
                            styles.roleTitle,
                            role === 'viewer' && styles.roleTitleSelected,
                          ]}
                        >
                          Viewer
                        </Text>
                        <Text style={styles.roleDescription}>
                          Can only view progress
                        </Text>
                      </View>
                      {role === 'viewer' && (
                        <Ionicons name="checkmark-circle" size={20} color="#FEC00F" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Send Button */}
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    { backgroundColor: colors.primary },
                    (!email.trim() || sending) && styles.sendButtonDisabled,
                  ]}
                  onPress={handleSend}
                  disabled={!email.trim() || sending}
                >
                  {sending ? (
                    <ActivityIndicator size="small" color={colors.textOnPrimary} />
                  ) : (
                    <>
                      <Ionicons name="paper-plane" size={18} color={colors.textOnPrimary} />
                      <Text style={[styles.sendButtonText, { color: colors.textOnPrimary }]}>Send Invitation</Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Info */}
                <Text style={styles.infoText}>
                  The invitee will receive the invitation in their DoLoop app.
                </Text>
              </KeyboardAvoidingView>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayPressable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  modalContent: {
    padding: 24,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF9E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  closeButton: {
    padding: 4,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  loopName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  roleContainer: {
    gap: 10,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  roleOptionSelected: {
    borderColor: '#FEC00F',
    backgroundColor: '#FFF9E5',
  },
  roleTextContainer: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  roleTitleSelected: {
    color: '#8A2BE2',
  },
  roleDescription: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    marginTop: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  infoText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 16,
  },
});
