import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onHide: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, isVisible, onHide }) => {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
      opacity.value = withTiming(1, { duration: 300 });
      
      const timer = setTimeout(() => {
        translateY.value = withSpring(-100);
        opacity.value = withTiming(0, { duration: 300 }, () => {
          runOnJS(onHide)();
        });
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      translateY.value = withSpring(-100);
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [isVisible, message]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  if (!isVisible && opacity.value === 0) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]} pointerEvents="none">
      <View style={styles.content}>
        <Ionicons name="checkmark-circle" size={20} color="#fff" style={styles.icon} />
        <Text style={styles.text}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
