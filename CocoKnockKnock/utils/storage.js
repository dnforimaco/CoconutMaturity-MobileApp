import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  SCAN_HISTORY: '@scan_history',
  APP_SETTINGS: '@app_settings',
};

// Scan record structure
export const createScanRecord = (analysisData, customName = '') => {
  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    coconutId: customName || `Coconut-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    status: analysisData.classification || 'unknown',
    confidence: analysisData.confidence || 0,
    location: 'Tree - Position', // Default location, can be updated
    duration: '45s', // Default duration, can be updated
    analysisResult: analysisData.result || '',
    color: analysisData.color || '#666666',
    name: customName || `Scan-${Date.now()}`,
  };
};

// Storage utility functions
export const storage = {
  // Save scan history
  saveScanHistory: async (scanHistory) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SCAN_HISTORY, JSON.stringify(scanHistory));
      return true;
    } catch (error) {
      console.error('Error saving scan history:', error);
      return false;
    }
  },

  // Get scan history
  getScanHistory: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SCAN_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting scan history:', error);
      return [];
    }
  },

  // Add new scan record
  addScanRecord: async (scanRecord) => {
    try {
      const history = await storage.getScanHistory();
      const newHistory = [scanRecord, ...history];
      await storage.saveScanHistory(newHistory);
      return true;
    } catch (error) {
      console.error('Error adding scan record:', error);
      return false;
    }
  },

  // Update scan record
  updateScanRecord: async (recordId, updatedData) => {
    try {
      const history = await storage.getScanHistory();
      const index = history.findIndex(record => record.id === recordId);
      if (index !== -1) {
        history[index] = { ...history[index], ...updatedData };
        await storage.saveScanHistory(history);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating scan record:', error);
      return false;
    }
  },

  // Delete single scan record
  deleteScanRecord: async (recordId) => {
    try {
      const history = await storage.getScanHistory();
      const filteredHistory = history.filter(record => record.id !== recordId);
      await storage.saveScanHistory(filteredHistory);
      return true;
    } catch (error) {
      console.error('Error deleting scan record:', error);
      return false;
    }
  },

  // Delete all scan records
  deleteAllScanRecords: async () => {
    try {
      await storage.saveScanHistory([]);
      return true;
    } catch (error) {
      console.error('Error deleting all scan records:', error);
      return false;
    }
  },

  // Get filtered scan records
  getFilteredScanRecords: async (filter = 'all', dateRange = 'all') => {
    try {
      const history = await storage.getScanHistory();
      let filtered = [...history];

      // Apply status filter
      if (filter !== 'all') {
        filtered = filtered.filter(record => record.status === filter);
      }

      // Apply date range filter
      if (dateRange !== 'all') {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        filtered = filtered.filter(record => {
          const recordDate = new Date(record.timestamp);
          switch (dateRange) {
            case 'today':
              return recordDate >= today;
            case 'week':
              const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
              return recordDate >= weekAgo;
            case 'month':
              const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
              return recordDate >= monthAgo;
            default:
              return true;
          }
        });
      }

      return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      console.error('Error filtering scan records:', error);
      return [];
    }
  },

  // Get scan statistics
  getScanStatistics: async () => {
    try {
      const history = await storage.getScanHistory();
      const stats = {
        total: history.length,
        mature: history.filter(record => record.status === 'mature').length,
        premature: history.filter(record => record.status === 'premature').length,
        overmature: history.filter(record => record.status === 'overmature').length,
        averageConfidence: history.length > 0
          ? Math.round(history.reduce((sum, record) => sum + record.confidence, 0) / history.length)
          : 0,
        todayScans: history.filter(record => {
          const today = new Date();
          const recordDate = new Date(record.timestamp);
          return recordDate.toDateString() === today.toDateString();
        }).length,
      };
      return stats;
    } catch (error) {
      console.error('Error getting scan statistics:', error);
      return {
        total: 0,
        mature: 0,
        premature: 0,
        overmature: 0,
        averageConfidence: 0,
        todayScans: 0,
      };
    }
  },

  // Export data as CSV
  exportAsCSV: async () => {
    try {
      const history = await storage.getScanHistory();
      if (history.length === 0) return '';

      const headers = ['ID', 'Timestamp', 'Coconut ID', 'Status', 'Confidence', 'Location', 'Duration', 'Analysis Result'];
      const csvContent = [
        headers.join(','),
        ...history.map(record => [
          record.id,
          record.timestamp,
          record.coconutId,
          record.status,
          record.confidence,
          record.location,
          record.duration,
          `"${record.analysisResult.replace(/"/g, '""')}"`
        ].join(','))
      ].join('\n');

      return csvContent;
    } catch (error) {
      console.error('Error exporting CSV:', error);
      return '';
    }
  },

  // Export data as JSON
  exportAsJSON: async () => {
    try {
      const history = await storage.getScanHistory();
      return JSON.stringify(history, null, 2);
    } catch (error) {
      console.error('Error exporting JSON:', error);
      return '';
    }
  },

  // Clear all data (for testing/reset)
  clearAllData: async () => {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  },
};

export default storage;
