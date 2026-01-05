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

  // Don't render if no meaningful data
  if (!authorName && !sourceTitle && !endGoalDescription) {
    return null;
  }

  const handleSourcePress = () => {
    if (sourceLink) {
      Linking.openURL(sourceLink);
    }
  };

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Check if we have a long bio worth expanding
  const hasLongBio = authorBio && authorBio.length > 150;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.header}>About this Recipe</Text>
        {isGenerating && (
          <View style={styles.generatingBadge}>
            <ActivityIndicator size="small" color="#FFB800" />
            <Text style={styles.generatingText}>Generating...</Text>
          </View>
        )}
      </View>

      {/* 1. ABOUT THIS LOOP - End Goal */}
      {endGoalDescription && (
        <View style={styles.goalContainer}>
          <Text style={styles.sectionLabel}>🎯 About this Loop</Text>
          <Text style={styles.goalText}>{endGoalDescription}</Text>
        </View>
      )}

      {/* 2. ABOUT THE SOURCE */}
      {sourceTitle && (
        <View style={styles.sourceContainer}>
          <Text style={styles.sectionLabel}>📖 About the Source</Text>
          <TouchableOpacity onPress={handleSourcePress} disabled={!sourceLink}>
            <Text style={[styles.sourceTitle, sourceLink && styles.sourceLink]}>
              {sourceTitle}
            </Text>
          </TouchableOpacity>
          {sourceLink && (
            <Text style={styles.sourceLinkHint}>Tap to learn more</Text>
          )}
        </View>
      )}

      {/* 3. ABOUT THE AUTHOR */}
      {authorName && (
        <View style={styles.authorSection}>
          <Text style={styles.sectionLabel}>👤 About the Author</Text>
          
          <View style={styles.authorRow}>
            {/* Avatar */}
            {authorImageUrl ? (
              <Image source={{ uri: authorImageUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>{getInitials(authorName)}</Text>
              </View>
            )}
            <Text style={styles.authorName}>{authorName}</Text>
          </View>

          {/* Short bio preview or full short bio */}
          {!hasLongBio && authorBio && (
            <Text style={styles.shortBio}>{authorBio}</Text>
          )}

          {/* Read the Story Toggle for long bios */}
          {hasLongBio && (
            <>
              <TouchableOpacity onPress={toggleExpanded} style={styles.toggleButton}>
                <Text style={styles.toggleText}>
                  {isExpanded ? 'Hide the Story' : 'Read the Story'}
                </Text>
                <Ionicons 
                  name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                  size={16} 
                  color="#FFB800" 
                />
              </TouchableOpacity>

              {/* Expandable Bio Section */}
              {isExpanded && (
                <View style={styles.bioContainer}>
                  <Text style={styles.bioText}>{authorBio}</Text>
                </View>
              )}
            </>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
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
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  // 1. Goal Section
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
  // 2. Source Section
  sourceContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 16,
  },
  sourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  sourceLink: {
    color: '#FFB800',
    textDecorationLine: 'underline',
  },
  sourceLinkHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  // 3. Author Section
  authorSection: {
    paddingTop: 4,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFB800',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarInitials: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  shortBio: {
    fontSize: 14,
    lineHeight: 22,
    color: '#4B5563',
  },
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
});

export default LoopProvenance;
