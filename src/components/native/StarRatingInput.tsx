import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// Brand colors for star rating
const STAR_GOLD = '#FFB800';
const STAR_EMPTY = '#E5E7EB';

interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
  size?: number;
}

// SVG star path (5-pointed star)
const STAR_PATH = 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';

const AnimatedStar: React.FC<{
  index: number;
  filled: boolean;
  size: number;
  onPress: () => void;
  disabled: boolean;
}> = ({ index, filled, size, onPress, disabled }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isHovered, setIsHovered] = useState(false);

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 1.2,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (disabled) return;
    
    // 200ms ease-in-out animation for selection feedback
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    onPress();
  };

  const fillColor = filled || isHovered ? STAR_GOLD : STAR_EMPTY;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      {...(Platform.OS === 'web' ? {
        // @ts-ignore - web-only props
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false),
      } : {})}
      style={[
        styles.starButton,
        disabled && styles.disabled,
      ]}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d={STAR_PATH} fill={fillColor} />
        </Svg>
      </Animated.View>
    </TouchableOpacity>
  );
};

export const StarRatingInput: React.FC<StarRatingInputProps> = ({
  value,
  onChange,
  disabled = false,
  size = 32,
}) => {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((star) => (
        <AnimatedStar
          key={star}
          index={star}
          filled={value >= star}
          size={size}
          onPress={() => onChange(star)}
          disabled={disabled}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starButton: {
    padding: 4,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'transform 200ms ease-in-out',
      } as any,
    }),
  },
  disabled: {
    opacity: 0.5,
    ...Platform.select({
      web: {
        cursor: 'not-allowed',
      } as any,
    }),
  },
});

export default StarRatingInput;
