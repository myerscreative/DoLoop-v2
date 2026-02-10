import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Image,
  Linking,
} from 'react-native';
import Animated, { 
  FadeIn, 
  FadeOut, 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { TaskWithDetails, Subtask } from '../../types/loop';
import { PriorityBadge } from './PriorityBadge';
import { createSubtask, toggleSubtask, deleteSubtask } from '../../lib/taskHelpers';
import { ReflectionInput } from './ReflectionInput';
import { getTodayReflection, saveReflection } from '../../lib/reflectionHelpers';
import { useAuth } from '../../contexts/AuthContext';
import { ReflectionHistoryModal } from './ReflectionHistoryModal';

interface ExpandableTaskCardProps {
  task: TaskWithDetails;
  onPress: () => void;
  onToggle: () => void;
  onSubtaskChange?: () => void;
  isPracticeLoop?: boolean;
  isActive?: boolean;
  isShelved?: boolean;
  isNested?: boolean;
}

const BRAND_GOLD = '#FEC00F';
const COOL_GREY = '#94A3B8';

export const ExpandableTaskCard: React.FC<ExpandableTaskCardProps> = ({
  task,
  onPress,
  onToggle,
  onSubtaskChange,
  isPracticeLoop = false,
  isActive = false,
  isShelved = false,
  isNested = false,
}) => {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [localSubtasks, setLocalSubtasks] = useState<Subtask[]>(task.subtasks || []);
  
  const [reflectionText, setReflectionText] = useState<string>('');
  const [showHistory, setShowHistory] = useState(false);

  // 3D Animation Shared Values
  const scale = useSharedValue(1);
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);

  useEffect(() => {
    if (task.subtasks) {
        setLocalSubtasks(task.subtasks);
    }
  }, [task.subtasks]);

  useEffect(() => {
    if (isPracticeLoop && task.completed && user) {
      loadReflection();
    }
  }, [isPracticeLoop, task.completed, user, task.id]);

  const loadReflection = async () => {
    if (!user) return;
    const text = await getTodayReflection(task.id, user.id);
    if (text) setReflectionText(text);
  };

  const handleSaveReflection = async (text: string) => {
    if (!user) return;
    await saveReflection(task.id, user.id, text);
    setReflectionText(text);
  };

  const hasSubtasks = localSubtasks.length > 0;
  const taskStatus = task.completed ? 'done' : 'pending';

  // Animation Styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective: 1000 },
        { scale: withSpring(scale.value, { damping: 15, stiffness: 150 }) },
        { rotateX: withSpring(`${rotateX.value}deg`, { damping: 15, stiffness: 150 }) },
        { rotateY: withSpring(`${rotateY.value}deg`, { damping: 15, stiffness: 150 }) },
      ],
    };
  });

  const handlePressIn = () => {
    scale.value = 0.98;
  };

  const handlePressOut = () => {
    scale.value = 1;
    rotateX.value = 0;
    rotateY.value = 0;
  };

  const handleToggleExpand = () => {
    if (hasSubtasks || showAddSubtask) {
      setExpanded(!expanded);
    }
  };

  const handleAddSubtask = async () => {
    if (!newSubtaskText.trim()) return;
    try {
      const subtask = await createSubtask(task.id, newSubtaskText.trim(), localSubtasks.length);
      if (subtask) {
        setLocalSubtasks([...localSubtasks, subtask]);
        setNewSubtaskText('');
        setShowAddSubtask(false);
        onSubtaskChange?.();
      }
    } catch {
      Alert.alert('Error', 'Failed to create subtask');
    }
  };

  const handleToggleSubtask = async (subtask: Subtask) => {
    try {
      const success = await toggleSubtask(subtask.id, subtask.completed);
      if (success) {
        setLocalSubtasks(localSubtasks.map(st =>
          st.id === subtask.id ? { ...st, completed: !st.completed } : st
        ));
        onSubtaskChange?.();
      }
    } catch {
    }
  };

  const handleDeleteSubtask = async (subtask: Subtask) => {
    Alert.alert(
      'Delete Step',
      `Delete "${subtask.description}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteSubtask(subtask.id);
            if (success) {
              setLocalSubtasks(localSubtasks.filter(st => st.id !== subtask.id));
              onSubtaskChange?.();
            }
          },
        },
      ]
    );
  };

  const cardContent = (
    <>
      <View style={styles.mainRow}>
        <TouchableOpacity 
          onPress={onToggle} 
          style={styles.toggleArea}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.checkbox,
              {
                borderColor: taskStatus === 'done' ? BRAND_GOLD : 'rgba(255, 255, 255, 0.2)',
                backgroundColor: taskStatus === 'done' ? BRAND_GOLD : 'transparent',
              },
            ]}
          >
            {taskStatus === 'done' && (
              <Ionicons name="checkmark" size={14} color="white" />
            )}
          </View>

          <View style={styles.content}>
            <View style={styles.titleRow}>
              <Text
                style={[
                  styles.description,
                  {
                    color: 'white',
                    fontFamily: isActive ? 'Outfit_700Bold' : 'Inter_500Medium',
                    textDecorationLine: isShelved ? 'line-through' : 'none',
                    opacity: taskStatus === 'done' ? 0.6 : 1,
                  },
                ]}
                numberOfLines={1}
              >
                {task.description}
              </Text>
              {task.priority !== 'none' && (
                <PriorityBadge priority={task.priority} size="small" />
              )}
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleToggleExpand} style={styles.expandButton}>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={hasSubtasks ? 'white' : 'rgba(255, 255, 255, 0.2)'}
          />
        </TouchableOpacity>
      </View>

      {isPracticeLoop && task.completed && (
        <Animated.View 
          entering={FadeIn.duration(200)} 
          style={{ paddingHorizontal: 16, paddingBottom: 8 }}
        >
          <ReflectionInput
            taskId={task.id}
            initialValue={reflectionText}
            onSave={handleSaveReflection}
          />
          <TouchableOpacity 
            onPress={() => setShowHistory(true)}
            style={{ alignSelf: 'flex-end', marginTop: 4, marginRight: 8 }}
          >
            <Text style={{ fontSize: 13, color: COOL_GREY, textDecorationLine: 'underline' }}>
                View History
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <ReflectionHistoryModal
        visible={showHistory}
        onClose={() => setShowHistory(false)}
        taskId={task.id}
        taskTitle={task.description}
      />

      {expanded && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.expandedSection}>
          {localSubtasks.map(subtask => (
            <View key={subtask.id} style={styles.subtaskRow}>
              <TouchableOpacity
                onPress={() => handleToggleSubtask(subtask)}
                style={[
                  styles.subtaskCheckbox,
                  {
                    borderColor: subtask.completed ? BRAND_GOLD : 'rgba(255, 255, 255, 0.2)',
                    backgroundColor: subtask.completed ? BRAND_GOLD : 'transparent',
                  },
                ]}
              >
                {subtask.completed && <Ionicons name="checkmark" size={10} color="white" />}
              </TouchableOpacity>
              <Text style={[styles.subtaskText, { color: subtask.completed ? COOL_GREY : 'white' }]}>
                {subtask.description}
              </Text>
              <TouchableOpacity
                onPress={() => handleDeleteSubtask(subtask)}
                style={styles.deleteButton}
              >
                <Ionicons name="close" size={14} color={COOL_GREY} />
              </TouchableOpacity>
            </View>
          ))}
          {showAddSubtask ? (
            <View style={styles.addSubtaskRow}>
              <TextInput
                style={[styles.subtaskInput, { color: 'white' }]}
                placeholder="Add step..."
                placeholderTextColor={COOL_GREY}
                value={newSubtaskText}
                onChangeText={setNewSubtaskText}
                onSubmitEditing={handleAddSubtask}
                autoFocus
              />
              <TouchableOpacity onPress={handleAddSubtask}>
                <Ionicons name="checkmark-circle" size={24} color={BRAND_GOLD} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowAddSubtask(false)}>
                <Ionicons name="close-circle" size={24} color={COOL_GREY} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              onPress={() => setShowAddSubtask(true)} 
              style={styles.addStepTrigger}
            >
              <Ionicons name="add" size={16} color={BRAND_GOLD} />
              <Text style={{ color: BRAND_GOLD, fontWeight: '600' }}>Add Step</Text>
            </TouchableOpacity>
          )}

          {task.attachments && task.attachments.length > 0 && (
            <View style={styles.attachmentsSection}>
              {task.attachments.map(att => (
                <TouchableOpacity 
                  key={att.id} 
                  onPress={() => Linking.openURL(att.file_url)}
                  style={styles.attachmentButton}
                >
                  <Ionicons name="attach-outline" size={16} color={COOL_GREY} />
                  <Text style={[styles.attachmentText, { color: COOL_GREY }]}>{att.file_name}</Text>
                </TouchableOpacity>
              ))}
              <View style={styles.imageGrid}>
                {task.attachments
                  .filter(att => att.file_type?.startsWith('image/'))
                  .map(att => (
                    <TouchableOpacity key={att.id} onPress={() => Linking.openURL(att.file_url)}>
                      <Image source={{ uri: att.file_url }} style={styles.attachmentImage} />
                    </TouchableOpacity>
                  ))}
              </View>
            </View>
          )}
        </Animated.View>
      )}
    </>
  );

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        animatedStyle,
        isActive && styles.activeCard,
        isShelved && { opacity: 0.4 },
        isNested && styles.nestedCard,
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        <BlurView intensity={24} tint="dark" style={styles.glassContainer}>
          <LinearGradient
            colors={isActive
              ? ['rgba(254, 192, 15, 0.15)', 'rgba(28, 31, 38, 0.8)']
              : ['rgba(255, 255, 255, 0.05)', 'rgba(28, 31, 38, 0.8)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            {cardContent}
          </LinearGradient>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 6,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  glassContainer: {
    borderRadius: 14,
  },
  gradient: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  activeCard: {
    borderColor: BRAND_GOLD,
    shadowColor: BRAND_GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  description: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    lineHeight: 22,
  },
  expandButton: {
    padding: 6,
  },
  expandedSection: {
    marginTop: 10,
    paddingLeft: 34,
    gap: 8,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  subtaskCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtaskText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  deleteButton: {
    padding: 4,
  },
  addStepTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  addSubtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subtaskInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 4,
  },
  attachmentsSection: {
    marginTop: 8,
    gap: 8,
  },
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  attachmentText: {
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  attachmentImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  nestedCard: {
    marginBottom: 8,
    borderRadius: 16,
  },
});
