import React from 'react';
import { View, Text,TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useCardHover } from '../../hooks/useCommandCenterAnimations';
import { LoopWithTasks, LoopType, FOLDER_ICONS } from '../../types/loop';
import { MomentumRing } from '../native/MomentumRing';
import { Animated } from 'react-native';

interface LoopCardProps {
  loop: LoopWithTasks;
  onPress: () => void;
  isSelected?: boolean;
}

/**
 * LoopCard - Glassmorphic card for Bento Grid layout
 * Features frost glass effect, trail preview, and hover animations
 */
export const LoopCard: React.FC<LoopCardProps> = ({ loop, onPress, isSelected = false }) => {
  const { colors } = useTheme();
  const { scaleAnim, onHoverIn, onHoverOut } = useCardHover();

  // Get the first incomplete task for trail preview
  const nextTask = loop.tasks?.find((t: any) => !t.completed && !t.is_one_time);
  const completionPercentage =
    loop.totalCount > 0 ? Math.round((loop.completedCount / loop.totalCount) * 100) : 0;

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[
          styles.container,
          {
            backgroundColor: colors.glassSurface,
            borderColor: isSelected ? colors.primary : colors.glassBorder,
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
        onPress={onPress}
        onMouseEnter={onHoverIn}
        onMouseLeave={onHoverOut}
        activeOpacity={0.9}
      >
        {/* Glassmorphic backdrop blur - Web only */}
        {Platform.OS === 'web' && <View style={styles.backdropBlur as any} />}

        {/* Shadow glow for selected state */}
        {isSelected && (
          <View
            style={[
              styles.glowOverlay,
              {
                shadowColor: colors.goldGlow,
                backgroundColor: `${colors.primary}10`,
              },
            ]}
          />
        )}

        <View style={styles.content}>
          {/* Top: Icon + Title */}
          <View style={styles.header}>
            <Text style={styles.emoji}>{FOLDER_ICONS[loop.category as LoopType] || '📋'}</Text>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
              {loop.name}
            </Text>
          </View>

          {/* Middle: Trail Preview */}
          {nextTask ? (
            <View style={styles.trailPreview}>
              <View style={[styles.trailDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.trailText, { color: colors.textSecondary }]} numberOfLines={1}>
                {nextTask.description}
              </Text>
            </View>
          ) : (
            <View style={styles.trailPreview}>
              <Text style={[styles.trailText, { color: colors.textSecondary, fontStyle: 'italic' }]}>
                {completionPercentage >= 100 ? '✓ All complete' : 'No pending tasks'}
              </Text>
            </View>
          )}

          {/* Bottom: Progress Ring + Stats */}
          <View style={styles.footer}>
            {loop.function_type === 'practice' ? (
              <MomentumRing size={40} strokeWidth={5} streak={loop.currentStreak || 0} />
            ) : (
              <View style={styles.progressRing}>
                <Text style={[styles.progressText, { color: colors.primary }]}>
                  {completionPercentage}%
                </Text>
              </View>
            )}

            <View style={styles.stats}>
              <Text style={[styles.statText, { color: colors.textSecondary }]}>
                {loop.function_type === 'practice'
                  ? `${loop.currentStreak || 0} day streak`
                  : `${loop.completedCount}/${loop.totalCount} complete`}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    minHeight: 180,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    ...Platform.select({
      web: {
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      } as any,
    }),
  },
  backdropBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      } as any,
    }),
    zIndex: 0,
  },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
    zIndex: 0,
  },
  content: {
    position: 'relative',
    zIndex: 1,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  emoji: {
    fontSize: 32,
    lineHeight: 36,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  trailPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 2,
  },
  trailDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  trailText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  progressRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(254, 192, 15, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 13,
    fontWeight: '800',
  },
  stats: {
    flex: 1,
  },
  statText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
