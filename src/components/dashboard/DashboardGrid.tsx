import React from 'react';
import { View, Text, ScrollView, StyleSheet, Platform, useWindowDimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { LoopCard } from './LoopCard';
import { LoopWithTasks, FilterType } from '../../types/loop';

interface DashboardGridProps {
  loops: LoopWithTasks[];
  onCreateLoop: () => void;
  onLoopPress: (loop: LoopWithTasks) => void;
  onLoopEdit?: (loop: LoopWithTasks) => void;
  layout?: 'list' | 'bento';
  forcedColumns?: number;
  title?: string;
  activeFilter?: FilterType;
  onSelectFilter?: (filter: FilterType) => void;
  selectedLoopId?: string | null;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  loops,
  onCreateLoop,
  onLoopPress,
  layout = 'list',
  forcedColumns,
  title,
  activeFilter = 'all',
  onSelectFilter,
  selectedLoopId,
}) => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();



  // Calculate number of columns for Bento Grid
  const getColumns = (): number => {
    if (forcedColumns) return forcedColumns;
    if (layout !== 'bento') return 1; // Keep list mode as 1 column
    
    // Bento Grid responsive columns
    if (width >= 1200) return 3;  // 27"+ desktop
    if (width >= 768) return 2;   // 13-15" laptop
    return 1;                      // Mobile/tablet
  };

  const columns = getColumns();

  // Responsive wrapper for Bento Grid with radial gradient
  const containerStyle = layout === 'bento' 
    ? [styles.bentoContainer] 
    : [styles.container, { backgroundColor: colors.surface }];

  return (
    <View style={containerStyle}>
      {/* Radial Gradient Background for Bento Mode */}
      {layout === 'bento' && Platform.OS === 'web' && (
        <View style={styles.radialGradientContainer}>
          <LinearGradient
            colors={[colors.radialGradientCenter, colors.radialGradientEdge]}
            start={{ x: 0.5, y: 0.5 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </View>
      )}

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={[styles.header, { backgroundColor: layout === 'bento' ? 'transparent' : colors.background }]}>
          <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <Text style={{ fontSize: 32, marginRight: 12 }}>🐝</Text>
            <Text style={[styles.greeting, { color: colors.text }]}>
              Good{' '}
              {new Date().getHours() < 12
                ? 'morning'
                : new Date().getHours() < 18
                ? 'afternoon'
                : 'evening'}! {new Date().getHours() >= 18 ? '🌙' : '🌅'}
            </Text>
          </View>
        </View>

        {/* Filter Tabs - Mobile/Desk Unified */}
        <View style={{
          paddingHorizontal: 24,
          paddingVertical: 16,
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 16,
          }}>
            Your Loops
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {[
              { id: 'all' as FilterType, label: 'All', icon: '⭐' },
              { id: 'manual' as FilterType, label: 'Checklists', icon: '✓' },
              { id: 'daily' as FilterType, label: 'Daily', icon: '☀️' },
              { id: 'weekly' as FilterType, label: 'Weekly', icon: '🎯' },
            ].map((tab) => {
              // UNIFIED GOLD BRAND - all tabs use gold
              const activeColor = colors.primary; // #FEC00F
              const isActive = activeFilter === tab.id;
              
              return (
              <TouchableOpacity
                key={tab.id}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 24,
                  borderWidth: 2,
                  borderColor: isActive ? activeColor : '#333333',
                  backgroundColor: isActive ? `${activeColor}15` : 'transparent',
                }}
                onPress={() => onSelectFilter?.(tab.id)}
              >
                <Text style={{
                  fontSize: 15,
                  fontWeight: isActive ? '800' : '600',
                  color: isActive ? activeColor : colors.textSecondary,
                }}>
                  {tab.icon} {tab.label}
                </Text>
              </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Quick Add Banner */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <TouchableOpacity 
            onPress={onCreateLoop}
            activeOpacity={0.8}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.background,
              padding: 16,
              borderRadius: 20,
              borderWidth: 1.5,
              borderStyle: 'dashed',
              borderColor: colors.primary,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 10,
              elevation: 2,
            }}
          >
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: `${colors.primary}20`,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
            }}>
              <Ionicons name="add" size={24} color={colors.primary} />
            </View>
            <View>
              <Text style={{ 
                fontSize: 16, 
                fontWeight: '700', 
                color: colors.text 
              }}>Create a new loop</Text>
              <Text style={{ 
                fontSize: 13, 
                color: colors.textSecondary 
              }}>Track your own custom routine</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {title || "Your Loops"}
          </Text>
        </View>

        {/* Grid/List Container */}
        {loops.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No loops yet. Create a new one to get started!
            </Text>
          </View>
        ) : layout === 'bento' ? (
          <View
            style={[
              styles.bentoGrid,
              {
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
              } as any,
            ]}
          >
            {loops.map((loop) => (
              <LoopCard
                key={loop.id}
                loop={loop}
                onPress={() => onLoopPress(loop)}
                isSelected={selectedLoopId === loop.id}
              />
            ))}
          </View>
        ) : (
          <View style={styles.listContainer}>
            {loops.map((loop) => (
              <LoopCard
                key={loop.id}
                loop={loop}
                onPress={() => onLoopPress(loop)}
                isSelected={selectedLoopId === loop.id}
              />
            ))}
          </View>
        )}

        {/* Discover Loops Section */}
        <View style={{ paddingHorizontal: 24, marginTop: 40, paddingBottom: 60 }}>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 20,
          }}>
            Discover Loops
          </Text>

          {/* Loop Library Card */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={{
              borderRadius: 20,
              overflow: 'hidden',
              marginBottom: 16,
            }}
          >
            <LinearGradient
              colors={['#2E1065', '#1E1B4B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                padding: 24,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ fontSize: 24, marginRight: 12 }}>📚</Text>
                  <Text style={{ fontSize: 20, fontWeight: '700', color: '#FFFFFF' }}>Loop Library</Text>
                </View>
                <Text style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.7)', lineHeight: 18 }}>
                  Explore loops inspired by top teachers, coaches, and business leaders
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={24} color="#FFFFFF" style={{ opacity: 0.8 }} />
            </LinearGradient>
          </TouchableOpacity>

          {/* AI Recommender Card */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={{
              borderRadius: 20,
              overflow: 'hidden',
            }}
          >
            <LinearGradient
              colors={['#FEC00F', '#F59E0B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                padding: 24,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ fontSize: 24, marginRight: 12 }}>✨</Text>
                  <Text style={{ fontSize: 20, fontWeight: '700', color: '#000000' }}>AI Loop Recommender</Text>
                </View>
                <Text style={{ fontSize: 13, color: 'rgba(0, 0, 0, 0.6)', lineHeight: 18 }}>
                  Describe what you want to achieve and get personalized loop recommendations
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={24} color="#000000" style={{ opacity: 0.6 }} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bentoContainer: {
    flex: 1,
    position: 'relative',
  },
  radialGradientContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  scrollView: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    padding: 24,
    marginBottom: 8,
    minWidth: 300,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.8,
  },
  sectionHeader: {
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  bentoGrid: {
    paddingHorizontal: 24,
    display: 'grid',
    gap: 16,
    ...Platform.select({
      web: {
        gridAutoRows: 'minmax(180px, auto)',
      } as any,
    }),
  } as any,
  listContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
