import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Switch,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import {
  getWebhookConfigurations,
  createWebhookConfiguration,
  updateWebhookConfiguration,
  deleteWebhookConfiguration,
  getNotificationPreferences,
  updateNotificationPreferences,
  WebhookConfiguration,
} from '../../lib/admin';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';

export function AdminSettingsScreen() {
  const theme = useTheme();
  const [webhooks, setWebhooks] = useState<WebhookConfiguration[]>([]);
  const [notificationPrefs, setNotificationPrefs] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfiguration | null>(null);

  // Webhook form state
  const [webhookName, setWebhookName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [webhookEvents, setWebhookEvents] = useState<string[]>(['template_published']);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [webhooksData, prefsData] = await Promise.all([
        getWebhookConfigurations(),
        getNotificationPreferences(user.id),
      ]);

      setWebhooks(webhooksData);
      setNotificationPrefs(prefsData || {
        notify_new_user: true,
        notify_new_template: true,
        notify_new_review: true,
        notify_affiliate_conversion: true,
        notify_system_alerts: true,
        notify_ab_test_complete: true,
        email_digest_frequency: 'daily',
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    }
    setLoading(false);
  };

  const handleToggleNotification = async (key: string, value: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const updated = { ...notificationPrefs, [key]: value };
      await updateNotificationPreferences(user.id, updated);
      setNotificationPrefs(updated);
    } catch (error) {
      console.error('Error updating notification preferences:', error);
    }
  };

  const handleCreateWebhook = async () => {
    if (!webhookName || !webhookUrl) {
      if (Platform.OS === 'web') {
        alert('Please fill in all required fields');
      } else {
        Alert.alert('Error', 'Please fill in all required fields');
      }
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (editingWebhook) {
        await updateWebhookConfiguration(editingWebhook.id, {
          name: webhookName,
          url: webhookUrl,
          secret: webhookSecret || null,
          events: webhookEvents,
        });
      } else {
        await createWebhookConfiguration({
          name: webhookName,
          url: webhookUrl,
          secret: webhookSecret || null,
          events: webhookEvents,
          active: true,
          retry_attempts: 3,
          timeout_seconds: 30,
          created_by: user.id,
        });
      }

      setShowWebhookModal(false);
      resetWebhookForm();
      await loadData();

      if (Platform.OS === 'web') {
        alert('Webhook saved successfully');
      } else {
        Alert.alert('Success', 'Webhook saved successfully');
      }
    } catch (error: any) {
      console.error('Error saving webhook:', error);
      if (Platform.OS === 'web') {
        alert(`Error: ${error.message}`);
      } else {
        Alert.alert('Error', error.message);
      }
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    const confirm = Platform.OS === 'web'
      ? window.confirm('Are you sure you want to delete this webhook?')
      : await new Promise(resolve => {
          Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this webhook?',
            [
              { text: 'Cancel', onPress: () => resolve(false), style: 'cancel' },
              { text: 'Delete', onPress: () => resolve(true), style: 'destructive' },
            ]
          );
        });

    if (!confirm) return;

    try {
      await deleteWebhookConfiguration(id);
      await loadData();

      if (Platform.OS === 'web') {
        alert('Webhook deleted successfully');
      } else {
        Alert.alert('Success', 'Webhook deleted successfully');
      }
    } catch (error: any) {
      console.error('Error deleting webhook:', error);
    }
  };

  const handleEditWebhook = (webhook: WebhookConfiguration) => {
    setEditingWebhook(webhook);
    setWebhookName(webhook.name);
    setWebhookUrl(webhook.url);
    setWebhookSecret(webhook.secret || '');
    setWebhookEvents(webhook.events);
    setShowWebhookModal(true);
  };

  const resetWebhookForm = () => {
    setEditingWebhook(null);
    setWebhookName('');
    setWebhookUrl('');
    setWebhookSecret('');
    setWebhookEvents(['template_published']);
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
    content: {
      flex: 1,
    },
    section: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 16,
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
    },
    settingLabel: {
      fontSize: 15,
      color: theme.colors.text,
      flex: 1,
    },
    webhookCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    webhookHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    webhookName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    webhookUrl: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginBottom: 8,
    },
    webhookEvents: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    webhookActions: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 12,
    },
    webhookButton: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 6,
      borderWidth: 1,
    },
    addButton: {
      padding: 16,
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 8,
    },
    addButtonText: {
      color: '#fff',
      fontWeight: '600',
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
      maxHeight: '80%',
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
    input: {
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 12,
      color: theme.colors.text,
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
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>Manage system settings</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.emptyText, { marginTop: 16 }]}>Loading settings...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Manage system settings</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email Notifications</Text>
          {notificationPrefs && (
            <>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>New User Signups</Text>
                <Switch
                  value={notificationPrefs.notify_new_user}
                  onValueChange={v => handleToggleNotification('notify_new_user', v)}
                  trackColor={{ true: theme.colors.primary }}
                />
              </View>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>New Template Created</Text>
                <Switch
                  value={notificationPrefs.notify_new_template}
                  onValueChange={v => handleToggleNotification('notify_new_template', v)}
                  trackColor={{ true: theme.colors.primary }}
                />
              </View>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>New Review Posted</Text>
                <Switch
                  value={notificationPrefs.notify_new_review}
                  onValueChange={v => handleToggleNotification('notify_new_review', v)}
                  trackColor={{ true: theme.colors.primary }}
                />
              </View>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Affiliate Conversion</Text>
                <Switch
                  value={notificationPrefs.notify_affiliate_conversion}
                  onValueChange={v => handleToggleNotification('notify_affiliate_conversion', v)}
                  trackColor={{ true: theme.colors.primary }}
                />
              </View>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>System Alerts</Text>
                <Switch
                  value={notificationPrefs.notify_system_alerts}
                  onValueChange={v => handleToggleNotification('notify_system_alerts', v)}
                  trackColor={{ true: theme.colors.primary }}
                />
              </View>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>A/B Test Completed</Text>
                <Switch
                  value={notificationPrefs.notify_ab_test_complete}
                  onValueChange={v => handleToggleNotification('notify_ab_test_complete', v)}
                  trackColor={{ true: theme.colors.primary }}
                />
              </View>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Webhooks</Text>
          <Text style={[styles.headerSubtitle, { marginBottom: 16 }]}>
            Configure webhooks to receive real-time notifications
          </Text>

          {webhooks.map(webhook => (
            <View key={webhook.id} style={styles.webhookCard}>
              <View style={styles.webhookHeader}>
                <Text style={styles.webhookName}>{webhook.name}</Text>
                <Text style={[styles.webhookEvents, { color: webhook.active ? theme.colors.success : theme.colors.textSecondary }]}>
                  {webhook.active ? 'Active' : 'Inactive'}
                </Text>
              </View>
              <Text style={styles.webhookUrl}>{webhook.url}</Text>
              <Text style={styles.webhookEvents}>
                Events: {webhook.events.join(', ')}
              </Text>
              <View style={styles.webhookActions}>
                <TouchableOpacity
                  style={[styles.webhookButton, { borderColor: theme.colors.primary }]}
                  onPress={() => handleEditWebhook(webhook)}
                >
                  <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: '600' }}>
                    Edit
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.webhookButton, { borderColor: theme.colors.error }]}
                  onPress={() => handleDeleteWebhook(webhook.id)}
                >
                  <Text style={{ color: theme.colors.error, fontSize: 12, fontWeight: '600' }}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              resetWebhookForm();
              setShowWebhookModal(true);
            }}
          >
            <Text style={styles.addButtonText}>Add Webhook</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showWebhookModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWebhookModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {editingWebhook ? 'Edit Webhook' : 'Add Webhook'}
              </Text>

              <Text style={styles.inputLabel}>Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Webhook name"
                placeholderTextColor={theme.colors.textSecondary}
                value={webhookName}
                onChangeText={setWebhookName}
              />

              <Text style={styles.inputLabel}>URL *</Text>
              <TextInput
                style={styles.input}
                placeholder="https://example.com/webhook"
                placeholderTextColor={theme.colors.textSecondary}
                value={webhookUrl}
                onChangeText={setWebhookUrl}
              />

              <Text style={styles.inputLabel}>Secret (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Webhook secret for signature verification"
                placeholderTextColor={theme.colors.textSecondary}
                value={webhookSecret}
                onChangeText={setWebhookSecret}
                secureTextEntry
              />

              <Text style={styles.inputLabel}>Events</Text>
              <TextInput
                style={styles.input}
                placeholder="template_published, user_created"
                placeholderTextColor={theme.colors.textSecondary}
                value={webhookEvents.join(', ')}
                onChangeText={text => setWebhookEvents(text.split(',').map(e => e.trim()))}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => setShowWebhookModal(false)}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextCancel]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm]}
                  onPress={handleCreateWebhook}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>
                    {editingWebhook ? 'Update' : 'Create'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
