const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getVersion: () => ipcRenderer.invoke('app-version'),
  
  // Dialog methods
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  
  // Path utilities
  getAppPath: (name) => ipcRenderer.invoke('get-app-path', name),
  
  // Proctoring controls
  enableKioskMode: () => ipcRenderer.invoke('enable-kiosk-mode'),
  disableKioskMode: () => ipcRenderer.invoke('disable-kiosk-mode'),
  enforceFullscreen: () => ipcRenderer.invoke('enforce-fullscreen'),
  exitFullscreen: () => ipcRenderer.invoke('exit-fullscreen'),
  
  // Menu event listeners
  onMenuNewAssignment: (callback) => ipcRenderer.on('menu-new-assignment', callback),
  onMenuExportResults: (callback) => ipcRenderer.on('menu-export-results', callback),
  onEnableSecureMode: (callback) => ipcRenderer.on('enable-secure-mode', callback),
  onShowSecurityLogs: (callback) => ipcRenderer.on('show-security-logs', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  
  // Platform info
  platform: process.platform,
  isElectron: true
});

// Enhanced security context for proctoring
contextBridge.exposeInMainWorld('proctoring', {
  // Security status
  isSecureEnvironment: true,
  isDesktopApp: true,
  
  // Screen capture detection
  detectScreenCapture: () => {
    // This would integrate with native screen capture detection
    return false;
  },
  
  // System monitoring
  getSystemInfo: () => ({
    platform: process.platform,
    architecture: process.arch,
    version: process.version
  }),
  
  // Notification system
  showSecurityAlert: (message, severity = 'medium') => {
    return ipcRenderer.invoke('show-message-box', {
      type: severity === 'critical' ? 'error' : 'warning',
      title: 'Security Alert',
      message: message,
      buttons: ['OK']
    });
  }
});