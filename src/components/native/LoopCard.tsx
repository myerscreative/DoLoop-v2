import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ProgressRing } from './ProgressRing';
import { Loop } from '../../types/loop';

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
    // Returns [BackgroundTint, TextColor/StrongColor]
    if (category === 'goals') return ['#F5DEB3', '#8B4513']; // Wheat / SaddleBrown
    switch (rule) {
      case 'daily': return ['#FFF0D4', '#EA580C']; // Pale Honey / Dark Orange
      case 'weekly': return ['#F0E6D2', '#B8860B']; // Pale Bronze / Dark Goldenrod
      case 'manual': return ['#FBF5E6', '#D4AF37']; // Champagne / Gold
      default: return ['#FFF0D4', '#EA580C'];
    }
  };

  const getBadgeLabel = (rule: string, category?: string) => {
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
          {isUpcoming ? (
             <Text style={styles.dueDateText}>
               {loop.due_date ? `Due ${new Date(loop.due_date).toLocaleDateString()}` : 'Future Task'}
             </Text>
          ) : (
            <View style={[styles.badge, { backgroundColor: badgeBg }]}>
              <Text style={[styles.badgeText, { color: badgeText }]}>
                {getBadgeLabel(loop.reset_rule || 'daily', loop.category)}
              </Text>
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
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
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
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#F3F4F6',
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
    backgroundColor: '#F9FAFB',
    opacity: 0.7,
    borderStyle: 'dashed',
    borderColor: '#E5E7EB',
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
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
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
    color: '#DC2626', // Softer Red
    fontWeight: '600',
  },
});
