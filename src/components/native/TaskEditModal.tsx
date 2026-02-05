
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  TaskWithDetails, 
  TaskPriority, 
  Tag, 
  Attachment, 
  Subtask, 
  PendingAttachment 
} from '../../types/loop';
import { TaskTag } from './TaskTag';
import { deleteSubtask } from '../../lib/taskHelpers';

// Conditionally import DateTimePicker only for native platforms
let DateTimePicker: any;
if (Platform.OS !== 'web') {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
}

interface TaskEditModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (
    taskData: Partial<TaskWithDetails>, 
    pendingSubtasks?: Subtask[], 
    pendingAttachments?: PendingAttachment[]
  ) => Promise<string | null | void>; // Return ID
  task?: TaskWithDetails | null;
  user: any;
  onCreateTag?: (name: string, color: string) => Promise<Tag | null>;
  initialValues?: Partial<TaskWithDetails>;
  availableTags: Tag[];
}

export const TaskEditModal: React.FC<TaskEditModalProps> = ({
  visible,
  onClose,
  onSave,
  task,
  availableTags,
  onCreateTag,
  initialValues,
}) => {
  const { user } = useAuth();

  // Ref for input to re-focus after saving
  const descriptionInputRef = useRef<any>(null);

  // Form state
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [newSubtaskText, setNewSubtaskText] = useState(''); // New state for subtask input
  const [assignInput, setAssignInput] = useState('');         // New state for assignment input (email)
  const [showAssignInput, setShowAssignInput] = useState(false);
  const [priority, setPriority] = useState<TaskPriority>('none');
  const [assignedTo, setAssignedTo] = useState<string | null>(null);

  const [isOneTime, setIsOneTime] = useState(false);
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [reminderDate, setReminderDate] = useState<Date | undefined>();
  const [timeEstimate, setTimeEstimate] = useState('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>([]);

  // Attachment state
  const [pendingAttachments, setPendingAttachments] = useState<{
    uri: string;
    name: string;
    type: 'image' | 'file';
    mimeType?: string;
  }[]>([]);

  // Interactive State
  const [saving, setSaving] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  // Picker Visibilities
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);

  const isProcessingSubtask = useRef(false);

  // Initialize form with task data
  useEffect(() => {
    if (visible) {
      if (task) {
        setDescription(task.description);
        setNotes(task.notes || '');
        setPriority(task.priority);
        setAssignedTo(task.assigned_to || task.assigned_user_id || null);
        setIsOneTime(task.is_one_time);
        setDueDate(task.due_date ? new Date(task.due_date) : undefined);
        setReminderDate(task.reminder_at ? new Date(task.reminder_at) : undefined);
        setTimeEstimate(task.time_estimate_minutes?.toString() || '');
        setSelectedTags(task.tag_details || []);
        // Ensure subtasks is an array
        setSubtasks(Array.isArray(task.subtasks) ? task.subtasks : []);
        setExistingAttachments(task.attachments || []);
      } else {
        resetForm();
      }
    }
  }, [visible, task, initialValues]);

  const resetForm = () => {
    setDescription('');
    setNotes('');
    setPriority('none');
    setAssignedTo(null);

    setIsOneTime(false);
    setDueDate(undefined);
    setReminderDate(undefined);
    setTimeEstimate('');
    setSelectedTags([]);
    setPendingAttachments([]);
    setExistingAttachments([]);
    setSubtasks([]);
    setShowDetails(false);
    setShowPriorityPicker(false);
    setShowDatePicker(false);
    setShowReminderPicker(false);
    setShowTagInput(false);
    setShowSubtaskInput(false);
    setNewSubtaskText('');
    setNewTagName('');
  };

  // Image picker
  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const fileName = asset.fileName || `image_${Date.now()}.jpg`;
        setPendingAttachments(prev => [...prev, {
          uri: asset.uri,
          name: fileName,
          type: 'image',
          mimeType: asset.mimeType || 'image/jpeg',
        }]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // Document picker
  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setPendingAttachments(prev => [...prev, {
          uri: asset.uri,
          name: asset.name,
          type: 'file',
          mimeType: asset.mimeType || 'application/octet-stream',
        }]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  const removeAttachment = (index: number) => {
    setPendingAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingAttachment = async (id: string) => {
    try {
        const { deleteAttachment } = await import('../../lib/taskHelpers');
        const success = await deleteAttachment(id);
        if (success) {
            setExistingAttachments(prev => prev.filter(a => a.id !== id));
        } else {
            Alert.alert('Error', 'Failed to delete attachment');
        }
    } catch (error) {
        console.error('Error deleting attachment:', error);
        Alert.alert('Error', 'Could not delete attachment');
    }
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

        is_one_time: isOneTime,
        due_date: dueDate?.toISOString(),
        reminder_at: reminderDate?.toISOString(),
        time_estimate_minutes: timeEstimate ? parseInt(timeEstimate) : undefined,
        tags: selectedTags.map(t => t.id),
      };

      // Pass pending subtasks (only temp ones, as existing ones are already saved)
      const pendingSubtasks = subtasks.filter(s => s.id.startsWith('temp_'));
      // Pass pending attachments to be uploaded after task is created
      await onSave(taskData, pendingSubtasks, pendingAttachments.length > 0 ? pendingAttachments : undefined);
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

  // Subtask Helpers
  const handleAddSubtask = () => {
    const textToAdd = newSubtaskText.trim();
    if (!textToAdd) return;
    
    // Debounce check to prevent double-entry from Enter key triggering both Submit and KeyPress
    if (isProcessingSubtask.current) return;
    isProcessingSubtask.current = true;
    
    // Clear immediately (Optimistic UI)
    setNewSubtaskText('');

    // Add to local state
    const tempSubtask: Subtask = {
        id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        task_id: task?.id || 'temp',
        description: textToAdd,
        completed: false,
        order_index: subtasks.length,
        created_at: new Date().toISOString()
    };
    
    setSubtasks(prev => [...prev, tempSubtask]);

    // Release lock quickly
    setTimeout(() => {
        isProcessingSubtask.current = false;
    }, 100);
  };

  const handleDeleteSubtask = async (id: string) => {
    if (id.startsWith('temp_')) {
        setSubtasks(subtasks.filter(s => s.id !== id));
        return;
    }

    // If it's an existing subtask, attempt to delete it from the backend
    try {
        const success = await deleteSubtask(id);
        if (success) {
            setSubtasks(subtasks.filter(s => s.id !== id));
        } else {
            Alert.alert('Error', 'Failed to delete subtask from server.');
        }
    } catch (error) {
        console.error('Failed to delete subtask', error);
        Alert.alert('Error', 'Could not delete subtask.');
    }
  };

  const handleSaveAndClose = () => {
    handleSave(true);
  };

  const OptionRow = ({ 
    icon, 
    label, 
    value, 
    onPress, 
    onClear,
    isBlue = false
  }: { 
    icon: any, 
    label: string, 
    value?: string | null, 
    onPress: () => void,
    onClear?: () => void,
    isBlue?: boolean
  }) => (
    <View style={styles.optionRow}>
      <TouchableOpacity 
        style={styles.optionContent} 
        onPress={onPress}
      >
        <View style={styles.optionIconContainer}>
            <Ionicons name={icon} size={22} color={value ? (isBlue ? '#0EA5E9' : '#0f172a') : '#0f172a'} />
        </View>
        
        {value ? (
            <Text style={[styles.optionValue, isBlue && { color: '#0EA5E9' }]}>{value}</Text>
        ) : (
            <Text style={styles.optionLabel}>{label}</Text>
        )}
      </TouchableOpacity>

      {value && onClear && (
        <TouchableOpacity onPress={onClear} style={styles.optionClear}>
             <Ionicons name="close" size={18} color="#94a3b8" />
        </TouchableOpacity>
      )}
    </View>
  );

  const SubtaskRow = ({ item }: { item: Subtask }) => (
      <View style={styles.subtaskRow}>
          <View style={styles.subtaskDot} />
          <Text style={styles.subtaskText}>{item.description}</Text>
          <TouchableOpacity onPress={() => handleDeleteSubtask(item.id)} style={{ padding: 4 }}>
              <Ionicons name="close" size={16} color="#94a3b8" />
          </TouchableOpacity>
      </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleSaveAndClose}
    >
      <View style={styles.container}>
        <View style={styles.modalContentWrapper}>
        {/* Header */}
        <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
            
            <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle}>Task Details</Text>
            </View>

            <TouchableOpacity 
                onPress={handleSaveAndClose} 
                style={[styles.saveHeaderButton, !description.trim() && { opacity: 0.5 }]}
                disabled={saving}
            >
                {saving ? (
                    <ActivityIndicator size="small" color="white" />
                ) : (
                    <Text style={styles.saveHeaderText}>Save</Text>
                )}
            </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Name Input */}
            <View style={styles.nameSection}>
                <TouchableOpacity style={styles.radioPlaceholder}>
                    <View style={styles.radioCircle} />
                </TouchableOpacity>
                <TextInput
                    ref={descriptionInputRef}
                    style={styles.nameInput}
                    placeholder="Enter Step Name..."
                    value={description}
                    onChangeText={setDescription}
                    placeholderTextColor="#94a3b8"
                    multiline={Platform.OS !== 'web'} // Allow multiline on mobile, but single line on web for easier Enter-to-save
                    blurOnSubmit={true}
                    returnKeyType="done"
                    onSubmitEditing={() => handleSave(false)}
                />
            </View>

            <View style={styles.subtasksContainer}>
                {subtasks.map(st => <SubtaskRow key={st.id} item={st} />)}
                
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    {!showSubtaskInput ? (
                        <TouchableOpacity 
                            style={styles.addSubtaskLink} 
                            onPress={() => setShowSubtaskInput(true)}
                        >
                            <Ionicons name="add" size={18} color="#64748b" />
                            <Text style={styles.addSubtaskLinkText}>Add Sub-Step/Sub-Task</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.addSubtaskRow}>
                            <View style={styles.addSubtaskInputContainer}>
                                <TextInput
                                    style={styles.addSubtaskInput}
                                    placeholder="Sub-Step description..."
                                    value={newSubtaskText}
                                    onChangeText={setNewSubtaskText}
                                    onSubmitEditing={handleAddSubtask}
                                    blurOnSubmit={false} 
                                    autoFocus
                                    placeholderTextColor="#94a3b8"
                                    onKeyPress={({ nativeEvent }) => {
                                        if (nativeEvent.key === 'Enter') {
                                            handleAddSubtask();
                                        }
                                    }}
                                />
                            </View>
                            <TouchableOpacity onPress={() => setShowSubtaskInput(false)} style={styles.cancelSubtask}>
                                <Ionicons name="close-circle" size={24} color="#94a3b8" />
                            </TouchableOpacity>
                            {newSubtaskText.length > 0 && (
                                    <TouchableOpacity onPress={handleAddSubtask} style={styles.addSubtaskConfirm}>
                                        <Ionicons name="checkmark-circle" size={24} color="#FEC00F" />
                                    </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {!showDetails && (
                        <TouchableOpacity 
                            style={styles.addDetailsLink} 
                            onPress={() => setShowDetails(true)}
                        >
                            <Ionicons name="options-outline" size={16} color="#6366f1" />
                            <Text style={styles.addDetailsLinkText}>Add Step Details</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {showDetails ? (
                <View>
                    <View style={styles.divider} />

                    {/* Options List */}
                    
                    {/* Loop Type */}
                    <OptionRow
                        icon="sync" // or refresh
                        label="Set as Loop item or one time task"
                        value={isOneTime ? "One time task" : "Loop item"}
                        onPress={() => setIsOneTime(!isOneTime)}
                        // No clear for this, it's a toggle
                    />
                    <View style={styles.separator} />

                    {/* Due Date */}
                    <OptionRow
                        icon="calendar-outline"
                        label="Add Due Date"
                        value={dueDate ? dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null}
                        onPress={() => setShowDatePicker(!showDatePicker)}
                        onClear={() => setDueDate(undefined)}
                        isBlue
                    />
                    {showDatePicker && (
                        <View style={styles.datePickerContainer}>
                            {Platform.OS === 'web' ? (
                                <View style={styles.webInputContainer}>
                                   <Text style={styles.webLabel}>Select Date:</Text>
                                   <input 
                                       type="date" 
                                       value={dueDate ? dueDate.toISOString().split('T')[0] : ''}
                                       onChange={(e) => {
                                           if (e.target.valueAsDate) {
                                               setDueDate(e.target.valueAsDate);
                                           } else {
                                               setDueDate(undefined);
                                           }
                                           setShowDatePicker(false);
                                       }}
                                       style={{ padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 16, width: '100%', fontFamily: 'inherit' }}
                                   />
                                </View>
                            ) : (
                                 DateTimePicker && (
                                    <DateTimePicker
                                        value={dueDate || new Date()}
                                        mode="date"
                                        display="inline"
                                        onChange={(e: any, d?: Date) => {
                                            setShowDatePicker(false);
                                            if (d) setDueDate(d);
                                        }}
                                        style={{ height: 300 }}
                                    />
                                 )
                            )}
                        </View>
                    )}
                    <View style={styles.separator} />

                    {/* Assign To */}
                    <View>
                        <OptionRow
                            icon="person-outline"
                            label="Assign to"
                            value={assignedTo ? (assignedTo === user?.id ? 'Me' : assignedTo) : null} 
                            onPress={() => setShowAssignInput(!showAssignInput)} 
                            onClear={() => setAssignedTo(null)}
                            isBlue
                        />
                        {showAssignInput && (
                            <View style={styles.assignInputContainer}>
                                <TouchableOpacity 
                                    style={styles.assignOption} 
                                    onPress={() => {
                                        setAssignedTo(user?.id || 'me');
                                        setShowAssignInput(false);
                                    }}
                                >
                                    <View style={[styles.avatarPlaceholder, { backgroundColor: '#FEC00F' }]}>
                                        <Text style={{ color: 'white', fontWeight: 'bold' }}>M</Text>
                                    </View>
                                    <Text style={styles.assignOptionText}>Assign to Me</Text>
                                </TouchableOpacity>
                                
                                <View style={styles.emailInputRow}>
                                     <TextInput
                                        style={styles.emailInput}
                                        placeholder="Enter email address"
                                        value={assignInput}
                                        onChangeText={setAssignInput}
                                        placeholderTextColor="#94a3b8"
                                     />
                                     <TouchableOpacity 
                                        onPress={() => {
                                            if(assignInput.trim()) {
                                                // TODO: Resolve user ID from email. For now, just setting it if we could.
                                                // Since we can't look up reliably without an edge function, we will show alert.
                                                Alert.alert('Coming Soon', 'Inviting via email will be available shortly. Assigned to you for now.');
                                                setAssignedTo(user?.id || 'me'); // Fallback
                                                setShowAssignInput(false);
                                                setAssignInput('');
                                            }
                                        }}
                                        style={styles.assignConfirmButton}
                                     >
                                         <Text style={styles.assignConfirmText}>Assign</Text>
                                     </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>
                    <View style={styles.separator} />

                    {/* Tags */}
                    <OptionRow
                        icon="pricetag-outline"
                        label="Add Tag"
                        value={selectedTags.length > 0 ? selectedTags.map(t => t.name).join(', ') : null}
                        onPress={() => setShowTagInput(!showTagInput)} // Simplified interaction
                        onClear={() => setSelectedTags([])}
                    />
                    {showTagInput && (
                         <View style={{ paddingHorizontal: 20, paddingBottom: 10 }}>
                             <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                                {availableTags.map(tag => (
                                    <TouchableOpacity key={tag.id} onPress={() => toggleTag(tag)}>
                                        <TaskTag tag={tag} selected={selectedTags.some(t => t.id === tag.id)} />
                                    </TouchableOpacity>
                                ))}
                             </View>
                             
                             {/* Create New Tag UI */}
                             <View style={styles.createTagRow}>
                                 <TextInput
                                     style={styles.createTagInput}
                                     placeholder="New Tag Name"
                                     value={newTagName}
                                     onChangeText={setNewTagName}
                                     placeholderTextColor="#94a3b8"
                                     onSubmitEditing={handleCreateTag}
                                 />
                                 <TouchableOpacity 
                                     onPress={handleCreateTag} 
                                     style={[styles.createTagButton, !newTagName.trim() && { opacity: 0.5 }]}
                                     disabled={!newTagName.trim()}
                                 >
                                     <Ionicons name="add" size={20} color="white" />
                                 </TouchableOpacity>
                             </View>
                         </View>
                    )}
                    <View style={styles.separator} />

                    {/* Attach File */}
                    <OptionRow
                        icon="attach-outline"
                        label="Attach File"
                        value={(existingAttachments.filter(a => !a.file_type?.startsWith('image/')).length + pendingAttachments.filter(a => a.type === 'file').length) > 0 
                          ? `${existingAttachments.filter(a => !a.file_type?.startsWith('image/')).length + pendingAttachments.filter(a => a.type === 'file').length} files` 
                          : null}
                        onPress={handlePickDocument}
                        isBlue
                    />
                    {/* Existing Files List */}
                    {existingAttachments.filter(a => !a.file_type?.startsWith('image/')).map(att => (
                       <View key={att.id} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 4, gap: 8 }}>
                          <Ionicons name="document-outline" size={16} color="#64748b" />
                          <Text style={{ flex: 1, fontSize: 13, color: '#64748b' }} numberOfLines={1}>{att.file_name}</Text>
                          <TouchableOpacity onPress={() => handleDeleteExistingAttachment(att.id)}>
                            <Ionicons name="close-circle" size={18} color="#94a3b8" />
                          </TouchableOpacity>
                       </View>
                    ))}
                    {/* Pending Files List */}
                    {pendingAttachments.filter(a => a.type === 'file').map((att, i) => (
                       <View key={`pending-file-${i}`} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 4, gap: 8 }}>
                          <Ionicons name="document-outline" size={16} color="#94a3b8" />
                          <Text style={{ flex: 1, fontSize: 13, color: '#94a3b8' }} numberOfLines={1}>{att.name}</Text>
                          <TouchableOpacity onPress={() => removeAttachment(i)}>
                            <Ionicons name="close-circle" size={18} color="#94a3b8" />
                          </TouchableOpacity>
                       </View>
                    ))}
                    <View style={styles.separator} />

                    {/* Attach Image */}
                    <OptionRow
                        icon="image-outline"
                        label="Attach image"
                        value={(existingAttachments.filter(a => a.file_type?.startsWith('image/')).length + pendingAttachments.filter(a => a.type === 'image').length) > 0 
                          ? `${existingAttachments.filter(a => a.file_type?.startsWith('image/')).length + pendingAttachments.filter(a => a.type === 'image').length} images` 
                          : null}
                        onPress={handlePickImage}
                    />
                     {/* Combined Images Strip */}
                     {(existingAttachments.filter(a => a.file_type?.startsWith('image/')).length > 0 || pendingAttachments.filter(a => a.type === 'image').length > 0) && (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, paddingBottom: 10, gap: 8 }}>
                            {existingAttachments.filter(a => a.file_type?.startsWith('image/')).map(att => (
                                <View key={att.id} style={{ position: 'relative' }}>
                                    <Image source={{ uri: att.file_url }} style={{ width: 45, height: 45, borderRadius: 6 }} />
                                    <TouchableOpacity 
                                      onPress={() => handleDeleteExistingAttachment(att.id)}
                                      style={{ position: 'absolute', top: -6, right: -6, backgroundColor: 'white', borderRadius: 10 }}
                                    >
                                        <Ionicons name="close-circle" size={18} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            {pendingAttachments.filter(a => a.type === 'image').map((att, i) => (
                                <View key={`pending-${i}`} style={{ position: 'relative' }}>
                                    <Image source={{ uri: att.uri }} style={{ width: 45, height: 45, borderRadius: 6, opacity: 0.7 }} />
                                    <TouchableOpacity 
                                      onPress={() => removeAttachment(i)}
                                      style={{ position: 'absolute', top: -6, right: -6, backgroundColor: 'white', borderRadius: 10 }}
                                    >
                                        <Ionicons name="close-circle" size={18} color="#94a3b8" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                     )}


                    <View style={styles.separator} />

                    {/* Note */}
                    <View style={styles.noteSection}>
                        <View style={[styles.optionRow, { borderBottomWidth: 0, alignItems: 'flex-start' }]}>
                             <View style={[styles.optionIconContainer, { marginTop: 12 }]}>
                                  <Ionicons name="chatbox-outline" size={22} color="#0f172a" />
                             </View>
                             <TextInput 
                                 style={[styles.noteInput, !!notes && { color: '#0EA5E9' }]}
                                 placeholder="Add Note" 
                                 placeholderTextColor="#94a3b8"
                                 value={notes}
                                 onChangeText={setNotes}
                                 multiline
                             />
                        </View>
                    </View>
                </View>
            ) : null}

            <View style={styles.separator} />


        </ScrollView>

        {/* Bottom Save Button - for better visibility */}
        <View style={styles.footer}>
            <TouchableOpacity 
                style={[styles.bottomSaveButton, (!description.trim() || saving) && styles.bottomSaveButtonDisabled]}
                onPress={handleSaveAndClose}
                disabled={!description.trim() || saving}
            >
                {saving ? (
                    <ActivityIndicator size="small" color="#000" />
                ) : (
                    <Text style={styles.bottomSaveButtonText}>Save Changes</Text>
                )}
            </TouchableOpacity>
        </View>


        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Platform.OS === 'web' ? 'rgba(0,0,0,0.5)' : 'white',
    alignItems: Platform.OS === 'web' ? 'center' : undefined,
    justifyContent: Platform.OS === 'web' ? 'center' : 'flex-end', // On mobile, slide from bottom
  },
  modalContentWrapper: {
      width: Platform.OS === 'web' ? '70%' : '100%',
      maxWidth: 800,
      maxHeight: Platform.OS === 'web' ? '90%' : '95%', // Use maxHeight to avoid gap
      backgroundColor: 'white',
      borderRadius: Platform.OS === 'web' ? 16 : 0,
      borderTopLeftRadius: 20, // Nice rounded corners for mobile bottom sheet feel
      borderTopRightRadius: 20,
      overflow: 'hidden',
  },
  header: {
    backgroundColor: '#FEC00F',
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    padding: 4,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  saveHeaderButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  saveHeaderText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700',
  },
  content: {
    paddingTop: 20,
  },
  nameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  radioPlaceholder: {
    marginRight: 16,
  },
  radioCircle: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: '#0f172a',
  },
  nameInput: {
      flex: 1,
      fontSize: 16,
      color: '#0f172a',
      backgroundColor: '#f8fafc',
      borderWidth: 1,
      borderColor: '#e2e8f0',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      minHeight: 48, // Ensure touch target
  },
  subtasksContainer: {
      paddingHorizontal: 20,
      paddingLeft: 60, // Indent to match text
      marginBottom: 20,
  },
  subtaskRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
  },
  subtaskDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#94a3b8',
      marginRight: 10,
  },
  subtaskText: {
    flex: 1,
    fontSize: 15,
    color: '#334155',
  },
  footer: {
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: '#f1f5f9',
      backgroundColor: 'white',
  },
  bottomSaveButton: {
      backgroundColor: '#FEC00F',
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#FEC00F',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
  },
  bottomSaveButtonDisabled: {
      backgroundColor: '#FDE68A',
      shadowOpacity: 0,
      elevation: 0,
  },
  bottomSaveButtonText: {
      fontSize: 16,
      fontWeight: '800',
      color: '#000',
  },
  addSubtaskButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
  },
  addSubtaskText: {
      marginLeft: 8,
      color: '#475569',
      fontSize: 15,
  },
  saveFirstText: {
      fontSize: 14,
      color: '#94a3b8',
      fontStyle: 'italic',
  },
  divider: {
      height: 1,
      backgroundColor: '#f1f5f9',
      marginHorizontal: 0,
      marginBottom: 0,
  },
  separator: {
      height: 1,
      backgroundColor: '#f1f5f9',
      marginLeft: 60, // Indent separator
  },
  optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
  },
  optionContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
  },
  optionIconContainer: {
      width: 24,
      marginRight: 16,
      alignItems: 'center',
  },
  optionLabel: {
      fontSize: 16,
      color: '#0f172a',
  },
  optionValue: {
      fontSize: 16,
      color: '#0f172a',
      fontWeight: '500',
  },
  optionClear: {
      padding: 4,
  },
  noteSection: {
      
  },
  // Attachment styles (kept for logic usage if needed, though mostly using inline or simple views)
  attachmentsList: {
    gap: 8,
    marginBottom: 12,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 8,
    gap: 10,
  },
  attachmentThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#e2e8f0',
  },
  attachmentFileBadge: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentName: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
  },
  attachmentRemove: {
    padding: 4,
  },
  attachmentButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  attachmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  attachmentButtonText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  // Subtask Input
  addSubtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  addSubtaskInputContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f8fafc',
      borderRadius: 8,
      paddingHorizontal: 8,
  },
  addSubtaskInput: {
      flex: 1,
      fontSize: 15,
      color: '#0f172a',
      paddingVertical: 8,
  },
  addSubtaskLink: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      gap: 6,
  },
  addSubtaskLinkText: {
      fontSize: 14,
      color: '#64748b',
      fontWeight: '500',
      textDecorationLine: 'underline',
  },
  addDetailsLink: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      gap: 6,
  },
  addDetailsLinkText: {
      fontSize: 14,
      color: '#6366f1', // Indigo
      fontWeight: '600',
      textDecorationLine: 'underline',
  },
  cancelSubtask: {
      padding: 4,
  },
  addSubtaskConfirm: {
      padding: 4,
  },
  // Date Picker
  datePickerContainer: {
      paddingHorizontal: 20,
      paddingBottom: 10,
  },
  webLabel: {
      fontSize: 14,
      color: '#64748b',
      marginBottom: 4,
  },
  // Assign
  assignInputContainer: {
      paddingHorizontal: 20,
      paddingBottom: 16,
      gap: 12,
  },
  assignOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
  },
  avatarPlaceholder: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
  },
  assignOptionText: {
      fontSize: 16,
      color: '#0f172a',
  },
  emailInputRow: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 4,
      alignItems: 'center',
  },
  emailInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: '#e2e8f0',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 15,
  },
  assignConfirmButton: {
      backgroundColor: '#f1f5f9',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      justifyContent: 'center',
  },
  createTagRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
  },
  createTagInput: {
      flex: 1,
      backgroundColor: '#f1f5f9',
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
      fontSize: 14,
      color: '#0f172a',
  },
  createTagButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#FEC00F',
      alignItems: 'center',
      justifyContent: 'center',
  },
  noteInput: {
      flex: 1,
      fontSize: 15,
      color: '#475569',
      paddingVertical: 8,
      minHeight: 100,
  },
  webInputContainer: {
      marginTop: 8,
  },
  assignConfirmText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#475569',
  },
});
