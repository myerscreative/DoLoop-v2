import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  type SharedValue,
} from 'react-native-reanimated';

interface AnimatedCircularProgressProps {
  size: number;
  width: number;
  fill: number; // 0-100
  tintColor: string;
  backgroundColor: string;
  children?: React.ReactNode;
  /**
   * Optional external shared value (0-100).
   * When provided, the ring stroke reads directly from this animated value.
   */
  animatedFillValue?: SharedValue<number>;
  animationDuration?: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const AnimatedCircularProgress: React.FC<AnimatedCircularProgressProps> = ({
  size,
  width,
  fill,
  tintColor,
  backgroundColor,
  children,
  animatedFillValue,
  animationDuration = 600,
}) => {
  const radius = (size - width) / 2;
  const circumference = radius * 2 * Math.PI;
  const internalProgressValue = useSharedValue(fill);

  useEffect(() => {
    if (animatedFillValue) return;
    internalProgressValue.value = withTiming(fill, {
      duration: animationDuration,
      easing: Easing.inOut(Easing.ease),
    });
  }, [fill, animationDuration, animatedFillValue, internalProgressValue]);

  const animatedProps = useAnimatedProps(() => {
    const sourceFill = animatedFillValue ? animatedFillValue.value : internalProgressValue.value;
    const normalizedFill = Math.min(Math.max(sourceFill, 0), 100) / 100;
    const strokeDashoffset = circumference - normalizedFill * circumference;
    return {
      strokeDashoffset,
    };
  });

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={width}
          fill="transparent"
        />
        {/* Progress circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={tintColor}
          strokeWidth={width}
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center', maxWidth: size * 0.7 }}>
        {children}
      </View>
    </View>
  );
};
