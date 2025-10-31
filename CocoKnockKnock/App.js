
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator, useWindowDimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

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

// Import contexts and screens
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ScanHistoryProvider } from './contexts/ScanHistoryContext';
import LoginScreen from './screens/LoginScreen';
import CreateAccountScreen from './screens/CreateAccountScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import DashboardScreen from './screens/DashboardScreen';
import ControlScreen from './screens/ControlScreen';
import HistoryScreen from './screens/HistoryScreen';
import SettingsScreen from './screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Responsive utility functions
const getResponsiveTabBarHeight = (width, height) => {
  // Base height for standard phones (375px width, 667px height)
  const baseHeight = 90;
  const baseWidth = 375;
  const baseHeightRef = 667;

  // Scale height based on screen dimensions
  const scaleFactor = Math.min(width / baseWidth, height / baseHeightRef);
  const scaledHeight = baseHeight * Math.min(scaleFactor, 1.3); // Cap max scale at 1.3

  // Ensure minimum height for usability
  return Math.max(scaledHeight, 75);
};

const getResponsiveFontSize = (baseSize, width, height) => {
  const baseWidth = 375;
  const baseHeight = 667;
  const scaleFactor = Math.min(width / baseWidth, height / baseHeight);
  return Math.round(baseSize * Math.min(scaleFactor, 1.4) * Math.max(scaleFactor, 0.8));
};

// Main app navigator for authenticated users
function MainAppNavigator() {
  const { width, height } = useWindowDimensions();
  const tabBarHeight = getResponsiveTabBarHeight(width, height);
  const labelFontSize = getResponsiveFontSize(12, width, height);
  const iconSize = getResponsiveFontSize(24, width, height);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: {
          backgroundColor: colors.surface,
          paddingBottom: Math.max(12, tabBarHeight * 0.15),
          paddingTop: Math.max(8, tabBarHeight * 0.1),
          height: tabBarHeight,
          borderTopWidth: 1,
          borderTopColor: colors.outline + '20',
          elevation: 12,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: labelFontSize,
          fontWeight: '600',
          marginTop: 4,
          letterSpacing: 0.3,
          textTransform: 'uppercase',
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: Math.max(4, tabBarHeight * 0.06),
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Control') {
            iconName = focused ? 'game-controller' : 'game-controller-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        headerStyle: {
          backgroundColor: colors.surface,
          elevation: 8,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.12,
          shadowRadius: 6,
        },
        headerTintColor: colors.onSurface,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 20,
          letterSpacing: 0.5,
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Control" component={ControlScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

// Loading component
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingCard}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading CocoKnockKnock...</Text>
      </View>
    </View>
  );
}

// Main app component that handles authentication state
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ScanHistoryProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isAuthenticated ? (
            <Stack.Screen name="MainApp" component={MainAppNavigator} />
          ) : (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
              <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
              <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
            </>
          )}
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </ScanHistoryProvider>
  );
}

// Main App component wrapped with AuthProvider
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.outline + '15',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: colors.onSurface,
    letterSpacing: 0.5,
  },
});
