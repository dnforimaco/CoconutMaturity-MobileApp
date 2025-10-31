
import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView, useWindowDimensions, Modal, TextInput, Alert } from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { storage, createScanRecord } from '../utils/storage';
import { useScanHistory } from '../contexts/ScanHistoryContext';

// Green Gamepad Color Palette
const colors = {
  primary: '#16A34A',      // Green for primary actions
  primaryDark: '#15803D',
  primaryLight: '#22C55E',
  secondary: '#059669',    // Teal for secondary actions
  secondaryDark: '#047857',
  accent: '#65A30D',       // Lime for special actions
  success: '#10B981',
  warning: '#EAB308',
  error: '#DC2626',
  background: '#052E16',   // Dark green background
  surface: '#064E3B',      // Darker green surface
  surfaceVariant: '#065F46',
  onPrimary: '#FFFFFF',
  onSecondary: '#FFFFFF',
  onBackground: '#ECFDF5',
  onSurface: '#D1FAE5',
  onSurfaceVariant: '#A7F3D0',
  outline: '#059669',
  shadow: 'rgba(0, 0, 0, 0.3)',
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

const getResponsiveButtonSize = (baseSize, width, height) => {
  const baseWidth = 375;
  const baseHeight = 667;
  const scaleFactor = Math.min(width / baseWidth, height / baseHeight);
  return Math.round(baseSize * Math.min(scaleFactor, 1.3) * Math.max(scaleFactor, 0.85));
};

const getResponsiveHeight = (baseHeight, width, height) => {
  const baseWidth = 375;
  const baseHeightRef = 667;
  const scaleFactor = Math.min(width / baseWidth, height / baseHeightRef);
  return Math.round(baseHeight * Math.min(scaleFactor, 1.2));
};

const ControlScreen = () => {
  const { width, height } = useWindowDimensions();

  // Tree Climbing Robot state
  const [speed, setSpeed] = useState(50);
  const [isMovingUp, setIsMovingUp] = useState(false);
  const [isMovingDown, setIsMovingDown] = useState(false);

  // Robot Arm state
  const [baseRotation, setBaseRotation] = useState(180); // Start at 180 for 1-360 range
  const [armRotation, setArmRotation] = useState(90); // For arm tap rotation, up to 180
  const [topRotation, setTopRotation] = useState(90); // Top rotation up to 180
  const [platformRotation, setPlatformRotation] = useState(90); // Platform rotation 0-180 (Motor 5)
  const [autoTapOn, setAutoTapOn] = useState(false);

  // Detection Robot state
  const [isRecording, setIsRecording] = useState(false);
  const [analysisResults, setAnalysisResults] = useState('');
  const [analysisColor, setAnalysisColor] = useState('#10B981');

  // Recording sequence state
  const [recordingSequenceStep, setRecordingSequenceStep] = useState(0); // 0: idle, 1-3: recording, 4-5: interval, 6: complete
  const [isSequenceActive, setIsSequenceActive] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [sequenceStatus, setSequenceStatus] = useState('');

  // Camera view state
  const [isCameraMinimized, setIsCameraMinimized] = useState(false);

  // Network section state
  const [isNetworkMinimized, setIsNetworkMinimized] = useState(false);

  // Save/Delete functionality state
  const [showSaveDeleteModal, setShowSaveDeleteModal] = useState(false);
  const [currentAnalysisData, setCurrentAnalysisData] = useState(null);
  const [savedAnalyses, setSavedAnalyses] = useState([]);
  const [saveInputName, setSaveInputName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  // Network link state
  const [networkLink, setNetworkLink] = useState('http://192.168.1.118:5000');
  const [baseUrl, setBaseUrl] = useState('http://192.168.1.118:5000');

  // Responsive values
  const headerFontSize = getResponsiveFontSize(20, width, height);
  const sectionTitleSize = getResponsiveFontSize(18, width, height);
  const headerPadding = getResponsivePadding(16, width, height);
  const sectionPadding = getResponsivePadding(20, width, height);
  const buttonSize = getResponsiveButtonSize(56, width, height);
  const iconSize = getResponsiveFontSize(32, width, height);
  const liveViewHeight = getResponsiveHeight(height * 0.35, width, height); // Reduced from 0.45 to 0.35

  const handleUpPress = async () => {
    try {
      let url, action;
      if (isMovingUp) {
        url = `${baseUrl}/stop`;
        action = 'stop';
        setIsMovingUp(false);
      } else {
        url = `${baseUrl}/up`;
        action = 'move_up';
        setIsMovingUp(true);
        setIsMovingDown(false);
      }
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        Alert.alert('Success', action + ': ' + data.action);
      } else {
        Alert.alert('Error', 'Failed: ' + response.status);
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Error: ' + error.message);
    }
  };

  const handleDownPress = async () => {
    try {
      let url, action;
      if (isMovingDown) {
        url = `${baseUrl}/stop`;
        action = 'stop';
        setIsMovingDown(false);
      } else {
        url = `${baseUrl}/down`;
        action = 'move_down';
        setIsMovingDown(true);
        setIsMovingUp(false);
      }
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        Alert.alert('Success', action + ': ' + data.action);
      } else {
        Alert.alert('Error', 'Failed: ' + response.status);
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Error: ' + error.message);
    }
  };

  const handleBaseRotation = async (direction) => {
    let newAngle;
    if (direction === 'left') {
      newAngle = Math.max(1, baseRotation - 10);
    } else {
      newAngle = Math.min(360, baseRotation + 10);
    }
    setBaseRotation(newAngle);
    try {
      const response = await fetch(`${baseUrl}/base_rotation/${newAngle}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        Alert.alert('Error', 'Failed to update base rotation');
      }
    } catch (error) {
      Alert.alert('Error', 'Error updating base rotation: ' + error.message);
    }
  };

  const handleArmRotation = async (direction) => {
    let newArmAngle;
    if (direction === 'up') {
      newArmAngle = Math.max(0, armRotation - 10);
    } else {
      newArmAngle = Math.min(180, armRotation + 10);
    }
    setArmRotation(newArmAngle);
    // Move top rotation oppositely
    const newTopAngle = 180 - newArmAngle;
    setTopRotation(newTopAngle);
    try {
      const response = await fetch(`${baseUrl}/arm_rotation/${newArmAngle}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        Alert.alert('Error', 'Failed to update arm rotation');
      }
    } catch (error) {
      Alert.alert('Error', 'Error updating arm rotation: ' + error.message);
    }
  };

  const handleTopRotation = async (direction) => {
    let newTopAngle;
    if (direction === 'up') {
      newTopAngle = Math.max(0, topRotation - 10);
    } else {
      newTopAngle = Math.min(180, topRotation + 10);
    }
    setTopRotation(newTopAngle);
    // Move arm rotation oppositely
    const newArmAngle = 180 - newTopAngle;
    setArmRotation(newArmAngle);
    try {
      const response = await fetch(`${baseUrl}/top_rotation/${newTopAngle}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        Alert.alert('Error', 'Failed to update top rotation');
      }
    } catch (error) {
      Alert.alert('Error', 'Error updating top rotation: ' + error.message);
    }
  };

  const handleAutoTap = async () => {
    const newState = !autoTapOn;
    setAutoTapOn(newState);
    try {
      const response = await fetch(`${baseUrl}/auto_tap/${newState ? 'on' : 'off'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        Alert.alert('Error', 'Failed to toggle auto tap');
      }
    } catch (error) {
      Alert.alert('Error', 'Error toggling auto tap: ' + error.message);
    }
  };



  const handleStartRecording = async () => {
    if (isSequenceActive) {
      // Stop the sequence if active
      setIsRecording(false);
      setIsSequenceActive(false);
      setRecordingSequenceStep(0);
      setSequenceStatus('');
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/start_recording`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        setIsSequenceActive(true);
        setRecordingSequenceStep(1);
        setSequenceStatus('Recording Sample 1...');
        setIsRecording(true);

        // Simulate the sequence steps
        setTimeout(() => {
          setRecordingSequenceStep(2);
          setSequenceStatus('Pause: Rotate coconut to different side');
          setIsRecording(false);

          setTimeout(() => {
            setRecordingSequenceStep(3);
            setSequenceStatus('Recording Sample 2...');
            setIsRecording(true);

            setTimeout(() => {
              setRecordingSequenceStep(4);
              setSequenceStatus('Pause: Rotate coconut to different side');
              setIsRecording(false);

              setTimeout(() => {
                setRecordingSequenceStep(5);
                setSequenceStatus('Recording Sample 3...');
                setIsRecording(true);

                setTimeout(() => {
                  setRecordingSequenceStep(6);
                  setSequenceStatus('Recording Complete');
                  setIsRecording(false);
                  setIsSequenceActive(false);
                  setShowCompletionModal(true);
                }, 5000);
              }, 2500);
            }, 5000);
          }, 2500);
        }, 5000);
      } else {
        Alert.alert('Error', 'Failed to start recording on Raspberry Pi');
      }
    } catch (error) {
      Alert.alert('Error', 'Error starting recording: ' + error.message);
    }
  };



  const handleAnalyze = async () => {
    try {
      const response = await fetch(`${baseUrl}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        let resultMessage = '';
        let resultColor = '';
        let maturityClassification = '';

        switch(data.classification.toLowerCase()) {
          case 'premature':
            resultMessage = 'Analysis Complete: Coconut is PREMATURE - Not ready for harvest';
            resultColor = '#FF6B6B'; // Red color for premature
            maturityClassification = 'premature';
            break;
          case 'mature':
            resultMessage = 'Analysis Complete: Coconut is MATURE - Ready for harvest';
            resultColor = '#4ECDC4'; // Green color for mature
            maturityClassification = 'mature';
            break;
          case 'overmature':
            resultMessage = 'Analysis Complete: Coconut is OVERMATURE - Should be harvested immediately';
            resultColor = '#45B7D1'; // Blue color for overmature
            maturityClassification = 'overmature';
            break;
          default:
            resultMessage = 'Analysis Complete: Unknown classification';
            resultColor = '#10B981';
            maturityClassification = 'unknown';
        }

        setAnalysisResults(resultMessage);
        setAnalysisColor(resultColor);

        // Store current analysis data for potential saving
        setCurrentAnalysisData({
          result: resultMessage,
          classification: maturityClassification,
          confidence: data.confidence,
          color: resultColor,
          timestamp: new Date().toLocaleString()
        });
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to analyze');
      }
    } catch (error) {
      Alert.alert('Error', 'Error analyzing: ' + error.message);
    }
  };

  const { addScanRecord } = useScanHistory();

  const handleSaveAnalysis = async () => {
    if (currentAnalysisData && saveInputName.trim()) {
      try {
        // Create scan record using the storage utility
        const scanRecord = createScanRecord(currentAnalysisData, saveInputName.trim());

        // Save using context
        const success = await addScanRecord(scanRecord);

        if (success) {
          setSaveInputName('');
          setShowNameInput(false);
          setShowSaveDeleteModal(false);
          setCurrentAnalysisData(null);
          setAnalysisResults('');
          setAnalysisColor('#10B981');

          Alert.alert('Success', `Analysis saved as "${scanRecord.coconutId}"`);
        } else {
          Alert.alert('Error', 'Failed to save analysis data');
        }
      } catch (error) {
        console.error('Error saving analysis:', error);
        Alert.alert('Error', 'Failed to save analysis data');
      }
    }
  };

  const handleDeleteAnalysis = () => {
    setShowSaveDeleteModal(false);
    setCurrentAnalysisData(null);
    setAnalysisResults('');
    setAnalysisColor('#10B981');
    Alert.alert('Deleted', 'Analysis data has been discarded');
  };

  const handleSavePrompt = () => {
    setShowSaveDeleteModal(false);
    setShowNameInput(true);
  };

  const handleCancelSave = () => {
    setShowNameInput(false);
    setSaveInputName('');
  };

  const handleCompletionAnalyze = () => {
    setShowCompletionModal(false);
    handleAnalyze();
  };

  const handleCompletionSave = () => {
    setShowCompletionModal(false);
    setShowNameInput(true);
  };

  const handleCompletionDiscard = () => {
    setShowCompletionModal(false);
    setRecordingSequenceStep(0);
    setSequenceStatus('');
    setIsSequenceActive(false);
    setIsRecording(false);
  };

  const handleToggleCamera = () => {
    setIsCameraMinimized(!isCameraMinimized);
  };

  const handleToggleNetwork = () => {
    setIsNetworkMinimized(!isNetworkMinimized);
  };

  const handleCancelRecording = () => {
    setIsRecording(false);
    setIsSequenceActive(false);
    setRecordingSequenceStep(0);
    setSequenceStatus('');
  };

  const updateSpeed = async (newSpeed) => {
    try {
      // Map UI speed (10-100) to motor speed (10-255)
      const motorSpeed = 10 + Math.round((newSpeed - 10) * 245 / 90);
      const url = `${baseUrl}/speed/${motorSpeed}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Speed updated:', data.speed);
      } else {
        console.error('Failed to update speed:', response.status);
      }
    } catch (error) {
      console.error('Error updating speed:', error);
    }
  };

  const callUrl = async () => {
    try {
      // Call Flask server status endpoint
      const url = `${baseUrl}/status`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        Alert.alert('Server Status', 'Flask server is running: ' + JSON.stringify(data));
      } else {
        Alert.alert('Error', 'Failed to call URL: ' + response.status);
      }
    } catch (error) {
      console.error('Error calling URL:', error);
      Alert.alert('Error', 'Error calling URL: ' + error.message);
    }
  };

  const handleConnectToServer = async () => {
    const fullUrl = networkLink.startsWith('http') ? networkLink : `http://${networkLink}`;
    setBaseUrl(fullUrl);
    try {
      const response = await fetch(`${fullUrl}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        Alert.alert('Connected', 'Successfully connected to server: ' + JSON.stringify(data));
      } else {
        Alert.alert('Error', 'Failed to connect to server: ' + response.status);
      }
    } catch (error) {
      console.error('Error connecting to server:', error);
      Alert.alert('Error', 'Error connecting to server: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Gamepad Header */}
      <View style={[styles.gamepadHeader, { paddingHorizontal: headerPadding, paddingVertical: headerPadding }]}>
        <Ionicons name="game-controller" size={iconSize} color={colors.accent} />
        <Text style={[styles.gamepadTitle, { fontSize: headerFontSize }]}>Robot Control Gamepad</Text>
      </View>

      {/* Network Link Section */}
      {!isNetworkMinimized ? (
        <View style={[styles.networkSection, { margin: 16, padding: sectionPadding }]}>
          {/* Minimize button */}
          <TouchableOpacity
            style={styles.minimizeButton}
            onPress={handleToggleNetwork}
          >
            <Ionicons name="chevron-up" size={20} color={colors.onPrimary} />
          </TouchableOpacity>
          <Text style={[styles.sectionTitle, { fontSize: sectionTitleSize }]}>🌐 Enter a Link</Text>
          <TextInput
            style={styles.networkInput}
            value={networkLink}
            onChangeText={setNetworkLink}
            placeholder="Enter server URL (e.g., 192.168.1.118:5000)"
            placeholderTextColor={colors.onSurfaceVariant}
          />
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleConnectToServer}
          >
            <Ionicons name="checkmark-circle" size={24} color={colors.onPrimary} />
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.minimizedNetworkCard}
          onPress={handleToggleNetwork}
        >
          <Ionicons name="chevron-down" size={24} color={colors.primary} />
          <Text style={styles.minimizedNetworkText}>Network Link</Text>
        </TouchableOpacity>
      )}

      {/* Live View Card */}
      {!isCameraMinimized ? (
        <View style={[styles.liveViewCard, { height: liveViewHeight, margin: 16 }]}>
          <View style={styles.videoContainer}>
            {/* Minimize button */}
            <TouchableOpacity
              style={styles.minimizeButton}
              onPress={handleToggleCamera}
            >
              <Ionicons name="chevron-up" size={20} color={colors.onPrimary} />
            </TouchableOpacity>
            {/* Placeholder for video feed */}
            <View style={styles.videoPlaceholder} />
            {/* Status bar overlay */}
            <View style={styles.statusBar}>
              <Text style={styles.statusText}>720p • 28 fps • 120 ms</Text>
            </View>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.minimizedCameraCard}
          onPress={handleToggleCamera}
        >
          <Ionicons name="chevron-down" size={24} color={colors.primary} />
          <Text style={styles.minimizedCameraText}>Camera View</Text>
        </TouchableOpacity>
      )}

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Gamepad Section 1: Movement & Speed */}
        <View style={[styles.gamepadSection, { margin: 16, padding: sectionPadding }]}>
          <Text style={[styles.sectionTitle, { fontSize: sectionTitleSize }]}>🎮 Movement Control</Text>

          {/* Speed Control - on top */}
          <View style={styles.speedContainer}>
            <Text style={styles.speedLabel}>Speed: {speed}%</Text>
            <View style={styles.speedControls}>
              <TouchableOpacity
                style={styles.speedButton}
                onPress={() => {
                  const newSpeed = Math.max(10, speed - 10);
                  setSpeed(newSpeed);
                  updateSpeed(newSpeed);
                }}
              >
                <Ionicons name="remove" size={24} color={colors.onPrimary} />
              </TouchableOpacity>
              <View style={styles.speedBar}>
                <View style={[styles.speedFill, { width: `${(speed - 10) * 100 / 90}%` }]} />
              </View>
              <TouchableOpacity
                style={styles.speedButton}
                onPress={() => {
                  const newSpeed = Math.min(100, speed + 10);
                  setSpeed(newSpeed);
                  updateSpeed(newSpeed);
                }}
              >
                <Ionicons name="add" size={24} color={colors.onPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Up and Down Movement Controls */}
          <View style={styles.movementContainer}>
            <TouchableOpacity
              style={[styles.movementButton, isMovingUp && styles.movementButtonActive]}
              onPress={handleUpPress}
            >
              <Ionicons name="chevron-up" size={32} color={isMovingUp ? colors.onPrimary : colors.primary} />
              <Text style={[styles.movementButtonText, { color: isMovingUp ? colors.onPrimary : colors.primary }]}>
                UP
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.movementButton, isMovingDown && styles.movementButtonActive]}
              onPress={handleDownPress}
            >
              <Ionicons name="chevron-down" size={32} color={isMovingDown ? colors.onPrimary : colors.primary} />
              <Text style={[styles.movementButtonText, { color: isMovingDown ? colors.onPrimary : colors.primary }]}>
                DOWN
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Gamepad Section 2: Robot Arm Control */}
        <View style={[styles.gamepadSection, { margin: 16, padding: sectionPadding }]}>
          <Text style={[styles.sectionTitle, { fontSize: sectionTitleSize }]}>🤖 Robot Arm Control</Text>

          <View style={styles.armControls}>
            {/* Left Analog Stick Area */}
            <View style={styles.analogArea}>
              <Text style={styles.analogLabel}>Base Rotation (1-360°)</Text>
              <View style={styles.analogStick}>
                <TouchableOpacity
                  style={styles.analogButton}
                  onPress={() => handleBaseRotation('left')}
                >
                  <Ionicons name="chevron-back" size={20} color={colors.onPrimary} />
                </TouchableOpacity>
                <Text style={styles.analogValue}>{baseRotation}°</Text>
                <TouchableOpacity
                  style={styles.analogButton}
                  onPress={() => handleBaseRotation('right')}
                >
                  <Ionicons name="chevron-forward" size={20} color={colors.onPrimary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Right Analog Stick Area */}
            <View style={styles.analogArea}>
              <Text style={styles.analogLabel}>Arm Rotation (0-180°)</Text>
              <View style={styles.sliderContainer}>
                <Slider
                  style={styles.slider}
                  value={armRotation}
                  onValueChange={(value) => {
                    const newValue = Math.round(value);
                    setArmRotation(newValue);
                    setTopRotation(180 - newValue);
                    fetch(`${baseUrl}/arm_rotation/${newValue}`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                    }).catch(error => Alert.alert('Error', 'Error updating arm rotation: ' + error.message));
                  }}
                  minimumValue={0}
                  maximumValue={180}
                  step={1}
                  minimumTrackTintColor={colors.accent}
                  maximumTrackTintColor={colors.outline}
                  thumbStyle={{ backgroundColor: colors.primary }}
                />
                <Text style={styles.sliderValue}>{armRotation}°</Text>
              </View>
            </View>
          </View>

          {/* Top Rotation Control */}
          <View style={styles.elbowControl}>
            <Text style={styles.controlLabel}>Arm Rotation Opposite (0-180°)</Text>
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                value={topRotation}
                onValueChange={(value) => {
                  const newValue = Math.round(value);
                  setTopRotation(newValue);
                  setArmRotation(180 - newValue);
                  fetch(`${baseUrl}/top_rotation/${newValue}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                  }).catch(error => Alert.alert('Error', 'Error updating top rotation: ' + error.message));
                }}
                minimumValue={0}
                maximumValue={180}
                step={1}
                minimumTrackTintColor={colors.accent}
                maximumTrackTintColor={colors.outline}
                thumbStyle={{ backgroundColor: colors.primary }}
              />
              <Text style={styles.sliderValue}>{topRotation}°</Text>
            </View>
          </View>

          {/* Platform Rotation Control */}
          <View style={styles.elbowControl}>
            <Text style={styles.controlLabel}>Platform Rotation (0-180°) - Motor 5</Text>
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                value={platformRotation}
                onValueChange={(value) => {
                  const newValue = Math.round(value);
                  setPlatformRotation(newValue);
                  fetch(`${baseUrl}/platform_rotation/${newValue}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                  }).catch(error => Alert.alert('Error', 'Error updating platform rotation: ' + error.message));
                }}
                minimumValue={0}
                maximumValue={180}
                step={1}
                minimumTrackTintColor={colors.accent}
                maximumTrackTintColor={colors.outline}
                thumbStyle={{ backgroundColor: colors.primary }}
              />
              <Text style={styles.sliderValue}>{platformRotation}°</Text>
            </View>
          </View>

          {/* Auto Tap Control */}
          <View style={styles.autoTapControl}>
            <Text style={styles.controlLabel}>Auto Tap (MG996R)</Text>
            <TouchableOpacity
              style={[styles.autoTapButton, autoTapOn && styles.autoTapButtonActive]}
              onPress={handleAutoTap}
            >
              <Ionicons name={autoTapOn ? "pause" : "play"} size={24} color={colors.onPrimary} />
              <Text style={[styles.autoTapButtonText, { color: colors.onPrimary }]}>
                {autoTapOn ? 'ON' : 'OFF'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Gamepad Section 3: Action Controls */}
        <View style={[styles.gamepadSection, { margin: 16, padding: sectionPadding }]}>
          <Text style={[styles.sectionTitle, { fontSize: sectionTitleSize }]}>⚡ Action Controls</Text>

          {/* Main Action Buttons */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={[styles.mainActionButton, (isRecording || isSequenceActive) && styles.mainActionButtonActive]}
              onPress={handleStartRecording}
            >
              <Ionicons name="mic" size={28} color={(isRecording || isSequenceActive) ? colors.onPrimary : colors.primary} />
              <Text style={[styles.mainActionButtonText, { color: (isRecording || isSequenceActive) ? colors.onPrimary : colors.primary }]}>
                {isSequenceActive ? (isRecording ? 'Recording...' : sequenceStatus || 'Start Recording') : 'Start Recording'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.mainActionButton, styles.analyzeMainButton]}
              onPress={handleAnalyze}
            >
              <Ionicons name="analytics" size={28} color={colors.onPrimary} />
              <Text style={styles.mainActionButtonText}>
                Analyze
              </Text>
            </TouchableOpacity>
          </View>

          {/* Recording Status Display */}
          {isSequenceActive && (
            <View style={styles.statusContainer}>
              <View style={styles.statusHeader}>
                <Ionicons name="radio" size={20} color={colors.error} />
                <Text style={styles.statusTitle}>Recording Sequence Active</Text>
                <Ionicons name="radio" size={20} color={colors.error} />
              </View>
              <Text style={styles.statusText}>{sequenceStatus}</Text>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${(recordingSequenceStep / 6) * 100}%` }]} />
                </View>
                <Text style={styles.progressText}>Step {recordingSequenceStep} of 6</Text>
              </View>

              {/* Step Indicators */}
              <View style={styles.stepIndicators}>
                {[1, 2, 3, 4, 5, 6].map((step) => (
                  <View
                    key={step}
                    style={[
                      styles.stepIndicator,
                      step <= recordingSequenceStep ? styles.stepIndicatorActive : styles.stepIndicatorInactive
                    ]}
                  />
                ))}
              </View>

              {/* Cancel Recording Button */}
              <TouchableOpacity
                style={[styles.cancelButton, styles.deleteButton]}
                onPress={handleCancelRecording}
              >
                <Ionicons name="close-circle" size={24} color={colors.onPrimary} />
                <Text style={styles.cancelButtonText}>Cancel Recording</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Display Results */}
          {analysisResults !== '' && (
            <View style={[styles.resultsContainer, { borderColor: analysisColor }]}>
              <Text style={[styles.resultsTitle, { color: analysisColor }]}>📊 Analysis Results:</Text>
              <Text style={styles.resultsText}>{analysisResults}</Text>

              {/* Save/Delete Action Buttons */}
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.saveButton]}
                  onPress={() => setShowSaveDeleteModal(true)}
                >
                  <Ionicons name="checkmark-circle" size={20} color={colors.onPrimary} />
                  <Text style={styles.actionButtonText}>Save Analysis</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={handleDeleteAnalysis}
                >
                  <Ionicons name="trash" size={20} color={colors.onPrimary} />
                  <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Save/Delete Modal */}
      <Modal
        visible={showSaveDeleteModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSaveDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Save Analysis Data?</Text>
            <Text style={styles.modalText}>
              Would you like to save this analysis result with maturity classification and confidence level?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveModalButton]}
                onPress={handleSavePrompt}
              >
                <Ionicons name="checkmark-circle" size={20} color={colors.onPrimary} />
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.deleteModalButton]}
                onPress={handleDeleteAnalysis}
              >
                <Ionicons name="trash" size={20} color={colors.onPrimary} />
                <Text style={styles.modalButtonText}>Delete</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => setShowSaveDeleteModal(false)}
              >
                <Ionicons name="close" size={20} color={colors.onPrimary} />
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Name Input Modal */}
      <Modal
        visible={showNameInput}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancelSave}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Name Your Analysis</Text>
            <Text style={styles.modalText}>
              Enter a name for this analysis (e.g., "Tree #1 – Position 1"):
            </Text>

            <TextInput
              style={styles.nameInput}
              value={saveInputName}
              onChangeText={setSaveInputName}
              placeholder="Enter analysis name..."
              placeholderTextColor={colors.onSurfaceVariant}
              autoFocus={true}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmModalButton]}
                onPress={handleSaveAnalysis}
              >
                <Ionicons name="checkmark" size={20} color={colors.onPrimary} />
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={handleCancelSave}
              >
                <Ionicons name="close" size={20} color={colors.onPrimary} />
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Completion Modal */}
      <Modal
        visible={showCompletionModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCompletionDiscard}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Recording Complete</Text>
            <Text style={styles.modalText}>
              Three audio samples have been captured. What would you like to do next?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.analyzeModalButton]}
                onPress={handleCompletionAnalyze}
              >
                <Ionicons name="analytics" size={20} color={colors.onPrimary} />
                <Text style={styles.modalButtonText}>Analyze</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveModalButton]}
                onPress={handleCompletionSave}
              >
                <Ionicons name="checkmark-circle" size={20} color={colors.onPrimary} />
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.discardModalButton]}
                onPress={handleCompletionDiscard}
              >
                <Ionicons name="trash" size={20} color={colors.onPrimary} />
                <Text style={styles.modalButtonText}>Discard</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gamepadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
  },
  gamepadTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.onSurface,
    letterSpacing: 1,
  },
  callUrlButton: {
    padding: 10,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  networkSection: {
    margin: 16,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.outline + '20',
  },
  networkInput: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.onSurface,
    borderWidth: 1,
    borderColor: colors.outline,
    marginBottom: 16,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    flexDirection: 'row',
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onPrimary,
    letterSpacing: 0.5,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  gamepadSection: {
    margin: 16,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.outline + '20',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.onSurface,
    letterSpacing: 0.5,
    marginBottom: 20,
    textAlign: 'center',
  },
  // Speed Control
  speedContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  speedLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.onSurface,
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  speedControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '80%',
  },
  speedButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primaryDark,
  },
  speedBar: {
    flex: 1,
    height: 16,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 8,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.outline,
    overflow: 'hidden',
  },
  speedFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 8,
  },
  // Movement Controls
  movementContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  movementButton: {
    backgroundColor: colors.surfaceVariant,
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    minWidth: 120,
  },
  movementButtonActive: {
    backgroundColor: colors.primary,
  },
  movementButtonText: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  // Robot Arm Controls
  armControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 16,
    flexWrap: 'wrap',
  },
  analogArea: {
    alignItems: 'center',
    flex: 1,
    maxWidth: 160,
    minWidth: 140,
    marginHorizontal: 8,
  },
  analogLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurface,
    marginBottom: 12,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  analogStick: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.outline,
    minHeight: 60,
  },
  analogButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  analogValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accent,
    minWidth: 50,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  elbowControl: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 16,
  },
  controlLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.onSurface,
    marginBottom: 16,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  elbowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.outline,
    minHeight: 60,
    justifyContent: 'center',
  },
  elbowButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
  },
  elbowValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accent,
    minWidth: 50,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  autoTapControl: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 16,
  },
  autoTapButton: {
    backgroundColor: colors.surfaceVariant,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.outline,
    minWidth: 120,
    flexDirection: 'row',
    gap: 8,
  },
  autoTapButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  autoTapButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  sliderContainer: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accent,
    marginTop: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  // Action Controls
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    gap: 12,
  },
  mainActionButton: {
    backgroundColor: colors.surfaceVariant,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.outline,
    flex: 1,
    maxWidth: 140,
  },
  mainActionButtonActive: {
    borderColor: colors.primary,
  },
  mainActionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  analyzeMainButton: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  resultsContainer: {
    backgroundColor: colors.surfaceVariant,
    padding: 20,
    borderRadius: 16,
    marginTop: 20,
    borderWidth: 2,
    borderColor: colors.success,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.success,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  resultsText: {
    fontSize: 16,
    color: colors.onSurface,
    lineHeight: 24,
    letterSpacing: 0.3,
  },
  // Save/Delete Action Buttons
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    minWidth: 120,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  saveButton: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  deleteButton: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  // Live View Card
  liveViewCard: {
    height: Dimensions.get('window').height * 0.5, // 50% of screen height - made taller
    margin: 16,
    marginBottom: 8,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.outline + '20',
    overflow: 'hidden',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: colors.background,
  },
  videoPlaceholder: {
    flex: 1,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 16,
    margin: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBar: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    color: colors.onPrimary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  // Camera minimize button
  minimizeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  // Minimized camera card
  minimizedCameraCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    margin: 16,
    marginBottom: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.outline + '20',
    minHeight: 60,
  },
  minimizedCameraText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.onSurface,
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  // Minimized network card
  minimizedNetworkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    margin: 16,
    marginBottom: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.outline + '20',
    minHeight: 60,
  },
  minimizedNetworkText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.onSurface,
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: colors.outline,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.onSurface,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  modalText: {
    fontSize: 16,
    color: colors.onSurface,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    letterSpacing: 0.3,
  },
  nameInput: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.onSurface,
    borderWidth: 1,
    borderColor: colors.outline,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtons: {
    gap: 12,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  saveModalButton: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  deleteModalButton: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  cancelModalButton: {
    backgroundColor: colors.surfaceVariant,
    borderColor: colors.outline,
  },
  confirmModalButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  // Status Container
  statusContainer: {
    backgroundColor: colors.surfaceVariant,
    padding: 20,
    borderRadius: 16,
    marginTop: 20,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  statusText: {
    fontSize: 16,
    color: colors.onSurface,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.3,
    fontWeight: '500',
  },
  statusSubText: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  // Progress Bar
  progressContainer: {
    width: '100%',
    marginBottom: 16,
    alignItems: 'center',
  },
  progressBar: {
    width: '80%',
    height: 8,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.outline,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
    letterSpacing: 0.3,
  },
  // Step Indicators
  stepIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  stepIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  stepIndicatorActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  stepIndicatorInactive: {
    backgroundColor: 'transparent',
    borderColor: colors.outline,
  },
  // Completion Modal Buttons
  analyzeModalButton: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  discardModalButton: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  // Cancel Button
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    minWidth: 160,
    gap: 8,
    marginTop: 16,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default ControlScreen;
