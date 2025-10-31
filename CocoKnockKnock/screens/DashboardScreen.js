
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, useWindowDimensions, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { storage } from '../utils/storage';
import { useFocusEffect } from '@react-navigation/native';
import { useScanHistory } from '../contexts/ScanHistoryContext';

// Modern Color Palette
const colors = {
  primary: '#4CAF50',
  primaryDark: '#388E3C',
  primaryLight: '#81C784',
  secondary: '#2196F3',
  secondaryDark: '#1976D2',
  accent: '#FF9800',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  background: '#F8FFF8',
  surface: '#FFFFFF',
  surfaceVariant: '#F1F8E9',
  onPrimary: '#FFFFFF',
  onSecondary: '#FFFFFF',
  onBackground: '#1C1B1F',
  onSurface: '#1C1B1F',
  onSurfaceVariant: '#49454F',
  outline: '#79747E',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

// Responsive utility functions
const getResponsiveFontSize = (baseSize, width, height) => {
  const baseWidth = 375;
  const baseHeight = 667; // iPhone 6/7/8 height
  const scaleFactor = Math.min(width / baseWidth, height / baseHeight);
  return Math.round(baseSize * Math.min(scaleFactor, 1.4) * Math.max(scaleFactor, 0.8));
};

const getResponsivePadding = (basePadding, width, height) => {
  const baseWidth = 375;
  const baseHeight = 667;
  const scaleFactor = Math.min(width / baseWidth, height / baseHeight);
  return Math.round(basePadding * Math.min(scaleFactor, 1.3) * Math.max(scaleFactor, 0.85));
};

const DashboardScreen = () => {
  const { width, height } = useWindowDimensions();
  const headerFontSize = getResponsiveFontSize(28, width, height);
  const subtitleFontSize = getResponsiveFontSize(16, width, height);
  const sectionTitleSize = getResponsiveFontSize(24, width, height);
  const headerPadding = getResponsivePadding(32, width, height);

  const { scanHistory, getScanStatistics } = useScanHistory();

  // State for real data
  const [stats, setStats] = useState({
    total: 0,
    mature: 0,
    premature: 0,
    overmature: 0,
    averageConfidence: 0,
    todayScans: 0,
  });
  const [recentScan, setRecentScan] = useState(null);
  const [weeklyData, setWeeklyData] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [0, 0, 0, 0, 0, 0, 0],
      color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
      strokeWidth: 2,
    }],
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load dashboard data on component mount and when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Load statistics
      const statistics = await getScanStatistics();
      setStats(statistics);

      // Load recent scan
      if (scanHistory.length > 0) {
        setRecentScan(scanHistory[0]);
      }

      // Generate weekly data
      await generateWeeklyData();

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateWeeklyData = async () => {
    try {
      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const today = new Date();
      const weeklyCounts = [0, 0, 0, 0, 0, 0, 0];

      // Count scans for each day of the week
      scanHistory.forEach(scan => {
        const scanDate = new Date(scan.timestamp);
        const dayOfWeek = scanDate.getDay();
        weeklyCounts[dayOfWeek]++;
      });

      setWeeklyData({
        labels: daysOfWeek,
        datasets: [{
          data: weeklyCounts,
          color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          strokeWidth: 2,
        }],
      });
    } catch (error) {
      console.error('Error generating weekly data:', error);
    }
  };

  // Generate maturity data for pie chart
  const maturityData = [
    {
      name: 'Premature',
      count: stats.premature,
      color: '#FF6B6B',
      legendFontColor: colors.onSurface,
      legendFontSize: 14,
    },
    {
      name: 'Mature',
      count: stats.mature,
      color: '#4ECDC4',
      legendFontColor: colors.onSurface,
      legendFontSize: 14,
    },
    {
      name: 'Overmature',
      count: stats.overmature,
      color: '#45B7D1',
      legendFontColor: colors.onSurface,
      legendFontSize: 14,
    },
  ];

  const chartConfig = {
    backgroundColor: colors.surface,
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    labelColor: (opacity = 1) => colors.onSurfaceVariant,
    style: {
      borderRadius: 16,
    },
    propsForLabels: {
      fontSize: 12,
      fontWeight: '600',
    },
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={[styles.header, { padding: headerPadding }]}>
        <Text style={[styles.headerTitle, { fontSize: headerFontSize }]}>CocoKnockKnock Dashboard</Text>
        <Text style={[styles.headerSubtitle, { fontSize: subtitleFontSize }]}>Welcome back!</Text>
      </View>

      {/* Quick Stats Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { fontSize: sectionTitleSize }]}>Quick Stats</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={loadDashboardData}>
            <Ionicons name="refresh" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Today's Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.statNumber}>{stats.todayScans}</Text>
          <Text style={styles.statLabel}>Today's Scans</Text>
        </View>

        {/* Charts Container */}
        <View style={styles.chartsContainer}>
          {/* Maturity Classifications Pie Chart */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Maturity Distribution</Text>
            <PieChart
              data={maturityData}
              width={width - 40}
              height={220}
              chartConfig={chartConfig}
              accessor="count"
              backgroundColor="transparent"
              paddingLeft="15"
              center={[10, 10]}
              style={styles.chart}
            />
          </View>

          {/* Weekly Scan Data Bar Chart */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Last 7 Days Activity</Text>
            <BarChart
              data={weeklyData}
              width={width - 40}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              showValuesOnTopOfBars
              withHorizontalLabels={true}
              withVerticalLabels={true}
              withInnerLines={false}
              withOuterLines={false}
            />
          </View>
        </View>
      </View>

      {/* Most Recent Detection Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { fontSize: sectionTitleSize }]}>Most Recent Detection</Text>
        {isLoading ? (
          <View style={styles.loadingCard}>
            <Ionicons name="refresh" size={48} color={colors.primary} />
            <Text style={styles.loadingText}>Loading dashboard data...</Text>
          </View>
        ) : recentScan ? (
          <View style={styles.detectionCard}>
            <View style={styles.detectionHeader}>
              <Ionicons name="leaf" size={24} color={recentScan.color || colors.primary} />
              <Text style={styles.detectionTitle}>{recentScan.coconutId}</Text>
              <Text style={styles.detectionTime}>
                {new Date(recentScan.timestamp).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.detectionDetails}>
              <Text style={styles.detectionText}>
                Status: <Text style={[styles.statusText, { color: recentScan.color || colors.primary }]}>
                  {recentScan.status}
                </Text>
              </Text>
              <Text style={styles.detectionText}>Confidence: {recentScan.confidence}%</Text>
              <Text style={styles.detectionText}>Location: {recentScan.location}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.detectionCard}>
            <View style={styles.detectionHeader}>
              <Ionicons name="document-text-outline" size={24} color={colors.onSurfaceVariant} />
              <Text style={styles.detectionTitle}>No scans yet</Text>
              <Text style={styles.detectionTime}>Start scanning</Text>
            </View>
            <View style={styles.detectionDetails}>
              <Text style={styles.detectionText}>No recent coconut scans available</Text>
              <Text style={styles.detectionText}>Use the Control screen to perform your first scan</Text>
            </View>
          </View>
        )}
      </View>


    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    padding: 32,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.onPrimary,
    marginBottom: 8,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.onPrimary,
    opacity: 0.9,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  section: {
    marginHorizontal: 20,
    marginVertical: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.onBackground,
    letterSpacing: 0.5,
  },
  refreshButton: {
    padding: 10,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary + '30',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.outline + '15',
  },
  chartsContainer: {
    gap: 24,
  },
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.outline + '15',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: colors.surface,
    width: '48%',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.outline + '15',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  statLabel: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  detectionCard: {
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.outline + '15',
  },
  detectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.onSurface,
    marginLeft: 16,
    flex: 1,
    letterSpacing: 0.3,
  },
  detectionTime: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    fontWeight: '500',
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  detectionDetails: {
    marginTop: 16,
    backgroundColor: colors.surfaceVariant,
    padding: 16,
    borderRadius: 16,
  },
  detectionText: {
    fontSize: 15,
    color: colors.onSurfaceVariant,
    marginBottom: 8,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  statusMature: {
    color: colors.primary,
    fontWeight: '700',
  },
  statusText: {
    fontWeight: '700',
  },
  loadingCard: {
    backgroundColor: colors.surface,
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.outline + '15',
  },
  loadingText: {
    fontSize: 16,
    color: colors.primary,
    marginTop: 16,
    fontWeight: '500',
    letterSpacing: 0.3,
    textAlign: 'center',
  },

});

export default DashboardScreen;
