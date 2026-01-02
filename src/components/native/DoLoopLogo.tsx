import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface DoLoopLogoProps {
  size?: number;
  color?: string;
  showText?: boolean;
}

/**
 * DoLoop Logo Component - Native Implementation
 */
export const DoLoopLogo: React.FC<DoLoopLogoProps> = ({ 
  size = 120,
}) => {
  const logoWidth = size;
  const logoHeight = size * 0.93;

  // Fallback for native - just show a placeholder for now
  return (
    <View style={styles.container}>
      <View style={{
        width: logoWidth,
        height: logoHeight,
        backgroundColor: '#EFB810',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
