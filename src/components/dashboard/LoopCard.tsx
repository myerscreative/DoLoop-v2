import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { LoopWithTasks } from '../../types/loop';

interface LoopCardProps {
  loop: LoopWithTasks;
  onPress: (loop: LoopWithTasks) => void;
  onEdit?: (loop: LoopWithTasks) => void;
  onDelete?: (loop: LoopWithTasks) => void;
  isSelected?: boolean;
}

/**
 * LoopCard - Redesigned to match mobile aesthetic (clean, list-style)
 */
export const LoopCard: React.FC<LoopCardProps> = ({ 
  loop, 
  onPress, 
  onEdit, 
  onDelete,
  isSelected = false 
}) => {
  const { colors } = useTheme();

  const getEmoji = (rule: string, category?: string) => {
    if (category === 'goals') return '🏆';
    switch (rule) {
      case 'daily': return '☀️';
      case 'weekly': return '🎯';
      case 'manual': return '✓';
      default: return '☀️';
    }
  };

  const getBadgeColors = (rule: string, category?: string) => {
    const c = colors;
    if (category === 'goals') return [c.accent2, '#FFFFFF']; 
    
    switch (rule) {
      case 'daily': return [c.accentYellow, '#000000']; 
      case 'weekly': return [c.accent1, '#FFFFFF'];    
      case 'manual': return [c.primary, c.textOnPrimary];    
      default: return [c.surface, c.text]; 
    }
  };
  
  const getBadgeLabel = (rule: string, category?: string, functionType?: string) => {
    if (functionType === 'practice') return 'Practice';
    if (category === 'goals') return 'Goal';
    switch (rule) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'manual': return 'Checklist';
      default: return rule.charAt(0).toUpperCase() + rule.slice(1);
    }
  };

  const [badgeBg, badgeText] = getBadgeColors(loop.reset_rule || 'daily', loop.category);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress(loop)}
      style={[
        styles.card,
        { 
          backgroundColor: isSelected ? 'rgba(255, 192, 15, 0.08)' : 'rgba(255, 255, 255, 0.05)', 
          borderColor: isSelected ? colors.primary : 'rgba(255, 255, 255, 0.1)',
          borderWidth: isSelected ? 2 : 1,
        }
      ]}
    >
      <View style={styles.leftSection}>
        <View style={[styles.iconCircle, { backgroundColor: badgeBg }]}>
           <Text style={{ fontSize: 24 }}>
             {getEmoji(loop.reset_rule || 'daily', loop.category)}
           </Text>
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.text }]}>
            {loop.name || 'Unnamed Loop'}
          </Text>
          
          <View style={[styles.badge, { backgroundColor: loop.function_type === 'practice' ? colors.primary : badgeBg }]}>
            <Text style={[styles.badgeText, { color: loop.function_type === 'practice' ? colors.textOnPrimary : badgeText }]}>
              {getBadgeLabel(loop.reset_rule || 'daily', loop.category, loop.function_type)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.rightSection}>
        <View style={styles.adminActions}>
          <TouchableOpacity 
            onPress={(e) => {
              e.stopPropagation();
              onEdit?.(loop);
            }}
            style={styles.actionButton}
          >
            <Text style={{ fontSize: 13, color: colors.textSecondary, fontWeight: '600' }}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={(e) => {
              e.stopPropagation();
              onDelete?.(loop);
            }}
            style={styles.actionButton}
          >
            <Text style={{ fontSize: 13, color: colors.error, fontWeight: '600' }}>Delete</Text>
          </TouchableOpacity>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    marginBottom: 8,
    width: '100%',
    alignSelf: 'center',
    borderWidth: 1,
    ...Platform.select({
      web: {
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      } as any,
    }),
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    marginLeft: 16,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  adminActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingRight: 8,
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
});
