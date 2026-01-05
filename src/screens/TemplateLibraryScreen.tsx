import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Platform,
  Share,
  Alert,
  Image,
  Animated,
  SafeAreaView,
  StatusBar,
  ScrollView,
  useWindowDimensions,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { supabase } from '../lib/supabase';
import { LoopTemplateWithDetails } from '../types/loop';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ResponsiveContainer } from '../components/layout/ResponsiveContainer';
import { WebSidebar } from '../components/layout/WebSidebar';
import { trackAffiliateClick } from '../lib/admin';
import { CompactLoopItem } from '../components/CompactLoopItem';
import { LoopDetailView } from '../components/LoopDetailView';

const loopDescriptions: Record<string, string> = {
  'Morning Momentum': 'Start your day with energy and intention',
  'Deep Work Session': 'Create the perfect environment for focused, distraction-free work',
  'Weekly Reset': 'Review your week and plan ahead for success',
  'Workout Routine': 'Stay consistent with your fitness goals',
  'Evening Wind Down': 'Prepare your mind and body for restful sleep',
  'Learning Sprint': 'Dedicate time to developing new skills',
  'Home Maintenance': 'Keep your living space clean and organized',
};

type TemplateLibraryScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'TemplateLibrary'
>;

interface Props {
  navigation: TemplateLibraryScreenNavigationProp;
}

type TabType = 'browse' | 'mylibrary' | 'favorites';

// Skeleton loader component
const SkeletonCard = () => {
  const pulseAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    ).start();
  }, []);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.skeletonCard}>
      <View style={styles.cardContent}>
        <Animated.View style={[styles.skeletonEmoji, { opacity }]} />
        <View style={{ flex: 1 }}>
          <Animated.View style={[styles.skeletonTitle, { opacity }]} />
          <Animated.View style={[styles.skeletonText, { opacity, width: '80%' }]} />
        </View>
      </View>
    </View>
  );
};

