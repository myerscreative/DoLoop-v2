import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LoopWithTasks } from '../../types/loop';
import { Colors } from '../../constants/Colors';
import { StarRating } from '../native/StarRating';
import { MomentumRing } from '../native/MomentumRing';

interface GridLoopCardProps {
  loop: LoopWithTasks;
  onPress: (loop: LoopWithTasks) => void;
  onEdit?: (loop: LoopWithTasks) => void;
}

export const GridLoopCard: React.FC<GridLoopCardProps> = ({ loop, onPress, onEdit }) => {
  const c = Colors.light;
  const progress = loop.totalCount > 0 ? (loop.completedCount / loop.totalCount) * 100 : 0;
  const isComplete = progress === 100;

  const getBadgeColors = (rule: string, category?: string) => {
    // [Background, Text]
    if (category === 'goals') return [c.focus, '#FFFFFF'];
    
    switch (rule) {
      case 'daily': return [c.primary, c.text]; // Bumblebee + Black
      case 'weekly': return [c.family, '#FFFFFF']; // Violet + White
      case 'manual': return [c.playful, '#FFFFFF']; // Pink + White
      default: return [c.surface, c.text];
    }
  };

  const [badgeBg, badgeText] = getBadgeColors(loop.reset_rule || 'daily', loop.category);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(loop)}
      activeOpacity={0.9}
    >
      {/* Top Row: Icon and Menu */}
      <View style={styles.topRow}>
        <View style={[styles.iconContainer, { backgroundColor: c.backgroundSecondary }]}>
          {loop.function_type === 'practice' ? (
            <MomentumRing size={32} strokeWidth={4} streak={loop.currentStreak || 0} />
          ) : (
            <Ionicons 
                name={isComplete ? "checkmark-circle" : "play"} 
                size={24}   
                color={c.primary} 
            />
          )}
        </View>
        
        {onEdit && (
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={(e) => {
              e.stopPropagation();
              onEdit(loop);
            }}
          >
            <Ionicons name="ellipsis-vertical" size={20} color={c.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Title */}
      <Text style={styles.title} numberOfLines={2}>
        {loop.name}
      </Text>

      {/* Category Badge */}
      <View style={[styles.badgeContainer, { backgroundColor: loop.function_type === 'practice' ? '#FFB800' : badgeBg }]}>
        <Text style={[styles.badgeText, { color: loop.function_type === 'practice' ? '#000' : badgeText }]}>
          {loop.function_type === 'practice' ? 'Practice' : (loop.reset_rule === 'manual' ? 'Checklist' : (loop.reset_rule || 'Daily'))}
        </Text>
      </View>

      {/* Rating Display */}
      {loop.average_rating !== undefined && loop.total_ratings !== undefined && loop.total_ratings > 0 && (
        <View style={styles.ratingContainer}>
          <StarRating rating={loop.average_rating} count={loop.total_ratings} size={12} />
        </View>
      )}

      {/* Bottom Row: Progress */}
      <View style={styles.bottomRow}>
        <Text style={styles.progressText}>
            {loop.function_type === 'practice' 
                ? `🔥 ${(loop.currentStreak || 0)} Day Streak`
                : `${Math.round(progress)}% Done`}
        </Text>
        
        {/* Thicker Ring (8px stroke) */}
        <View style={styles.miniRing}>
            <View style={[
                styles.miniRingFill, 
                { 
                    borderTopColor: c.primary, 
                    borderRightColor: progress > 25 ? c.primary : 'transparent',
                    borderBottomColor: progress > 50 ? c.primary : 'transparent',
                    borderLeftColor: progress > 75 ? c.primary : 'transparent',
                }
            ]} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.background,
    borderColor: Colors.light.border,
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }
    })
  } as any,
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    // backgroundColor handled inline with Colors.light.backgroundSecondary
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '800', // Extra Bold
    color: Colors.light.text, // Jet Black
    marginBottom: 12,
    lineHeight: 24,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  ratingContainer: {
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.textSecondary,
    opacity: 0.8,
  },
  miniRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 6,
    borderColor: Colors.light.surface,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniRingFill: {
      position: 'absolute',
      top: -6, left: -6, right: -6, bottom: -6,
      borderRadius: 20,
      borderWidth: 6,
      borderColor: 'transparent',
      transform: [{ rotate: '-45deg' }]
  }
});
