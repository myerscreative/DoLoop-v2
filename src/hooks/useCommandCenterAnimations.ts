/**
 * Custom hook for Command Center glassmorphic animations
 * Provides reusable animation utilities for micro-interactions
 */

import { useRef, useCallback } from 'react';
import { Animated, Platform } from 'react-native';

/**
 * Card hover animation - scale 1.0 → 1.02 with bounce easing
 */
export function useCardHover() {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onHoverIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1.02,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  }, [scaleAnim]);

  const onHoverOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  }, [scaleAnim]);

  return {
    scaleAnim,
    onHoverIn,
    onHoverOut,
    style: { transform: [{ scale: scaleAnim }] },
  };
}

/**
 * Panel slide-in animation from right edge
 */
export function usePanelSlide(isVisible: boolean) {
  const translateX = useRef(new Animated.Value(480)).current; // Start off-screen (panel width)
  const opacity = useRef(new Animated.Value(0)).current;

  const slideIn = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateX, opacity]);

  const slideOut = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 480,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateX, opacity]);

  return {
    translateX,
    opacity,
    slideIn,
    slideOut,
    style: {
      transform: [{ translateX }],
      opacity,
    },
  };
}

/**
 * Pulsing glow animation for MomentumRing
 */
export function useRingPulse(active: boolean) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const startPulse = useCallback(() => {
    if (!active) return;

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
  }, [active, pulseAnim]);

  const stopPulse = useCallback(() => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  }, [pulseAnim]);

  return {
    pulseAnim,
    startPulse,
    stopPulse,
    style: { transform: [{ scale: pulseAnim }] },
  };
}

/**
 * Gold glow effect animation
 * Used for active states and focus indicators
 */
export function useGlowEffect() {
  const glowAnim = useRef(new Animated.Value(0)).current;

  const startGlow = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false, // Can't use native driver for shadow properties
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [glowAnim]);

  const stopGlow = useCallback(() => {
    glowAnim.stopAnimation();
    glowAnim.setValue(0);
  }, [glowAnim]);

  // Interpolate shadow radius from 4 to 20
  const shadowRadius = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 20],
  });

  // Interpolate shadow opacity from 0.2 to 0.6
  const shadowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.6],
  });

  return {
    glowAnim,
    startGlow,
    stopGlow,
    shadowRadius,
    shadowOpacity,
  };
}
