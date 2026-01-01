import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { getAuditLogs, exportAuditLogsToCSV, downloadCSV, AuditLog } from '../../lib/admin';
import { useTheme } from '../../contexts/ThemeContext';

export function AdminAuditLogsScreen() {
  const theme = useTheme();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState<string>('');
  const [filterResource, setFilterResource] = useState<string>('');

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [searchQuery, filterAction, filterResource, logs]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await getAuditLogs({ limit: 500 });
      setLogs(data);
      setFilteredLogs(data);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    }
    setLoading(false);
  };

  const filterLogs = () => {
    let filtered = logs;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        log =>
          log.user_email?.toLowerCase().includes(query) ||
          log.action.toLowerCase().includes(query) ||
          log.resource_type.toLowerCase().includes(query)
      );
    }

    if (filterAction) {
      filtered = filtered.filter(log => log.action === filterAction);
    }

    if (filterResource) {
      filtered = filtered.filter(log => log.resource_type === filterResource);
    }

    setFilteredLogs(filtered);
  };

  const handleExport = async () => {
    try {
      const csv = await exportAuditLogsToCSV({ limit: 1000 });
      downloadCSV(csv, `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      console.error('Error exporting audit logs:', error);
    }
  };

  const uniqueActions = Array.from(new Set(logs.map(l => l.action))).sort();
  const uniqueResources = Array.from(new Set(logs.map(l => l.resource_type))).sort();

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
      ...Platform.select({
        web: { position: 'sticky' as any, top: 0, zIndex: 10 },
      }),
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
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      gap: 8,
    },
    searchInput: {
      flex: 1,
      padding: 10,
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      color: theme.colors.text,
    },
    filterButton: {
      padding: 10,
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      minWidth: 80,
      alignItems: 'center',
    },
    filterButtonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 14,
    },
    exportButton: {
      padding: 10,
      backgroundColor: theme.colors.success,
      borderRadius: 8,
      minWidth: 80,
      alignItems: 'center',
    },
    filters: {
      flexDirection: 'row',
      gap: 8,
      padding: 12,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      flexWrap: 'wrap',
    },
    filterChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: theme.colors.background,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    filterChipActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    filterChipText: {
      fontSize: 12,
      color: theme.colors.text,
    },
    filterChipTextActive: {
      color: '#fff',
    },
    content: {
      flex: 1,
    },
    table: {
      ...Platform.select({
        web: {
          minWidth: '100%',
        },
      }),
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      padding: 12,
      borderBottomWidth: 2,
      borderBottomColor: theme.colors.border,
      ...Platform.select({
        web: { position: 'sticky' as any, top: 0, zIndex: 5 },
      }),
    },
    tableHeaderCell: {
      flex: 1,
      fontWeight: '600',
      color: theme.colors.text,
      fontSize: 14,
    },
    tableRow: {
      flexDirection: 'row',
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    tableCell: {
      flex: 1,
      fontSize: 13,
      color: theme.colors.text,
    },
    timestamp: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    actionBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: theme.colors.primary + '20',
      borderRadius: 4,
      alignSelf: 'flex-start',
    },
    actionBadgeText: {
      fontSize: 11,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    emptyContainer: {
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
          <Text style={styles.headerTitle}>Audit Logs</Text>
          <Text style={styles.headerSubtitle}>Track all admin actions</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.emptyText, { marginTop: 16 }]}>Loading audit logs...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Audit Logs</Text>
        <Text style={styles.headerSubtitle}>
          {filteredLogs.length} of {logs.length} logs
        </Text>
      </View>

      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by user, action, or resource..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
          <Text style={styles.filterButtonText}>Export</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        <Text style={[styles.tableHeaderCell, { flex: 0, marginRight: 8 }]}>Actions:</Text>
        <TouchableOpacity
          style={[styles.filterChip, !filterAction && styles.filterChipActive]}
          onPress={() => setFilterAction('')}
        >
          <Text style={[styles.filterChipText, !filterAction && styles.filterChipTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        {uniqueActions.slice(0, 5).map(action => (
          <TouchableOpacity
            key={action}
            style={[styles.filterChip, filterAction === action && styles.filterChipActive]}
            onPress={() => setFilterAction(filterAction === action ? '' : action)}
          >
            <Text
              style={[
                styles.filterChipText,
                filterAction === action && styles.filterChipTextActive,
              ]}
            >
              {action}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {filteredLogs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No audit logs found</Text>
          </View>
        ) : (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Timestamp</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>User</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Action</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Resource</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Resource ID</Text>
            </View>
            {filteredLogs.map(log => (
              <View key={log.id} style={styles.tableRow}>
                <View style={{ flex: 1.5 }}>
                  <Text style={styles.timestamp}>
                    {new Date(log.created_at).toLocaleString()}
                  </Text>
                </View>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>
                  {log.user_email || 'System'}
                </Text>
                <View style={{ flex: 1 }}>
                  <View style={styles.actionBadge}>
                    <Text style={styles.actionBadgeText}>{log.action}</Text>
                  </View>
                </View>
                <Text style={[styles.tableCell, { flex: 1 }]}>{log.resource_type}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]} numberOfLines={1}>
                  {log.resource_id?.substring(0, 8) || '-'}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
