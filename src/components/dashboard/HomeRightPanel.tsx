import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedCircularProgress } from '../native/AnimatedCircularProgress';

interface HomeRightPanelProps {
  onCreateLoop: () => void;
}

export const HomeRightPanel: React.FC<HomeRightPanelProps> = ({ onCreateLoop }) => {
  const { user } = useAuth();
  const { colors } = useTheme();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Momentum / Active Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>MOMENTUM</Text>
        
        <View style={styles.streakCard}>
            <View style={styles.streakInfo}>
                <Text style={styles.streakCount}>12</Text>
                <Text style={styles.streakLabel}>Day Streak</Text>
            </View>
            <Ionicons name="flame" size={32} color="#F59E0B" />
        </View>

        <View style={styles.progressRow}>
            <View style={styles.progressItem}>
                <AnimatedCircularProgress
                    size={60}
                    width={5}
                    fill={75}
                    tintColor="#FEC00F"
                    backgroundColor="#FEF3C7"
                >
                    <Text style={styles.progressText}>75%</Text>
                </AnimatedCircularProgress>
                <Text style={styles.progressLabel}>Weekly</Text>
            </View>
            <View style={styles.progressItem}>
               <AnimatedCircularProgress
                    size={60}
                    width={5}
                    fill={30}
                    tintColor="#8A2BE2"
                    backgroundColor="#F3E8E3"
                >
                    <Text style={styles.progressText}>30%</Text>
                </AnimatedCircularProgress>
                <Text style={styles.progressLabel}>Monthly</Text>
            </View>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Chef's Tips / Context */}
      <View style={styles.section}>
         <View style={styles.tipCard}>
             <View style={styles.tipHeader}>
                 <Ionicons name="bulb-outline" size={20} color="#8A2BE2" />
                 <Text style={styles.tipTitle}>Chef's Tip</Text>
             </View>
             <Text style={styles.tipText}>
                Break down complex loops into bite-sized tasks to keep your momentum flowing.
             </Text>
         </View>
      </View>

      {/* Placeholder Quote */}
      <View style={styles.quoteSection}>
        <Text style={styles.quoteText}>
          "Success is the sum of small efforts, repeated day in and day out."
        </Text>
        <Text style={styles.quoteAuthor}>— Robert Collier</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // or slightly off-white if desired
  },
  content: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9CA3AF',
    marginBottom: 16,
    letterSpacing: 1,
  },
  streakCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#FFFBEB',
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#FEF3C7',
      marginBottom: 24,
  },
  streakInfo: {
      gap: 4,
  },
  streakCount: {
      fontSize: 24,
      fontWeight: '800',
      color: '#B45309',
  },
  streakLabel: {
      fontSize: 13,
      color: '#D97706',
      fontWeight: '600',
  },
  progressRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      gap: 12,
  },
  progressItem: {
      alignItems: 'center',
      gap: 8,
  },
  progressText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#374151',
  },
  progressLabel: {
      fontSize: 12,
      color: '#6B7280',
      fontWeight: '500',
  },
  divider: {
      height: 1,
      backgroundColor: '#F3F4F6',
      marginBottom: 32,
  },
  tipCard: {
      backgroundColor: '#F9FAFB',
      padding: 16,
      borderRadius: 12,
      gap: 10,
  },
  tipHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
  },
  tipTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: '#374151',
  },
  tipText: {
      fontSize: 13,
      color: '#4B5563',
      lineHeight: 20,
  },
  quoteSection: {
    backgroundColor: '#fff',
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#E5E7EB',
  },
  quoteText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#9CA3AF',
    lineHeight: 20,
    marginBottom: 6,
  },
  quoteAuthor: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D1D5DB',
  },
});
