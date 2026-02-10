import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const PURPLE_ORB = '#4F46E5';
const ACCENT_ORB = '#7C3AED';

export const MomentumOrb = () => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.15); // Reduced default opacity

  useEffect(() => {
    translateX.value = withRepeat(
      withSequence(
        withTiming(width * 0.3, { duration: 10000, easing: Easing.bezier(0.445, 0.05, 0.55, 0.95) }),
        withTiming(-width * 0.3, { duration: 12000, easing: Easing.bezier(0.445, 0.05, 0.55, 0.95) }),
        withTiming(0, { duration: 10000, easing: Easing.bezier(0.445, 0.05, 0.55, 0.95) })
      ),
      -1,
      true
    );

    translateY.value = withRepeat(
      withSequence(
        withTiming(height * 0.15, { duration: 15000, easing: Easing.bezier(0.445, 0.05, 0.55, 0.95) }),
        withTiming(-height * 0.15, { duration: 18000, easing: Easing.bezier(0.445, 0.05, 0.55, 0.95) }),
        withTiming(0, { duration: 15000, easing: Easing.bezier(0.445, 0.05, 0.55, 0.95) })
      ),
      -1,
      true
    );

    scale.value = withRepeat(
      withSequence(
        withTiming(1.8, { duration: 8000 }),
        withTiming(1.2, { duration: 8000 })
      ),
      -1,
      true
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(0.1, { duration: 5000 }),
        withTiming(0.2, { duration: 5000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View style={[styles.orb, animatedStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  orb: {
    position: 'absolute',
    top: height * 0.2,
    left: width * 0.2,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: PURPLE_ORB,
    shadowColor: ACCENT_ORB,
    shadowRadius: 150,
    shadowOpacity: 0.5,
    elevation: 20,
  },
});
