import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path, Line, Rect, Polygon } from 'react-native-svg';

export type IconName =
  | 'grid'
  | 'sun'
  | 'flag'
  | 'calendar'
  | 'bookmark'
  | 'users'
  | 'share'
  | 'star'
  | 'sparkles'
  | 'sliders'
  | 'search'
  | 'plus'
  | 'settings'
  | 'user'
  | 'chevron-down'
  | 'chevron-up'
  | 'chevron-left'
  | 'chevron-right'
  | 'check'
  | 'x'
  | 'more-vertical';

interface CustomIconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const CustomIcon: React.FC<CustomIconProps> = ({
  name,
  size = 20,
  color = '#666',
  strokeWidth = 2,
}) => {
  const renderIcon = () => {
    switch (name) {
      // Grid (9 dots in 3x3)
      case 'grid':
        return (
          <>
            <Circle cx="5" cy="5" r="2" fill={color} />
            <Circle cx="12" cy="5" r="2" fill={color} />
            <Circle cx="19" cy="5" r="2" fill={color} />
            <Circle cx="5" cy="12" r="2" fill={color} />
            <Circle cx="12" cy="12" r="2" fill={color} />
            <Circle cx="19" cy="12" r="2" fill={color} />
            <Circle cx="5" cy="19" r="2" fill={color} />
            <Circle cx="12" cy="19" r="2" fill={color} />
            <Circle cx="19" cy="19" r="2" fill={color} />
          </>
        );

      // Sun/Sunrise
      case 'sun':
        return (
          <>
            <Circle cx="12" cy="12" r="4" stroke={color} strokeWidth={strokeWidth} fill="none" />
            <Path d="M12 2v2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Path d="M12 20v2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Path d="m4.93 4.93 1.41 1.41" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Path d="m17.66 17.66 1.41 1.41" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Path d="M2 12h2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Path d="M20 12h2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Path d="m6.34 17.66-1.41 1.41" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Path d="m19.07 4.93-1.41 1.41" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          </>
        );

      // Flag
      case 'flag':
        return (
          <>
            <Path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <Line x1="4" y1="22" x2="4" y2="15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          </>
        );

      // Calendar
      case 'calendar':
        return (
          <>
            <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke={color} strokeWidth={strokeWidth} fill="none" />
            <Line x1="16" y1="2" x2="16" y2="6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Line x1="8" y1="2" x2="8" y2="6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Line x1="3" y1="10" x2="21" y2="10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          </>
        );

      // Bookmark
      case 'bookmark':
        return (
          <Path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        );

      // Users/People
      case 'users':
        return (
          <>
            <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth={strokeWidth} fill="none" />
            <Path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M16 3.13a4 4 0 0 1 0 7.75" stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );

      // Share/Network
      case 'share':
        return (
          <>
            <Circle cx="18" cy="5" r="3" stroke={color} strokeWidth={strokeWidth} fill="none" />
            <Circle cx="6" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} fill="none" />
            <Circle cx="18" cy="19" r="3" stroke={color} strokeWidth={strokeWidth} fill="none" />
            <Line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          </>
        );

      // Star
      case 'star':
        return (
          <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        );

      // Sparkles (NOT a wand - just sparkles)
      case 'sparkles':
        return (
          <>
            <Path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M19 13l.75 2.25L22 16l-2.25.75L19 19l-.75-2.25L16 16l2.25-.75z" stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M5 19l.75 2.25L8 22l-2.25.75L5 25l-.75-2.25L2 22l2.25-.75z" stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );

      // Sliders/Settings
      case 'sliders':
        return (
          <>
            <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} fill="none" />
            <Path d="M12 1v6m0 6v10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Path d="m4.93 4.93 4.24 4.24m5.66 5.66 4.24 4.24" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Path d="M1 12h6m6 0h10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Path d="m4.93 19.07 4.24-4.24m5.66-5.66 4.24-4.24" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          </>
        );

      // Search
      case 'search':
        return (
          <>
            <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth={strokeWidth} fill="none" />
            <Path d="m21 21-4.35-4.35" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          </>
        );

      // Plus
      case 'plus':
        return (
          <>
            <Line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          </>
        );

      // Settings (gear alternative)
      case 'settings':
        return (
          <>
            <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} fill="none" />
            <Path d="M12 1v6m0 6v10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Path d="m4.93 4.93 4.24 4.24m5.66 5.66 4.24 4.24" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Path d="M1 12h6m6 0h10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Path d="m4.93 19.07 4.24-4.24m5.66-5.66 4.24-4.24" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          </>
        );

      // User (single person)
      case 'user':
        return (
          <>
            <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth={strokeWidth} fill="none" />
          </>
        );

      // Chevrons
      case 'chevron-down':
        return <Path d="m6 9 6 6 6-6" stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
      
      case 'chevron-up':
        return <Path d="m18 15-6-6-6 6" stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
      
      case 'chevron-left':
        return <Path d="m15 18-6-6 6-6" stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
      
      case 'chevron-right':
        return <Path d="m9 18 6-6-6-6" stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />;

      // Check
      case 'check':
        return <Path d="M20 6 9 17l-5-5" stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />;

      // X/Close
      case 'x':
        return (
          <>
            <Line x1="18" y1="6" x2="6" y2="18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Line x1="6" y1="6" x2="18" y2="18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          </>
        );

      // More Vertical (3 dots)
      case 'more-vertical':
        return (
          <>
            <Circle cx="12" cy="12" r="1" fill={color} />
            <Circle cx="12" cy="5" r="1" fill={color} />
            <Circle cx="12" cy="19" r="1" fill={color} />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        {renderIcon()}
      </Svg>
    </View>
  );
};
