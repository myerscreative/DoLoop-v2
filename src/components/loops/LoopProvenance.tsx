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

      {/* Subtitle: By Author • From Source */}
      {(authorName || sourceTitle) && (
        <View style={styles.subtitleRow}>
          {/* Avatar */}
          {authorImageUrl ? (
            <Image source={{ uri: authorImageUrl }} style={styles.avatar} />
          ) : authorName ? (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>{getInitials(authorName)}</Text>
            </View>
          ) : null}

          <View style={styles.subtitleTextContainer}>
            <Text style={styles.subtitle}>
              {authorName && <Text style={styles.authorName}>By {authorName}</Text>}
              {authorName && sourceTitle && <Text style={styles.subtitleSeparator}> • </Text>}
              {sourceTitle && (
                <TouchableOpacity onPress={handleSourcePress} disabled={!sourceLink}>
                  <Text style={[styles.sourceText, sourceLink && styles.sourceLink]}>
                    From "{sourceTitle}"
                  </Text>
                </TouchableOpacity>
              )}
            </Text>
          </View>
        </View>
      )}

      {/* Read the Story Toggle */}
      {hasLongBio && (
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
      )}

      {/* Expandable Bio Section */}
      {isExpanded && authorBio && (
        <View style={styles.bioContainer}>
          <Text style={styles.bioText}>{authorBio}</Text>
        </View>
      )}

      {/* Short bio if not expandable */}
      {!hasLongBio && authorBio && (
        <Text style={styles.shortBio}>{authorBio}</Text>
      )}

      {/* End Goal - Always Visible */}
      {endGoalDescription && (
        <View style={styles.goalContainer}>
          <Text style={styles.goalLabel}>🎯 End Goal</Text>
          <Text style={styles.goalText}>{endGoalDescription}</Text>
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
    marginBottom: 16,
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
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
  subtitleTextContainer: {
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    flexWrap: 'wrap',
  },
  authorName: {
    fontWeight: '600',
    color: '#374151',
  },
  subtitleSeparator: {
    color: '#9CA3AF',
  },
  sourceText: {
    color: '#6B7280',
  },
  sourceLink: {
    color: '#FFB800',
    textDecorationLine: 'underline',
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
    marginBottom: 16,
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
    marginBottom: 16,
  },
  goalContainer: {
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#8B4513',
  },
  goalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 6,
  },
  goalText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#8B4513',
  },
});

export default LoopProvenance;
