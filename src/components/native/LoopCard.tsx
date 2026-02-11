import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StarRating } from './StarRating';
import { Loop } from '../../types/loop';
import { useTheme } from '../../contexts/ThemeContext';

interface LoopCardProps {
  loop: Loop & { completedCount?: number; totalCount?: number };
  onPress: (loop: Loop) => void;
  onEdit?: (loop: Loop) => void;
  onDelete?: (loop: Loop) => void;
  isUpcoming?: boolean;
}

export const LoopCard: React.FC<LoopCardProps> = ({
  loop,
  onPress,
  onEdit,
  onDelete,
  isUpcoming = false,
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
      activeOpacity={isUpcoming ? 0.9 : 0.7}
      onPress={() => onPress(loop)}
      style={[
        styles.card,
        isUpcoming && styles.upcomingCard,
        { backgroundColor: isUpcoming ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }
      ]}
    >
      <View style={styles.leftSection}>
        {isUpcoming ? (
          <View style={[styles.calendarIconWrapper, { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
            <Ionicons name="calendar-outline" size={24} color={colors.textSecondary} />
          </View>
        ) : (
          <View style={[styles.iconCircle, { backgroundColor: badgeBg }]}>
             <Text style={{ fontSize: 24 }}>
               {getEmoji(loop.reset_rule || 'daily', loop.category)}
             </Text>
          </View>
        )}
        
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: isUpcoming ? colors.textSecondary : colors.text }]}>
            {loop.name || 'Unnamed Loop'}
          </Text>
          {(loop.author_name || loop.source_title) && (
             <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                 <Ionicons name="library" size={12} color={colors.primary} style={{ marginRight: 4 }} />
                 <Text style={{ fontSize: 11, color: colors.textSecondary, fontWeight: '600' }}>
                    {loop.author_name ? 'Expert Loop' : 'From Library'}
                 </Text>
             </View>
          )}
          {isUpcoming ? (
             <Text style={[styles.dueDateText, { color: colors.primary }]}>
               {loop.due_date ? `Due ${new Date(loop.due_date).toLocaleDateString()}` : 'Future Task'}
             </Text>
          ) : (
            <View>
              <View style={[styles.badge, { backgroundColor: loop.function_type === 'practice' ? colors.primary : badgeBg }]}>
                <Text style={[styles.badgeText, { color: loop.function_type === 'practice' ? colors.textOnPrimary : badgeText }]}>
                  {getBadgeLabel(loop.reset_rule || 'daily', loop.category, loop.function_type)}
                </Text>
              </View>
              {loop.average_rating !== undefined && loop.total_ratings !== undefined && loop.total_ratings > 0 && (
                <View style={styles.ratingRow}>
                  <StarRating rating={loop.average_rating} count={loop.total_ratings} size={14} />
                </View>
              )}
            </View>
          )}
        </View>
      </View>

      <View style={styles.rightSection}>
        {Platform.OS === 'web' && (
          <View style={styles.adminActions}>
            <TouchableOpacity 
              onPress={(e) => {
                e.stopPropagation();
                onEdit?.(loop);
              }}
              style={styles.actionButton}
            >
              <Text style={{ fontSize: 12, color: colors.text, fontWeight: '600' }}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={(e) => {
                e.stopPropagation();
                onDelete?.(loop);
              }}
              style={styles.actionButton}
            >
              <Text style={{ fontSize: 12, color: colors.error, fontWeight: '600' }}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
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
    marginBottom: 12,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  upcomingCard: {
    borderStyle: 'dashed',
    borderWidth: 1.5,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    marginLeft: 16,
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  ratingRow: {
    marginTop: 6,
  },
  dueDateText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  adminActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
});
