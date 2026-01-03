import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { LoopRecommendation, COURSE_CONFIG, LoopCourse } from '../types/loop';

type LoopSommelierScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'LoopSommelier'
>;

interface Props {
  navigation: LoopSommelierScreenNavigationProp;
}

type RecommendationMode = 'quick' | 'thorough';

const SAMPLE_PROMPTS = [
  "I want to start my mornings better and get focused on work",
  "Help me plan for my trip overseas",
  "I want to build a reading habit",
  "Prepare me for a job interview",
  "Help me lose weight and get healthier",
];

export function LoopSommelierScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { session } = useAuth();
  
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<RecommendationMode>('thorough');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<LoopRecommendation[]>([]);
  const [goal, setGoal] = useState('');
  const [summary, setSummary] = useState('');
  const [adminNotes, setAdminNotes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [addingLoops, setAddingLoops] = useState<Set<string>>(new Set());
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  const fetchRecommendations = async () => {
    if (!prompt.trim()) {
      Alert.alert('Please describe what you want to achieve');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setRecommendations([]);
    fadeAnim.setValue(0);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('recommend_loops', {
        body: { prompt: prompt.trim(), mode },
      });
      
      if (fnError) throw fnError;
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to get recommendations');
      }
      
      setGoal(data.goal);
      setSummary(data.summary);
      setRecommendations(data.recommendations);
      setAdminNotes(data.adminNotes || []);
      
      // Animate results in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
      
      // Save session for analytics
      if (session?.user?.id) {
        await supabase.from('loop_recommendation_sessions').insert({
          user_id: session.user.id,
          prompt: prompt.trim(),
          parsed_goal: data.goal,
          recommendations: data.recommendations,
        });
      }
      
    } catch (err: any) {
      console.error('Recommendation error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const addLoop = async (recommendation: LoopRecommendation, index: number) => {
    const key = `${recommendation.course}-${index}`;
    if (addingLoops.has(key)) return;
    
    setAddingLoops(prev => new Set(prev).add(key));
    
    try {
      // Build description with expert info
      let description = recommendation.loop.description;
      if (recommendation.loop.expertName) {
        description += `\n\n📚 Based on ${recommendation.loop.expertName}'s "${recommendation.loop.bookOrCourse || 'methodology'}"`;
      }
      
      // Create the loop
      const { data: newLoop, error: loopError } = await supabase
        .from('loops')
        .insert({
          owner_id: session?.user?.id,
          name: recommendation.loop.name,
          description: description,
          color: recommendation.loop.color,
          reset_rule: recommendation.loop.resetRule,
          category: recommendation.loop.resetRule === 'daily' ? 'daily' : 
                   recommendation.loop.resetRule === 'weekly' ? 'weekly' : 'manual',
          affiliate_link: recommendation.loop.affiliateLink || null,
        })
        .select()
        .single();
      
      if (loopError) throw loopError;
      
      // Create tasks
      if (recommendation.loop.tasks && recommendation.loop.tasks.length > 0) {
        const tasks = recommendation.loop.tasks.map((task, idx) => ({
          loop_id: newLoop.id,
          description: task.description,
          notes: task.notes || null,
          completed: false,
          is_one_time: recommendation.loop.resetRule === 'manual',
          order_index: idx,
          priority: 'none',
        }));
        
        await supabase.from('tasks').insert(tasks);
      }
      
      Alert.alert(
        '✓ Loop Added!',
        `"${recommendation.loop.name}" has been added to your loops.`,
        [
          { text: 'View Loop', onPress: () => navigation.navigate('LoopDetail', { loopId: newLoop.id }) },
          { text: 'Continue', style: 'cancel' },
        ]
      );
      
    } catch (err: any) {
      console.error('Error adding loop:', err);
      Alert.alert('Error', 'Failed to add loop. Please try again.');
    } finally {
      setAddingLoops(prev => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };
  
  const addAllLoops = async () => {
    Alert.alert(
      'Add All Loops',
      `Add all ${recommendations.length} recommended loops to your collection?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add All',
          onPress: async () => {
            for (let i = 0; i < recommendations.length; i++) {
              await addLoop(recommendations[i], i);
            }
          },
        },
      ]
    );
  };
  
  const renderRecommendationCard = (rec: LoopRecommendation, index: number) => {
    const key = `${rec.course}-${index}`;
    const isAdding = addingLoops.has(key);
    const config = COURSE_CONFIG[rec.course];
    
    return (
      <View 
        key={key} 
        style={[
          styles.recommendationCard, 
          { backgroundColor: colors.surface, borderColor: colors.border }
        ]}
      >
        {/* Course Badge */}
        <View style={[styles.courseBadge, { backgroundColor: `${rec.loop.color}20` }]}>
          <Text style={styles.courseBadgeText}>{config.emoji} {config.name}</Text>
        </View>
        
        <View style={styles.cardHeader}>
          <View style={[styles.colorDot, { backgroundColor: rec.loop.color }]} />
          <View style={styles.cardTitleContainer}>
            <Text style={[styles.loopName, { color: colors.text }]}>
              {rec.loop.name}
            </Text>
            <Text style={[styles.resetRule, { color: colors.textSecondary }]}>
              {rec.loop.resetRule === 'daily' ? '☀️ Daily' : 
               rec.loop.resetRule === 'weekly' ? '📅 Weekly' : '✓ One-time'}
            </Text>
          </View>
          {rec.isTemplate && (
            <View style={styles.templateBadge}>
              <Text style={styles.templateBadgeText}>📚 Library</Text>
            </View>
          )}
        </View>
        
        {/* Expert Info */}
        {rec.loop.expertName && (
          <View style={styles.expertSection}>
            <Text style={[styles.expertName, { color: colors.text }]}>
              👤 {rec.loop.expertName}
            </Text>
            {rec.loop.expertTitle && (
              <Text style={[styles.expertTitle, { color: colors.textSecondary }]}>
                {rec.loop.expertTitle}
              </Text>
            )}
            {rec.loop.bookOrCourse && (
              <Text style={[styles.bookTitle, { color: colors.primary }]}>
                📖 "{rec.loop.bookOrCourse}"
              </Text>
            )}
          </View>
        )}
        
        <Text style={[styles.explanation, { color: colors.text }]}>
          {rec.explanation}
        </Text>
        
        <View style={styles.taskPreview}>
          <Text style={[styles.taskCount, { color: colors.textSecondary }]}>
            {rec.loop.tasks.length} tasks
          </Text>
          {rec.loop.tasks.slice(0, 3).map((task, i) => (
            <Text key={i} style={[styles.taskItem, { color: colors.textSecondary }]}>
              • {task.description}
            </Text>
          ))}
          {rec.loop.tasks.length > 3 && (
            <Text style={[styles.moreTasksText, { color: colors.textSecondary }]}>
              +{rec.loop.tasks.length - 3} more...
            </Text>
          )}
        </View>
        
        {/* Affiliate Note (if needs setup) */}
        {rec.loop.needsAffiliateSetup && !rec.loop.affiliateLink && (
          <View style={styles.affiliateNote}>
            <Text style={styles.affiliateNoteText}>
              💡 Affiliate link pending setup
            </Text>
          </View>
        )}
        
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: rec.loop.color }]}
          onPress={() => addLoop(rec, index)}
          disabled={isAdding}
        >
          {isAdding ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.addButtonText}>+ Add to My Loops</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Text style={[styles.backButtonText, { color: colors.text }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>AI Loop Recommender</Text>
        <View style={styles.headerRight} />
      </View>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Input Section */}
          <View style={styles.inputSection}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              ✨ What would you like to achieve?
            </Text>
            <TextInput
              style={[
                styles.promptInput, 
                { 
                  backgroundColor: colors.surface, 
                  color: colors.text,
                  borderColor: colors.border,
                }
              ]}
              placeholder="Describe your goal..."
              placeholderTextColor={colors.textSecondary}
              value={prompt}
              onChangeText={setPrompt}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            
            {/* Mode Toggle */}
            <View style={styles.modeToggle}>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  mode === 'quick' && styles.modeButtonActive,
                  { borderColor: mode === 'quick' ? '#EFB810' : colors.border }
                ]}
                onPress={() => setMode('quick')}
              >
                <Text style={[styles.modeEmoji]}>⚡</Text>
                <View>
                  <Text style={[styles.modeLabel, { color: mode === 'quick' ? '#EFB810' : colors.text }]}>
                    Quick
                  </Text>
                  <Text style={[styles.modeDescription, { color: colors.textSecondary }]}>
                    2 essential loops
                  </Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  mode === 'thorough' && styles.modeButtonActive,
                  { borderColor: mode === 'thorough' ? '#EFB810' : colors.border }
                ]}
                onPress={() => setMode('thorough')}
              >
                <Text style={[styles.modeEmoji]}>🍽️</Text>
                <View>
                  <Text style={[styles.modeLabel, { color: mode === 'thorough' ? '#EFB810' : colors.text }]}>
                    Thorough
                  </Text>
                  <Text style={[styles.modeDescription, { color: colors.textSecondary }]}>
                    4-6 curated loops
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            
            {/* Sample prompts */}
            {!recommendations.length && (
              <View style={styles.samplePrompts}>
                <Text style={[styles.samplePromptsLabel, { color: colors.textSecondary }]}>
                  Try these:
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {SAMPLE_PROMPTS.map((sample, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[styles.samplePromptChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      onPress={() => setPrompt(sample)}
                    >
                      <Text style={[styles.samplePromptText, { color: colors.textSecondary }]} numberOfLines={1}>
                        {sample}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
            
            <TouchableOpacity
              style={[
                styles.generateButton, 
                { backgroundColor: '#EFB810' },
                isLoading && styles.generateButtonDisabled,
              ]}
              onPress={fetchRecommendations}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#1a1a1a" />
                  <Text style={styles.generateButtonText}>
                    {mode === 'quick' ? '  Finding 2 perfect loops...' : '  Curating your loops...'}
                  </Text>
                </View>
              ) : (
                <Text style={styles.generateButtonText}>
                  ✨ Get {mode === 'quick' ? 'Quick' : 'Thorough'} Recommendations
                </Text>
              )}
            </TouchableOpacity>
          </View>
          
          {/* Error State */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>❌ {error}</Text>
            </View>
          )}
          
          {/* Results Section */}
          {recommendations.length > 0 && (
            <Animated.View style={[styles.resultsSection, { opacity: fadeAnim }]}>
              <View style={styles.resultsHeader}>
                <Text style={[styles.goalText, { color: colors.text }]}>
                  🎯 {goal}
                </Text>
                <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
                  {summary}
                </Text>
                <Text style={[styles.modeIndicator, { color: colors.textSecondary }]}>
                  {mode === 'quick' ? '⚡ Quick Mode' : '🍽️ Thorough Mode'} • {recommendations.length} loops
                </Text>
              </View>
              
              {/* Recommendation Cards */}
              {recommendations.map((rec, index) => renderRecommendationCard(rec, index))}
              
              {/* Admin Notes (for owner) */}
              {adminNotes.length > 0 && (
                <View style={styles.adminNotesSection}>
                  <Text style={[styles.adminNotesTitle, { color: colors.textSecondary }]}>
                    📋 Notes for you (affiliate setup):
                  </Text>
                  {adminNotes.map((note, i) => (
                    <Text key={i} style={[styles.adminNote, { color: colors.textSecondary }]}>
                      • {note}
                    </Text>
                  ))}
                </View>
              )}
              
              {/* Actions */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={[styles.addAllButton, { backgroundColor: '#10b981' }]}
                  onPress={addAllLoops}
                >
                  <Text style={styles.addAllButtonText}>
                    ✓ Add All {recommendations.length} Loops
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.regenerateButton, { borderColor: colors.border }]}
                  onPress={fetchRecommendations}
                >
                  <Text style={[styles.regenerateButtonText, { color: colors.text }]}>
                    🔄 Regenerate
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerRight: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  promptInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 80,
    marginBottom: 16,
  },
  modeToggle: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  modeButtonActive: {
    backgroundColor: 'rgba(239, 184, 16, 0.1)',
  },
  modeEmoji: {
    fontSize: 24,
  },
  modeLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  modeDescription: {
    fontSize: 12,
  },
  samplePrompts: {
    marginBottom: 16,
  },
  samplePromptsLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  samplePromptChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    maxWidth: 200,
  },
  samplePromptText: {
    fontSize: 13,
  },
  generateButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateButtonDisabled: {
    opacity: 0.8,
  },
  generateButtonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
  },
  resultsSection: {
    marginTop: 8,
  },
  resultsHeader: {
    marginBottom: 20,
  },
  goalText: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 6,
  },
  modeIndicator: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  recommendationCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  courseBadge: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
  },
  courseBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  cardTitleContainer: {
    flex: 1,
  },
  loopName: {
    fontSize: 17,
    fontWeight: '600',
  },
  resetRule: {
    fontSize: 12,
    marginTop: 2,
  },
  templateBadge: {
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  templateBadgeText: {
    fontSize: 11,
    color: '#1d4ed8',
    fontWeight: '500',
  },
  expertSection: {
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  expertName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  expertTitle: {
    fontSize: 12,
    marginBottom: 4,
  },
  bookTitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  explanation: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  taskPreview: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  taskCount: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
  },
  taskItem: {
    fontSize: 13,
    lineHeight: 20,
  },
  moreTasksText: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  affiliateNote: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  affiliateNoteText: {
    fontSize: 12,
    color: '#92400e',
  },
  addButton: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  adminNotesSection: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  adminNotesTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  adminNote: {
    fontSize: 13,
    lineHeight: 20,
  },
  actionsContainer: {
    marginTop: 16,
    gap: 12,
  },
  addAllButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  addAllButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  regenerateButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  regenerateButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
