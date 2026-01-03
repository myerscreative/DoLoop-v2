import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AssigneeDotProps {
  userId?: string; // For future avatar logic or looking up user defaults
  initials?: string;     // Explicit initials override
  size?: number;   // Allow override but default to 24
}

export const AssigneeDot: React.FC<AssigneeDotProps> = ({ 
  userId, 
  initials = '?', 
  size = 24 
}) => {
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={styles.text}>
        {initials.slice(0, 2).toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FEC00F',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff', // White border for overlap contrast
  },
  text: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
