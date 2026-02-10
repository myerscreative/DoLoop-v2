import React from 'react';
import { View, Text, ScrollView, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { CompactLoopItem } from '../CompactLoopItem';
import { LoopWithTasks, FilterType, LoopType, FOLDER_ICONS } from '../../types/loop';

interface DashboardGridProps {
  loops: LoopWithTasks[];
  onCreateLoop: () => void;
  onLoopPress: (loop: LoopWithTasks) => void;
  onLoopEdit?: (loop: LoopWithTasks) => void;
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

  forcedColumns,
  title,
  activeFilter = 'all',
  selectedLoopId
}) => {
  const { user } = useAuth();
  const { colors } = useTheme();

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={[styles.header, { backgroundColor: colors.background }]}>
           <Text style={[styles.greeting, { color: colors.text }]}>
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.user_metadata?.first_name || 'Friend'} 👋
          </Text>
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>{currentDate}</Text>
        </View>

        {/* Section Label */}
        <View style={styles.sectionHeader}>
           <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{title || "TODAY'S LOOPS"}</Text>
        </View>

        {/* Loops List */}
        <View style={styles.gridContainer}>
          {loops.length === 0 ? (
             <View style={styles.emptyState}>
                 <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No loops yet. Create a new one to get started!</Text>
             </View>
          ) : (
             loops.map((loop) => (
                <CompactLoopItem 
                  key={loop.id}
                  emoji={FOLDER_ICONS[loop.category as LoopType] || '📋'}
                  name={loop.name || 'Untitled Loop'}
                  description={loop.description || ''}
                  isSelected={selectedLoopId === loop.id}
                  onPress={() => onLoopPress(loop)}
                  colors={colors}
                />
             ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
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
  gridContainer: {
    paddingHorizontal: 16,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  }
});
