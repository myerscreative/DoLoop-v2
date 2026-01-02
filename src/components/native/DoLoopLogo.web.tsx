import React from 'react';
import { Image } from 'react-native';

interface DoLoopLogoProps {
  size?: number;
  color?: string;
  showText?: boolean;
}

/**
 * DoLoop Logo Component - Web Implementation
 */
export const DoLoopLogo: React.FC<DoLoopLogoProps> = ({ 
  size = 120,
}) => {
  const logoWidth = size;
  const logoHeight = size * 0.93;

  return (
    <Image
      source={{ uri: '/doloop-logo-custom.png' }}
      style={{
        width: logoWidth,
        height: logoHeight,
      }}
      resizeMode="contain"
      accessible={true}
      accessibilityLabel="DoLoop Logo"
    />
  );
};
