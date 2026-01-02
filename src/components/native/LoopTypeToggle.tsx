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

interface LoopTypeToggleProps {
  activeTab: 'manual' | 'daily' | 'weekly' | 'goals';
  onChange: (type: 'manual' | 'daily' | 'weekly' | 'goals') => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTAINER_WIDTH = Math.min(SCREEN_WIDTH - 40, 460);

export default function LoopTypeToggle({ activeTab, onChange }: LoopTypeToggleProps) {
  const tabs = [
    { id: 'manual', label: 'Task' },
    { id: 'daily', label: 'Loop' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'goals', label: 'Goal' },
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

  const getTabColors = (tabId: string) => {
    switch (tabId) {
      case 'manual': return { bg: '#FBF5E6', text: '#D4AF37' }; // Champagne / Gold
      case 'daily': return { bg: '#FFF0D4', text: '#EA580C' }; // Pale Honey / Dark Orange
      case 'weekly': return { bg: '#F0E6D2', text: '#B8860B' }; // Pale Bronze / Dark Goldenrod
      case 'goals': return { bg: '#F5DEB3', text: '#8B4513' }; // Wheat / SaddleBrown
      default: return { bg: '#FFF0D4', text: '#EA580C' };
    }
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
    borderColor: '#e2e8f0', // Very subtle border, definitely nog blue
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
