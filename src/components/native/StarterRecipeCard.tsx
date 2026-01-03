import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface StarterRecipeProps {
  title: string;
  emoji: string;
  items: string[];
  color?: string; // e.g. 'purple', 'orange'
  onPress: () => void;
  width?: number | string;
}

export const StarterRecipeCard: React.FC<StarterRecipeProps> = ({
  title,
  emoji,
  items,
  color = '#8b5cf6', // default purple
  onPress,
  width = 300
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { width }]}>
        {/* Header Icon + Title */}
      <View style={styles.header}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>

      {/* List Items Preview */}
      <View style={styles.listContainer}>
        {items.map((item, index) => (
          <View key={index} style={styles.listItem}>
            <View style={styles.radioCircle} />
            <Text style={styles.itemText}>{item}</Text>
          </View>
        ))}
      </View>

      {/* Progress Bar Placeholder */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '0%' }]} />
        </View>
      </View>

      {/* Action Button */}
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: color }]} 
        onPress={onPress}
      >
        <Text style={styles.buttonText}>Try This Loop</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    width: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 12,
  },
  emoji: {
    fontSize: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  listContainer: {
    gap: 12,
    marginBottom: 24,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  itemText: {
    fontSize: 14,
    color: '#4b5563',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#e5e7eb',
  },
  button: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
});
