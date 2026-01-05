import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LoopTemplateWithDetails } from '../types/loop';
import { supabase } from '../lib/supabase';
import { LoopProvenance } from './loops/LoopProvenance';

interface LoopDetailViewProps {
  template: LoopTemplateWithDetails | null;
  onAdd: () => void;
}

export const LoopDetailView: React.FC<LoopDetailViewProps> = ({ template, onAdd }) => {
  const [expandedHints, setExpandedHints] = useState<Set<string>>(new Set());
  const [localTasks, setLocalTasks] = useState<any[]>(template?.tasks || []);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setLocalTasks(template?.tasks || []);
    setExpandedHints(new Set());

    if (template) {
      const needsHints = template.tasks.some(t => !t.hint || t.hint.trim() === '');
      if (needsHints) {
        console.log(`[LoopDetailView] Template "${template.title}" needs hints, triggering...`);
        setIsGenerating(true);
        triggerHintGeneration(template.id);
      } else {
        setIsGenerating(false);
      }
    }
  }, [template?.id]);

  const triggerHintGeneration = async (id: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate_template_hints', {
        body: { template_id: id },
      });

      if (error) throw error;

      if (data.success && data.tasks) {
        console.log(`[LoopDetailView] Hints generated for ${id}`);
        const sortedTasks = (data.tasks || []).sort(
          (a: any, b: any) => a.display_order - b.display_order
        );
        setLocalTasks(sortedTasks);
      }
    } catch (err) {
      console.warn('[LoopDetailView] Hint generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!template) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Select a Loop</Text>
        <Text style={styles.emptySubtitle}>Choose a loop from the list to view details and tasks.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.emoji}>{template.category === 'daily' ? '☀️' : '🔄'}</Text>
          <View style={styles.headerText}>
            <Text style={styles.title}>{template.title}</Text>
            <Text style={styles.description}>{template.description}</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={onAdd}>
            <Text style={styles.addButtonText}>Add Loop</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* BODY - TASKS */}
      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tasks</Text>
          {isGenerating && (
            <View style={styles.generatingBadge}>
              <ActivityIndicator size="small" color="#FEC00F" />
              <Text style={styles.generatingText}>Generating AI hints...</Text>
            </View>
          )}
        </View>
        {localTasks.map((task, index) => (
          <View key={task.id || index.toString()} style={styles.taskContainer}>
            <View style={styles.taskItem}>
              <View style={styles.checkbox} />
              <Text style={styles.taskText}>{task.description}</Text>
              {task.hint && (
                <TouchableOpacity
                  onPress={() => {
                    const newHints = new Set(expandedHints);
                    if (newHints.has(task.id)) newHints.delete(task.id);
                    else newHints.add(task.id);
                    setExpandedHints(newHints);
                  }}
                  style={styles.infoButton}
                >
                  <Text style={[styles.infoIcon, { color: expandedHints.has(task.id) ? '#FEC00F' : '#9CA3AF' }]}>
                    ⓘ
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            {task.hint && expandedHints.has(task.id) && (
              <View style={styles.hintContainer}>
                <Text style={styles.hintText}>💡 { task.hint }</Text>
              </View>
            )}
          </View>
        ))}

        {/* PROVENANCE SECTION - Author & Source */}
        <LoopProvenance
          authorName={template.creator?.name}
          authorBio={template.creator?.bio}
          authorImageUrl={template.creator?.photo_url}
          sourceTitle={template.book_course_title}
          sourceLink={template.affiliate_link}
          endGoalDescription={template.description}
        />
      </ScrollView>
    </View>
  );
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
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    padding: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  emoji: {
    fontSize: 48,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  description: {
    fontSize: 16,
    color: '#666',
  },
  addButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  generatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBE6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    gap: 8,
  },
  generatingText: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '600',
  },
  taskContainer: {
    marginBottom: 8,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  infoButton: {
    padding: 4,
    marginLeft: 'auto',
  },
  infoIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  hintContainer: {
    marginTop: 4,
    marginLeft: 36,
    padding: 12,
    backgroundColor: '#FFFBE6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  hintText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  taskText: {
    fontSize: 16,
    color: '#1a1a1a',
    flex: 1,
  },
});
