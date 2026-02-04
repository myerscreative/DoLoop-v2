import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface ReflectionInputProps {
  taskId: string;
  initialValue?: string;
  onSave: (text: string) => Promise<void>;
  placeholder?: string;
}

export const ReflectionInput: React.FC<ReflectionInputProps> = ({
  taskId,
  initialValue = '',
  onSave,
  placeholder = "Chef's Tip: How did you apply this principle today?"
}) => {
  const { colors } = useTheme();
  const [text, setText] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(initialValue);
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);

  useEffect(() => {
    setText(initialValue);
    setLastSaved(initialValue);
  }, [initialValue]);

  const handleSave = async () => {
    if (text === lastSaved) return;
    
    setIsSaving(true);
    try {
      await onSave(text);
      setLastSaved(text);
      setShowSavedIndicator(true);
      setTimeout(() => setShowSavedIndicator(false), 2000);
    } catch (error) {
      console.error('Failed to save reflection', error);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = text !== lastSaved;

  return (
    <View style={styles.container}>
      <View style={[
        styles.inputContainer,
        { 
          backgroundColor: colors.surface,
          borderColor: isFocused ? '#FEC00F' : colors.border 
        }
      ]}>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          multiline
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            if (hasChanges) handleSave(); // Auto-save on blur
          }}
        />
        
        {/* Action Button / Status Indicator */}
        <View style={styles.actionArea}>
          {isSaving ? (
            <ActivityIndicator size="small" color="#FEC00F" />
          ) : showSavedIndicator ? (
            <View style={styles.savedBadge}>
              <Ionicons name="checkmark" size={14} color="#FEC00F" />
              <Text style={styles.savedText}>Saved</Text>
            </View>
          ) : hasChanges ? (
            <TouchableOpacity 
              onPress={handleSave}
              style={styles.saveButton}
            >
              <Text style={styles.saveButtonText}>Save</Text> 
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    paddingBottom: 12,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    justifyContent: 'space-between',
  },
  input: {
    fontSize: 14,
    width: '100%',
    marginBottom: 8,
    textAlignVertical: 'top',
  },
  actionArea: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    height: 24,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#FEC00F',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  saveButtonText: {
    color: 'black',
    fontWeight: '600',
    fontSize: 12,
  },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  savedText: {
    color: '#FEC00F',
    fontSize: 12,
    fontWeight: '500',
  }
});
