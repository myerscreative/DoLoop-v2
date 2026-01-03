import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LoopMemberProfile, getInitials, getAvatarColor } from '../../lib/profileHelpers';

interface MemberAvatarsProps {
  members: LoopMemberProfile[];
  maxVisible?: number;
  size?: number;
  onPress?: () => void;
}

export const MemberAvatars: React.FC<MemberAvatarsProps> = ({
  members,
  maxVisible = 3,
  size = 32,
  onPress,
}) => {
  if (members.length === 0) return null;

  const visibleMembers = members.slice(0, maxVisible);
  const overflow = members.length - maxVisible;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      {visibleMembers.map((member, index) => (
        <View
          key={member.user_id}
          style={[
            styles.avatar,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: member.avatar_url ? '#ddd' : getAvatarColor(member.user_id),
              marginLeft: index > 0 ? -size / 3 : 0,
              zIndex: maxVisible - index,
            },
          ]}
        >
          {member.avatar_url ? (
            // Image would go here when avatar uploads are supported
            <Text style={[styles.initials, { fontSize: size * 0.4 }]}>
              {getInitials(member.display_name)}
            </Text>
          ) : (
            <Text style={[styles.initials, { fontSize: size * 0.4 }]}>
              {getInitials(member.display_name)}
            </Text>
          )}
        </View>
      ))}
      
      {overflow > 0 && (
        <View
          style={[
            styles.avatar,
            styles.overflowBadge,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              marginLeft: -size / 3,
            },
          ]}
        >
          <Text style={[styles.overflowText, { fontSize: size * 0.35 }]}>
            +{overflow}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// Member List Modal Component
interface MemberListModalProps {
  visible: boolean;
  onClose: () => void;
  members: LoopMemberProfile[];
  loopName: string;
}

export const MemberListModal: React.FC<MemberListModalProps> = ({
  visible,
  onClose,
  members,
  loopName,
}) => {
  const renderMember = ({ item }: { item: LoopMemberProfile }) => (
    <View style={styles.memberRow}>
      <View
        style={[
          styles.memberAvatar,
          { backgroundColor: getAvatarColor(item.user_id) },
        ]}
      >
        <Text style={styles.memberInitials}>
          {getInitials(item.display_name)}
        </Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>
          {item.display_name || 'Unknown'}
        </Text>
        <Text style={styles.memberRole}>
          {item.role === 'owner' ? '👑 Owner' : 
           item.role === 'sous-chef' ? '🍳 Sous-Chef' : '👁️ Viewer'}
        </Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Loop Members</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.loopNameText}>"{loopName}"</Text>
          
          <FlatList
            data={members}
            renderItem={renderMember}
            keyExtractor={(item) => item.user_id}
            style={styles.memberList}
            showsVerticalScrollIndicator={false}
          />
          
          <Text style={styles.memberCount}>
            {members.length} member{members.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  initials: {
    color: '#fff',
    fontWeight: '700',
  },
  overflowBadge: {
    backgroundColor: '#64748b',
  },
  overflowText: {
    color: '#fff',
    fontWeight: '700',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  closeButton: {
    padding: 4,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  loopNameText: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  memberList: {
    flexGrow: 0,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memberInitials: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  memberRole: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  memberCount: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 16,
  },
});
