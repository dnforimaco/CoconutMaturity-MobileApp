# CocoKnockKnock

A React Native mobile application for controlling an automated coconut harvesting robot system. The app provides a comprehensive interface for robot operation, audio-based maturity analysis, and data management.

## Features

### 🤖 Robot Control
- **Tree Climbing Control**: Up/down movement with adjustable speed (10-100%)
- **Robot Arm Control**: Multi-axis servo control including:
  - Base rotation (1-360°)
  - Arm rotation (0-180°)
  - Platform rotation (0-180°)
  - Auto-tap functionality
- **Real-time Camera Feed**: Live video monitoring with status indicators

### 🎙️ Audio Analysis
- **Automated Recording Sequence**: Captures three audio samples from different coconut positions
- **Maturity Classification**: AI-powered analysis determining:
  - Premature (not ready for harvest)
  - Mature (ready for harvest)
  - Overmature (should be harvested immediately)
- **Confidence Scoring**: Provides analysis confidence levels

### 📊 Data Management
- **Scan History**: Stores and tracks all analysis results
- **Firebase Integration**: Cloud-based authentication and data storage --not yet integrated
- **Local Storage**: Offline-capable data persistence

## Tech Stack

- **Framework**: React Native with Expo
- **Backend**: Firebase (Authentication, Database)
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **State Management**: React Context API
- **UI Components**: React Native built-in components + Expo Vector Icons
- **Networking**: Fetch API for HTTP communication
- **Charts**: React Native Chart Kit
- **Audio/Video**: Expo AV
- **File System**: Expo File System
- **Build System**: Expo Application Services (EAS)

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cocoknockknock
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication and Firestore Database
   - Add your Firebase configuration to the appropriate config files

4. **Start the development server**
   ```bash
   npm start
   ```

## Running the App

### Development
```bash
# Start Expo development server
npm start

# Run on specific platform
npm run android    # Android
npm run ios        # iOS
npm run web        # Web browser
```

## Hardware Requirements

The app communicates with a Raspberry Pi-based robot system that requires:

- **Raspberry Pi** with Flask server running on port 5000
- **Servo Motors**: Multiple MG996R servos for robot arm control
- **DC Motors**: For tree climbing mechanism
- **Microphone**: For audio sample collection
- **Camera**: For live video feed
- **Network Connection**: WiFi/Ethernet connectivity

## API Endpoints

The app communicates with the Raspberry Pi server via REST API:

- `GET /status` - Server health check
- `POST /up` - Move robot up
- `POST /down` - Move robot down
- `POST /stop` - Stop movement
- `POST /speed/{value}` - Set motor speed (10-255)
- `POST /base_rotation/{angle}` - Rotate base (1-360°)
- `POST /arm_rotation/{angle}` - Rotate arm (0-180°)
- `POST /top_rotation/{angle}` - Rotate top servo (0-180°)
- `POST /platform_rotation/{angle}` - Rotate platform (0-180°)
- `POST /auto_tap/{state}` - Toggle auto-tap (on/off)
- `POST /start_recording` - Begin audio recording sequence
- `POST /analyze` - Analyze recorded audio for maturity

## Project Structure

```
cocoknockknock/
├── assets/                 # Static assets (icons, images)
├── contexts/               # React Context providers
│   ├── AuthContext.js      # Authentication state
│   └── ScanHistoryContext.js # Scan history management
├── screens/                # App screens
│   ├── LoginScreen.js      # User login
│   ├── CreateAccountScreen.js # Account creation
│   ├── DashboardScreen.js  # Main dashboard
│   ├── ControlScreen.js    # Robot control interface
│   ├── HistoryScreen.js    # Scan history
│   ├── SettingsScreen.js   # App settings
│   └── ...
├── utils/                  # Utility functions
│   └── storage.js          # Local storage helpers
├── App.js                  # Main app component
├── package.json            # Dependencies and scripts
├── eas.json               # EAS build configuration
└── README.md              # This file
```

## Acknowledgments

- Built with [Expo](https://expo.dev/)
- Icons from [Expo Vector Icons](https://docs.expo.dev/guides/icons/)
- Charts powered by [React Native Chart Kit](https://github.com/indiespirit/react-native-chart-kit)
