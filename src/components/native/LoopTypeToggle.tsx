import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { ResetRule, RESET_RULE_LABELS } from '../../types/loop';

interface LoopTypeToggleProps {
  activeTab: ResetRule;
  onChange: (type: ResetRule) => void;
  showDescriptions?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTAINER_WIDTH = Math.min(SCREEN_WIDTH - 40, 460);

export default function LoopTypeToggle({ activeTab, onChange, showDescriptions = false }: LoopTypeToggleProps) {
  const tabs: Array<{ id: ResetRule; label: string }> = [
    { id: 'daily', label: RESET_RULE_LABELS.daily },
    { id: 'weekdays', label: RESET_RULE_LABELS.weekdays },
    { id: 'weekly', label: RESET_RULE_LABELS.weekly },
    { id: 'custom', label: RESET_RULE_LABELS.custom },
    { id: 'manual', label: RESET_RULE_LABELS.manual },
  ];

  const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
  // Fallback if activeTab not found (e.g. if we add more types later)
  const effectiveIndex = activeIndex === -1 ? 0 : activeIndex;

  const animatedStyle = useAnimatedStyle(() => {
    const tabWidth = (CONTAINER_WIDTH - 8) / tabs.length;
    return {
      transform: [
        {
          translateX: withSpring(effectiveIndex * tabWidth, {
            stiffness: 300,
            damping: 30,
          }),
        },
      ],
      width: `${100 / tabs.length}%`,
    };
  });

  const getTabColors = (tabId: ResetRule) => {
    // Unified gold color for all recurrence options
    return { bg: '#FFF9E6', text: '#FEC00F' }; // Light gold tint / Gold
  };

  const activeColors = getTabColors(activeTab);

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.activeBackground, 
          animatedStyle,
          { backgroundColor: activeColors.bg }
        ]} 
      />
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const tabColors = isActive ? activeColors : { bg: '', text: '#64748b' };
        
        return (
          <TouchableOpacity
            key={tab.id}
            activeOpacity={0.7}
            onPress={() => onChange(tab.id as any)}
            style={styles.tab}
          >
            <Text
              style={[
                styles.tabText,
                { color: tabColors.text },
                isActive && styles.activeTabFont
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {tab.label}
            </Text>
            {isActive && (
              <View style={[styles.underline, { backgroundColor: tabColors.text }]} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff', // Clean white background
    borderRadius: 14,
    padding: 2,
    height: 44,
    width: '100%',
    position: 'relative',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'transparent', // No border as requested
  },
  activeBackground: {
    position: 'absolute',
    top: 2,
    left: 2,
    bottom: 2,
    // Width handled by animatedStyle
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabFont: {
    fontWeight: '800',
  },
  underline: {
    position: 'absolute',
    bottom: 6,
    height: 2,
    width: 20,
    borderRadius: 1,
    opacity: 0.3, // Subtle underline as requested
  },
});
