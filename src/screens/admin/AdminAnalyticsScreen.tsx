import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { getAdminDashboardStats, getTemplatePerformance, DashboardStats } from '../../lib/admin';
import { useTheme } from '../../contexts/ThemeContext';

export function AdminAnalyticsScreen() {
  const theme = useTheme();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, templatesData] = await Promise.all([
        getAdminDashboardStats(),
        getTemplatePerformance(),
      ]);
      setStats(statsData);
      setTemplates(templatesData.slice(0, 10)); // Top 10
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
    setLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const calculatePercentage = (value: number, total: number) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
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
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    statCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      flex: 1,
      minWidth: 150,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    statValue: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    chartContainer: {
      marginVertical: 12,
    },
    barChart: {
      marginTop: 8,
    },
    barItem: {
      marginBottom: 12,
    },
    barLabel: {
      fontSize: 13,
      color: theme.colors.text,
      marginBottom: 4,
    },
    barWrapper: {
      height: 24,
      backgroundColor: theme.colors.background,
      borderRadius: 4,
      overflow: 'hidden',
    },
    barFill: {
      height: '100%',
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      paddingHorizontal: 8,
    },
    barValue: {
      fontSize: 11,
      color: '#fff',
      fontWeight: '600',
    },
    conversionCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    conversionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    conversionLabel: {
      fontSize: 14,
      color: theme.colors.text,
    },
    conversionValue: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.primary,
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

  if (loading || !stats) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Analytics</Text>
          <Text style={styles.headerSubtitle}>Platform insights and metrics</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.emptyText, { marginTop: 16 }]}>Loading analytics...</Text>
        </View>
      </View>
    );
  }

  const maxUses = Math.max(...templates.map(t => t.total_uses), 1);
  const conversionRate = stats.total_affiliate_clicks > 0
    ? ((stats.total_conversions / stats.total_affiliate_clicks) * 100).toFixed(1)
    : '0.0';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <Text style={styles.headerSubtitle}>Platform insights and metrics</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.total_users.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.new_users_30d.toLocaleString()}</Text>
              <Text style={styles.statLabel}>New Users (30d)</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.total_loops.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Loops</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.total_templates.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Templates</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Affiliate Performance</Text>
          <View style={styles.conversionCard}>
            <View style={styles.conversionRow}>
              <Text style={styles.conversionLabel}>Total Clicks</Text>
              <Text style={styles.conversionValue}>
                {stats.total_affiliate_clicks.toLocaleString()}
              </Text>
            </View>
            <View style={styles.conversionRow}>
              <Text style={styles.conversionLabel}>Conversions</Text>
              <Text style={styles.conversionValue}>
                {stats.total_conversions.toLocaleString()}
              </Text>
            </View>
            <View style={styles.conversionRow}>
              <Text style={styles.conversionLabel}>Conversion Rate</Text>
              <Text style={styles.conversionValue}>{conversionRate}%</Text>
            </View>
            <View style={[styles.conversionRow, { marginBottom: 0, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.border }]}>
              <Text style={[styles.conversionLabel, { fontWeight: '600' }]}>Total Revenue</Text>
              <Text style={[styles.conversionValue, { fontSize: 20, color: theme.colors.success }]}>
                {formatCurrency(stats.total_revenue)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Templates by Usage</Text>
          <View style={styles.chartContainer}>
            <View style={styles.barChart}>
              {templates.map((template, index) => (
                <View key={template.id} style={styles.barItem}>
                  <Text style={styles.barLabel} numberOfLines={1}>
                    {index + 1}. {template.title}
                  </Text>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${(template.total_uses / maxUses) * 100}%`,
                          minWidth: template.total_uses > 0 ? 40 : 0,
                        },
                      ]}
                    >
                      <Text style={styles.barValue}>{template.total_uses}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Template Performance</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {templates.reduce((sum, t) => sum + t.total_uses, 0).toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Total Template Uses</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {(templates.reduce((sum, t) => sum + t.average_rating, 0) / templates.length).toFixed(1)}
              </Text>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {templates.reduce((sum, t) => sum + t.review_count, 0).toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Total Reviews</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {formatCurrency(
                  templates.reduce((sum, t) => sum + parseFloat(t.affiliate_revenue || 0), 0)
                )}
              </Text>
              <Text style={styles.statLabel}>Template Revenue</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
