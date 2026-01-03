import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface TimePickerProps {
  value: string; // '04:00' format (24-hour)
  onChange: (time: string) => void;
  accentColor: string;
}

const TIME_OPTIONS = [
  { label: '12:00am (Midnight)', value: '00:00' },
  { label: '4:00am', value: '04:00' },
  { label: '6:00am', value: '06:00' },
  { label: '8:00am', value: '08:00' },
  { label: '12:00pm (Noon)', value: '12:00' },
  { label: '3:00pm', value: '15:00' },
  { label: '6:00pm', value: '18:00' },
  { label: '9:00pm', value: '21:00' },
];

export const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, accentColor }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Format time for display (convert 24-hour to 12-hour with am/pm)
  const formatTimeDisplay = (time24: string) => {
    const option = TIME_OPTIONS.find(opt => opt.value === time24);
    return option ? option.label : time24;
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
          {formatTimeDisplay(value)}
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
          {TIME_OPTIONS.map((option) => (
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
    minWidth: 160,
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
    maxHeight: 240,
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
