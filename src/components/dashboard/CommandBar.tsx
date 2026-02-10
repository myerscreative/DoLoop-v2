import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
  Animated,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { usePanelSlide } from '../../hooks/useCommandCenterAnimations';

interface CommandBarProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (text: string) => void;
  placeholder?: string;
}

/**
 * CommandBar - Rapid entry modal with glass backdrop
 * Activated via "Cmd + K" shortcut (web) or button press
 */
export const CommandBar: React.FC<CommandBarProps> = ({
  visible,
  onClose,
  onCreate,
  placeholder = 'Create a new loop...',
}) => {
  const { colors } = useTheme();
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Auto-focus input when modal opens
  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
      setInputValue('');
    }
  }, [visible, fadeAnim]);

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onCreate(inputValue.trim());
      setInputValue('');
      onClose();
    }
  };

  const handleKeyPress = (e: any) => {
    if (e.nativeEvent.key === 'Enter') {
      handleSubmit();
    } else if (e.nativeEvent.key === 'Escape') {
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      {/* Backdrop */}
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <Animated.View style={[styles.backdropOverlay, { opacity: fadeAnim }]} />
      </TouchableOpacity>

      {/* Command Bar Container */}
      <Animated.View
        style={[
          styles.commandContainer,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View
          style={[
            styles.commandBar,
            {
              backgroundColor: colors.glassBackdrop,
              borderColor: colors.glassBorder,
            },
          ]}
        >
          {/* Icon */}
          <Ionicons name="flash-outline" size={20} color={colors.primary} style={styles.icon} />

          {/* Input Field */}
          <TextInput
            ref={inputRef}
            style={[styles.input, { color: colors.text }]}
            value={inputValue}
            onChangeText={setInputValue}
            placeholder={placeholder}
            placeholderTextColor={colors.textSecondary}
            onSubmitEditing={handleSubmit}
            onKeyPress={handleKeyPress}
            autoCapitalize="sentences"
            autoCorrect
          />

          {/* Submit Button */}
          {inputValue.trim() && (
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
              onPress={handleSubmit}
            >
              <Ionicons name="arrow-forward" size={18} color={colors.text} />
            </TouchableOpacity>
          )}

          {/* Hint */}
          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            {Platform.OS === 'web' ? 'Press Enter ↵' : 'Tap to create'}
          </Text>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdropOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  commandContainer: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  commandBar: {
    width: '100%',
    maxWidth: 600,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 16,
    gap: 12,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      } as any,
    }),
  },
  icon: {
    opacity: 0.8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    outlineStyle: 'none', // Remove web input outline
  } as any,
  submitButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(254, 192, 15, 0.6)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
  },
  hint: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.5,
  },
});
