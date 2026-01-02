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

  // Helper to get color for item
  const getItemColor = (id: SidebarItem) => {
    // We need to cast carefully or check existence
    // FOLDER_COLORS keys: personal, work, daily, shared, manual, weekly, goals
    if (id === 'all') return colors.primary;
    if (id === 'library') return colors.text; // Library uses neutral
    if (id === 'sommelier') return colors.primary;
    
    // Check if id is a key in FOLDER_COLORS
    // We know 'daily', 'weekly', 'manual' are valid keys
    return FOLDER_COLORS[id as any] || colors.primary;
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
            <Text style={[styles.navCount, { color: colors.textSecondary }]}>{count}</Text>
        )}
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderRightColor: colors.border }]}>
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
                borderColor: colors.border,
                color: colors.text 
            }]}
            placeholder="Search recipes..."
            placeholderTextColor={colors.textSecondary}
        />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Navigation */}
        <View style={styles.navSection}>
            <NavItem id="all" label="My Loops" iconName="home-outline" count={counts.all} />
            <NavItem id="daily" label="Daily Routine" iconName="sunny-outline" count={counts.daily} />
            <NavItem id="weekly" label="Weekly Goals" iconName="calendar-outline" count={counts.weekly} />
            <NavItem id="manual" label="Checklists" iconName="checkbox-outline" count={counts.manual} />
            
            <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 12, opacity: 0.5 }} />
            
            <NavItem id="library" label="Loop Library" iconName="book-outline" />
            <NavItem id="sommelier" label="AI Recommender" iconName="sparkles-outline" />
        </View>

        {/* Create Action */}
        <View style={[styles.createContainer, { borderTopColor: colors.border }]}>
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
      <TouchableOpacity style={styles.settingsButton}>
        <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
        <Text style={[styles.settingsText, { color: colors.textSecondary }]}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    borderRightWidth: 1,
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
    borderWidth: 1,
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
    borderTopWidth: 1,
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
