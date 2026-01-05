import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// Brand colors for star rating
const STAR_GOLD = '#FFB800';
const STAR_EMPTY = '#E5E7EB';

interface StarRatingProps {
  rating: number;
  count?: number;
  size?: number;
  showCount?: boolean;
}

// SVG star path (5-pointed star)
const STAR_PATH = 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';

const Star: React.FC<{ filled: number; size: number }> = ({ filled, size }) => {
  // filled: 0 = empty, 1 = full, 0.5 = half
  const fillColor = filled > 0 ? STAR_GOLD : STAR_EMPTY;
  
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Background (empty) star */}
      <Path d={STAR_PATH} fill={STAR_EMPTY} />
      {/* Filled overlay - clipped for partial fill */}
      {filled > 0 && (
        <Path 
          d={STAR_PATH} 
          fill={fillColor}
          clipPath={filled < 1 ? `inset(0 ${(1 - filled) * 100}% 0 0)` : undefined}
        />
      )}
    </Svg>
  );
};

export const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  count, 
  size = 16,
  showCount = true 
}) => {
  const stars = [];
  
  for (let i = 1; i <= 5; i++) {
    let filled = 0;
    if (rating >= i) {
      filled = 1;
    } else if (rating >= i - 0.5) {
      filled = 0.5;
    }
    stars.push(<Star key={i} filled={filled} size={size} />);
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.starsRow}>
        {stars}
      </View>
      {showCount && (
        <Text style={[styles.ratingText, { fontSize: size - 2 }]}>
          {rating > 0 ? rating.toFixed(1) : '—'}
          {count !== undefined && count > 0 && (
            <Text style={styles.countText}> ({count})</Text>
          )}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 1,
  },
  ratingText: {
    fontWeight: '600',
    color: '#374151',
    marginLeft: 4,
  },
  countText: {
    fontWeight: '400',
    color: '#6B7280',
  },
});

export default StarRating;
