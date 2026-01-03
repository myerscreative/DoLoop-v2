import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';

interface CompactLoopItemProps {
  emoji: string;
  name: string;
  description: string;
  isSelected?: boolean;
  onPress: () => void;
}

export const CompactLoopItem: React.FC<CompactLoopItemProps> = ({
  emoji,
  name,
  description,
  isSelected,
  onPress,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.selectedContainer,
        !isSelected && isHovered && styles.hoverContainer,
      ]}
      onPress={onPress}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <Text style={styles.emoji}>{emoji}</Text>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    // Strict height around 80-90px
    minHeight: 80,
    justifyContent: 'center',
    ...Platform.select({
      web: {
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      },
    }),
  } as any,
  hoverContainer: {
    borderColor: '#FFE4A3',
    transform: [{ translateY: -2 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedContainer: {
    borderColor: '#FFD700',
    backgroundColor: '#FFFBF5',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  emoji: {
    fontSize: 24,
    lineHeight: 28,
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827', // text-gray-900
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: '#4B5563', // text-gray-600
    lineHeight: 18,
  },
});
