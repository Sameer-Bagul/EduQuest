# EduQuest Desktop Application

This document explains how to build and distribute the EduQuest desktop application using Electron.

## Features

### Desktop-Specific Features
- **Enhanced Security**: Kiosk mode and fullscreen enforcement
- **Advanced Proctoring**: Screen capture detection and system monitoring
- **Native Notifications**: Security alerts via system notifications
- **Offline Capability**: Work without internet connection (assignments sync when online)
- **Better Performance**: Native application performance
- **System Integration**: File system access and native menus

### Security Enhancements for Desktop
- **Kiosk Mode**: Prevents access to other applications
- **Screen Capture Prevention**: Detects and blocks screenshot attempts
- **Fullscreen Enforcement**: Locks application in fullscreen mode
- **Tab Switching Detection**: Advanced monitoring of application focus
- **System Information**: Access to hardware and system details
- **Network Monitoring**: Detects network changes and connectivity

## Building the Desktop Application

### Prerequisites
- Node.js 18 or later
- npm or yarn
- Platform-specific build tools:
  - **Windows**: Visual Studio Build Tools
  - **macOS**: Xcode Command Line Tools
  - **Linux**: build-essential package

### Development
```bash
# Start the web application
npm run dev

# In another terminal, start Electron in development mode
cd electron
npm install
npm run dev
```

### Building for Production

#### Build Web Application and Package Electron App
```bash
# Build everything and create packaged app
node scripts/build-electron.js
```

#### Create Executable/Installer
```bash
# Create distributable executables for all platforms
node scripts/make-executable.js
```

### Manual Build Steps

#### 1. Build Web Application
```bash
npm run build
```

#### 2. Package Electron App
```bash
cd electron
npm install
npm run pack
```

#### 3. Create Distributable
```bash
cd electron
npm run make
```

## Distribution

### Output Files
After building, you'll find the following in `electron/out/make/`:

#### Windows
- `EduQuest-Setup.exe` - Squirrel installer
- `eduquest-win32-x64.zip` - Portable version

#### macOS
- `EduQuest.app` - Application bundle
- `eduquest-darwin-x64.zip` - Compressed app

#### Linux
- `eduquest_1.0.0_amd64.deb` - Debian package
- `eduquest-1.0.0.x86_64.rpm` - Red Hat package

### Installation
- **Windows**: Run the `.exe` installer
- **macOS**: Drag the `.app` to Applications folder
- **Linux**: Install the `.deb` or `.rpm` package

## Configuration

### Forge Configuration
The Electron Forge configuration is in `electron/forge.config.js`:
- **Makers**: Define output formats (exe, zip, deb, rpm)
- **Packager**: App metadata and signing options
- **Plugins**: Additional functionality

### Security Configuration
Desktop-specific security settings can be configured in the ProctoringManager:
```javascript
const config = {
  enableKeyboardBlocking: true,
  enableTabMonitoring: true,
  enableScreenCapture: true,
  enableIdleDetection: true,
  enableNetworkMonitoring: true,
  allowedIdleTime: 300, // 5 minutes
  enableFullscreenEnforcement: true
};
```

## Proctoring Features

### Enhanced Desktop Proctoring
- **System-Level Monitoring**: Direct access to system APIs
- **Screen Capture Detection**: Native detection of screenshot attempts
- **Application Focus Tracking**: Precise monitoring of window focus
- **Hardware Information**: Access to system specifications
- **Network Monitoring**: Real-time network status tracking

### Security Measures
- **Kiosk Mode**: Prevents access to other applications
- **Fullscreen Lock**: Forces application to stay in fullscreen
- **Keyboard Shortcut Blocking**: Prevents access to system shortcuts
- **Context Menu Blocking**: Disables right-click menus
- **Developer Tools Protection**: Blocks access to dev tools

## Troubleshooting

### Common Issues

#### Build Fails on Windows
- Install Visual Studio Build Tools
- Set `npm config set msvs_version 2019`

#### macOS Code Signing
- Install Xcode Command Line Tools
- Configure developer certificates in forge.config.js

#### Linux Dependencies
- Install required system packages:
  ```bash
  sudo apt-get install build-essential libnss3-dev libatk-bridge2.0-dev libdrm2 libxss1 libgconf-2-4 libxrandr2 libasound2-dev libpangocairo-1.0-0 libatk1.0-dev libcairo-gobject2 libgtk-3-dev libgdk-pixbuf2.0-dev
  ```

### Performance Optimization
- Use `NODE_ENV=production` for builds
- Enable native node modules compilation
- Minimize bundle size with tree shaking

## Updates and Deployment

### Auto-Updates (Future Enhancement)
Configure auto-updates using Electron's built-in updater:
- Set up update server
- Implement update checking in main process
- Handle update installation and restart

### Manual Deployment
1. Build application for target platforms
2. Test on each platform
3. Distribute through appropriate channels:
   - **Windows**: Microsoft Store, direct download
   - **macOS**: Mac App Store, direct download
   - **Linux**: Package repositories, direct download

## Development Tips

### Debugging
- Use Chrome DevTools for renderer process
- Use `console.log` in main process
- Enable verbose logging in development

### Testing
- Test on all target platforms
- Verify security features work correctly
- Test offline functionality
- Validate proctoring features

### Performance
- Monitor memory usage
- Optimize renderer process
- Use native modules where beneficial
- Profile application startup time