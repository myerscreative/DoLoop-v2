import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface CustomDaySelectorProps {
  selectedDays: number[];
  onChange: (days: number[]) => void;
  accentColor?: string;
  accentBg?: string;
}

const DAYS = [
  { id: 0, label: 'Sun', full: 'Sunday' },
  { id: 1, label: 'Mon', full: 'Monday' },
  { id: 2, label: 'Tue', full: 'Tuesday' },
  { id: 3, label: 'Wed', full: 'Wednesday' },
  { id: 4, label: 'Thu', full: 'Thursday' },
  { id: 5, label: 'Fri', full: 'Friday' },
  { id: 6, label: 'Sat', full: 'Saturday' },
];

export const CustomDaySelector: React.FC<CustomDaySelectorProps> = ({
  selectedDays,
  onChange,
  accentColor = '#FEC00F',
  accentBg = '#FFF9E6',
}) => {
  const toggleDay = (dayId: number) => {
    if (selectedDays.includes(dayId)) {
      onChange(selectedDays.filter(d => d !== dayId));
    } else {
      onChange([...selectedDays, dayId].sort());
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Days</Text>
      <View style={styles.daysContainer}>
        {DAYS.map((day) => {
          const isSelected = selectedDays.includes(day.id);
          return (
            <TouchableOpacity
              key={day.id}
              style={[
                styles.dayButton,
                isSelected && { 
                  backgroundColor: accentColor,
                  borderColor: accentColor,
                }
              ]}
              onPress={() => toggleDay(day.id)}
            >
              <Text
                style={[
                  styles.dayLabel,
                  isSelected && styles.dayLabelSelected
                ]}
              >
                {day.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {selectedDays.length > 0 && (
        <Text style={styles.helpText}>
          Resets on: {selectedDays.map(id => DAYS[id].full).join(', ')}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 8,
  },
  daysContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  dayButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    minWidth: 50,
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  dayLabelSelected: {
    color: '#0f172a',
    fontWeight: '700',
  },
  helpText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