export function TemplateLibraryScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const [templates, setTemplates] = useState<LoopTemplateWithDetails[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<LoopTemplateWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('browse');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, [activeTab, user]);

  useEffect(() => {
    filterTemplates();
  }, [searchQuery, selectedCategory, templates, activeTab]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      console.log('[TemplateLibrary] Fetching templates...');

      // 1. Fetch all templates (publicly accessible)
      const { data: templateData, error: templateError } = await supabase
        .from('loop_templates')
        .select(`
          *,
          creator:template_creators(*),
          tasks:template_tasks(*)
        `)
        .order('is_featured', { ascending: false })
        .order('popularity_score', { ascending: false });

      if (templateError) {
        console.error('[TemplateLibrary] Template query error:', templateError);
        throw templateError;
      }

      console.log(`[TemplateLibrary] Raw template data:`, templateData?.length || 0, 'templates');

      // Initialize user-specific data sets
      let favoriteIds = new Set<string>();
      let addedIds = new Set<string>();
      let userRatings = new Map<string, number>();

      // 2. If user is logged in, fetch their specific data
      if (user) {
        const { data: favoritesData } = await supabase
          .from('template_favorites')
          .select('template_id')
          .eq('user_id', user.id);
        favoriteIds = new Set(favoritesData?.map(f => f.template_id) || []);

        const { data: usageData } = await supabase
          .from('user_template_usage')
          .select('template_id')
          .eq('user_id', user.id);
        addedIds = new Set(usageData?.map(u => u.template_id) || []);

        const { data: ratingsData } = await supabase
          .from('template_reviews')
          .select('template_id, rating')
          .eq('user_id', user.id);
        userRatings = new Map(ratingsData?.map(r => [r.template_id, r.rating]) || []);
      }

      // 3. Process templates with creator and user-specific details
      const templatesWithDetails: LoopTemplateWithDetails[] = (templateData || [])
        .map((template: any) => {
          const creator = Array.isArray(template.creator) ? template.creator[0] : template.creator;
          return {
            ...template,
            creator: creator || { id: '', name: 'Unknown Creator', bio: '', created_at: '', updated_at: '' },
            tasks: template.tasks || [],
            taskCount: template.tasks?.length || 0,
            isFavorite: favoriteIds.has(template.id),
            isAdded: addedIds.has(template.id),
            userRating: userRatings.get(template.id),
            average_rating: template.average_rating || 0,
            review_count: template.review_count || 0,
          };
        });

      console.log(`[TemplateLibrary] Loaded ${templatesWithDetails.length} templates`);
      const distinctCats = [...new Set(templatesWithDetails.map(t => t.category))];
      console.log('[TemplateLibrary] Distinct categories in state:', distinctCats);

      setTemplates(templatesWithDetails);
      setFilteredTemplates(templatesWithDetails);
    } catch (error) {
      console.error('Error fetching templates:', error);
      Alert.alert('Error', 'Failed to load templates. Please try again.');
      setTemplates([]);
      setFilteredTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = [...templates];
    console.log(`[TemplateLibrary] Filtering ${templates.length} templates, activeTab: ${activeTab}, category: ${selectedCategory}, search: "${searchQuery}"`);

    if (activeTab === 'mylibrary') {
      filtered = filtered.filter(t => t.isAdded);
      console.log(`[TemplateLibrary] After mylibrary filter: ${filtered.length} templates`);
    } else if (activeTab === 'favorites') {
      filtered = filtered.filter(t => t.isFavorite);
      console.log(`[TemplateLibrary] After favorites filter: ${filtered.length} templates`);
    }

    if (selectedCategory) {
      // Robust matching: lower-case and handle shorthand aliases in-memory
      const catLower = selectedCategory.toLowerCase();
      filtered = filtered.filter(t => {
        const itemCatLower = t.category.toLowerCase();
        
        // Exact match
        if (itemCatLower === catLower) return true;
        
        // Logical aliases for broader categories
        if (catLower === 'personal development' && (itemCatLower === 'personal' || itemCatLower === 'growth')) return true;
        if (catLower === 'productivity & work' && (itemCatLower === 'work' || itemCatLower === 'productivity')) return true;
        if (catLower === 'health & wellness' && (itemCatLower === 'health' || itemCatLower === 'wellness')) return true;
        if (catLower === 'fitness & sports' && (itemCatLower === 'fitness' || itemCatLower === 'sports')) return true;
        if (catLower === 'relationships & social' && (itemCatLower === 'social' || itemCatLower === 'relationships')) return true;
        if (catLower === 'finance & money' && (itemCatLower === 'money' || itemCatLower === 'finance')) return true;
        
        return false;
      });
      console.log(`[TemplateLibrary] After category filter (${selectedCategory}): ${filtered.length} templates`);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        t =>
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          (t.creator?.name?.toLowerCase().includes(query) || false) ||
          t.book_course_title.toLowerCase().includes(query)
      );
      console.log(`[TemplateLibrary] After search filter: ${filtered.length} templates`);
    }

    console.log(`[TemplateLibrary] Final filtered count: ${filtered.length} templates`);
    setFilteredTemplates(filtered);
  };

  const toggleFavorite = async (templateId: string, currentlyFavorited: boolean) => {
    if (!user) return;

    // Haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      if (currentlyFavorited) {
        await supabase
          .from('template_favorites')
          .delete()
          .eq('template_id', templateId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('template_favorites')
          .insert([{ template_id: templateId, user_id: user.id }]);
      }

      await fetchTemplates();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorite status');
    }
  };

  const shareTemplate = async (template: LoopTemplateWithDetails) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      await Share.share({
        message: `Check out this loop template: "${template.title}" by ${template.creator.name}. Based on "${template.book_course_title}". Add it to your DoLoop app!`,
        title: template.title,
      });
    } catch (error) {
      console.error('Error sharing template:', error);
    }
  };

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId) || null;

  const handleAddToMyLoops = async (template: LoopTemplateWithDetails) => {
    if (!user) {
      Alert.alert('Error', 'Please log in to add this template to your loops');
      return;
    }

    try {
      setIsAdding(true);

      // Check if this template has already been added for this user
      const { data: existingUsage } = await supabase
        .from('user_template_usage')
        .select('loop_id')
        .eq('user_id', user.id)
        .eq('template_id', template.id);

      if (existingUsage && existingUsage.length > 0) {
        const existingLoopId = existingUsage[0].loop_id;
        Alert.alert(
          'Already Added',
          `"${template.title}" is already in your loops.`,
          [
            {
              text: 'View Loop',
              onPress: () => navigation.navigate('LoopDetail', { loopId: existingLoopId }),
            },
            { text: 'OK', style: 'cancel' },
          ]
        );
        setIsAdding(false);
        return;
      }

      // Create a new loop based on this template
      const { data: newLoop, error: loopError } = await supabase
        .from('loops')
        .insert([
          {
            owner_id: user.id,
            name: template.title,
            color: template.color,
            description: template.description,
            affiliate_link: template.affiliate_link,
            reset_rule: template.category === 'daily' ? 'daily' : 'manual',
            is_favorite: false,
          },
        ])
        .select()
        .single();

      if (loopError) throw loopError;

      // Copy all tasks from the template to the new loop
      const tasksToInsert = template.tasks.map((task: any) => ({
        loop_id: newLoop.id,
        description: task.description,
        is_one_time: task.is_one_time || false,
        completed: false,
        notes: task.hint, // Copy hint to task notes
      }));

      const { error: tasksError } = await supabase
        .from('tasks')
        .insert(tasksToInsert);

      if (tasksError) throw tasksError;

      // Track that this user added this template
      await supabase
        .from('user_template_usage')
        .insert([{ user_id: user.id, template_id: template.id, loop_id: newLoop.id }]);

      setShowSuccess(true);
      
      if (Platform.OS === 'web') {
        setTimeout(() => {
          setShowSuccess(false);
          navigation.navigate('LoopDetail', { loopId: newLoop.id });
        }, 2000);
      } else {
        Alert.alert(
          'Success!',
          `"${template.title}" has been added to your loops!`,
          [
            {
              text: 'View Loop',
              onPress: () => {
                setShowSuccess(false);
                navigation.navigate('LoopDetail', { loopId: newLoop.id });
              },
            },
            {
              text: 'Browse More',
              onPress: () => setShowSuccess(false),
              style: 'cancel',
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error adding template to loops:', error);
      Alert.alert('Error', 'Failed to add template to your loops');
    } finally {
      setIsAdding(false);
    }
  };

  const handleLearnMore = (template: LoopTemplateWithDetails) => {
    if (!template.affiliate_link) return;

    if (Platform.OS === 'web') {
        trackAffiliateClick(template.id, template.affiliate_link);
        return;
    }

    Alert.alert(
      'Learn More',
      `This will open a link to "${template.book_course_title}" where you can learn more.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Link',
          onPress: async () => {
            try {
              await trackAffiliateClick(template.id, template.affiliate_link!);
            } catch (err) {
              Linking.openURL(template.affiliate_link!);
            }
          },
        },
      ]
    );
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      checklist: '✓',
      daily: '☀️',
      weekly: '🎯',
      personal: '🌱',
      work: '💼',
      shared: '👥',
      'Personal Development': '🧠',
      'Health & Wellness': '🥗',
      'Productivity & Work': '⚡',
      'Fitness & Sports': '💪',
      'Travel & Adventure': '✈️',
      'Finance & Money': '💰',
      'Creativity & Hobbies': '🎨',
      'Learning & Education': '📚',
      'Relationships & Social': '❤️',
      'Mindfulness & Spirituality': '🧘',
      'Home & Organization': '🏠',
      'Career & Entrepreneurship': '🚀',
      'Environmental & Sustainability': '🌿',
      'Community & Campaigns': '📢',
      'Recovery & Rehab': '🛁',
    };
    return icons[category] || '📋';
  };

  // Calculate counts for each category to hide empty ones
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    templates.forEach(t => {
      const cat = t.category || 'other';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [templates]);

  const categories = React.useMemo(() => {
    // Labels and icons for known categories
    const categoryConfig: Record<string, { label: string; icon: string }> = {
      'Personal Development': { label: 'Growth', icon: '🧠' },
      'Health & Wellness': { label: 'Health', icon: '🥗' },
      'Productivity & Work': { label: 'Work', icon: '⚡' },
      'Fitness & Sports': { label: 'Fitness', icon: '💪' },
      'Travel & Adventure': { label: 'Travel', icon: '✈️' },
      'Finance & Money': { label: 'Money', icon: '💰' },
      'Creativity & Hobbies': { label: 'Creative', icon: '🎨' },
      'Learning & Education': { label: 'Learn', icon: '📚' },
      'Relationships & Social': { label: 'Social', icon: '❤️' },
      'Mindfulness & Spirituality': { label: 'Spirit', icon: '🧘' },
      'Home & Organization': { label: 'Home', icon: '🏠' },
      'Career & Entrepreneurship': { label: 'Career', icon: '🚀' },
      'Environmental & Sustainability': { label: 'Eco', icon: '🌿' },
      'Community & Campaigns': { label: 'Legacy', icon: '📢' },
      'Recovery & Rehab': { label: 'Review', icon: '🛁' },
      'daily': { label: 'Daily', icon: '☀️' },
      'weekly': { label: 'Weekly', icon: '🎯' },
      'checklist': { label: 'Checklist', icon: '✓' },
    };

    // Get unique categories from fetched templates
    const uniqueCats = [...new Set(templates.map(t => t.category))].sort();
    
    // Always put "All" first
    const items = [{ id: null as string | null, label: 'All', icon: '⭐' }];
    
    // Add categories that exist in the data
    uniqueCats.forEach(catId => {
      if (!catId) return;
      const config = categoryConfig[catId] || { label: catId, icon: '📋' };
      items.push({ id: catId, label: config.label, icon: config.icon });
    });

    return items;
  }, [templates]);

  const tabs = [
    { id: 'browse' as TabType, label: 'Browse', icon: '📚' },
    { id: 'mylibrary' as TabType, label: 'My Library', icon: '📖' },
    { id: 'favorites' as TabType, label: 'Favorites', icon: '❤️' },
  ];

  const handleTabPress = (tabId: TabType) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    setActiveTab(tabId);
  };

  return (
    <ResponsiveContainer
      layout="productivity"
      sidebar={
        <WebSidebar
          activeItem="library"
          selectedFilter="all"
          onCreatePress={() => {}}
          counts={{ all: 0, daily: 0, weekly: 0, manual: 0 }}
          onSelectFilter={(filter) => {
            navigation.navigate('Home', { screen: 'Home', params: { initialFilter: filter } } as any);
          }}
          onNavigateToLibrary={() => {}}
          onNavigateToSommelier={() => navigation.navigate('LoopSommelier')}
        />
      }
      rightPanel={
        <LoopDetailView
          template={selectedTemplate}
          onAdd={() => selectedTemplate && handleAddToMyLoops(selectedTemplate)}
        />
      }
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <View style={{ flex: 1, width: '100%', alignSelf: 'center', backgroundColor: '#ffffff' }}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  if (navigation.canGoBack()) {
                    navigation.goBack();
                  } else {
                    navigation.navigate('Home' as any);
                  }
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="arrow-back" size={24} color="#000" />
              </TouchableOpacity>
              <View style={styles.headerContent}>
                <Text style={styles.pageTitle}>Loop Library</Text>
                <Text style={styles.pageSubtitle}>Discover loops from the best</Text>
              </View>
            </View>

            {/* Tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsContainer}
              style={styles.tabsScroll}
            >
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  style={styles.tab}
                  onPress={() => handleTabPress(tab.id)}
                >
                  <Text style={styles.tabIcon}>{tab.icon}</Text>
                  <Text
                    style={[
                      styles.tabLabel,
                      activeTab === tab.id && styles.tabLabelActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                  {activeTab === tab.id && (
                    <LinearGradient
                      colors={[colors.accentYellow, '#FFA500']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.tabIndicator}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Search */}
          <View style={[styles.searchSection, { borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }]}>
            <View style={styles.searchBar}>
              <Ionicons
                name="search"
                size={20}
                color="#999"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search templates, creators, books..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Filters */}
          <View style={styles.filtersSection}>
            <View style={styles.filtersContent}>
              {categories
                .filter((filter) => {
                  if (isFiltersExpanded) return true;
                  if (filter.id === null || filter.id === selectedCategory) return true;
                  if (!selectedCategory && categories.indexOf(filter) < 4) return true;
                  return false;
                })
                .map((filter) => (
                  <TouchableOpacity
                    key={filter.id || 'all'}
                    onPress={() => {
                      if (Platform.OS !== 'web') {
                        Haptics.selectionAsync();
                      }
                      setSelectedCategory(filter.id);
                    }}
                    style={{ marginBottom: 4 }}
                  >
                    {selectedCategory === filter.id ? (
                      <LinearGradient
                        colors={[colors.accentYellow, '#FFA500']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.filterChipActive}
                      >
                        <Text style={styles.filterChipTextActive}>
                          {filter.icon} {filter.label} ({filter.id === null ? templates.length : (categoryCounts[filter.id!] || 0)})
                        </Text>
                      </LinearGradient>
                    ) : (
                      <View style={styles.filterChip}>
                        <Text style={styles.filterChipText}>
                          {filter.icon} {filter.label} ({filter.id === null ? templates.length : (categoryCounts[filter.id] || 0)})
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}

              <TouchableOpacity
                onPress={() => setIsFiltersExpanded(!isFiltersExpanded)}
                style={styles.seeAllButton}
              >
                <Text style={styles.seeAllText}>
                  {isFiltersExpanded ? 'Show less' : 'See all'}
                </Text>
                <Ionicons
                  name={isFiltersExpanded ? "chevron-up" : "chevron-down"}
                  size={14}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Templates List */}
          {loading ? (
            <View style={styles.content}>
              {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
            </View>
          ) : filteredTemplates.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>
                {activeTab === 'mylibrary' ? '📖' : activeTab === 'favorites' ? '💜' : '🔍'}
              </Text>
              <Text style={styles.emptyText}>
                {activeTab === 'mylibrary'
                  ? 'No templates yet'
                  : activeTab === 'favorites'
                  ? 'No favorites yet'
                  : 'No templates found'}
              </Text>
              <Text style={styles.emptySubtext}>
                {activeTab === 'mylibrary'
                  ? 'Browse templates and add them to your library'
                  : activeTab === 'favorites'
                  ? 'Tap the heart to save your favorites'
                  : searchQuery
                  ? 'Try a different search term'
                  : 'Check back soon for new templates'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredTemplates}
              renderItem={({ item }) => (
                <CompactLoopItem
                  emoji={getCategoryIcon(item.category)}
                  name={`${item.title} (${item.category})`}
                  description={loopDescriptions[item.title] || item.description}
                  isSelected={selectedTemplateId === item.id}
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      navigation.navigate('TemplateDetail', { templateId: item.id });
                    } else {
                      setSelectedTemplateId(item.id);
                    }
                  }}
                />
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </SafeAreaView>
    </ResponsiveContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  // Header
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    width: '100%',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#999',
  },

  // Tabs
  tabsScroll: {
    marginTop: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#f0f0f0',
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 20,
    paddingRight: 20,
  },
  tab: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    paddingBottom: 12,
    position: 'relative',
    minWidth: 80,
  },
  tabIcon: {
    fontSize: 22,
    marginBottom: 6,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
  },
  tabLabelActive: {
    color: '#1a1a1a',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -2,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },

  // Search
  searchSection: {
    padding: 16,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
  },
  searchBar: {
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    top: 14,
    zIndex: 1,
  },
  searchInput: {
    paddingVertical: 14,
    paddingLeft: 44,
    paddingRight: 16,
    borderWidth: 2,
    borderColor: '#f0f0f0',
    borderRadius: 12,
    fontSize: 15,
    backgroundColor: '#fafafa',
    color: '#1a1a1a',
  },

  // Filters
  filtersSection: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filtersContent: {
    paddingHorizontal: 20,
    gap: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 4,
    marginBottom: 4,
  },
  seeAllText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  filterChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    backgroundColor: '#ffffff',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterChipActive: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  filterChipTextActive: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },

  // Content
  content: {
    padding: 20,
    gap: 16,
  },


  // Skeleton styles
  // Skeleton styles
  skeletonCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardContent: {
    flexDirection: 'row',
    gap: 12,
  },
  skeletonEmoji: {
    width: 32,
    height: 32,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
  },
  skeletonTitle: {
    height: 18,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
    width: '60%',
  },
  skeletonText: {
    height: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 72,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});
