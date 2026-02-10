import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Task } from '../../types/loop';
import { PriorityBadge } from './PriorityBadge';
import { RenderItemParams } from 'react-native-draggable-flatlist';

interface TaskRowProps extends RenderItemParams<Task> {
  onToggle: (task: Task) => void;
  onPress: (task: Task) => void;
  isActive: boolean;
  isHovered?: boolean;
  isDragging?: boolean;
}

export const TaskRow: React.FC<TaskRowProps> = ({ item: task, drag, isActive, onToggle, onPress, isHovered = false, isDragging = false }) => {
  const depth = task.depth || 0;
  const BRAND_GOLD = '#FEC00F';

  return (
    <View
      style={[
        styles.container,
        {
          paddingLeft: depth * 24 + 12,
          backgroundColor: isHovered
            ? 'rgba(254, 192, 15, 0.30)'
            : isActive
              ? 'rgba(254, 192, 15, 0.15)'
              : 'rgba(255, 255, 255, 0.05)',
          borderColor: isHovered
            ? BRAND_GOLD
            : isActive
              ? BRAND_GOLD
              : 'rgba(255, 255, 255, 0.08)',
          borderWidth: isHovered ? 2 : 1,
          transform: [{ scale: isHovered ? 1.03 : 1 }],
          opacity: isDragging ? 0.5 : 1,
        },
        isHovered && styles.hoveredShadow,
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onPress(task)}
        onLongPress={drag}
        delayLongPress={300}
        style={styles.touchable}
      >
        {/* Drag Handle */}
        <TouchableOpacity
          onLongPress={drag}
          delayLongPress={150}
          style={styles.dragHandle}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons name="drag-vertical" size={24} color={BRAND_GOLD} />
        </TouchableOpacity>

        {/* Checkbox */}
        <TouchableOpacity
          onPress={() => onToggle(task)}
          style={[
            styles.checkbox,
            {
              borderColor: task.completed ? BRAND_GOLD : 'rgba(255, 255, 255, 0.2)',
              backgroundColor: task.completed ? BRAND_GOLD : 'transparent',
            },
          ]}
        >
          {task.completed && <Ionicons name="checkmark" size={14} color="white" />}
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.content}>
          <Text
            style={[
              styles.description,
              {
                color: 'white',
                textDecorationLine: task.completed ? 'line-through' : 'none',
                opacity: task.completed ? 0.6 : 1,
              },
            ]}
            numberOfLines={1}
          >
            {task.description}
          </Text>

          <View style={styles.metadata}>
            {task.priority !== 'none' && (
              <PriorityBadge priority={task.priority} size="small" />
            )}
            {task.children && task.children.length > 0 && (
              <View style={styles.counts}>
                <Text style={styles.countText}>
                  {task.children.filter((c: Task) => c.completed).length}/{task.children.length}
                </Text>
              </View>
            )}
          </View>
        </View>

        {isHovered && (
          <View style={styles.nestHint}>
            <Ionicons name="enter-outline" size={16} color={BRAND_GOLD} />
            <Text style={styles.nestHintText}>Nest</Text>
          </View>
        )}

        {!isHovered && (
          <Ionicons name="chevron-forward" size={16} color="rgba(255, 255, 255, 0.3)" />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingRight: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 0,
  },
  touchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  hoveredShadow: {
    shadowColor: '#FEC00F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
    borderRadius: 8,
  },
  dragHandle: {
    paddingRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 8,
  },
  description: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  counts: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  countText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  nestHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(254, 192, 15, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  nestHintText: {
    color: '#FEC00F',
    fontSize: 11,
    fontWeight: '700',
  },
});
