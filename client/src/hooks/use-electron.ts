import { useEffect, useState } from 'react';

interface ElectronAPI {
  getVersion: () => Promise<string>;
  showMessageBox: (options: any) => Promise<any>;
  showSaveDialog: (options: any) => Promise<any>;
  getAppPath: (name: string) => Promise<string>;
  enableKioskMode: () => Promise<boolean>;
  disableKioskMode: () => Promise<boolean>;
  enforceFullscreen: () => Promise<boolean>;
  exitFullscreen: () => Promise<boolean>;
  onMenuNewAssignment: (callback: () => void) => void;
  onMenuExportResults: (callback: () => void) => void;
  onEnableSecureMode: (callback: () => void) => void;
  onShowSecurityLogs: (callback: () => void) => void;
  removeAllListeners: (channel: string) => void;
  platform: string;
  isElectron: boolean;
}

interface ProctoringAPI {
  isSecureEnvironment: boolean;
  isDesktopApp: boolean;
  detectScreenCapture: () => boolean;
  getSystemInfo: () => {
    platform: string;
    architecture: string;
    version: string;
  };
  showSecurityAlert: (message: string, severity?: 'low' | 'medium' | 'high' | 'critical') => Promise<any>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
    proctoring?: ProctoringAPI;
  }
}

export function useElectron() {
  const [isElectron, setIsElectron] = useState(false);
  const [electronAPI, setElectronAPI] = useState<ElectronAPI | null>(null);
  const [proctoringAPI, setProctoringAPI] = useState<ProctoringAPI | null>(null);

  useEffect(() => {
    // Check if running in Electron
    const isElectronApp = !!(window.electronAPI?.isElectron);
    setIsElectron(isElectronApp);
    
    if (isElectronApp) {
      setElectronAPI(window.electronAPI!);
      setProctoringAPI(window.proctoring || null);
    }
  }, []);

  return {
    isElectron,
    electronAPI,
    proctoringAPI,
    // Helper methods
    showAlert: async (message: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') => {
      if (proctoringAPI) {
        return await proctoringAPI.showSecurityAlert(message, severity);
      } else {
        // Fallback for web version
        alert(message);
      }
    },
    enableSecureMode: async () => {
      if (electronAPI) {
        return await electronAPI.enableKioskMode();
      }
      return false;
    },
    disableSecureMode: async () => {
      if (electronAPI) {
        return await electronAPI.disableKioskMode();
      }
      return false;
    },
    enforceFullscreen: async () => {
      if (electronAPI) {
        return await electronAPI.enforceFullscreen();
      }
      return false;
    },
    exitFullscreen: async () => {
      if (electronAPI) {
        return await electronAPI.exitFullscreen();
      }
      return false;
    }
  };
}

export function useElectronMenus() {
  const { electronAPI } = useElectron();

  useEffect(() => {
    if (!electronAPI) return;

    const handleNewAssignment = () => {
      // Handle new assignment menu click
      window.dispatchEvent(new CustomEvent('electron-new-assignment'));
    };

    const handleExportResults = () => {
      // Handle export results menu click
      window.dispatchEvent(new CustomEvent('electron-export-results'));
    };

    const handleEnableSecureMode = () => {
      // Handle enable secure mode menu click
      window.dispatchEvent(new CustomEvent('electron-enable-secure-mode'));
    };

    const handleShowSecurityLogs = () => {
      // Handle show security logs menu click
      window.dispatchEvent(new CustomEvent('electron-show-security-logs'));
    };

    // Register menu event listeners
    electronAPI.onMenuNewAssignment(handleNewAssignment);
    electronAPI.onMenuExportResults(handleExportResults);
    electronAPI.onEnableSecureMode(handleEnableSecureMode);
    electronAPI.onShowSecurityLogs(handleShowSecurityLogs);

    return () => {
      // Cleanup listeners
      electronAPI.removeAllListeners('menu-new-assignment');
      electronAPI.removeAllListeners('menu-export-results');
      electronAPI.removeAllListeners('enable-secure-mode');
      electronAPI.removeAllListeners('show-security-logs');
    };
  }, [electronAPI]);
}