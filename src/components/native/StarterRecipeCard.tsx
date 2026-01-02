import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface StarterRecipeCardProps {
  onPress: () => void;
}

export const StarterRecipeCard: React.FC<StarterRecipeCardProps> = ({ onPress }) => {
  return (
    <View style={styles.cardContainer}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.progressRing}>
          <Text style={styles.progressText}>0%</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>First Recipe</Text>
          <Text style={styles.subtitle}>Let's get your first loop started.</Text>
        </View>
      </View>

      {/* Checklist Section */}
      <View style={styles.checklist}>
        {/* Item 1: Active */}
        <View style={[styles.checklistItem, styles.activeItem]}>
          <View style={[styles.checkbox, styles.activeCheckbox]} />
          <Text style={styles.activeText}>Give your first loop a name</Text>
        </View>

        {/* Item 2: Inactive */}
        <View style={[styles.checklistItem, styles.inactiveItem]}>
          <View style={styles.checkbox} />
          <Text style={styles.inactiveText}>Add three steps (ingredients)</Text>
        </View>

        {/* Item 3: Inactive */}
        <View style={[styles.checklistItem, styles.inactiveItem]}>
          <View style={styles.checkbox} />
          <Text style={styles.inactiveText}>Hit the "Reloop" button</Text>
        </View>
      </View>

      {/* Action Button */}
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={styles.buttonWrapper}
      >
        <LinearGradient
          colors={['#FFD700', '#FFA500']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Create My First Loop</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    maxWidth: 400,
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    // Box Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 25,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  progressRing: {
    width: 60,
    height: 60,
    borderRadius: 30, // 50%
    borderWidth: 6,
    borderColor: '#FDE68A', // Light yellow stroke
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontWeight: 'bold',
    color: '#B8860B', // Dark goldenrod
    fontSize: 16,
  },
  headerText: {
    marginLeft: 16,
  },
  title: {
    fontSize: 20, // 1.25rem approx
    fontWeight: '700',
    color: '#1F2937', // Gray 800
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14, // 0.875rem
    color: '#6B7280', // Gray 500
  },
  checklist: {
    gap: 12, // display: flex; gap: 12px
    flexDirection: 'column',
    marginBottom: 24,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    marginRight: 12,
  },
  activeItem: {
    backgroundColor: '#FFF9E6',
    borderColor: '#FFE082',
  },
  activeCheckbox: {
    borderColor: '#FFA500',
  },
  activeText: {
    color: '#4B5563', // Gray 600
    fontWeight: '500',
  },
  inactiveItem: {
    borderColor: '#E5E7EB',
    opacity: 0.6,
  },
  inactiveText: {
    color: '#4B5563',
  },
  buttonWrapper: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  button: {
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
