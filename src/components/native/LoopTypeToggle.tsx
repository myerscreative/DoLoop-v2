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
  activeTab: 'manual' | 'daily' | 'weekly';
  onChange: (type: 'manual' | 'daily' | 'weekly') => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTAINER_WIDTH = Math.min(SCREEN_WIDTH - 40, 460); // 500px max width for desktop-like feel

export default function LoopTypeToggle({ activeTab, onChange }: LoopTypeToggleProps) {
  const tabs = [
    { id: 'manual', label: 'One-Time Task' },
    { id: 'daily', label: 'Recurring Loop' },
  ];

  // Map 'weekly' to 'daily' for the simplified toggle UI
  const displayTab = activeTab === 'weekly' ? 'daily' : activeTab;
  const activeIndex = tabs.findIndex(tab => tab.id === displayTab);

  const animatedStyle = useAnimatedStyle(() => {
    const tabWidth = (CONTAINER_WIDTH - 8) / 2;
    return {
      transform: [
        {
          translateX: withSpring(activeIndex * tabWidth, {
            stiffness: 300,
            damping: 30,
          }),
        },
      ],
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.activeBackground, animatedStyle]}>
        <LinearGradient
          colors={['#FFD700', '#FFA500']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          activeOpacity={0.7}
          onPress={() => onChange(tab.id as any)}
          style={styles.tab}
        >
          <Text
            style={[
              styles.tabText,
              displayTab === tab.id && styles.activeTabText,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 2,
    height: 44,
    width: '100%',
    position: 'relative',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activeBackground: {
    position: 'absolute',
    top: 2,
    left: 2,
    bottom: 2,
    width: '50%',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#FFA500',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
  },
  activeTabText: {
    color: '#000',
  },
});
