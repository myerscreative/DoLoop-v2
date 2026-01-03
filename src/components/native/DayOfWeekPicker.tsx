import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface DayOfWeekPickerProps {
  value: number; // 0-6 (Sunday-Saturday)
  onChange: (day: number) => void;
  accentColor: string;
}

const DAY_OPTIONS = [
  { label: 'Sunday', value: 0 },
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 },
];

export const DayOfWeekPicker: React.FC<DayOfWeekPickerProps> = ({ value, onChange, accentColor }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getSelectedLabel = () => {
    const day = DAY_OPTIONS.find(opt => opt.value === value);
    return day ? day.label : 'Monday';
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.pickerButton,
          isOpen && { borderColor: accentColor, backgroundColor: `${accentColor}10` }
        ]}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={styles.pickerButtonText}>
          {getSelectedLabel()}
        </Text>
        <Ionicons 
          name={isOpen ? "chevron-up" : "chevron-down"} 
          size={14} 
          color="#64748b" 
        />
      </TouchableOpacity>

      {isOpen && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={styles.dropdown}
        >
          {DAY_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                value === option.value && { backgroundColor: `${accentColor}15` }
              ]}
              onPress={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  value === option.value && { color: accentColor, fontWeight: '700' }
                ]}
              >
                {option.label}
              </Text>
              {value === option.value && (
                <Ionicons name="checkmark" size={16} color={accentColor} />
              )}
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 10,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minWidth: 120,
  },
  pickerButtonText: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '500',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    maxHeight: 280,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  optionText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
});
