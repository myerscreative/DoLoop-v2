import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { LoopTemplateWithDetails } from '../../types/loop';

interface CompactTemplateItemProps {
  template: LoopTemplateWithDetails;
  isSelected?: boolean;
  onPress: () => void;
}

export const CompactTemplateItem: React.FC<CompactTemplateItemProps> = ({
  template,
  isSelected,
  onPress,
}) => {
  const { colors } = useTheme();
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
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.emojiWrapper}>
           <Text style={styles.emoji}>
             {getCategoryIcon(template.category)}
           </Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {template.title}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {template.description}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const getCategoryIcon = (category: string) => {
  const icons: Record<string, string> = {
    checklist: '✓',
    daily: '☀️',
    weekly: '🎯',
    personal: '🏡',
    work: '💼',
    shared: '👥',
  };
  return icons[category] || '📋';
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    ...Platform.select({
      web: {
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
      },
    }),
  } as any,
  hoverContainer: {
    borderColor: '#FFE4A3',
    transform: [{ translateY: -1 }],
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
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
  emojiWrapper: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});
