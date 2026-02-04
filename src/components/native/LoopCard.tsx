import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ProgressRing } from './ProgressRing';
import { MomentumRing } from './MomentumRing';
import { StarRating } from './StarRating';
import { Loop } from '../../types/loop';
import { Colors } from '../../constants/Colors';

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
  const progress = loop.totalCount && loop.totalCount > 0 
    ? (loop.completedCount! / loop.totalCount) * 100
    : 0;

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
    // Returns [BackgroundTint, TextColor]
    const c = Colors.light;
    
    if (category === 'goals') return [c.focus, '#FFFFFF']; // Blue + White
    
    switch (rule) {
      case 'daily': return [c.primary, c.text]; // Bumblebee Yellow + Black
      case 'weekly': return [c.family, '#FFFFFF']; // Violet + White
      case 'manual': return [c.playful, '#FFFFFF']; // Pink + White
      default: return [c.surface, c.text]; // Grey + Black
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

  const colors = getBadgeColors(loop.reset_rule || 'daily', loop.category);
  const badgeBg = colors[0];
  const badgeText = colors[1];

  return (
    <TouchableOpacity 
      activeOpacity={isUpcoming ? 0.9 : 0.7}
      onPress={() => onPress(loop)}
      style={[
        styles.card,
        isUpcoming && styles.upcomingCard
      ]}
    >
      <View style={styles.leftSection}>
        {isUpcoming ? (
          <View style={styles.calendarIconWrapper}>
            <Ionicons name="calendar-outline" size={24} color="#94a3b8" />
          </View>
        ) : (
          <View style={[styles.iconCircle, { backgroundColor: badgeBg }]}>
             <Text style={{ fontSize: 24 }}>
               {getEmoji(loop.reset_rule || 'daily', loop.category)}
             </Text>
          </View>
        )}
        
        <View style={styles.textContainer}>
          <Text style={[styles.title, isUpcoming && styles.upcomingTitle]}>
            {loop.name || 'Unnamed Loop'}
          </Text>
          {(loop.author_name || loop.source_title) && (
             <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                 <Ionicons name="library" size={12} color="#FEC00F" style={{ marginRight: 4 }} />
                 <Text style={{ fontSize: 11, color: '#64748b', fontWeight: '600' }}>
                    {loop.author_name ? 'Expert Loop' : 'From Library'}
                 </Text>
             </View>
          )}
          {isUpcoming ? (
             <Text style={styles.dueDateText}>
               {loop.due_date ? `Due ${new Date(loop.due_date).toLocaleDateString()}` : 'Future Task'}
             </Text>
          ) : (
            <View>
              <View style={[styles.badge, { backgroundColor: loop.function_type === 'practice' ? '#FFB800' : badgeBg }]}>
                <Text style={[styles.badgeText, { color: loop.function_type === 'practice' ? '#000000' : badgeText }]}>
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
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={(e) => {
                e.stopPropagation();
                onDelete?.(loop);
              }}
              style={styles.actionButton}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        <Ionicons name="chevron-forward" size={20} color={Colors.light.textSecondary} />
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
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  upcomingCard: {
    backgroundColor: Colors.light.backgroundSecondary,
    opacity: 0.7,
    borderStyle: 'dashed',
    borderColor: Colors.light.border,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    marginLeft: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700', // Bold
    color: Colors.light.text, // Jet Black
    marginBottom: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  ratingRow: {
    marginTop: 6,
  },
  upcomingTitle: {
    color: '#64748b',
  },
  dueDateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFA500',
    marginTop: 2,
  },
  iconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
  },
  calendarIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminActions: {
    flexDirection: 'row',
    marginRight: 8,
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editText: {
    fontSize: 12,
    color: '#374151', // Dark Charcoal
    fontWeight: '600',
  },
  deleteText: {
    fontSize: 12,
    color: '#EF4444', // Softer Red
    fontWeight: '600',
  },
});
