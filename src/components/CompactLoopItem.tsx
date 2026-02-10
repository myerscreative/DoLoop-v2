import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';

type ThemeColors = {
  background: string;
  text: string;
  textSecondary: string;
  primary: string;
  border: string;
};

interface CompactLoopItemProps {
  emoji: string;
  name: string;
  description: string;
  isSelected?: boolean;
  onPress: () => void;
  colors?: ThemeColors;
}

export const CompactLoopItem: React.FC<CompactLoopItemProps> = ({
  emoji,
  name,
  description,
  isSelected,
  onPress,
  colors: themeColors,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const colors = themeColors ?? {
    background: '#FFFFFF',
    text: '#111827',
    textSecondary: '#4B5563',
    primary: '#FEC00F',
    border: '#E5E7EB',
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: colors.background },
        isSelected && {
          borderColor: colors.primary,
          backgroundColor: `${colors.primary}12`,
        },
        !isSelected && isHovered && {
          borderColor: `${colors.primary}60`,
          transform: [{ translateY: -2 }],
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        },
      ]}
      onPress={onPress}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <Text style={styles.emoji}>{emoji}</Text>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {name}
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
            {description}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 80,
    justifyContent: 'center',
    ...Platform.select({
      web: {
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      },
    }),
  } as any,
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
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
});
