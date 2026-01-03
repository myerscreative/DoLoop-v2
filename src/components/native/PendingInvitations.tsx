import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import {
  LoopInvitation,
  getMyInvitations,
  acceptInvitation,
  declineInvitation,
} from '../../lib/invitationHelpers';

interface InvitationCardProps {
  invitation: LoopInvitation;
  onAccept: () => void;
  onDecline: () => void;
  accepting: boolean;
  declining: boolean;
}

const InvitationCard: React.FC<InvitationCardProps> = ({
  invitation,
  onAccept,
  onDecline,
  accepting,
  declining,
}) => {
  const { colors } = useTheme();
  const loopName = invitation.loop?.name || 'A Loop';
  const inviterEmail = invitation.inviter?.email || 'Someone';

  return (
    <Animated.View
      entering={SlideInRight.duration(300)}
      exiting={SlideOutLeft.duration(300)}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconCircle, { backgroundColor: invitation.loop?.color || '#FEC00F' }]}>
          <Ionicons name="repeat" size={20} color="#fff" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.loopName}>{loopName}</Text>
          <Text style={styles.inviterText}>
            Invited by {inviterEmail.split('@')[0]}
          </Text>
        </View>
      </View>

      <View style={styles.roleTag}>
        <Ionicons
          name={invitation.role === 'sous-chef' ? 'create-outline' : 'eye-outline'}
          size={14}
          color="#64748b"
        />
        <Text style={styles.roleText}>
          {invitation.role === 'sous-chef' ? 'Sous-Chef' : 'Viewer'}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.declineButton}
          onPress={onDecline}
          disabled={accepting || declining}
        >
          {declining ? (
            <ActivityIndicator size="small" color="#64748b" />
          ) : (
            <Text style={styles.declineButtonText}>Decline</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.acceptButton}
          onPress={onAccept}
          disabled={accepting || declining}
        >
          {accepting ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <>
              <Ionicons name="checkmark" size={18} color="#000" />
              <Text style={styles.acceptButtonText}>Join Loop</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

interface PendingInvitationsProps {
  onInvitationHandled?: () => void;
}

export const PendingInvitations: React.FC<PendingInvitationsProps> = ({
  onInvitationHandled,
}) => {
  const { colors } = useTheme();
  const [invitations, setInvitations] = useState<LoopInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'accept' | 'decline' | null>(null);

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    setLoading(true);
    const data = await getMyInvitations();
    setInvitations(data);
    setLoading(false);
  };

  const handleAccept = async (invitation: LoopInvitation) => {
    setProcessingId(invitation.id);
    setActionType('accept');
    
    const success = await acceptInvitation(invitation.id);
    
    if (success) {
      Alert.alert('Welcome! 🎉', `You've joined "${invitation.loop?.name || 'the loop'}"!`);
      setInvitations(prev => prev.filter(i => i.id !== invitation.id));
      onInvitationHandled?.();
    } else {
      Alert.alert('Error', 'Failed to accept invitation. It may have expired.');
    }
    
    setProcessingId(null);
    setActionType(null);
  };

  const handleDecline = async (invitation: LoopInvitation) => {
    Alert.alert(
      'Decline Invitation',
      `Are you sure you want to decline the invitation to "${invitation.loop?.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            setProcessingId(invitation.id);
            setActionType('decline');
            
            const success = await declineInvitation(invitation.id);
            
            if (success) {
              setInvitations(prev => prev.filter(i => i.id !== invitation.id));
            } else {
              Alert.alert('Error', 'Failed to decline invitation');
            }
            
            setProcessingId(null);
            setActionType(null);
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  if (invitations.length === 0) {
    return null; // Don't show anything if no invitations
  }

  return (
    <Animated.View entering={FadeIn} style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="mail-unread" size={20} color="#FEC00F" />
        <Text style={styles.headerTitle}>Pending Invitations</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{invitations.length}</Text>
        </View>
      </View>

      {invitations.map((invitation) => (
        <InvitationCard
          key={invitation.id}
          invitation={invitation}
          onAccept={() => handleAccept(invitation)}
          onDecline={() => handleDecline(invitation)}
          accepting={processingId === invitation.id && actionType === 'accept'}
          declining={processingId === invitation.id && actionType === 'decline'}
        />
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  badge: {
    backgroundColor: '#FEC00F',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#FEC00F',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  loopName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  inviterText: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginBottom: 16,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  declineButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingVertical: 12,
  },
  declineButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
  acceptButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEC00F',
    borderRadius: 10,
    paddingVertical: 12,
    gap: 6,
  },
  acceptButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
});
