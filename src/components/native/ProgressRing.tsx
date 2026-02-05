import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  Easing 
} from 'react-native-reanimated';

interface ProgressRingProps {
  size?: number;
  strokeWidth?: number;
  progress?: number; // 0 to 1
  completedText?: string;
  colors?: {
    start: string;
    end: string;
    bg: string;
  };
}

const BRAND_GOLD = '#FEC00F';
const LIGHT_GOLD = '#FFD700';

export const ProgressRing: React.FC<ProgressRingProps> = ({
  size = 120,
  strokeWidth = 6,
  progress = 0,
  completedText = '0/0',
  colors = {
    start: BRAND_GOLD,
    end: LIGHT_GOLD,
    bg: 'rgba(255, 255, 255, 0.05)',
  },
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - Math.min(Math.max(progress, 0), 1));

  // Pulse animation for the text
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 800, easing: Easing.bezier(0.4, 0, 0.6, 1) }),
        withTiming(1, { duration: 800, easing: Easing.bezier(0.4, 0, 0.6, 1) })
      ),
      -1,
      true
    );
  }, []);

  const animatedTextStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <LinearGradient id="progress-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={colors.start} />
            <Stop offset="100%" stopColor={colors.end} />
          </LinearGradient>
        </Defs>
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.bg}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progress-gradient)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <Animated.View style={[styles.textWrapper, animatedTextStyle]}>
        <Text style={[styles.progressText, { fontSize: size * 0.2, color: 'white' }]}>
          {completedText}
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  svg: {
    transform: [{ rotate: '-90deg' }],
    position: 'absolute',
  },
  textWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontFamily: 'Outfit_700Bold',
    textAlign: 'center',
  },
});
