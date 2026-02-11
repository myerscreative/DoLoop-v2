import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { DashboardGrid } from '../dashboard/DashboardGrid';

import { LoopWithTasks, FilterType } from '../../types/loop';

interface DynamicStageProps {
  loops: LoopWithTasks[];
  selectedFilter: FilterType;
  selectedLoopId: string | null;
  onLoopPress: (loop: LoopWithTasks) => void;
  onSelectFilter: (filter: FilterType) => void;
  onCreateLoop: () => void;

}

/**
 * DynamicStage - Main content area with radial gradient background
 * Houses the Bento Grid of loop cards
 */
export const DynamicStage: React.FC<DynamicStageProps> = ({
  loops,
  selectedFilter,
  selectedLoopId,
  onLoopPress,
  onSelectFilter,
  onCreateLoop,
}) => {
  const { colors } = useTheme();

  const getGridTitle = () => {
    switch (selectedFilter) {
      case 'daily':
        return "TODAY'S LOOPS";
      case 'weekly':
        return 'IMPORTANT LOOPS';
      case 'manual':
        return 'PLANNED LOOPS';
      default:
        return 'ALL LOOPS';
    }
  };

  return (
    <View style={styles.container}>
      {/* Radial Gradient Background */}
      <LinearGradient
        colors={[colors.radialGradientCenter, colors.radialGradientEdge]}
        start={{ x: 0.5, y: 0.5 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Bento Grid Content */}
        <View style={styles.gridContainer}>
          <DashboardGrid
            loops={loops}
            layout="list"
            onCreateLoop={onCreateLoop}
            onLoopPress={onLoopPress}
            title={getGridTitle()}
            activeFilter={selectedFilter}
            onSelectFilter={onSelectFilter}
            selectedLoopId={selectedLoopId}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Extra padding for CommandBar
  },
  gridContainer: {
    paddingVertical: 12,
  },
});
