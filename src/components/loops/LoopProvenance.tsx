import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Linking, TouchableOpacity, Platform, ActivityIndicator, LayoutAnimation, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface LoopProvenanceProps {
  authorName?: string;
  authorBio?: string;
  authorImageUrl?: string;
  sourceTitle?: string;
  sourceLink?: string;
  endGoalDescription?: string;
  isGenerating?: boolean;
}

export const LoopProvenance: React.FC<LoopProvenanceProps> = ({
  authorName,
  authorBio,
  authorImageUrl,
  sourceTitle,
  sourceLink,
  endGoalDescription,
  isGenerating = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine if we have any data to show
  const hasData = authorName || sourceTitle || endGoalDescription;

  if (!hasData && !isGenerating) {
    return null;
  }

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const handleSourcePress = () => {
    if (sourceLink) {
      Linking.openURL(sourceLink);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header - Clickable to toggle */}
      <TouchableOpacity 
        style={styles.headerRow} 
        onPress={toggleExpanded}
        activeOpacity={0.7}
      >
        <Text style={styles.header}>About this Loop</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {isGenerating && (
                <View style={styles.generatingBadge}>
                    <ActivityIndicator size="small" color="#FFB800" />
                    <Text style={styles.generatingText}>Generating...</Text>
                </View>
            )}
            <Ionicons 
                name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color="#64748b" 
            />
        </View>
      </TouchableOpacity>

      {/* Expanded Content */}
      {isExpanded && (
          <View style={styles.content}>
            {/* Author & Source Row - Single Line */}
            <View style={styles.metaRow}>
                {authorName && (
                <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Author:</Text>
                    <Text style={styles.metaValue}>{authorName}</Text>
                </View>
                )}
                {sourceTitle && (
                <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Source:</Text>
                    <TouchableOpacity onPress={handleSourcePress} disabled={!sourceLink}>
                    <Text style={[styles.metaValue, sourceLink && styles.sourceLink]}>
                        {sourceTitle}
                    </Text>
                    </TouchableOpacity>
                </View>
                )}
            </View>

            {/* About this Loop - End Goal */}
            {endGoalDescription && (
                <View style={styles.goalContainer}>
                <Text style={styles.goalText}>{endGoalDescription}</Text>
                </View>
            )}

            {/* Bio */}
            {authorBio && (
                <View style={styles.bioContainer}>
                <Text style={styles.bioText}>{authorBio}</Text>
                </View>
            )}
          </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    marginTop: 24,
    marginHorizontal: Platform.OS === 'web' ? 0 : 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    maxWidth: Platform.OS === 'web' ? 600 : undefined,
  },
  content: {
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  header: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  generatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  generatingText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  // Meta Row (Author & Source on one line)
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  sourceLink: {
    color: '#FFB800',
    textDecorationLine: 'underline',
  },
  // Goal Section
  goalContainer: {
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#8B4513',
    marginBottom: 16,
  },
  goalText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#8B4513',
  },
  // Toggle
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFB800',
  },
  // Bio
  bioContainer: {
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#FFB800',
  },
  bioText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#4B5563',
    fontFamily: Platform.OS === 'web' ? 'system-ui, -apple-system, sans-serif' : undefined,
  },
  shortBio: {
    fontSize: 14,
    lineHeight: 22,
    color: '#4B5563',
  },
});

export default LoopProvenance;
