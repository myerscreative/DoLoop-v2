import React from 'react';
import { View, Text, ScrollView, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { StarterRecipeCard } from '../native/StarterRecipeCard';
import { GridLoopCard } from './GridLoopCard';
import { LoopWithTasks, FilterType } from '../../types/loop';
import { Colors } from '../../constants/Colors';

interface DashboardGridProps {
  loops: LoopWithTasks[];
  onCreateLoop: () => void;
  onLoopPress: (loop: LoopWithTasks) => void;
  onLoopEdit?: (loop: LoopWithTasks) => void;
  forcedColumns?: number;
  title?: string;
  activeFilter?: FilterType;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({ 
  loops, 
  onCreateLoop,
  onLoopPress,
  onLoopEdit,

  forcedColumns,
  title,
  activeFilter = 'all'
}) => {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  // Determine columns based on width
  // > 1200px: 3 cols
  // > 900px: 2 cols
  // < 900px: 1 col
  // Sidebar takes 250px, so content width is ~ windowWidth - 250
  // Or just use window width heuristics
  
  let numColumns = 3;
  if (forcedColumns) {
      numColumns = forcedColumns;
  } else {
      if (width < 900) numColumns = 1;
      else if (width < 1200) numColumns = 2;
      else numColumns = 3;
  }

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const showDaily = activeFilter === 'all' || activeFilter === 'daily';
  const showManual = activeFilter === 'all' || activeFilter === 'manual';
  const showWeekly = activeFilter === 'all' || activeFilter === 'weekly';

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.surface }]} contentContainerStyle={styles.content}>
      {/* Welcome Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
             <Text style={[styles.greetingTitle, { color: colors.text }]}>
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.user_metadata?.first_name || 'Friend'}
            </Text>
            <Text style={styles.waveEmoji}>👋</Text>
        </View>
        <Text style={[styles.dateText, { color: colors.textSecondary }]}>{currentDate}</Text>
      </View>

      {/* Starter Loops Tray */}
      <View style={styles.traySection}>
        {numColumns === 1 ? (
          // Vertical Stack for Narrow View (Productivity Mode)
          <View style={{ gap: 16 }}>
             {showDaily && (
             <StarterRecipeCard 
                title="Morning Momentum" 
                emoji="☀️" 
                items={['Drink water', 'Make bed', 'Stretch']}
                color={Colors.light.primary}
                onPress={onCreateLoop}
                width="100%"
             />
             )}
             {showManual && (
             <StarterRecipeCard 
                title="Deep Work Session" 
                emoji="🧠" 
                items={['Clear desk', 'Set timer', 'Block sites']}
                color={Colors.light.focus}
                onPress={onCreateLoop}
                width="100%"
             />
             )}
             {showWeekly && (
             <StarterRecipeCard 
                title="Weekly Reset" 
                emoji="🔄" 
                items={['Review calendar', 'Plan projects', 'Tidy up']}
                color={Colors.light.family}
                onPress={onCreateLoop}
                width="100%"
             />
             )}
          </View>
        ) : (
          <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.trayScroll}
              contentContainerStyle={styles.trayContent}
          >
               {showDaily && (
               <StarterRecipeCard 
                  title="Morning Momentum" 
                  emoji="☀️" 
                  items={['Drink water', 'Make bed', 'Stretch']}
                  color={Colors.light.primary}
                  onPress={onCreateLoop}
               />
               )}
               {showManual && (
               <StarterRecipeCard 
                  title="Deep Work Session" 
                  emoji="🧠" 
                  items={['Clear desk', 'Set timer', 'Block sites']}
                  color={Colors.light.focus}
                  onPress={onCreateLoop}
               />
               )}
               {showWeekly && (
               <StarterRecipeCard 
                  title="Weekly Reset" 
                  emoji="🔄" 
                  items={['Review calendar', 'Plan projects', 'Tidy up']}
                  color={Colors.light.family}
                  onPress={onCreateLoop}
               />
               )}
          </ScrollView>
        )}
      </View>

      {/* Grid Section */}
      <View style={styles.gridSection}>
         <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{title || "TODAY'S LOOPS"}</Text>
         </View>

         {loops.length === 0 ? (
             <View style={[styles.emptyState, { borderColor: colors.border }]}>
                 <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No loops yet. Pick a starter above or create a new one!</Text>
             </View>
         ) : (
             <View style={styles.gridContainer}>
                <View style={styles.gridRow}>
                    {loops.map((loop) => (
                        <View 
                            key={loop.id} 
                            style={[
                                styles.gridItem, 
                                { width: numColumns === 1 ? '100%' : numColumns === 2 ? '48%' : '31%' } 
                            ]}
                        >
                            <GridLoopCard 
                                loop={loop} 
                                onPress={onLoopPress} 
                                onEdit={onLoopEdit}
                            />
                        </View>
                    ))}
                </View>
             </View>
         )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 32,
    paddingBottom: 100,
  },
  contentNarrow: {
    padding: 16, // Tighter padding for side column
  },
  header: {
    marginBottom: 24,
  },
  headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
      flexWrap: 'wrap', // Allow wrapping
  },
  greetingTitle: {
    fontSize: 30, // 3xl
    fontWeight: '800',
  },
  waveEmoji: {
    fontSize: 30,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.9,
  },
  traySection: {
    marginBottom: 40,
  },
  trayScroll: {
    overflow: 'visible',
    marginHorizontal: -32, // Allow bleed
  },
  trayScrollNarrow: {
    marginHorizontal: -16, // Adjust bleed for narrow view
  },
  trayContent: {
    paddingHorizontal: 32,
    paddingBottom: 10,
    gap: 20,
  },
  trayContentNarrow: {
    paddingHorizontal: 16,
  },
  gridSection: {
      flex: 1,
  },
  sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
  },
  sectionTitle: {
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 1,
  },
  gridContainer: {
      // Just a wrapper
  },
  gridRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
      justifyContent: 'flex-start',
  },
  gridItem: {
    minWidth: 260, // reduced min width
  },
  emptyState: {
      padding: 40,
      alignItems: 'center',
      borderWidth: 2,
      borderStyle: 'dashed',
      borderRadius: 12,
  },
  emptyText: {
      fontSize: 14,
      textAlign: 'center',
  }
});
