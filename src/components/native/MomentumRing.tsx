import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop, Filter, FeGaussianBlur, FeMerge, FeMergeNode } from 'react-native-svg';

interface MomentumRingProps {
  size?: number;
  strokeWidth?: number;
  streak?: number;
  active?: boolean;
  displayMode?: 'hero' | 'compact' | 'inline';
}

export const MomentumRing: React.FC<MomentumRingProps> = ({
  size: customSize,
  strokeWidth: customStrokeWidth,
  streak = 0,
  active = true,
  displayMode = 'inline',
}) => {
  // Determine size based on display mode
  const size = customSize ?? (displayMode === 'hero' ? 350 : displayMode === 'compact' ? 40 : 48);
  const strokeWidth = customStrokeWidth ?? (displayMode === 'hero' ? 16 : 6);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (active && streak > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [active, streak]);

  const glowColor = '#FFB800';

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View style={{ 
        position: 'absolute',
        width: size,
        height: size,
        transform: [{ scale: pulseAnim }],
        opacity: active && streak > 0 ? 0.6 : 0
      }}>
        <Svg width={size} height={size}>
            <Defs>
                <Filter id="glow">
                    <FeGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <FeMerge>
                        <FeMergeNode in="coloredBlur" />
                        <FeMergeNode in="SourceGraphic" />
                    </FeMerge>
                </Filter>
            </Defs>
            <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={glowColor}
                strokeWidth={strokeWidth}
                fill="transparent"
                filter="url(#glow)"
            />
        </Svg>
      </Animated.View>

      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <LinearGradient id="streak-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#FFB800" />
            <Stop offset="100%" stopColor="#FF8A00" />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={active && streak > 0 ? "url(#streak-gradient)" : "#E5E7EB"}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
        />
      </Svg>
      <View style={styles.textContainer}>
        {displayMode === 'hero' ? (
          <>
            <Text style={[styles.streakText, { fontSize: 72, fontWeight: '900' }]}>{streak}</Text>
            <Text style={[styles.heroLabel, { fontSize: 20, marginTop: 8 }]}>DAY STREAK</Text>
            <Text style={[styles.heroSubtitle, { fontSize: 14, marginTop: 4 }]}>Momentum</Text>
          </>
        ) : streak > 0 ? (
          <>
            <Text style={[styles.streakText, { fontSize: size * 0.35 }]}>{streak}</Text>
            <Text style={[styles.label, { fontSize: size * 0.15 }]}>DAYS</Text>
          </>
        ) : (
          <Text style={{ fontSize: size * 0.4 }}>🧘</Text>
        )}
      </View>
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
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakText: {
    fontWeight: '900',
    color: '#FFB800',
    lineHeight: 20,
  },
  label: {
    fontWeight: '800',
    color: '#FFB800',
    marginTop: -2,
  },
  heroLabel: {
    fontWeight: '800',
    color: '#FFB800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  heroSubtitle: {
    fontWeight: '600',
    color: '#FFB800',
    opacity: 0.7,
  },
});
