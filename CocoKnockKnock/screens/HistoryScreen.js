
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { storage } from '../utils/storage';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
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

const HistoryScreen = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [filteredHistory, setFilteredHistory] = useState([]);

  const { scanHistory, isLoading, loadScanHistory, deleteScanRecord, deleteAllScanRecords, getFilteredScanRecords } = useScanHistory();

  // Filter history when filters change
  useEffect(() => {
    filterHistory();
  }, [selectedFilter, dateRange, scanHistory]);

  const filterHistory = async () => {
    try {
      const filtered = await getFilteredScanRecords(selectedFilter, dateRange);
      setFilteredHistory(filtered);
    } catch (error) {
      console.error('Error filtering history:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Mature': return '#4CAF50';
      case 'Premature': return '#FF9800';
      case 'Overmature': return '#F44336';
      default: return '#666';
    }
  };

  const handleDeleteItem = async (id) => {
    Alert.alert(
      'Delete Scan Record',
      'Are you sure you want to delete this scan record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deleteScanRecord(id);
              if (success) {
                Alert.alert('Success', 'Scan record deleted successfully');
              } else {
                Alert.alert('Error', 'Failed to delete scan record');
              }
            } catch (error) {
              console.error('Error deleting scan record:', error);
              Alert.alert('Error', 'Failed to delete scan record');
            }
          }
        }
      ]
    );
  };

  const handleDeleteAll = async () => {
    Alert.alert(
      'Delete All Records',
      'Are you sure you want to delete all scan records? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deleteAllScanRecords();
              if (success) {
                Alert.alert('Success', 'All scan records deleted successfully');
              } else {
                Alert.alert('Error', 'Failed to delete all scan records');
              }
            } catch (error) {
              console.error('Error deleting all scan records:', error);
              Alert.alert('Error', 'Failed to delete all scan records');
            }
          }
        }
      ]
    );
  };

  const handleExportData = async () => {
    Alert.alert(
      'Export Data',
      'Choose export format:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export as CSV', onPress: () => exportAsCSV() },
        { text: 'Export as JSON', onPress: () => exportAsJSON() }
      ]
    );
  };

  const exportAsCSV = async () => {
    try {
      const csvData = await storage.exportAsCSV();
      if (csvData) {
        const fileName = `coconut_scans_${new Date().toISOString().split('T')[0]}.csv`;
        const filePath = `${FileSystem.documentDirectory}${fileName}`;

        await FileSystem.writeAsStringAsync(filePath, csvData);

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(filePath, {
            mimeType: 'text/csv',
            dialogTitle: 'Export Coconut Scan Data',
          });
        } else {
          Alert.alert('Success', `CSV file saved to: ${filePath}`);
        }
      } else {
        Alert.alert('No Data', 'No scan records available to export');
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      Alert.alert('Error', 'Failed to export CSV file');
    }
  };

  const exportAsJSON = async () => {
    try {
      const jsonData = await storage.exportAsJSON();
      if (jsonData) {
        const fileName = `coconut_scans_${new Date().toISOString().split('T')[0]}.json`;
        const filePath = `${FileSystem.documentDirectory}${fileName}`;

        await FileSystem.writeAsStringAsync(filePath, jsonData);

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(filePath, {
            mimeType: 'application/json',
            dialogTitle: 'Export Coconut Scan Data',
          });
        } else {
          Alert.alert('Success', `JSON file saved to: ${filePath}`);
        }
      } else {
        Alert.alert('No Data', 'No scan records available to export');
      }
    } catch (error) {
      console.error('Error exporting JSON:', error);
      Alert.alert('Error', 'Failed to export JSON file');
    }
  };

  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyHeader}>
        <View style={styles.historyMain}>
          <Text style={styles.coconutId}>{item.coconutId}</Text>
          <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
        <TouchableOpacity onPress={() => handleDeleteItem(item.id)}>
          <Ionicons name="trash" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
      <View style={styles.historyDetails}>
        <Text style={styles.detailText}>Time: {item.timestamp}</Text>
        <Text style={styles.detailText}>Confidence: {item.confidence}%</Text>
        <Text style={styles.detailText}>Location: {item.location}</Text>
        <Text style={styles.detailText}>Duration: {item.duration}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Filters Section - Fixed header */}
      <View style={styles.filtersSection}>
        <Text style={styles.sectionTitle}>Filters</Text>
        <View style={styles.filtersContainer}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Date Range</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={dateRange}
                onValueChange={setDateRange}
                style={styles.picker}
              >
                <Picker.Item label="Today" value="today" />
                <Picker.Item label="Last 7 days" value="week" />
                <Picker.Item label="Last 30 days" value="month" />
                <Picker.Item label="All time" value="all" />
              </Picker>
            </View>
          </View>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Class</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedFilter}
                onValueChange={setSelectedFilter}
                style={styles.picker}
              >
                <Picker.Item label="All" value="all" />
                <Picker.Item label="Mature" value="mature" />
                <Picker.Item label="Premature" value="premature" />
                <Picker.Item label="Overmature" value="overmature" />
              </Picker>
            </View>
          </View>
        </View>
      </View>

      {/* List Section with integrated header */}
      <View style={styles.listContainer}>
        <FlatList
          data={filteredHistory}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            isLoading ? (
              <View style={styles.loadingContainer}>
                <Ionicons name="refresh" size={48} color={colors.primary} />
                <Text style={styles.loadingText}>Loading scan history...</Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={48} color={colors.onSurfaceVariant} />
                <Text style={styles.emptyText}>No scan records found</Text>
              </View>
            )
          }
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <View style={styles.headerLeft}>
                <Text style={styles.sectionTitle}>Scan History</Text>
                <TouchableOpacity style={styles.refreshButton} onPress={loadScanHistory}>
                  <Ionicons name="refresh" size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
              <View style={styles.listActions}>
                <TouchableOpacity style={styles.exportButton} onPress={handleExportData}>
                  <Ionicons name="download" size={16} color={colors.primary} />
                  <Text style={styles.exportText}>Export</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteAllButton} onPress={handleDeleteAll}>
                  <Ionicons name="trash" size={16} color={colors.error} />
                  <Text style={styles.deleteAllText}>Delete All</Text>
                </TouchableOpacity>
              </View>
            </View>
          }
          contentContainerStyle={styles.listContentContainer}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filtersSection: {
    margin: 20,
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.outline + '15',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  filtersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterGroup: {
    flex: 1,
    marginHorizontal: 8,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.onSurface,
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  pickerContainer: {
    borderWidth: 2,
    borderColor: colors.primary + '30',
    borderRadius: 16,
    backgroundColor: colors.surfaceVariant,
  },
  picker: {
    height: 50,
    color: colors.onSurface,
    fontWeight: '500',
  },
  listContainer: {
    flex: 1,
    backgroundColor: colors.surface,
    margin: 20,
    marginTop: 0,
    borderRadius: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.outline + '15',
  },
  listContentContainer: {
    padding: 24,
    paddingTop: 0,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    marginLeft: 12,
    padding: 8,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  listActions: {
    flexDirection: 'row',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.primary + '30',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  exportText: {
    marginLeft: 6,
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  deleteAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error + '15',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error + '30',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deleteAllText: {
    marginLeft: 6,
    fontSize: 14,
    color: colors.error,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  historyItem: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.outline + '15',
    marginVertical: 6,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coconutId: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
    marginRight: 16,
    letterSpacing: 0.3,
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
  },
  historyDetails: {
    marginTop: 12,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
  },
  detailText: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginBottom: 6,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  separator: {
    height: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
  },
  emptyText: {
    fontSize: 18,
    color: colors.onSurfaceVariant,
    marginTop: 16,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
  },
  loadingText: {
    fontSize: 16,
    color: colors.primary,
    marginTop: 16,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});

export default HistoryScreen;
