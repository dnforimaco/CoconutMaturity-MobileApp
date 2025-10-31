import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';

const ScanHistoryContext = createContext();

export const useScanHistory = () => {
  const context = useContext(ScanHistoryContext);
  if (!context) {
    throw new Error('useScanHistory must be used within a ScanHistoryProvider');
  }
  return context;
};

export const ScanHistoryProvider = ({ children }) => {
  const [scanHistory, setScanHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadScanHistory = async () => {
    try {
      setIsLoading(true);
      const history = await storage.getScanHistory();
      setScanHistory(history);
    } catch (error) {
      console.error('Error loading scan history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addScanRecord = async (scanRecord) => {
    try {
      const success = await storage.addScanRecord(scanRecord);
      if (success) {
        await loadScanHistory(); // Reload to ensure consistency
      }
      return success;
    } catch (error) {
      console.error('Error adding scan record:', error);
      return false;
    }
  };

  const updateScanRecord = async (recordId, updatedData) => {
    try {
      const success = await storage.updateScanRecord(recordId, updatedData);
      if (success) {
        await loadScanHistory();
      }
      return success;
    } catch (error) {
      console.error('Error updating scan record:', error);
      return false;
    }
  };

  const deleteScanRecord = async (recordId) => {
    try {
      const success = await storage.deleteScanRecord(recordId);
      if (success) {
        await loadScanHistory();
      }
      return success;
    } catch (error) {
      console.error('Error deleting scan record:', error);
      return false;
    }
  };

  const deleteAllScanRecords = async () => {
    try {
      const success = await storage.deleteAllScanRecords();
      if (success) {
        await loadScanHistory();
      }
      return success;
    } catch (error) {
      console.error('Error deleting all scan records:', error);
      return false;
    }
  };

  const getFilteredScanRecords = async (filter = 'all', dateRange = 'all') => {
    try {
      return await storage.getFilteredScanRecords(filter, dateRange);
    } catch (error) {
      console.error('Error filtering scan records:', error);
      return [];
    }
  };

  const getScanStatistics = async () => {
    try {
      return await storage.getScanStatistics();
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
  };

  useEffect(() => {
    loadScanHistory();
  }, []);

  const value = {
    scanHistory,
    isLoading,
    loadScanHistory,
    addScanRecord,
    updateScanRecord,
    deleteScanRecord,
    deleteAllScanRecords,
    getFilteredScanRecords,
    getScanStatistics,
  };

  return (
    <ScanHistoryContext.Provider value={value}>
      {children}
    </ScanHistoryContext.Provider>
  );
};
