import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import {
  getAllRoleAssignments,
  getUserSummary,
  grantAdminRole,
  revokeAdminRole,
  AdminRole,
  AdminRoleAssignment,
} from '../../lib/admin';
import { useTheme } from '../../contexts/ThemeContext';

const ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
  super_admin: 'Full access to everything, including role management',
  moderator: 'Can manage templates, reviews, and users',
  analyst: 'Read-only access to analytics and reports',
  affiliate_manager: 'Can manage affiliates and conversions',
};

const ROLE_COLORS: Record<AdminRole, string> = {
  super_admin: '#ef4444',
  moderator: '#f59e0b',
  analyst: '#3b82f6',
  affiliate_manager: '#10b981',
};

export function AdminRolesScreen() {
  const theme = useTheme();
  const [roles, setRoles] = useState<AdminRoleAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<AdminRole>('moderator');
  const [expiresInDays, setExpiresInDays] = useState('');
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rolesData, usersData] = await Promise.all([
        getAllRoleAssignments(),
        getUserSummary(),
      ]);
      setRoles(rolesData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading roles:', error);
    }
    setLoading(false);
  };

  const handleGrantRole = async () => {
    if (!selectedUserId) {
      if (Platform.OS === 'web') {
        alert('Please select a user');
      } else {
        Alert.alert('Error', 'Please select a user');
      }
      return;
    }

    try {
      let expiresAt: Date | undefined;
      if (expiresInDays) {
        const days = parseInt(expiresInDays);
        if (!isNaN(days) && days > 0) {
          expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + days);
        }
      }

      await grantAdminRole(selectedUserId, selectedRole, expiresAt);
      setShowGrantModal(false);
      setSelectedUserId('');
      setExpiresInDays('');
      await loadData();

      if (Platform.OS === 'web') {
        alert('Role granted successfully');
      } else {
        Alert.alert('Success', 'Role granted successfully');
      }
    } catch (error: any) {
      console.error('Error granting role:', error);
      if (Platform.OS === 'web') {
        alert(`Error: ${error.message}`);
      } else {
        Alert.alert('Error', error.message);
      }
    }
  };

  const handleRevokeRole = async (userId: string, role: AdminRole) => {
    const confirmRevoke = Platform.OS === 'web'
      ? confirm(`Are you sure you want to revoke the ${role} role?`)
      : await new Promise(resolve => {
          Alert.alert(
            'Confirm Revoke',
            `Are you sure you want to revoke the ${role} role?`,
            [
              { text: 'Cancel', onPress: () => resolve(false), style: 'cancel' },
              { text: 'Revoke', onPress: () => resolve(true), style: 'destructive' },
            ]
          );
        });

    if (!confirmRevoke) return;

    try {
      await revokeAdminRole(userId, role);
      await loadData();

      if (Platform.OS === 'web') {
        alert('Role revoked successfully');
      } else {
        Alert.alert('Success', 'Role revoked successfully');
      }
    } catch (error: any) {
      console.error('Error revoking role:', error);
      if (Platform.OS === 'web') {
        alert(`Error: ${error.message}`);
      } else {
        Alert.alert('Error', error.message);
      }
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: 20,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 8,
    },
    headerSubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    toolbar: {
      padding: 12,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    grantButton: {
      padding: 12,
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
    },
    grantButtonText: {
      color: '#fff',
      fontWeight: '600',
    },
    content: {
      flex: 1,
      padding: 16,
    },
    roleCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    roleHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    roleInfo: {
      flex: 1,
    },
    userEmail: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    roleBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      alignSelf: 'flex-start',
      marginBottom: 4,
    },
    roleBadgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#fff',
    },
    roleDetails: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    revokeButton: {
      padding: 8,
      backgroundColor: theme.colors.error + '20',
      borderRadius: 6,
    },
    revokeButtonText: {
      color: theme.colors.error,
      fontSize: 12,
      fontWeight: '600',
    },
    expiredBadge: {
      backgroundColor: theme.colors.textSecondary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      marginTop: 4,
    },
    expiredBadgeText: {
      fontSize: 11,
      color: '#fff',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 24,
      width: '90%',
      maxWidth: 500,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
    },
    picker: {
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 12,
      marginBottom: 16,
    },
    pickerButton: {
      padding: 12,
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 4,
    },
    pickerButtonText: {
      color: theme.colors.text,
    },
    input: {
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 12,
      color: theme.colors.text,
      marginBottom: 16,
    },
    helpText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginBottom: 16,
    },
    modalActions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    modalButton: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    modalButtonCancel: {
      backgroundColor: theme.colors.background,
    },
    modalButtonConfirm: {
      backgroundColor: theme.colors.primary,
    },
    modalButtonText: {
      fontWeight: '600',
    },
    modalButtonTextCancel: {
      color: theme.colors.text,
    },
    modalButtonTextConfirm: {
      color: '#fff',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    emptyText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Role Management</Text>
          <Text style={styles.headerSubtitle}>Manage admin role assignments</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.emptyText, { marginTop: 16 }]}>Loading roles...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Role Management</Text>
        <Text style={styles.headerSubtitle}>
          {roles.length} role{roles.length !== 1 ? 's' : ''} assigned
        </Text>
      </View>

      <View style={styles.toolbar}>
        <Text style={styles.headerSubtitle}>Granular admin permissions</Text>
        <TouchableOpacity style={styles.grantButton} onPress={() => setShowGrantModal(true)}>
          <Text style={styles.grantButtonText}>Grant Role</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {roles.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.emptyText}>No roles assigned yet</Text>
          </View>
        ) : (
          roles.map(assignment => {
            const isExpired = assignment.expires_at && new Date(assignment.expires_at) < new Date();
            return (
              <View key={assignment.id} style={styles.roleCard}>
                <View style={styles.roleHeader}>
                  <View style={styles.roleInfo}>
                    <Text style={styles.userEmail}>{assignment.user_email}</Text>
                    <View style={[styles.roleBadge, { backgroundColor: ROLE_COLORS[assignment.role] }]}>
                      <Text style={styles.roleBadgeText}>{assignment.role}</Text>
                    </View>
                    {isExpired && (
                      <View style={styles.expiredBadge}>
                        <Text style={styles.expiredBadgeText}>EXPIRED</Text>
                      </View>
                    )}
                    <Text style={styles.roleDetails}>
                      Granted: {new Date(assignment.granted_at).toLocaleDateString()}
                    </Text>
                    {assignment.expires_at && (
                      <Text style={styles.roleDetails}>
                        Expires: {new Date(assignment.expires_at).toLocaleDateString()}
                      </Text>
                    )}
                    <Text style={styles.roleDetails}>
                      {ROLE_DESCRIPTIONS[assignment.role]}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.revokeButton}
                    onPress={() => handleRevokeRole(assignment.user_id, assignment.role)}
                  >
                    <Text style={styles.revokeButtonText}>Revoke</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal
        visible={showGrantModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGrantModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Grant Admin Role</Text>

            <Text style={styles.inputLabel}>Select User</Text>
            <ScrollView style={{ maxHeight: 150, marginBottom: 16 }}>
              {users.map(user => (
                <TouchableOpacity
                  key={user.id}
                  style={[
                    styles.pickerButton,
                    selectedUserId === user.id && { borderColor: theme.colors.primary, borderWidth: 2 },
                  ]}
                  onPress={() => setSelectedUserId(user.id)}
                >
                  <Text style={styles.pickerButtonText}>{user.email}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.inputLabel}>Select Role</Text>
            {(['super_admin', 'moderator', 'analyst', 'affiliate_manager'] as AdminRole[]).map(
              role => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.pickerButton,
                    selectedRole === role && { borderColor: ROLE_COLORS[role], borderWidth: 2 },
                  ]}
                  onPress={() => setSelectedRole(role)}
                >
                  <Text style={[styles.pickerButtonText, { fontWeight: '600' }]}>{role}</Text>
                  <Text style={[styles.helpText, { marginBottom: 0 }]}>
                    {ROLE_DESCRIPTIONS[role]}
                  </Text>
                </TouchableOpacity>
              )
            )}

            <Text style={[styles.inputLabel, { marginTop: 16 }]}>Expires In (days)</Text>
            <TextInput
              style={styles.input}
              placeholder="Leave empty for permanent"
              placeholderTextColor={theme.colors.textSecondary}
              value={expiresInDays}
              onChangeText={setExpiresInDays}
              keyboardType="numeric"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowGrantModal(false)}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextCancel]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleGrantRole}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>
                  Grant Role
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
