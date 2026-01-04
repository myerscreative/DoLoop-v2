import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeOut,
  Layout,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import LoopTypeToggle from './LoopTypeToggle';
import { CustomDaySelector } from './CustomDaySelector';
import { TimePicker } from './TimePicker';
import { DayOfWeekPicker } from './DayOfWeekPicker';
import { ResetRule, RESET_RULE_DESCRIPTIONS } from '../../types/loop';

interface CreateLoopModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    description: string;
    affiliate_link: string;
    type: ResetRule;
    custom_days?: number[];
    due_date?: string;
    reset_time?: string;
    reset_day_of_week?: number;
    color: string;
    priority?: string;
    time_estimate?: string;
  }) => void;
  initialData?: {
    name: string;
    description: string;
    affiliate_link: string;
    reset_rule: string;
    color?: string;
    priority?: string;
    due_date?: string;
    time_estimate?: string;
  } | null;
  loading: boolean;
  isEditing: boolean;
}

export default function CreateLoopModal({
  visible,
  onClose,
  onSave,
  initialData,
  loading,
  isEditing,
}: CreateLoopModalProps) {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#FEC00F');
  const [description, setDescription] = useState('');
  const [affiliateLink, setAffiliateLink] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [timeEstimate, setTimeEstimate] = useState('');
  const [type, setType] = useState<ResetRule>('daily');
  const [customDays, setCustomDays] = useState<number[]>([]);
  const [resetTime, setResetTime] = useState('04:00'); // Default 4am
  const [resetDayOfWeek, setResetDayOfWeek] = useState(1); // Default Monday
  const [showDetails, setShowDetails] = useState(true); // Default open for now, can be toggled
  const [isFocused, setIsFocused] = useState(false);

  // Optional Field Toggles
  const [hasPriority, setHasPriority] = useState(false);
  const [hasDueDate, setHasDueDate] = useState(false);
  const [hasTimeEstimate, setHasTimeEstimate] = useState(false);

  // Color Palette
  const LOOP_COLORS = [
    '#FEC00F', // Gold (Brand)
    '#DC2626', // Red
    '#16A34A', // Green
    '#2563EB', // Blue
    '#1E40AF', // Dark Blue
    '#7C3AED', // Violet
    '#DB2777', // Pink

    '#FDBA74', // Peach
    '#FDA4AF', // Salmon
    '#86EFAC', // Light Green
    '#7DD3FC', // Sky Blue
    '#93C5FD', // Light Blue
    '#A5B4FC', // Periwinkle
    '#F0ABFC', // Light Pink
  ];

  const getThemeColors = (tabId: string) => {
    // Use selected color for accent if available, otherwise Gold
    return { strong: selectedColor, tint: `${selectedColor}20` }; 
  };

  // Helper to determine if color is light or dark
  const isLightColor = (color: string) => {
     const hex = color.replace('#', '');
     const r = parseInt(hex.substr(0, 2), 16);
     const g = parseInt(hex.substr(2, 2), 16);
     const b = parseInt(hex.substr(4, 2), 16);
     const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
     return brightness > 155;
  };

  const themeColors = getThemeColors(type);

  // Format time for display (convert 24-hour to 12-hour with am/pm)
  const formatTimeDisplay = (time24: string) => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'pm' : 'am';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')}${period}`;
  };

  // Get dynamic reset description
  const getResetDescription = () => {
    const timeLabel = formatTimeDisplay(resetTime);
    const dayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayLabel = dayLabels[resetDayOfWeek];
    
    switch (type) {
      case 'daily':
        return `Resets every day at ${timeLabel}`;
      case 'weekdays':
        return `Monday - Friday at ${timeLabel}`;
      case 'weekly':
        return `Resets every ${dayLabel} at ${timeLabel}`;
      case 'custom':
        return 'Resets on selected days';
      case 'manual':
        return 'One-time checklist (no reset)';
      default:
        return '';
    }
  };

  useEffect(() => {
    if (visible && initialData) {
      setName(initialData.name || '');
      setSelectedColor(initialData.color || '#FEC00F');
      setDescription(initialData.description || '');
      setAffiliateLink(initialData.affiliate_link || '');
      setType((initialData.reset_rule as any) || 'manual');
      
      // Initialize optional flags
      if (initialData.priority) {
        setPriority(initialData.priority);
        setHasPriority(true);
      }
      if (initialData.due_date) {
        setDueDate(initialData.due_date);
        setHasDueDate(true);
      }
      if (initialData.time_estimate) {
        setTimeEstimate(initialData.time_estimate);
        setHasTimeEstimate(true);
      }

    } else if (visible) {
      setName('');
      setSelectedColor('#FEC00F');
      setDescription('');
      setAffiliateLink('');
      setPriority('Medium');
      setDueDate(new Date().toISOString());
      setTimeEstimate('');
      setType('manual');
      setShowDetails(false);
      
      // Reset optional flags
      setHasPriority(false);
      setHasDueDate(false);
      setHasTimeEstimate(false);
    }
  }, [visible, initialData]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      description: description.trim(),
      affiliate_link: affiliateLink.trim(),
      type,
      custom_days: type === 'custom' ? customDays : undefined,
      due_date: hasDueDate ? (dueDate || new Date().toISOString()) : undefined,
      reset_time: resetTime,
      reset_day_of_week: type === 'weekly' ? resetDayOfWeek : undefined,
      color: selectedColor,
      priority: hasPriority ? priority : undefined,
      time_estimate: hasTimeEstimate ? timeEstimate : undefined,
    });
  };

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
                style={{ width: '100%', flex: 1 }}
              >
                <View style={styles.header}>
                  <Text style={styles.headerTitle}>
                    {isEditing ? 'Edit Loop' : 'New DoLoop'}
                  </Text>
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color="#94a3b8" />
                  </TouchableOpacity>
                </View>

                {/* Main Content */}
                <ScrollView 
                  showsVerticalScrollIndicator={false} 
                  contentContainerStyle={styles.scrollContent}
                  style={{ flex: 1 }}
                >
                  {/* Icon & Color Picker Section */}
                  <View style={{ alignItems: 'center', marginBottom: 32 }}>
                    
                    {/* Dynamic Loop Icon */}
                    <View style={{ marginBottom: 24 }}>
                        <Svg width="120" height="120" viewBox="0 0 444.25 444.25">
                            <Path
                                fill={selectedColor}
                                d="M239.72,111.74l30.57-25.47c-12.11-9.89-24.22-19.79-36.33-29.68,11.16,1,78.57,8.2,124.27,67.79,4.09,5.34,43.27,54.72,35,126.27-2.14,18.49-6.5,33.53-10.41,43.86l17.72,11.08-72.81,27.39c-4.65-25.62-8.64-51.32-12.63-76.79,7.09,3.77,12.18,6.65,19.72,10.63,8.64-34.78,3.99-81.08-20.16-109.21-31.65-36.88-62.25-42.53-74.95-45.85Z"
                            />
                            <Path
                                fill={selectedColor}
                                d="M311.88,310.36c2.15,13.09,4.29,26.18,6.44,39.27,14.67-5.41,29.34-10.83,44.01-16.24-6.53,9.11-46.94,63.55-121.47,72.69-6.68.82-69.1,9.52-126.56-33.91-14.85-11.22-25.6-22.62-32.51-31.23-6.18,3.22-12.36,6.43-18.54,9.65,4.45-25.55,8.89-51.09,13.34-76.64,24.44,8.99,48.61,18.6,72.58,28.09-6.84,4.2-11.91,7.13-19.17,11.59,25.59,25.09,67.84,44.57,104.34,38.04,47.84-8.56,68.23-32.06,77.54-41.32Z"
                            />
                            <Path
                                fill={selectedColor}
                                d="M104.99,274.14c-12.41-4.7-24.81-9.39-37.22-14.09-2.66,15.41-5.32,30.82-7.98,46.23-4.62-10.22-31.5-72.45-2.1-141.54,2.63-6.19,26.36-64.59,92.73-92.57,17.15-7.23,32.39-10.83,43.31-12.51.31-6.96.62-13.92.93-20.88,19.89,16.64,39.77,33.28,59.66,49.92-20.02,16.65-40.44,32.76-60.66,48.76-.21-8.02-.21-13.88-.44-22.4-34.53,9.58-72.56,36.4-85.18,71.26-16.55,45.7-6.42,75.12-3.07,87.81Z"
                            />
                        </Svg>
                    </View>

                    {/* Color Grid */}
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', maxWidth: 320 }}>
                      {LOOP_COLORS.map((color) => (
                        <TouchableOpacity
                          key={color}
                          onPress={() => setSelectedColor(color)}
                          activeOpacity={0.8}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            backgroundColor: color,
                            borderWidth: 2,
                            borderColor: selectedColor === color ? '#1e293b' : 'transparent',
                            transform: [{ scale: selectedColor === color ? 1.2 : 1 }],
                          }}
                        />
                      ))}
                    </View>

                  </View>

                  {/* Loop Name Input */}
                  <View style={[styles.inputSection, { alignItems: 'center' }]}>
                    <Text style={[styles.label, { textAlign: 'center', marginBottom: 12, fontSize: 13, fontWeight: '500', textTransform: 'none', color: '#64748b' }]}>
                        Give your loop a name
                    </Text>
                    <View style={{ width: '100%', alignItems: 'center', paddingHorizontal: 16 }}>
                      <TextInput
                        style={[styles.primaryInput, { 
                            textAlign: 'center', 
                            fontSize: 24, 
                            fontWeight: '700',
                            backgroundColor: '#f1f5f9',
                            width: '100%',
                            borderRadius: 16,
                            paddingHorizontal: 24,
                            paddingVertical: 16
                        }]}
                        placeholder="Camping"
                        placeholderTextColor="#cbd5e1"
                        value={name}
                        onChangeText={setName}
                        autoFocus={false}
                      />
                    </View>
                  </View>

                  {/* Loop Type Toggle at Top */}
                  <View style={styles.section}>
                    <Text style={styles.label}>Loop Recurrence</Text>
                    <LoopTypeToggle
                      activeTab={type}
                      onChange={(newType) => setType(newType)}
                    />
                    <Text style={{ marginTop: 8, fontSize: 12, color: '#94a3b8' }}>
                      {getResetDescription()}
                    </Text>
                    
                    {/* Time and Day Pickers */}
                    {(type === 'daily' || type === 'weekdays' || type === 'weekly') && (
                      <Animated.View
                        entering={FadeIn}
                        layout={Layout.springify()}
                        style={styles.timePickerSection}
                      >
                        <View style={styles.timePickerRow}>
                          {type === 'weekly' ? (
                            <>
                              <Text style={styles.timeLabel}>Resets every</Text>
                              <DayOfWeekPicker
                                value={resetDayOfWeek}
                                onChange={setResetDayOfWeek}
                                accentColor={themeColors.strong}
                              />
                              <Text style={styles.timeLabel}>at</Text>
                              <TimePicker
                                value={resetTime}
                                onChange={setResetTime}
                                accentColor={themeColors.strong}
                              />
                            </>
                          ) : (
                            <>
                              <Text style={styles.timeLabel}>
                                {type === 'daily' ? 'Resets every day at' : 'Resets weekdays at'}
                              </Text>
                              <TimePicker
                                value={resetTime}
                                onChange={setResetTime}
                                accentColor={themeColors.strong}
                              />
                            </>
                          )}
                        </View>
                      </Animated.View>
                    )}
                    
                    {/* Custom Day Selector */}
                    {type === 'custom' && (
                      <Animated.View 
                        entering={FadeIn}
                        layout={Layout.springify()}
                      >
                        <CustomDaySelector
                          selectedDays={customDays}
                          onChange={setCustomDays}
                          accentColor={themeColors.strong}
                          accentBg={themeColors.tint}
                        />
                      </Animated.View>
                    )}
                  </View>

                  {/* Removed Task Input Section (Moved to Loop Name) */}

                  {/* Progressive Disclosure Toggle */}
                  <TouchableOpacity
                    onPress={() => setShowDetails(!showDetails)}
                    style={styles.detailsToggle}
                    activeOpacity={0.6}
                  >
                    <View style={[
                      styles.detailsToggleContent, 
                      { 
                        backgroundColor: 'transparent',
                        borderColor: themeColors.strong,
                        borderWidth: 1
                      }
                    ]}>
                      <Text style={[styles.detailsToggleText, { color: themeColors.strong }]}>Add Details</Text>
                      <Ionicons
                        name={showDetails ? 'remove-circle-outline' : 'add-circle-outline'}
                        size={18}
                        color={themeColors.strong}
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
                      <View style={styles.inputGroup}>
                        <Text style={styles.subLabel}>Notes</Text>
                        <TextInput
                          style={styles.textArea}
                          placeholder="Add more context or steps..."
                          placeholderTextColor="#94a3b8"
                          value={description}
                          onChangeText={setDescription}
                          multiline
                          numberOfLines={3}
                          textAlignVertical="top"
                        />
                      </View>

                      {/* Optional Settings Toggles */}
                      <View style={{ gap: 12, marginTop: 12 }}>
                        
                        {/* Priority Toggle */}
                        <View>
                           <TouchableOpacity 
                             style={styles.optionToggle}
                             onPress={() => setHasPriority(!hasPriority)}
                           >
                              <Ionicons 
                                name={hasPriority ? "checkbox" : "square-outline"} 
                                size={20} 
                                color={hasPriority ? themeColors.strong : "#94a3b8"} 
                              />
                              <Text style={styles.optionToggleText}>Set Priority</Text>
                           </TouchableOpacity>
                           
                           {hasPriority && (
                             <Animated.View entering={FadeIn} style={{ marginTop: 8, marginLeft: 28 }}>
                                <TouchableOpacity style={styles.pickerButton}>
                                  <Text style={styles.pickerButtonText}>{priority}</Text>
                                  <Ionicons name="chevron-down" size={14} color="#64748b" />
                                </TouchableOpacity>
                             </Animated.View>
                           )}
                        </View>

                        {/* Due Date Toggle */}
                        <View>
                           <TouchableOpacity 
                             style={styles.optionToggle}
                             onPress={() => setHasDueDate(!hasDueDate)}
                           >
                              <Ionicons 
                                name={hasDueDate ? "checkbox" : "square-outline"} 
                                size={20} 
                                color={hasDueDate ? themeColors.strong : "#94a3b8"} 
                              />
                              <Text style={styles.optionToggleText}>Set Due Date</Text>
                           </TouchableOpacity>
                           
                           {hasDueDate && (
                             <Animated.View entering={FadeIn} style={{ marginTop: 8, marginLeft: 28 }}>
                                <TouchableOpacity style={styles.pickerButton}>
                                  <Text style={styles.pickerButtonText}>
                                    {dueDate ? new Date(dueDate).toLocaleDateString() : 'Today'}
                                  </Text>
                                  <Ionicons name="calendar-outline" size={14} color="#64748b" />
                                </TouchableOpacity>
                             </Animated.View>
                           )}
                        </View>

                        {/* Time Estimate Toggle */}
                         <View>
                           <TouchableOpacity 
                             style={styles.optionToggle}
                             onPress={() => setHasTimeEstimate(!hasTimeEstimate)}
                           >
                              <Ionicons 
                                name={hasTimeEstimate ? "checkbox" : "square-outline"} 
                                size={20} 
                                color={hasTimeEstimate ? themeColors.strong : "#94a3b8"} 
                              />
                              <Text style={styles.optionToggleText}>Set Time Estimate</Text>
                           </TouchableOpacity>
                           
                           {hasTimeEstimate && (
                             <Animated.View entering={FadeIn} style={{ marginTop: 8, marginLeft: 28 }}>
                                <TextInput
                                  style={styles.secondaryInput}
                                  placeholder="e.g. 15 mins"
                                  placeholderTextColor="#94a3b8"
                                  value={timeEstimate}
                                  onChangeText={setTimeEstimate}
                                />
                             </Animated.View>
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
                    onPress={handleSave}
                    disabled={loading || !name.trim()}
                    style={styles.saveButtonWrapper}
                  >
                    <View
                      style={[
                        styles.saveButton, 
                        (!name.trim() || loading) && styles.saveButtonDisabled,
                        { 
                          backgroundColor: selectedColor || '#EFB810',
                          shadowColor: selectedColor || themeColors.strong
                        }
                      ]}
                    >
                      {loading ? (
                        <ActivityIndicator size="small" color={isLightColor(selectedColor) ? "#000" : "#fff"} />
                      ) : (
                        <Text style={[styles.saveButtonText, { color: isLightColor(selectedColor) ? "#000" : "#fff" }]}>Save Loop</Text>
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
    maxHeight: '90%', // Limit height to ensure it fits on screen
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
    flex: 1, // Ensure content takes available space
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
  timePickerSection: {
    marginTop: 16,
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  timeLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  subLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  optionToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  optionToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
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
  pickerButtonText: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '500',
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
});
