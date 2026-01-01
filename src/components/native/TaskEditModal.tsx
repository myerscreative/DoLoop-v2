import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { TaskWithDetails, TaskPriority, PRIORITY_LABELS, Tag } from '../../types/loop';
import { PriorityBadge } from './PriorityBadge';
import { TaskTag } from './TaskTag';

// Only import DateTimePicker on native platforms
let DateTimePicker: any = null;
if (Platform.OS !== 'web') {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
}

// Helper to format date for HTML input
const formatDateForInput = (date: Date | undefined): string => {
  if (!date) return '';
  return date.toISOString().split('T')[0];
};

// Helper to format datetime for HTML input
const formatDateTimeForInput = (date: Date | undefined): string => {
  if (!date) return '';
  // Format: YYYY-MM-DDTHH:mm
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

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

  // Form state
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('none');
  const [isRecurring, setIsRecurring] = useState(true);
  const [isOneTime, setIsOneTime] = useState(false);
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [reminderDate, setReminderDate] = useState<Date | undefined>();
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [reminderPickerMode, setReminderPickerMode] = useState<'date' | 'time'>('date');
  const [tempReminderDate, setTempReminderDate] = useState<Date | undefined>();
  const [timeEstimate, setTimeEstimate] = useState('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [saving, setSaving] = useState(false);

  // Initialize form with task data
  useEffect(() => {
    if (task) {
      setDescription(task.description || '');
      setNotes(task.notes || '');
      setPriority(task.priority || 'none');
      setIsRecurring(!task.is_one_time);
      setIsOneTime(task.is_one_time ?? false);
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
    setIsRecurring(true);
    setIsOneTime(false);
    setDueDate(undefined);
    setReminderDate(undefined);
    setTempReminderDate(undefined);
    setReminderPickerMode('date');
    setTimeEstimate('');
    setSelectedTags([]);
  };

  const handleSave = async () => {
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
        is_one_time: isOneTime,
        due_date: dueDate?.toISOString(),
        reminder_at: reminderDate?.toISOString(),
        time_estimate_minutes: timeEstimate ? parseInt(timeEstimate) : undefined,
        tags: selectedTags.map(t => t.id),
      };

      await onSave(taskData);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error saving task:', error);
      Alert.alert('Error', 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const toggleTag = (tag: Tag) => {
    setSelectedTags(prev =>
      prev.find(t => t.id === tag.id)
        ? prev.filter(t => t.id !== tag.id)
        : [...prev, tag]
    );
  };

  const priorityOptions: TaskPriority[] = ['none', 'low', 'medium', 'high', 'urgent'];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modal, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <Text style={[styles.title, { color: colors.text }]}>
                {task ? 'Edit Task' : 'New Task'}
              </Text>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={[styles.closeButton, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              {/* Description */}
              <View style={styles.section}>
                <Text style={[styles.label, { color: colors.text }]}>Description *</Text>
                <TextInput
                  style={[styles.input, {
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor: colors.surface
                  }]}
                  placeholder="What needs to be done?"
                  placeholderTextColor={colors.textSecondary}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={2}
                />
              </View>

              {/* Notes */}
              <View style={styles.section}>
                <Text style={[styles.label, { color: colors.text }]}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.textArea, {
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor: colors.surface
                  }]}
                  placeholder="Additional details..."
                  placeholderTextColor={colors.textSecondary}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={4}
                />
              </View>

              {/* Priority */}
              <View style={styles.section}>
                <Text style={[styles.label, { color: colors.text }]}>Priority</Text>
                <View style={styles.priorityRow}>
                  {priorityOptions.map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.priorityOption,
                        {
                          borderColor: priority === p ? colors.primary : colors.border,
                          backgroundColor: priority === p ? `${colors.primary}10` : colors.surface,
                        },
                      ]}
                      onPress={() => setPriority(p)}
                    >
                      <Text style={[
                        styles.priorityText,
                        { color: priority === p ? colors.primary : colors.text }
                      ]}>
                        {PRIORITY_LABELS[p]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Due Date */}
              <View style={styles.section}>
                <Text style={[styles.label, { color: colors.text }]}>Due Date (Platform: {Platform.OS})</Text>
                {Platform.OS === 'web' ? (
                  <View style={[styles.webDateContainer, {
                    borderColor: colors.border,
                    backgroundColor: colors.surface
                  }]}>
                    <input
                      type="date"
                      value={formatDateForInput(dueDate)}
                      onChange={(e) => {
                        if (e.target.value) {
                          setDueDate(new Date(e.target.value + 'T00:00:00'));
                        } else {
                          setDueDate(undefined);
                        }
                      }}
                      style={{
                        width: '100%',
                        height: 44,
                        padding: '0 12px',
                        border: 'none',
                        background: 'transparent',
                        color: colors.text,
                        fontSize: 16,
                        fontFamily: 'inherit',
                        outline: 'none',
                        cursor: 'pointer',
                        boxSizing: 'border-box',
                      } as any}
                    />
                    {dueDate && (
                      <TouchableOpacity
                        style={styles.webClearButton}
                        onPress={() => setDueDate(undefined)}
                      >
                        <Text style={{ color: colors.textSecondary, fontSize: 18 }}>✕</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  <>
                    <TouchableOpacity
                      style={[styles.dateButton, {
                        borderColor: colors.border,
                        backgroundColor: colors.surface
                      }]}
                      onPress={() => setShowDueDatePicker(true)}
                    >
                      <Text style={{ color: dueDate ? colors.text : colors.textSecondary }}>
                        {dueDate ? dueDate.toLocaleDateString() : 'No due date'}
                      </Text>
                      {dueDate && (
                        <TouchableOpacity
                          onPress={() => setDueDate(undefined)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Text style={{ color: colors.textSecondary }}>  ✕</Text>
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                    {showDueDatePicker && DateTimePicker && (
                      <DateTimePicker
                        value={dueDate || new Date()}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event: any, date?: Date) => {
                          if (Platform.OS === 'android') {
                            setShowDueDatePicker(false);
                            if (event.type === 'set' && date) {
                              setDueDate(date);
                            }
                          } else {
                            // iOS - picker stays open, only update date
                            if (date) setDueDate(date);
                          }
                        }}
                      />
                    )}
                    {Platform.OS === 'ios' && showDueDatePicker && (
                      <TouchableOpacity
                        style={[styles.pickerDoneButton, { backgroundColor: colors.primary }]}
                        onPress={() => setShowDueDatePicker(false)}
                      >
                        <Text style={{ color: 'white', fontWeight: '600' }}>Done</Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>

              {/* Time Estimate */}
              <View style={styles.section}>
                <Text style={[styles.label, { color: colors.text }]}>Time Estimate (minutes)</Text>
                <TextInput
                  style={[styles.input, {
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor: colors.surface
                  }]}
                  placeholder="e.g., 30"
                  placeholderTextColor={colors.textSecondary}
                  value={timeEstimate}
                  onChangeText={setTimeEstimate}
                  keyboardType="number-pad"
                />
              </View>

              {/* Reminder */}
              <View style={styles.section}>
                <Text style={[styles.label, { color: colors.text }]}>Reminder (Platform: {Platform.OS})</Text>
                {Platform.OS === 'web' ? (
                  <View style={[styles.webDateContainer, {
                    borderColor: colors.border,
                    backgroundColor: colors.surface
                  }]}>
                    <input
                      type="datetime-local"
                      value={formatDateTimeForInput(reminderDate)}
                      onChange={(e) => {
                        if (e.target.value) {
                          setReminderDate(new Date(e.target.value));
                        } else {
                          setReminderDate(undefined);
                        }
                      }}
                      style={{
                        width: '100%',
                        height: 44,
                        padding: '0 12px',
                        border: 'none',
                        background: 'transparent',
                        color: colors.text,
                        fontSize: 16,
                        fontFamily: 'inherit',
                        outline: 'none',
                        cursor: 'pointer',
                        boxSizing: 'border-box',
                      } as any}
                    />
                    {reminderDate && (
                      <TouchableOpacity
                        style={styles.webClearButton}
                        onPress={() => setReminderDate(undefined)}
                      >
                        <Text style={{ color: colors.textSecondary, fontSize: 18 }}>✕</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  <>
                    <TouchableOpacity
                      style={[styles.dateButton, {
                        borderColor: colors.border,
                        backgroundColor: colors.surface
                      }]}
                      onPress={() => {
                        setReminderPickerMode('date');
                        setTempReminderDate(reminderDate || new Date());
                        setShowReminderPicker(true);
                      }}
                    >
                      <Text style={{ color: reminderDate ? colors.text : colors.textSecondary }}>
                        {reminderDate ? reminderDate.toLocaleString() : 'No reminder'}
                      </Text>
                      {reminderDate && (
                        <TouchableOpacity
                          onPress={() => setReminderDate(undefined)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Text style={{ color: colors.textSecondary }}>  ✕</Text>
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                    {showReminderPicker && Platform.OS === 'ios' && DateTimePicker && (
                      <>
                        <DateTimePicker
                          value={tempReminderDate || new Date()}
                          mode="datetime"
                          display="spinner"
                          onChange={(event: any, date?: Date) => {
                            if (date) setTempReminderDate(date);
                          }}
                        />
                        <View style={styles.pickerButtonRow}>
                          <TouchableOpacity
                            style={[styles.pickerCancelButton, { borderColor: colors.border }]}
                            onPress={() => {
                              setShowReminderPicker(false);
                              setTempReminderDate(undefined);
                            }}
                          >
                            <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Cancel</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.pickerDoneButton, { backgroundColor: colors.primary }]}
                            onPress={() => {
                              setReminderDate(tempReminderDate);
                              setShowReminderPicker(false);
                              setTempReminderDate(undefined);
                            }}
                          >
                            <Text style={{ color: 'white', fontWeight: '600' }}>Done</Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                    {showReminderPicker && Platform.OS === 'android' && reminderPickerMode === 'date' && DateTimePicker && (
                      <DateTimePicker
                        value={tempReminderDate || new Date()}
                        mode="date"
                        display="default"
                        onChange={(event: any, date?: Date) => {
                          if (event.type === 'dismissed') {
                            setShowReminderPicker(false);
                            setTempReminderDate(undefined);
                            return;
                          }
                          if (event.type === 'set' && date) {
                            // Store the date and show time picker
                            setTempReminderDate(date);
                            setReminderPickerMode('time');
                          }
                        }}
                      />
                    )}
                    {showReminderPicker && Platform.OS === 'android' && reminderPickerMode === 'time' && DateTimePicker && (
                      <DateTimePicker
                        value={tempReminderDate || new Date()}
                        mode="time"
                        display="default"
                        onChange={(event: any, date?: Date) => {
                          setShowReminderPicker(false);
                          if (event.type === 'set' && date && tempReminderDate) {
                            // Combine the date from step 1 with the time from step 2
                            const finalDate = new Date(tempReminderDate);
                            finalDate.setHours(date.getHours());
                            finalDate.setMinutes(date.getMinutes());
                            setReminderDate(finalDate);
                          }
                          setTempReminderDate(undefined);
                          setReminderPickerMode('date');
                        }}
                      />
                    )}
                  </>
                )}
              </View>

              {/* Tags */}
              <View style={styles.section}>
                <Text style={[styles.label, { color: colors.text }]}>Tags</Text>
                <View style={styles.tagsContainer}>
                  {availableTags.map((tag) => (
                    <TouchableOpacity key={tag.id} onPress={() => toggleTag(tag)}>
                      <TaskTag
                        tag={tag}
                        onRemove={selectedTags.find(t => t.id === tag.id) ? () => toggleTag(tag) : undefined}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Task Type */}
              <View style={styles.section}>
                <View style={styles.switchRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.label, { color: colors.text }]}>Recurring Task</Text>
                    <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                      Resets when you reloop
                    </Text>
                  </View>
                  <Switch
                    value={isRecurring}
                    onValueChange={(val) => {
                      setIsRecurring(val);
                      if (val) setIsOneTime(false);
                    }}
                  />
                </View>

                <View style={styles.switchRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.label, { color: colors.text }]}>One-Time Task</Text>
                    <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                      Archived when completed
                    </Text>
                  </View>
                  <Switch
                    value={isOneTime}
                    onValueChange={(val) => {
                      setIsOneTime(val);
                      if (val) setIsRecurring(false);
                    }}
                  />
                </View>
              </View>
            </ScrollView>

            {/* Footer Actions */}
            <View style={[styles.footer, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
                onPress={onClose}
              >
                <Text style={[styles.buttonText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleSave}
                disabled={saving}
              >
                <Text style={[styles.buttonText, { color: 'white' }]}>
                  {saving ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modal: {
    maxHeight: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 24,
  },
  scrollView: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 13,
    marginTop: 2,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  priorityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priorityOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 2,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  webDateContainer: {
    position: 'relative',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  webClearButton: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  pickerDoneButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  pickerCancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
  },
  pickerButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {
    // backgroundColor set dynamically
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
