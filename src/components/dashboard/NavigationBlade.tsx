import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { DoLoopLogo } from '../native/DoLoopLogo';

type FilterType = 'all' | 'manual' | 'daily' | 'weekly';

interface NavigationBladeProps {
  selectedFilter: FilterType;
  onSelectFilter: (filter: FilterType) => void;
  onCreatePress: () => void;
  counts: {
    all: number;
    manual: number;
    daily: number;
    weekly: number;
  };
}

interface NavItemConfig {
  id: FilterType;
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
}

const NAV_ITEMS: NavItemConfig[] = [
  { id: 'all', label: 'All Loops', iconName: 'apps-outline' },
  { id: 'daily', label: 'My Day', iconName: 'sunny-outline' },
  { id: 'weekly', label: 'Important', iconName: 'flag-outline' },
  { id: 'manual', label: 'Planned', iconName: 'calendar-outline' },
];

/**
 * NavigationBlade - 80px slim icon-only sidebar for Command Center layout
 * Features glassmorphic backdrop, gold active states, and hover tooltips
 */
export const NavigationBlade: React.FC<NavigationBladeProps> = ({
  selectedFilter,
  onSelectFilter,
  onCreatePress,
  counts,
}) => {
  const { colors } = useTheme();
  const [hoveredId, setHoveredId] = useState<FilterType | 'create' | null>(null);

  const NavIconButton = ({ item }: { item: NavItemConfig }) => {
    const isActive = selectedFilter === item.id;
    const isHovered = hoveredId === item.id;
    const count = counts[item.id];

    return (
      <View style={styles.itemContainer}>
        <TouchableOpacity
          style={[
            styles.iconButton,
            isActive && {
              backgroundColor: colors.primary,
              shadowColor: colors.goldGlow,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.6,
              shadowRadius: 12,
              elevation: 8,
            },
          ]}
          onPress={() => onSelectFilter(item.id)}
          onMouseEnter={() => setHoveredId(item.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          <Ionicons
            name={item.iconName}
            size={24}
            color={isActive ? colors.text : colors.primary}
            style={{ opacity: isActive ? 1 : 0.8 }}
          />
          {count > 0 && !isActive && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.badgeText, { color: colors.text }]}>
                {count > 99 ? '99+' : count}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Tooltip on hover - Web only */}
        {Platform.OS === 'web' && isHovered && (
          <View style={[styles.tooltip, { backgroundColor: colors.glassBackdrop }]}>
            <Text style={[styles.tooltipText, { color: colors.text }]}>{item.label}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.glassSurface }]}>
      {/* Glassmorphic backdrop blur - web only */}
      {Platform.OS === 'web' && <View style={styles.backdropBlur as any} />}

      {/* DoLoop Logo Icon */}
      <View style={styles.logoContainer}>
        <DoLoopLogo size={48} color={colors.primary} showText={false} />
      </View>

      {/* Navigation Icons */}
      <View style={styles.navItems}>
        {NAV_ITEMS.map((item) => (
          <NavIconButton key={item.id} item={item} />
        ))}
      </View>

      {/* Create Button at Bottom */}
      <View style={styles.createContainer}>
        <TouchableOpacity
          style={[
            styles.createButton,
            {
              backgroundColor: colors.primary,
              shadowColor: colors.goldGlow,
            },
          ]}
          onPress={onCreatePress}
          onMouseEnter={() => setHoveredId('create')}
          onMouseLeave={() => setHoveredId(null)}
        >
          <Ionicons name="add" size={28} color={colors.text} />
        </TouchableOpacity>

        {/* Tooltip for Create button */}
        {Platform.OS === 'web' && hoveredId === 'create' && (
          <View style={[styles.tooltip, { backgroundColor: colors.glassBackdrop }]}>
            <Text style={[styles.tooltipText, { color: colors.text }]}>New Loop</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 80,
    height: '100%',
    paddingVertical: 20,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  backdropBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      } as any,
    }),
    zIndex: -1,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  navItems: {
    flex: 1,
    gap: 16,
  },
  itemContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  iconButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...Platform.select({
      web: {
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      } as any,
    }),
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  createContainer: {
    alignItems: 'center',
    marginTop: 16,
    position: 'relative',
  },
  createButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    ...Platform.select({
      web: {
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      } as any,
    }),
  },
  tooltip: {
    position: 'absolute',
    left: 72,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    zIndex: 1000,
    ...Platform.select({
      web: {
        whiteSpace: 'nowrap',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      } as any,
    }),
  },
  tooltipText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
