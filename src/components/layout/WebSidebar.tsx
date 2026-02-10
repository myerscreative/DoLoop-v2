import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, Platform, Pressable, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { DoLoopLogo } from '../native/DoLoopLogo';

import { FOLDER_COLORS } from '../../types/loop';

type FilterType = 'all' | 'manual' | 'daily' | 'weekly';
type SidebarItem = FilterType | 'library' | 'sommelier';

interface WebSidebarProps {
  selectedFilter: FilterType;
  onSelectFilter: (filter: FilterType) => void;
  onNavigateToLibrary: () => void;
  onNavigateToSommelier: () => void;
  onNavigateToSettings: () => void;
  counts: {
    all: number;
    manual: number;
    daily: number;
    weekly: number;
  };
  onCreatePress: () => void;
  activeItem: string;
}

export const WebSidebar: React.FC<WebSidebarProps> = ({
  selectedFilter,
  onSelectFilter,
  onNavigateToLibrary,
  onNavigateToSommelier,
  onNavigateToSettings,
  counts,
  onCreatePress,
  activeItem,
}) => {
  const { colors } = useTheme();
  const [hoveredId, setHoveredId] = useState<SidebarItem | null>(null);
  const ACTIVE_BG = `${colors.primary}20`; // 20% opacity primary

  const isItemActive = (id: SidebarItem) => {
    if (activeItem === id) return true;
    if (selectedFilter === id) return true;
    return false;
  };

  // Helper to get color for item - UNIFIED GOLD BRAND
  const getItemColor = (id: SidebarItem) => {
    // Library uses neutral text color
    if (id === 'library') return colors.text;
    // All other items use gold
    return colors.primary; // #FEC00F
  };

  const NavItem = ({ 
    id, 
    label, 
    iconName, 
    count 
  }: { 
    id: SidebarItem; 
    label: string; 
    iconName: keyof typeof Ionicons.glyphMap; 
    count?: number;
  }) => {
    const active = isItemActive(id);
    const hovered = hoveredId === id;
    const itemColor = getItemColor(id);

    return (
      <Pressable
        style={[
          styles.navItem,
          (active || hovered) && { backgroundColor: `${itemColor}15` } // 15% opacity
        ]}
        onPress={() => {
            if (id === 'library') onNavigateToLibrary();
            else if (id === 'sommelier') onNavigateToSommelier();
            else onSelectFilter(id as FilterType);
        }}
        onHoverIn={() => setHoveredId(id)}
        onHoverOut={() => setHoveredId(null)}
      >
        <View style={styles.navItemContent}>
            <Ionicons 
                name={iconName} 
                size={20} 
                color={itemColor} 
                style={{ opacity: active ? 1 : 0.8 }}
            />
            <Text style={[
                styles.navLabel,
                { color: active ? colors.text : colors.textSecondary, fontWeight: active ? '700' : '500' }
            ]}>
                {label}
            </Text>
        </View>
        {count !== undefined && count > 0 && (
            <Text style={[
              styles.navCount, 
              { color: active ? colors.text : colors.textSecondary }
            ]}>{count}</Text>
        )}
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* DoLoop Branding */}
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <DoLoopLogo size={86} color={colors.text} showText={true} />
      </View>

      {/* Global Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput 
            style={[styles.searchInput, { 
                backgroundColor: colors.surface, 
                color: colors.text 
            }]}
            placeholder="Search recipes..."
            placeholderTextColor={colors.textSecondary}
        />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* ===== SECTION 1: MY LOOPS ===== */}
        <View style={styles.navSection}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>MY LOOPS</Text>
          
          <NavItem id="all" label="All Loops" iconName="apps-outline" count={counts.all} />
          <NavItem id="daily" label="My Day" iconName="sunny-outline" count={counts.daily} />
          <NavItem id="weekly" label="Important" iconName="flag-outline" />
          <NavItem id="manual" label="Planned" iconName="calendar-outline" count={counts.manual} />
        </View>

        {/* ===== SECTION 2: LOOP LIBRARY ===== */}
        <View style={styles.navSection}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>LOOP LIBRARY</Text>
          
          <NavItem id="library" label="My Templates" iconName="bookmark-outline" />
          <NavItem id="library" label="Community" iconName="people-outline" />
          <NavItem id="library" label="Shared Libraries" iconName="share-social-outline" />
          <NavItem id="library" label="Premium" iconName="diamond-outline" />
          
          <NavItem id="sommelier" label="AI Loop Recommender" iconName="sparkles-outline" />
        </View>

        {/* Create Action */}
        <View style={styles.createContainer}>
            <TouchableOpacity 
                style={[styles.createButton, { 
                    backgroundColor: colors.primary,
                    shadowColor: colors.primary 
                }]}
                onPress={onCreatePress}
            >
                <Ionicons name="add" size={24} color={colors.text} />
                <Text style={[styles.createButtonText, { color: colors.text }]}>New Loop</Text>
            </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer Settings */}
      <TouchableOpacity 
        style={styles.settingsButton}
        onPress={onNavigateToSettings}
      >
        <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
        <Text style={[styles.settingsText, { color: colors.textSecondary }]}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  branding: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 0,
    gap: 8,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800', 
    letterSpacing: -0.5,
  },
  searchContainer: {
    marginBottom: 24,
    position: 'relative',
    justifyContent: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  searchInput: {
    width: '100%',
    borderWidth: 0,
    borderRadius: 12,
    paddingVertical: 10,
    paddingLeft: 40,
    paddingRight: 16,
    fontSize: 14,
    outlineStyle: 'none', 
  } as any, 
  navSection: {
    gap: 4,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '600', // Reduced from 700 for lighter appearance
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 4,
    paddingHorizontal: 12,
    textTransform: 'uppercase',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8, // slightly sharper than 12
    marginBottom: 2,
  },
  navItemContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
  },
  navLabel: {
    fontSize: 15,
  },
  navCount: {
    fontSize: 12,
  },
  createContainer: {
    marginTop: 24,
    paddingTop: 16,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14, // taller button
    borderRadius: 12, // match input radius
    gap: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, // reduced opacity
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonText: {
    fontWeight: '700',
    fontSize: 16,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 'auto',
  },
  settingsText: {
      fontSize: 14,
      fontWeight: '500',
  }
});
