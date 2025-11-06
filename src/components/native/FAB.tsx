import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface FABProps {
  onAddTask: (description: string, isOneTime: boolean) => Promise<void>;
}

export const FAB: React.FC<FABProps> = ({ onAddTask }) => {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [description, setDescription] = useState('');
  const [isOneTime, setIsOneTime] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a task description');
      return;
    }

    setLoading(true);
    try {
      await onAddTask(description.trim(), isOneTime);
      setModalVisible(false);
      setDescription('');
      setIsOneTime(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to add task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
        }}
        onPress={() => setModalVisible(true)}
      >
        <Text style={{ fontSize: 24, color: 'white', fontWeight: 'bold' }}>+</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              padding: 20,
            }}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {}}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: colors.text,
                  marginBottom: 16,
                }}
              >
                Add New Task
              </Text>

              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  color: colors.text,
                  marginBottom: 16,
                  minHeight: 80,
                  textAlignVertical: 'top',
                }}
                placeholder="Enter task description..."
                placeholderTextColor={colors.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
                autoFocus
              />

              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                <TouchableOpacity
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    borderWidth: 2,
                    borderColor: colors.primary,
                    backgroundColor: isOneTime ? colors.primary : 'transparent',
                    marginRight: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => setIsOneTime(!isOneTime)}
                >
                  {isOneTime && <Text style={{ color: 'white', fontSize: 12 }}>✓</Text>}
                </TouchableOpacity>
                <Text style={{ color: colors.text, fontSize: 16 }}>One-time only</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 14, marginLeft: 8 }}>
                  (Expires after check)
                </Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
                <TouchableOpacity
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 6,
                  }}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={{ color: colors.textSecondary, fontSize: 16 }}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    backgroundColor: colors.primary,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 6,
                  }}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                    {loading ? 'Adding...' : 'Add Task'}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};
