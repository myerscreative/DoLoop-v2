import React from 'react';
import Svg, { Path, Circle, Rect, Polygon } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

// Person icon - simple head circle + body shape
export const PersonIcon: React.FC<IconProps> = ({ size = 14, color = '#9ca3af' }) => (
  <Svg width={size} height={size} viewBox="0 0 30 49" fill="none">
    <Circle cx="15" cy="10" r="9" stroke={color} strokeWidth="1.5" fill="none" />
    <Path
      d="M29,34c-.08-7.81-6.43-14.11-14.26-14.11S.59,26,.51,34v14.35h28.53V34Z"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
    />
  </Svg>
);

// Image icon - stacked rectangles with landscape
export const ImageIcon: React.FC<IconProps> = ({ size = 14, color = '#9ca3af' }) => (
  <Svg width={size} height={size} viewBox="0 0 49 33" fill="none">
    <Rect x="0.5" y="0.5" width="43" height="27" rx="2.5" stroke={color} strokeWidth="1" fill="none" />
    <Rect x="5" y="4" width="43" height="27" rx="2.5" stroke={color} strokeWidth="1" fill="none" />
    <Path
      d="M6,31 L18,14 L26,25 L31,20 L43,31"
      stroke={color}
      strokeWidth="1"
      fill="none"
    />
    <Circle cx="34" cy="13" r="3.5" stroke={color} strokeWidth="1" fill="none" />
  </Svg>
);

// Note icon - speech bubble
export const NoteIcon: React.FC<IconProps> = ({ size = 14, color = '#9ca3af' }) => (
  <Svg width={size} height={size} viewBox="0 0 48 40" fill="none">
    <Path
      d="M44,0.5 H3 C1.6,0.5 0.5,1.66 0.5,3 V27 C0.5,28.43 1.66,29.5 3,29.5 H4.5 L7.5,38 L23.5,29.5 H44 C45.43,29.5 46.5,28.34 46.5,27 V3 C46.5,1.57 45.34,0.5 44,0.5 Z"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
    />
  </Svg>
);

// Subtask icon - hierarchical boxes
export const SubtaskIcon: React.FC<IconProps> = ({ size = 14, color = '#9ca3af' }) => (
  <Svg width={size} height={size} viewBox="0 0 46 28" fill="none">
    <Rect x="0.5" y="0.5" width="45" height="9.5" rx="4" stroke={color} strokeWidth="1" fill="none" />
    <Rect x="12" y="17.5" width="33.5" height="9.5" rx="4" stroke={color} strokeWidth="1" fill="none" />
    <Rect x="5.5" y="10" width="2.5" height="13" stroke={color} strokeWidth="1" fill="none" />
    <Rect x="6" y="21" width="13" height="2" stroke={color} strokeWidth="1" fill="none" />
  </Svg>
);

// Chevron/expand icon - simple triangle
export const ChevronIcon: React.FC<IconProps & { direction?: 'up' | 'down' | 'left' | 'right' }> = ({
  size = 14,
  color = '#9ca3af',
  direction = 'right'
}) => {
  const getRotation = () => {
    switch (direction) {
      case 'up': return 'rotate(90 17 20)';
      case 'down': return 'rotate(-90 17 20)';
      case 'left': return 'rotate(180 17 20)';
      case 'right': return 'rotate(0 17 20)';
    }
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 35 40" fill="none">
      <Polygon
        points="1,20 34,39 34,1"
        stroke={color}
        strokeWidth="1"
        fill="none"
        transform={getRotation()}
      />
    </Svg>
  );
};

// Tag icon - price tag shape
export const TagIcon: React.FC<IconProps> = ({ size = 14, color = '#9ca3af' }) => (
  <Svg width={size} height={size} viewBox="0 0 46 42" fill="none">
    <Path
      d="M33,2 L45,20 C46,21.5 45.5,23.5 44,24.5 L20,40 C19.3,40.5 18.4,40.6 17.5,40.4 L3,37 C1.3,36.6 0.2,35 0.5,33.3 L3,18 C3.15,17.1 3.7,16.3 4.5,15.8 L29,1 C30.5,0.05 32.5,0.5 33,2 Z"
      stroke={color}
      strokeWidth="1"
      fill="none"
    />
    <Circle cx="4.5" cy="34" r="2" stroke={color} strokeWidth="1" fill="none" />
  </Svg>
);

// Sync/recurring icon - circular arrows
export const RecurringIcon: React.FC<IconProps> = ({ size = 14, color = '#9ca3af' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 12a8 8 0 0 1 14.5-4.5"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
    />
    <Path
      d="M20 12a8 8 0 0 1-14.5 4.5"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
    />
    <Path
      d="M18.5 3v4.5h-4.5"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M5.5 21v-4.5h4.5"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Calendar icon - simple calendar outline
export const CalendarIcon: React.FC<IconProps> = ({ size = 14, color = '#9ca3af' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
    <Path d="M3 10h18" stroke={color} strokeWidth="1.5" />
    <Path d="M8 2v4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Path d="M16 2v4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

// Alarm/reminder icon - simple bell outline
export const ReminderIcon: React.FC<IconProps> = ({ size = 14, color = '#9ca3af' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C8 2 5 5 5 9v5l-2 2v1h18v-1l-2-2V9c0-4-3-7-7-7z"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
      strokeLinejoin="round"
    />
    <Path
      d="M9 19c0 1.5 1.5 3 3 3s3-1.5 3-3"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
    />
  </Svg>
);

// Plus icon - simple plus
export const PlusIcon: React.FC<IconProps> = ({ size = 14, color = '#9ca3af' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5v14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Path d="M5 12h14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

// Close/X icon
export const CloseIcon: React.FC<IconProps> = ({ size = 14, color = '#9ca3af' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 6l12 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Path d="M18 6L6 18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

// Checkmark icon
export const CheckIcon: React.FC<IconProps> = ({ size = 14, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 12l5 5 9-9"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);
