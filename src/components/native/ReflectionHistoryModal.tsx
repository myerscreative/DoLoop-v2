import React, { useEffect, useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { TaskReflection } from '../../types/loop';
import { getReflectionHistory } from '../../lib/reflectionHelpers';

interface ReflectionHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  taskId: string;
  taskTitle: string;
}

export const ReflectionHistoryModal: React.FC<ReflectionHistoryModalProps> = ({
  visible,
  onClose,
  taskId,
  taskTitle,
}) => {
  const { colors } = useTheme();
  const [history, setHistory] = useState<TaskReflection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadHistory();
    }
  }, [visible, taskId]);

  const loadHistory = async () => {
    setLoading(true);
    const data = await getReflectionHistory(taskId);
    setHistory(data);
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString); // Note: Date string is YYYY-MM-DD
    // Adjust for timezone if needed, but usually we just want the date part
    // Using UTC to avoid shifting dates
    return new Date(date.valueOf() + date.getTimezoneOffset() * 60000).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
                <Text style={[styles.title, { color: colors.text }]}>Reflection History</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                    {taskTitle}
                </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {loading ? (
              <ActivityIndicator size="large" color="#FEC00F" style={{ marginTop: 40 }} />
            ) : history.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="journal-outline" size={48} color={colors.border} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No reflections yet.
                </Text>
              </View>
            ) : (
              <View style={styles.timeline}>
                {history.map((item, index) => (
                  <View key={item.id} style={styles.timelineItem}>
                    {/* Timeline Line */}
                    {index !== history.length - 1 && (
                        <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
                    )}
                    
                    {/* Date Bubble */}
                    <View style={styles.dateRow}>
                        <View style={[styles.dot, { backgroundColor: '#FEC00F' }]} />
                        <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                            {formatDate(item.reflection_date)}
                        </Text>
                    </View>

                    {/* Content Card */}
                    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.reflectionText, { color: colors.text }]}>
                            {item.reflection_text}
                        </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.8,
    maxWidth: 250,
  },
  closeButton: {
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    marginBottom: 24,
    position: 'relative',
    paddingLeft: 24,
  },
  timelineLine: {
    position: 'absolute',
    left: 3.5,
    top: 6,
    bottom: -30,
    width: 2,
    zIndex: -1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginLeft: -28, // Pull back to align dot
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    marginRight: 19,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  reflectionText: {
    fontSize: 15,
    lineHeight: 22,
  },
});
