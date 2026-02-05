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
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const BRAND_GOLD = '#FEC00F';

export const MomentumOrb = () => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    translateX.value = withRepeat(
      withSequence(
        withTiming(width * 0.2, { duration: 8000, easing: Easing.bezier(0.445, 0.05, 0.55, 0.95) }),
        withTiming(-width * 0.2, { duration: 10000, easing: Easing.bezier(0.445, 0.05, 0.55, 0.95) }),
        withTiming(0, { duration: 8000, easing: Easing.bezier(0.445, 0.05, 0.55, 0.95) })
      ),
      -1,
      true
    );

    translateY.value = withRepeat(
      withSequence(
        withTiming(height * 0.1, { duration: 12000, easing: Easing.bezier(0.445, 0.05, 0.55, 0.95) }),
        withTiming(-height * 0.1, { duration: 15000, easing: Easing.bezier(0.445, 0.05, 0.55, 0.95) }),
        withTiming(0, { duration: 12000, easing: Easing.bezier(0.445, 0.05, 0.55, 0.95) })
      ),
      -1,
      true
    );

    scale.value = withRepeat(
      withSequence(
        withTiming(1.5, { duration: 6000 }),
        withTiming(1, { duration: 6000 })
      ),
      -1,
      true
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(0.15, { duration: 4000 }),
        withTiming(0.4, { duration: 4000 })
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
      <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
    </View>
  );
};

const styles = StyleSheet.create({
  orb: {
    position: 'absolute',
    top: height * 0.2,
    left: width * 0.2,
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: BRAND_GOLD,
    shadowColor: BRAND_GOLD,
    shadowRadius: 100,
    shadowOpacity: 0.8,
    elevation: 20,
  },
});
