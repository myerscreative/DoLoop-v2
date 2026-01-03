import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LoopTemplateWithDetails, TemplateTask } from '../../types/loop';
import { useTheme } from '../../contexts/ThemeContext';
import { AnimatedCircularProgress } from '../native/AnimatedCircularProgress';

interface TemplateDetailPanelProps {
  template: LoopTemplateWithDetails | null;
  onAdd: () => void;
  onLearnMore: () => void;
  isAdding?: boolean;
}

export const TemplateDetailPanel: React.FC<TemplateDetailPanelProps> = ({
  template,
  onAdd,
  onLearnMore,
  isAdding,
}) => {
  const { colors } = useTheme();
  const [expandedHints, setExpandedHints] = useState<Set<string>>(new Set());

  const toggleHint = (taskId: string) => {
    setExpandedHints(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  if (!template) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconWrapper}>
          <Ionicons name="arrow-back" size={40} color="#999" />
        </View>
        <Text style={styles.emptyTitle}>Select a Loop</Text>
        <Text style={styles.emptySubtitle}>
          Choose a loop from the list to view details, manage tasks, and track progress.
        </Text>
        
        <TouchableOpacity 
          style={styles.emptyButton} 
          onPress={() => {
            // This might need to navigate back home or open a modal
            // For now, let's just make it look consistent
          }}
        >
          <Ionicons name="add" size={24} color="#000" />
          <Text style={styles.emptyButtonText}>Create New Loop</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.mainEmoji}>{getCategoryIcon(template.category)}</Text>
          <View style={styles.headerActions}>
             {template.affiliate_link && (
               <TouchableOpacity style={styles.learnMoreButton} onPress={onLearnMore}>
                 <Text style={styles.learnMoreText}>Learn More</Text>
               </TouchableOpacity>
             )}
             <TouchableOpacity 
               style={styles.addButton} 
               onPress={onAdd}
               disabled={isAdding}
             >
               {isAdding ? (
                 <ActivityIndicator size="small" color="#000" />
               ) : (
                 <Text style={styles.addButtonText}>Add to My Loops</Text>
               )}
             </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.title}>{template.title}</Text>
        <Text style={styles.subtitle}>From: {template.book_course_title}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Progress & Quick Stats */}
        <View style={styles.statsSection}>
          <View style={styles.progressWrapper}>
             <AnimatedCircularProgress
              size={100}
              width={8}
              fill={0} // Initial state for template
              tintColor="#FEC00F"
              backgroundColor="#f0f0f0"
             >
               <Text style={styles.progressPercent}>0%</Text>
             </AnimatedCircularProgress>
          </View>
          <View style={styles.statsRows}>
            <View style={styles.statItem}>
               <Text style={styles.statValue}>{template.taskCount}</Text>
               <Text style={styles.statLabel}>TASKS</Text>
            </View>
            <View style={styles.statItem}>
               <Text style={[styles.statValue, { color: '#FEC00F' }]}>{template.popularity_score}</Text>
               <Text style={styles.statLabel}>USES</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.description}>{template.description}</Text>
        </View>

        {/* Task List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Task List</Text>
          <View style={styles.taskList}>
            {template.tasks.map((task, index) => (
              <View key={task.id} style={styles.taskItem}>
                <View style={styles.taskRow}>
                  <View style={styles.taskNumWrapper}>
                    <Text style={styles.taskNum}>{index + 1}</Text>
                  </View>
                  <View style={styles.taskContent}>
                    <Text style={styles.taskTitle}>{task.description}</Text>
                    <View style={styles.taskMeta}>
                       {task.is_recurring ? (
                         <View style={styles.metaBadge}>
                           <Ionicons name="repeat" size={12} color="#999" />
                           <Text style={styles.metaText}>Recurring</Text>
                         </View>
                       ) : (
                         <View style={styles.metaBadge}>
                           <Ionicons name="checkmark-circle-outline" size={12} color="#999" />
                           <Text style={styles.metaText}>One-time</Text>
                         </View>
                       )}
                    </View>
                  </View>
                  {task.hint && (
                    <TouchableOpacity onPress={() => toggleHint(task.id)} style={styles.hintButton}>
                      <Ionicons 
                        name={expandedHints.has(task.id) ? "information-circle" : "information-circle-outline"} 
                        size={20} 
                        color={expandedHints.has(task.id) ? "#FEC00F" : "#ccc"} 
                      />
                    </TouchableOpacity>
                  )}
                </View>
                {task.hint && expandedHints.has(task.id) && (
                  <View style={styles.hintBox}>
                    <Text style={styles.hintText}>{task.hint}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const getCategoryIcon = (category: string) => {
  const icons: Record<string, string> = {
    checklist: '✓',
    daily: '☀️',
    weekly: '🎯',
    personal: '🏡',
    work: '💼',
    shared: '👥',
  };
  return icons[category] || '📋';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fafafa',
  },
  emptyIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
    marginBottom: 32,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    backgroundColor: '#FFD700',
    borderRadius: 16,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  emptyButtonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
  },
  header: {
    padding: 32,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  mainEmoji: {
    fontSize: 40,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  addButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  learnMoreButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  learnMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
  },
  scrollContent: {
    padding: 32,
  },
  statsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 40,
    marginBottom: 32,
  },
  progressWrapper: {
    alignItems: 'center',
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  statsRows: {
    flex: 1,
    flexDirection: 'row',
    gap: 32,
  },
  statItem: {
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#999',
    letterSpacing: 0.5,
  },
  descriptionSection: {
    marginBottom: 32,
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  taskList: {
    gap: 12,
  },
  taskItem: {
    padding: 16,
    backgroundColor: '#fafafa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  taskNumWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskNum: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
  },
  taskContent: {
    flex: 1,
    gap: 4,
  },
  taskTitle: {
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  taskMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#999',
  },
  hintButton: {
    padding: 4,
  },
  hintBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FFFBF0',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FEC00F',
  },
  hintText: {
    fontSize: 13,
    color: '#856404',
    lineHeight: 18,
  },
});
