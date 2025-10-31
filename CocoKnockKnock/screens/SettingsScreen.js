
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, TextInput, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

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

const SettingsScreen = () => {
  const { width, height } = useWindowDimensions();
  const { user, logout } = useAuth();
  const [storageLimit, setStorageLimit] = useState('1000');
  const [autoPurge, setAutoPurge] = useState('30');

  // Responsive values
  const sectionTitleSize = getResponsiveFontSize(22, width, height);
  const sectionMargin = getResponsivePadding(20, width, height);
  const sectionPadding = getResponsivePadding(24, width, height);

  // Utility function to truncate long emails
  const truncateEmail = (email, maxLength = 20) => {
    if (!email) return 'N/A';
    if (email.length <= maxLength) return email;
    return email.substring(0, maxLength - 3) + '...';
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          }
        }
      ]
    );
  };

  const handleChangePassword = () => {
    Alert.alert('Change Password', 'Password change functionality would be implemented here.');
  };

  const handleExportAll = () => {
    Alert.alert(
      'Export All Data',
      'This will export all your scan data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: () => console.log('Export all data') }
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => console.log('Clear cache') }
      ]
    );
  };

  const handleContactSupport = () => {
    Alert.alert('Contact Support', 'Support contact information would be displayed here.');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Account Section */}
      <View style={[styles.section, { margin: sectionMargin, padding: sectionPadding }]}>
        <Text style={[styles.sectionTitle, { fontSize: sectionTitleSize }]}>Account</Text>

        <View style={styles.infoGroup}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{user?.name || 'Guest User'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{truncateEmail(user?.email) || 'guest@example.com'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Account Type</Text>
            <Text style={styles.infoValue}>{user?.isGuest ? 'Guest' : 'Registered'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Login Time</Text>
            <Text style={styles.infoValue}>
              {user?.loginTime ? new Date(user.loginTime).toLocaleString() : 'N/A'}
            </Text>
          </View>
        </View>

        {!user?.isGuest && (
          <TouchableOpacity style={styles.settingButton} onPress={handleChangePassword}>
            <Ionicons name="key" size={16} color="#007AFF" />
            <Text style={[styles.settingButtonText, styles.settingButtonTextPrimary]}>Change Password</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.settingButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={16} color="#F44336" />
          <Text style={[styles.settingButtonText, styles.settingButtonTextDanger]}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Data Section */}
      <View style={[styles.section, { margin: sectionMargin, padding: sectionPadding }]}>
        <Text style={[styles.sectionTitle, { fontSize: sectionTitleSize }]}>Data Management</Text>

        <View style={styles.settingGroup}>
          <Text style={styles.settingLabel}>Storage Limit (MB)</Text>
          <TextInput
            style={styles.textInput}
            value={storageLimit}
            onChangeText={setStorageLimit}
            placeholder="1000"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.settingGroup}>
          <Text style={styles.settingLabel}>Auto-purge after (days)</Text>
          <TextInput
            style={styles.textInput}
            value={autoPurge}
            onChangeText={setAutoPurge}
            placeholder="30"
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity style={styles.settingButton} onPress={handleExportAll}>
          <Ionicons name="download" size={16} color="#007AFF" />
          <Text style={[styles.settingButtonText, styles.settingButtonTextPrimary]}>Export All Data</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingButton} onPress={handleClearCache}>
          <Ionicons name="trash" size={16} color="#F44336" />
          <Text style={[styles.settingButtonText, styles.settingButtonTextDanger]}>Clear Cache</Text>
        </TouchableOpacity>
      </View>

      {/* About Section */}
      <View style={[styles.section, { margin: sectionMargin, padding: sectionPadding }]}>
        <Text style={[styles.sectionTitle, { fontSize: sectionTitleSize }]}>About</Text>

        <View style={styles.infoGroup}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>App Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Robot Firmware</Text>
            <Text style={styles.infoValue}>2.1.3</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Camera Module</Text>
            <Text style={styles.infoValue}>1.4.2</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Audio Module</Text>
            <Text style={styles.infoValue}>1.2.1</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.settingButton} onPress={handleContactSupport}>
          <Ionicons name="mail" size={16} color="#007AFF" />
          <Text style={[styles.settingButtonText, styles.settingButtonTextPrimary]}>Contact Support</Text>
        </TouchableOpacity>

        <View style={styles.licensesContainer}>
          <Text style={styles.licensesTitle}>Licenses & Acknowledgments</Text>
          <TouchableOpacity style={styles.licenseItem}>
            <Text style={styles.licenseText}>React Native</Text>
            <Ionicons name="chevron-forward" size={16} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.licenseItem}>
            <Text style={styles.licenseText}>Expo</Text>
            <Ionicons name="chevron-forward" size={16} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.licenseItem}>
            <Text style={styles.licenseText}>Open Source Licenses</Text>
            <Ionicons name="chevron-forward" size={16} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
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
  settingGroup: {
    marginBottom: 24,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.onSurface,
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  textInput: {
    borderWidth: 2,
    borderColor: colors.primary + '30',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    backgroundColor: colors.surfaceVariant,
    color: colors.onSurface,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.outline + '15',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingButtonText: {
    fontSize: 16,
    color: colors.onSurface,
    marginLeft: 16,
    flex: 1,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  settingButtonTextPrimary: {
    color: colors.primary,
  },
  settingButtonTextDanger: {
    color: colors.error,
  },
  infoGroup: {
    marginBottom: 20,
    backgroundColor: colors.surfaceVariant,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.outline + '15',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.outline + '20',
  },
  infoLabel: {
    fontSize: 15,
    color: colors.onSurfaceVariant,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
    letterSpacing: 0.3,
  },
  licensesContainer: {
    marginTop: 16,
    backgroundColor: colors.surfaceVariant,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.outline + '15',
  },
  licensesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.onSurface,
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  licenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.outline + '20',
  },
  licenseText: {
    fontSize: 15,
    color: colors.onSurfaceVariant,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});

export default SettingsScreen;
