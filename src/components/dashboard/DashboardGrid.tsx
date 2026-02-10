import React from 'react';
import { View, Text, ScrollView, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
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
  selectedLoopId?: string | null;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  loops,
  onCreateLoop,
  onLoopPress,
  onLoopEdit,
  layout = 'list',
  forcedColumns,
  title,
  activeFilter = 'all',
  selectedLoopId,
}) => {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

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
          <Text style={[styles.greeting, { color: colors.text }]}>
            Good{' '}
            {new Date().getHours() < 12
              ? 'Morning'
              : new Date().getHours() < 18
              ? 'Afternoon'
              : 'Evening'}
            , {user?.user_metadata?.first_name || 'Friend'} 👋
          </Text>
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>{currentDate}</Text>
        </View>

        {/* Section Label */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {title || "TODAY'S LOOPS"}
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
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionHeader: {
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
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
