import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { DashboardGrid } from '../dashboard/DashboardGrid';
import { MomentumRing } from '../native/MomentumRing';
import { LoopWithTasks, FilterType } from '../../types/loop';

interface DynamicStageProps {
  loops: LoopWithTasks[];
  selectedFilter: FilterType;
  selectedLoopId: string | null;
  onLoopPress: (loop: LoopWithTasks) => void;
  onCreateLoop: () => void;
  totalStreak: number;
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
  onCreateLoop,
  totalStreak,
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
        {/* MomentumRing Hero */}
        <View style={styles.heroContainer}>
          <MomentumRing 
            displayMode="hero" 
            streak={totalStreak} 
            active={true} 
          />
        </View>

        {/* Bento Grid Content */}
        <DashboardGrid
          loops={loops}
          layout="bento"
          onCreateLoop={onCreateLoop}
          onLoopPress={onLoopPress}
          title={getGridTitle()}
          activeFilter={selectedFilter}
          selectedLoopId={selectedLoopId}
        />
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
  heroContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
});
