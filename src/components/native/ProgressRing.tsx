import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

interface ProgressRingProps {
  size?: number;
  strokeWidth?: number;
  progress?: number; // 0 to 1
  icon?: string;
  colors?: {
    start: string;
    end: string;
    bg: string;
  };
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  size = 48,
  strokeWidth = 4,
  progress = 0,
  icon = '☀️',
  colors = {
    start: '#FFD700',
    end: '#FFA500',
    bg: '#f3f4f6',
  },
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - Math.min(Math.max(progress, 0), 1));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <LinearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={colors.start} />
            <Stop offset="100%" stopColor={colors.end} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.bg}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gold-gradient)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <Text style={[styles.icon, { fontSize: size * 0.375 }]}>{icon}</Text>
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
  icon: {
    textAlign: 'center',
  },
});
