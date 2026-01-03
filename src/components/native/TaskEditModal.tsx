
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { AssigneeDot } from '../ui/AssigneeDot';
import { TaskWithDetails, TaskPriority, PRIORITY_LABELS, Tag, FOLDER_COLORS, ResetRule, RESET_RULE_DESCRIPTIONS } from '../../types/loop';
import LoopTypeToggle from './LoopTypeToggle';
import { TaskTag } from './TaskTag';
import { CustomDaySelector } from './CustomDaySelector';

// Conditionally import DateTimePicker only for native platforms
let DateTimePicker: any;
if (Platform.OS !== 'web') {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
}

interface TaskEditModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<TaskWithDetails>) => Promise<void>;
  task?: TaskWithDetails | null;
  availableTags: Tag[];
  onCreateTag?: (name: string, color: string) => Promise<Tag>;
}

export const TaskEditModal: React.FC<TaskEditModalProps> = ({
  visible,
  onClose,
  onSave,
  task,
  availableTags,
  onCreateTag,
}) => {
  const { colors } = useTheme();
  const { user } = useAuth();

  // Ref for input to re-focus after saving
  const descriptionInputRef = useRef<any>(null);

  // Form state
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('none');
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [resetRule, setResetRule] = useState<ResetRule>('daily');
  const [customDays, setCustomDays] = useState<number[]>([]); // For custom recurrence
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [reminderDate, setReminderDate] = useState<Date | undefined>();
  const [timeEstimate, setTimeEstimate] = useState('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  
  // Interactive State
  const [saving, setSaving] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  // Picker Visibilities
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  // Initialize form with task data
  useEffect(() => {
    if (task) {
      setDescription(task.description || '');
      setNotes(task.notes || '');
      setPriority(task.priority || 'none');
      setAssignedTo(task.assigned_user_id || null);
      // Map legacy is_one_time to resetRule
      setResetRule(task.is_one_time ? 'manual' : 'daily');
      setDueDate(task.due_date ? new Date(task.due_date) : undefined);
      setReminderDate(task.reminder_at ? new Date(task.reminder_at) : undefined);
      setTimeEstimate(task.time_estimate_minutes?.toString() || '');
      setSelectedTags(task.tag_details || []);
    } else {
      resetForm();
    }
  }, [task, visible]);

  const resetForm = () => {
    setDescription('');
    setNotes('');
    setPriority('none');
    setAssignedTo(null);
    setResetRule('daily');
    setCustomDays([]);
    setDueDate(undefined);
    setReminderDate(undefined);
    setTimeEstimate('');
    setSelectedTags([]);
    setShowDetails(false);
    setShowPriorityPicker(false);
    setShowDatePicker(false);
    setShowReminderPicker(false);
    setShowTagInput(false);
    setNewTagName('');
  };

  const toggleTag = (tag: Tag) => {
    setSelectedTags(prev =>
      prev.find(t => t.id === tag.id)
        ? prev.filter(t => t.id !== tag.id)
        : [...prev, tag]
    );
  };
  
  const handleCreateTag = async () => {
    if (!onCreateTag || !newTagName.trim()) return;
    
    try {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const newTag = await onCreateTag(newTagName.trim(), randomColor);
        if (newTag) {
            toggleTag(newTag);
            setNewTagName('');
            setShowTagInput(false);
        }
    } catch (error) {
        Alert.alert('Error', 'Failed to create tag');
    }
  };

  const handleSave = async (closeModal: boolean = true) => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a task description');
      return;
    }

    setSaving(true);
    try {
      const taskData: Partial<TaskWithDetails> = {
        description: description.trim(),
        notes: notes.trim() || undefined,
        priority,
        assigned_to: assignedTo,
        // Map resetRule to legacy is_one_time for now (will be fully migrated later)
        is_one_time: resetRule === 'manual',
        due_date: dueDate?.toISOString(),
        reminder_at: reminderDate?.toISOString(),
        time_estimate_minutes: timeEstimate ? parseInt(timeEstimate) : undefined,
        tags: selectedTags.map(t => t.id),
      };

      await onSave(taskData);
      
      if (closeModal) {
        onClose();
        resetForm();
      } else {
        // Keep modal open for rapid entry
        resetForm();
        // Re-focus the input after a brief delay to allow state to update
        setTimeout(() => {
          descriptionInputRef.current?.focus();
        }, 100);
      }
    } catch (error) {
      console.error('Error saving task:', error);
      Alert.alert('Error', 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  // Helper for Web Dates
  const formatDateForWeb = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const formatTimeForWeb = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  // Unified accent color for all recurrence options
  const accentColor = '#FEC00F'; // Gold
  const accentBg = '#FFF9E6'; // Light gold tint 

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlayPressable}
          activeOpacity={1}
          onPress={onClose}
        >
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={styles.modalContainer}
          >
            <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ width: '100%' }}
              >
                {/* Header */}
                <View style={styles.header}>
                  <Text style={styles.headerTitle}>
                    {task ? 'Edit Task' : 'New Task'}
                  </Text>
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color="#94a3b8" />
                  </TouchableOpacity>
                </View>

                {/* Narrow content container */}
                <ScrollView 
                  showsVerticalScrollIndicator={false} 
                  contentContainerStyle={styles.scrollContent}
                  style={{ maxHeight: Platform.OS === 'web' ? '85%' : 600 }}
                >
                  {/* Loop Recurrence Toggle */}
                  <View style={styles.section}>
                    <Text style={styles.label}>Loop Recurrence</Text>
                    <LoopTypeToggle
                      activeTab={resetRule}
                      onChange={setResetRule}
                    />
                    <Text style={[styles.hintText, { marginTop: 8 }]}>
                      {RESET_RULE_DESCRIPTIONS[resetRule]}
                    </Text>
                    
                    {/* Custom Day Selector - shows when 'custom' is selected */}
                    {resetRule === 'custom' && (
                      <Animated.View 
                        entering={FadeIn}
                        layout={Layout.springify()}
                      >
                        <CustomDaySelector
                          selectedDays={customDays}
                          onChange={setCustomDays}
                          accentColor={accentColor}
                          accentBg={accentBg}
                        />
                      </Animated.View>
                    )}
                  </View>

                  {/* Primary Input - Task */}
                  <View style={styles.inputSection}>
                    <Text style={styles.label}>Task</Text>
                    <View style={styles.mainInputContainer}>
                      <TextInput
                        ref={descriptionInputRef}
                        style={styles.primaryInput}
                        placeholder="What needs to be done?"
                        placeholderTextColor="#94a3b8"
                        value={description}
                        onChangeText={setDescription}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        autoFocus={!task}
                        onKeyPress={(e: any) => {
                          // Handle Enter key for quick save & add another
                          if (e.nativeEvent.key === 'Enter') {
                            e.preventDefault();
                            const isCtrlOrCmd = e.nativeEvent.ctrlKey || e.nativeEvent.metaKey;
                            handleSave(!isCtrlOrCmd); // Ctrl/Cmd+Enter closes, Enter keeps open
                          }
                        }}
                        blurOnSubmit={false}
                      />
                      <LinearGradient
                        colors={isFocused ? [accentColor, accentColor] : ['#e2e8f0', '#e2e8f0']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.animatedBorder}
                      />
                    </View>
                    <Text style={styles.hintText}>
                      Press Enter to save & add another • {Platform.OS === 'web' ? '⌘' : 'Ctrl'}+Enter to finish
                    </Text>
                  </View>

                  {/* Progressive Disclosure Toggle */}
                  <TouchableOpacity
                    onPress={() => setShowDetails(!showDetails)}
                    style={[styles.detailsToggle]}
                    activeOpacity={0.6}
                  >
                    <View style={[
                        styles.detailsToggleContent, 
                        { 
                            backgroundColor: 'transparent', 
                            borderWidth: 1, 
                            borderColor: accentColor,
                        }
                    ]}>
                      <Text style={[styles.detailsToggleText, { color: accentColor }]}>Add Details</Text>
                      <Ionicons
                        name={showDetails ? 'remove-circle-outline' : 'add-circle-outline'}
                        size={18}
                        color={accentColor}
                      />
                    </View>
                  </TouchableOpacity>

                  {showDetails && (
                    <Animated.View
                      entering={FadeIn}
                      exiting={FadeOut}
                      layout={Layout.springify()}
                      style={styles.detailsContainer}
                    >
                      <View style={styles.inputRow}>
                         {/* PRIORITY PICKER (INLINE) */}
                         <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.subLabel}>Priority</Text>
                            <TouchableOpacity 
                               style={[styles.pickerButton, showPriorityPicker && styles.pickerButtonActive]}
                               onPress={() => {
                                   setShowPriorityPicker(!showPriorityPicker);
                                   setShowDatePicker(false);
                                   setShowReminderPicker(false);
                               }}
                             >
                              <Text style={styles.pickerButtonText}>
                                {priority === 'none' ? 'None' : PRIORITY_LABELS[priority]}
                              </Text>
                              <Ionicons name={showPriorityPicker ? "chevron-up" : "chevron-down"} size={14} color="#64748b" />
                            </TouchableOpacity>
                         </View>

                         {/* DUE DATE PICKER */}
                         <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.subLabel}>Due Date</Text>
                            {Platform.OS === 'web' ? (
                                /* WEB: HTML DATE INPUT */
                                <View style={styles.webInputContainer}>
                                    <input 
                                        type="date"
                                        value={dueDate ? formatDateForWeb(dueDate) : ''}
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                setDueDate(new Date(e.target.value + 'T00:00:00'));
                                            } else {
                                                setDueDate(undefined);
                                            }
                                        }}
                                        style={{
                                            border: 'none',
                                            padding: '10px',
                                            width: '100%',
                                            boxSizing: 'border-box',
                                            fontSize: '14px',
                                            borderRadius: '12px',
                                            backgroundColor: '#f8fafc',
                                            outline: 'none',
                                            color: '#0f172a'
                                        }}
                                    />
                                </View>
                            ) : (
                                /* NATIVE: INLINE TOGGLE */
                                <TouchableOpacity 
                                   style={[styles.pickerButton, showDatePicker && styles.pickerButtonActive]}
                                   onPress={() => {
                                       setShowDatePicker(!showDatePicker);
                                       setShowPriorityPicker(false);
                                       setShowReminderPicker(false);
                                   }}
                                 >
                                  <Text style={styles.pickerButtonText}>
                                    {dueDate ? dueDate.toLocaleDateString() : 'Set date'}
                                  </Text>
                                  <Ionicons name="calendar-outline" size={14} color="#64748b" />
                                </TouchableOpacity>
                            )}
                         </View>
                      </View>

                      {/* INLINE EXPANSION: PRIORITY (Common for both) */}
                      {showPriorityPicker && (
                        <View style={styles.inlineDropdown}>
                            {(['none', 'low', 'medium', 'high', 'urgent'] as TaskPriority[]).map((p) => (
                            <TouchableOpacity
                                key={p}
                                style={[
                                styles.priorityOption,
                                priority === p && styles.priorityOptionSelected
                                ]}
                                onPress={() => {
                                setPriority(p);
                                setShowPriorityPicker(false);
                                }}
                            >
                                <Text style={[
                                styles.priorityOptionText,
                                priority === p && styles.priorityOptionTextSelected
                                ]}>
                                {p === 'none' ? 'None' : PRIORITY_LABELS[p]}
                                </Text>
                                {priority === p && <Ionicons name="checkmark" size={16} color="#0f172a" />}
                            </TouchableOpacity>
                            ))}
                        </View>
                       )}

                      {/* INLINE EXPANSION: DATE PICKER (NATIVE ONLY) */}
                      {Platform.OS !== 'web' && showDatePicker && DateTimePicker && (
                          <View style={styles.inlinePickerContainer}>
                              <DateTimePicker
                                value={dueDate || new Date()}
                                mode="date"
                                display="inline"
                                themeVariant="light"
                                textColor="black"
                                onChange={(event: any, selectedDate?: Date) => {
                                  if (selectedDate) setDueDate(selectedDate);
                                }}
                                style={{ height: 300, width: '100%' }}
                              />
                              <TouchableOpacity 
                                style={styles.pickerDoneButton}
                                onPress={() => setShowDatePicker(false)}
                              >
                                  <Text style={styles.pickerDoneText}>Done</Text>
                              </TouchableOpacity>
                          </View>
                      )}

                      <View style={styles.inputGroup}>
                        <Text style={styles.subLabel}>Notes</Text>
                        <TextInput
                          style={styles.textArea}
                          placeholder="Add more context or steps..."
                          placeholderTextColor="#94a3b8"
                          value={notes}
                          onChangeText={setNotes}
                          multiline
                          numberOfLines={3}
                          textAlignVertical="top"
                        />
                      </View>

                      <View style={styles.inputRow}>
                        {/* REMINDER PICKER */}
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                          <Text style={styles.subLabel}>Reminder</Text>
                          {Platform.OS === 'web' ? (
                                /* WEB: HTML TIME INPUT */
                                <View style={styles.webInputContainer}>
                                    <input 
                                        type="time"
                                        value={reminderDate ? formatTimeForWeb(reminderDate) : ''}
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                const [hours, minutes] = e.target.value.split(':');
                                                const newDate = new Date();
                                                newDate.setHours(parseInt(hours), parseInt(minutes));
                                                setReminderDate(newDate);
                                            } else {
                                                setReminderDate(undefined);
                                            }
                                        }}
                                        style={{
                                            border: 'none',
                                            padding: '10px',
                                            width: '100%',
                                            boxSizing: 'border-box',
                                            fontSize: '14px',
                                            borderRadius: '12px',
                                            backgroundColor: '#f8fafc',
                                            outline: 'none',
                                            color: '#0f172a'
                                        }}
                                    />
                                </View>
                            ) : (
                                /* NATIVE: INLINE TOGGLE */
                                <TouchableOpacity 
                                   style={[styles.pickerButton, showReminderPicker && styles.pickerButtonActive]}
                                   onPress={() => {
                                       setShowReminderPicker(!showReminderPicker);
                                       setShowDatePicker(false);
                                       setShowPriorityPicker(false);
                                   }}
                                 >
                                  <Text style={styles.pickerButtonText}>
                                    {reminderDate ? reminderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'No reminder'}
                                  </Text>
                                  <Ionicons name="notifications-outline" size={14} color="#64748b" />
                                </TouchableOpacity>
                            )}
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                          <Text style={styles.subLabel}>Time Estimate</Text>
                          <TextInput
                            style={styles.secondaryInput}
                            placeholder="e.g. 15 (min)"
                            placeholderTextColor="#94a3b8"
                            value={timeEstimate}
                            onChangeText={setTimeEstimate}
                            keyboardType="number-pad"
                          />
                        </View>
                      </View>

                       {/* INLINE EXPANSION: REMINDER PICKER (NATIVE ONLY) */}
                       {Platform.OS !== 'web' && showReminderPicker && DateTimePicker && (
                          <View style={styles.inlinePickerContainer}>
                              <DateTimePicker
                                value={reminderDate || new Date()}
                                mode="time"
                                display="spinner"
                                themeVariant="light"
                                textColor="black"
                                onChange={(event: any, selectedDate?: Date) => {
                                  if (selectedDate) setReminderDate(selectedDate);
                                }}
                                style={{ height: 120, width: '100%' }}
                              />
                              <TouchableOpacity 
                                style={styles.pickerDoneButton}
                                onPress={() => setShowReminderPicker(false)}
                              >
                                  <Text style={styles.pickerDoneText}>Done</Text>
                              </TouchableOpacity>
                          </View>
                      )}

                      {/* ASSIGNMENT */}
                      <View style={styles.inputGroup}>
                        <Text style={styles.subLabel}>Assignment</Text>
                        <TouchableOpacity 
                            style={[styles.pickerButton, !!assignedTo && styles.pickerButtonActive]}
                            onPress={() => {
                                // Toggle assignment to self if logged in
                                if (user) {
                                    setAssignedTo(assignedTo === user.id ? null : user.id);
                                }
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                                {assignedTo ? (
                                    <AssigneeDot initials="ME" size={24} />
                                ) : (
                                    <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: '#cbd5e1', borderStyle: 'dashed', backgroundColor: '#f1f5f9' }} />
                                )}
                                <Text style={styles.pickerButtonText}>
                                    {assignedTo ? 'Assigned to Me' : 'Unassigned'}
                                </Text>
                            </View>
                            {!assignedTo && <Ionicons name="person-add-outline" size={16} color="#94a3b8" />}
                        </TouchableOpacity>
                      </View>
                      
                      <View style={styles.inputGroup}>
                        <Text style={styles.subLabel}>Tags</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                          {availableTags.map((tag) => (
                            <TouchableOpacity key={tag.id} onPress={() => toggleTag(tag)}>
                              <TaskTag
                                tag={tag}
                                onRemove={selectedTags.find(t => t.id === tag.id) ? () => toggleTag(tag) : undefined}
                              />
                            </TouchableOpacity>
                          ))}
                          
                          {/* INLINE EXPANSION: NEW TAG INPUT */}
                           {showTagInput ? (
                               <View style={styles.tagInputContainer}>
                                   <TextInput 
                                        style={styles.tagInput}
                                        value={newTagName}
                                        onChangeText={setNewTagName}
                                        placeholder="Tag name"
                                        placeholderTextColor="#94a3b8"
                                        autoFocus
                                        onSubmitEditing={handleCreateTag}
                                   />
                                   <TouchableOpacity onPress={handleCreateTag} style={styles.tagInputButton}>
                                       <Ionicons name="checkmark" size={16} color="white" />
                                   </TouchableOpacity>
                                   <TouchableOpacity onPress={() => setShowTagInput(false)} style={styles.tagInputButtonCancel}>
                                       <Ionicons name="close" size={16} color="#64748b" />
                                   </TouchableOpacity>
                               </View>
                           ) : (
                                <TouchableOpacity 
                                    onPress={() => setShowTagInput(true)}
                                    style={styles.addTagButton}
                                >
                                    <Ionicons name="add" size={20} color="#FEC00F" />
                                </TouchableOpacity>
                           )}
                        </View>
                      </View>
                    </Animated.View>
                  )}
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                  <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleSave(true)}
                    disabled={saving || !description.trim()}
                    style={styles.saveButtonWrapper}
                  >
                    <View
                      style={[
                        styles.saveButton, 
                        { backgroundColor: '#EFB810' }, // Refined Gold
                        (!description.trim() || saving) && styles.saveButtonDisabled
                      ]}
                    >
                      {saving ? (
                        <ActivityIndicator size="small" color="#000" />
                      ) : (
                        <Text style={styles.saveButtonText}>Save Task</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayPressable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  modalContent: {
    padding: 24,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  closeButton: {
    padding: 4,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  section: {
    marginBottom: 24,
  },
  inputSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mainInputContainer: {
    width: '100%',
  },
  primaryInput: {
    fontSize: 20,
    color: '#0f172a',
    paddingVertical: 12,
    fontWeight: '600',
  },
  animatedBorder: {
    height: 2,
    width: '100%',
    borderRadius: 1,
  },
  hintText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 6,
    fontStyle: 'italic',
  },
  detailsToggle: {
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 16,
  },
  detailsToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF9E5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  detailsToggleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FEC00F',
  },
  detailsContainer: {
    gap: 16,
    paddingTop: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    gap: 6,
  },
  subLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pickerButtonActive: {
    borderColor: '#FEC00F',
    backgroundColor: '#FFF9E5',
  },
  pickerButtonText: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '500',
  },
  inlineDropdown: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    marginTop: -8,
    marginBottom: 8,
  },
  priorityOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  priorityOptionSelected: {
    backgroundColor: '#FFF9E5',
  },
  priorityOptionText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  priorityOptionTextSelected: {
    color: '#0f172a',
    fontWeight: '700',
  },
  inlinePickerContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginTop: -8,
    marginBottom: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pickerDoneButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 24,
    backgroundColor: '#e2e8f0',
    borderRadius: 20,
  },
  pickerDoneText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  secondaryInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  textArea: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minHeight: 80,
  },
  addTagButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF9E5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FEC00F',
    borderStyle: 'dashed',
    marginBottom: 6,
  },
  tagInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
  },
  tagInput: {
      width: 100,
      backgroundColor: '#f8fafc',
      borderWidth: 1,
      borderColor: '#e2e8f0',
      borderRadius: 8,
      paddingVertical: 4,
      paddingHorizontal: 8,
      fontSize: 13,
  },
  tagInputButton: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: '#10B981',
      alignItems: 'center',
      justifyContent: 'center',
  },
  tagInputButtonCancel: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: '#e2e8f0',
      alignItems: 'center',
      justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748b',
  },
  saveButtonWrapper: {
    flex: 2,
  },
  saveButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFA500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
  },
  webInputContainer: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    overflow: 'hidden',
  },
});
