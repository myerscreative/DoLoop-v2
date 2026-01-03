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
import LoopTypeToggle from './LoopTypeToggle';
import { CustomDaySelector } from './CustomDaySelector';
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
  }) => void;
  initialData?: {
    name: string;
    description: string;
    affiliate_link: string;
    reset_rule: string;
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
  const [description, setDescription] = useState('');
  const [affiliateLink, setAffiliateLink] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [timeEstimate, setTimeEstimate] = useState('');
  const [type, setType] = useState<ResetRule>('daily');
  const [customDays, setCustomDays] = useState<number[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const getThemeColors = (tabId: string) => {
    // UNIFIED GOLD BRAND - all types use same gold color
    return { strong: '#FEC00F', tint: '#FFF9E6' }; // Gold / Light gold tint
  };

  const themeColors = getThemeColors(type);

  useEffect(() => {
    if (visible && initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setAffiliateLink(initialData.affiliate_link || '');
      setType((initialData.reset_rule as any) || 'manual');
    } else if (visible) {
      setName('');
      setDescription('');
      setAffiliateLink('');
      setPriority('Medium');
      setDueDate(new Date().toISOString());
      setTimeEstimate('');
      setType('manual');
      setShowDetails(false);
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
      due_date: type === 'manual' ? (dueDate || new Date().toISOString()) : undefined,
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
                style={{ width: '100%' }}
              >
                {/* Header */}
                <View style={styles.header}>
                  <Text style={styles.headerTitle}>
                    {isEditing ? 'Edit Loop' : 'Create a Loop'}
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
                  {/* Loop Type Toggle at Top */}
                  <View style={styles.section}>
                    <Text style={styles.label}>Loop Recurrence</Text>
                    <LoopTypeToggle
                      activeTab={type}
                      onChange={(newType) => setType(newType)}
                    />
                    <Text style={[styles.hintText, { marginTop: 8, fontSize: 12, color: '#94a3b8' }]}>
                      {RESET_RULE_DESCRIPTIONS[type]}
                    </Text>
                    
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

                  {/* Primary Input - Task */}
                  <View style={styles.inputSection}>
                    <Text style={styles.label}>Task</Text>
                    <View style={styles.mainInputContainer}>
                      <TextInput
                        style={styles.primaryInput}
                        placeholder="What needs to be done?"
                        placeholderTextColor="#94a3b8"
                        value={name}
                        onChangeText={setName}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        autoFocus={!isEditing}
                      />
                      <View
                        style={[
                          styles.animatedBorder, 
                          { backgroundColor: isFocused ? themeColors.strong : '#e2e8f0' }
                        ]}
                      />
                    </View>
                  </View>

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
                      <View style={styles.inputRow}>
                         <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.subLabel}>Priority</Text>
                            <TouchableOpacity style={styles.pickerButton}>
                              <Text style={styles.pickerButtonText}>{priority}</Text>
                              <Ionicons name="chevron-down" size={14} color="#64748b" />
                            </TouchableOpacity>
                         </View>
                         <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.subLabel}>Due Date</Text>
                            <TouchableOpacity style={styles.pickerButton}>
                              <Text style={styles.pickerButtonText}>
                                {dueDate ? new Date(dueDate).toLocaleDateString() : 'Today'}
                              </Text>
                              <Ionicons name="calendar-outline" size={14} color="#64748b" />
                            </TouchableOpacity>
                         </View>
                      </View>

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

                      <View style={styles.inputGroup}>
                        <Text style={styles.subLabel}>Affiliate Link</Text>
                        <TextInput
                          style={styles.secondaryInput}
                          placeholder="Order book or training link..."
                          placeholderTextColor="#94a3b8"
                          value={affiliateLink}
                          onChangeText={setAffiliateLink}
                        />
                      </View>
                      
                      <View style={styles.inputGroup}>
                        <Text style={styles.subLabel}>Time Estimate</Text>
                        <TextInput
                          style={styles.secondaryInput}
                          placeholder="e.g. 15 mins"
                          placeholderTextColor="#94a3b8"
                          value={timeEstimate}
                          onChangeText={setTimeEstimate}
                        />
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
                          backgroundColor: '#EFB810',
                          shadowColor: themeColors.strong
                        }
                      ]}
                    >
                      {loading ? (
                        <ActivityIndicator size="small" color="#000" />
                      ) : (
                        <Text style={styles.saveButtonText}>Save Loop</Text>
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
