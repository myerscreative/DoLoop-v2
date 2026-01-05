import React from 'react';
import { View, Text, Image, StyleSheet, Linking, TouchableOpacity, Platform } from 'react-native';

interface LoopProvenanceProps {
  authorName?: string;
  authorBio?: string;
  authorImageUrl?: string;
  sourceTitle?: string;
  sourceLink?: string;
  endGoalDescription?: string;
}

export const LoopProvenance: React.FC<LoopProvenanceProps> = ({
  authorName,
  authorBio,
  authorImageUrl,
  sourceTitle,
  sourceLink,
  endGoalDescription,
}) => {
  // Don't render if no meaningful data
  if (!authorName && !sourceTitle && !endGoalDescription) {
    return null;
  }

  const handleSourcePress = () => {
    if (sourceLink) {
      Linking.openURL(sourceLink);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>About this Recipe</Text>

      {/* Author Row */}
      {(authorName || sourceTitle) && (
        <View style={styles.authorRow}>
          {/* Avatar */}
          {authorImageUrl ? (
            <Image source={{ uri: authorImageUrl }} style={styles.avatar} />
          ) : authorName ? (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>{getInitials(authorName)}</Text>
            </View>
          ) : null}

          {/* Author Info */}
          <View style={styles.authorInfo}>
            {authorName && (
              <Text style={styles.authorName}>{authorName}</Text>
            )}
            {sourceTitle && (
              <TouchableOpacity 
                onPress={handleSourcePress} 
                disabled={!sourceLink}
                activeOpacity={sourceLink ? 0.7 : 1}
              >
                <Text style={[styles.sourceTitle, sourceLink && styles.sourceTitleLink]}>
                  {sourceLink ? `📖 ${sourceTitle}` : `📖 ${sourceTitle}`}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Bio */}
      {authorBio && (
        <Text style={styles.bio}>{authorBio}</Text>
      )}

      {/* End Goal */}
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
  header: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEC00F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarInitials: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  sourceTitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  sourceTitleLink: {
    color: '#2563EB',
    textDecorationLine: 'underline',
  },
  bio: {
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
    borderColor: '#FDE68A',
  },
  goalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 6,
  },
  goalText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#78350F',
  },
});

export default LoopProvenance;
