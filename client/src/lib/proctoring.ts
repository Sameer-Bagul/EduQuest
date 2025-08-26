export interface ProctoringEvent {
  type: 'tab_change' | 'copy_attempt' | 'paste_attempt' | 'context_menu' | 'key_combination' | 
        'window_resize' | 'screen_capture' | 'multiple_tabs' | 'browser_change' | 'fullscreen_exit' |
        'suspicious_activity' | 'idle_detection' | 'mouse_leave' | 'network_change';
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details?: any;
  location?: {
    x: number;
    y: number;
  };
}

export interface SecurityConfig {
  enableKeyboardBlocking: boolean;
  enableTabMonitoring: boolean;
  enableScreenCapture: boolean;
  enableIdleDetection: boolean;
  enableNetworkMonitoring: boolean;
  allowedIdleTime: number; // in seconds
  enableFullscreenEnforcement: boolean;
}

export class ProctoringManager {
  private isActive = false;
  private events: ProctoringEvent[] = [];
  private onEventCallback?: (event: ProctoringEvent) => void;
  private suspiciousScore = 0;
  private idleTimer: NodeJS.Timeout | null = null;
  private lastActivity = Date.now();
  private config: SecurityConfig;
  private isFullscreen = false;
  private tabSwitchCount = 0;
  private startTime = Date.now();

  constructor(onEvent?: (event: ProctoringEvent) => void, config?: Partial<SecurityConfig>) {
    this.onEventCallback = onEvent;
    this.config = {
      enableKeyboardBlocking: true,
      enableTabMonitoring: true,
      enableScreenCapture: true,
      enableIdleDetection: true,
      enableNetworkMonitoring: true,
      allowedIdleTime: 300, // 5 minutes
      enableFullscreenEnforcement: false,
      ...config
    };
  }

  start() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.addEventListeners();
    document.body.classList.add('proctored');
  }

  stop() {
    if (!this.isActive) return;
    
    this.isActive = false;
    this.removeEventListeners();
    document.body.classList.remove('proctored');
  }

  private addEventListeners() {
    // Disable right-click context menu
    document.addEventListener('contextmenu', this.handleContextMenu);
    
    // Disable text selection
    document.addEventListener('selectstart', this.handleSelectStart);
    
    // Disable copy/paste
    document.addEventListener('copy', this.handleCopy);
    document.addEventListener('paste', this.handlePaste);
    document.addEventListener('cut', this.handleCut);
    
    // Monitor key combinations
    document.addEventListener('keydown', this.handleKeyDown);
    
    // Monitor tab changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    
    // Monitor window focus
    window.addEventListener('blur', this.handleWindowBlur);
    window.addEventListener('focus', this.handleWindowFocus);
  }

  private removeEventListeners() {
    document.removeEventListener('contextmenu', this.handleContextMenu);
    document.removeEventListener('selectstart', this.handleSelectStart);
    document.removeEventListener('copy', this.handleCopy);
    document.removeEventListener('paste', this.handlePaste);
    document.removeEventListener('cut', this.handleCut);
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('blur', this.handleWindowBlur);
    window.removeEventListener('focus', this.handleWindowFocus);
  }

  private handleContextMenu = (e: Event) => {
    e.preventDefault();
    this.logEvent('context_menu', null, 'high');
    this.incrementSuspiciousScore(5);
  };

  private handleSelectStart = (e: Event) => {
    const target = e.target as HTMLElement;
    // Allow selection in input/textarea elements
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }
    e.preventDefault();
    this.logEvent('suspicious_activity', { action: 'text_selection' }, 'medium');
  };

  private handleCopy = (e: Event) => {
    e.preventDefault();
    this.logEvent('copy_attempt', null, 'critical');
    this.incrementSuspiciousScore(10);
  };

  private handlePaste = (e: Event) => {
    e.preventDefault();
    this.logEvent('paste_attempt', null, 'critical');
    this.incrementSuspiciousScore(15);
  };

  private handleCut = (e: Event) => {
    e.preventDefault();
    this.logEvent('copy_attempt', { type: 'cut' }, 'critical');
    this.incrementSuspiciousScore(10);
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    // Disable common key combinations
    const forbiddenCombinations = [
      { ctrl: true, key: 'c' }, // Copy
      { ctrl: true, key: 'v' }, // Paste
      { ctrl: true, key: 'x' }, // Cut
      { ctrl: true, key: 'a' }, // Select all
      { ctrl: true, key: 's' }, // Save
      { ctrl: true, key: 'p' }, // Print
      { key: 'F12' }, // Dev tools
      { ctrl: true, shift: true, key: 'I' }, // Dev tools
      { ctrl: true, shift: true, key: 'J' }, // Dev tools
      { ctrl: true, shift: true, key: 'C' }, // Dev tools
      { alt: true, key: 'Tab' }, // Alt+Tab
    ];

    for (const combo of forbiddenCombinations) {
      if (
        (!combo.ctrl || e.ctrlKey) &&
        (!combo.shift || e.shiftKey) &&
        (!combo.alt || e.altKey) &&
        e.key === combo.key
      ) {
        e.preventDefault();
        this.logEvent('key_combination', { combination: combo }, 'high');
        this.incrementSuspiciousScore(8);
        return;
      }
    }
  };

  private handleVisibilityChange = () => {
    if (document.hidden) {
      this.tabSwitchCount++;
      this.logEvent('tab_change', { 
        hidden: true, 
        switchCount: this.tabSwitchCount,
        sessionDuration: Date.now() - this.startTime 
      }, 'high');
      this.incrementSuspiciousScore(20);
    }
  };

  private handleWindowBlur = () => {
    this.logEvent('tab_change', { type: 'blur' }, 'medium');
    this.incrementSuspiciousScore(5);
  };

  private handleWindowFocus = () => {
    this.logEvent('tab_change', { type: 'focus' }, 'low');
  };

  private logEvent(type: ProctoringEvent['type'], details?: any, severity: ProctoringEvent['severity'] = 'medium') {
    const event: ProctoringEvent = {
      type,
      timestamp: Date.now(),
      severity,
      details
    };
    
    this.events.push(event);
    this.onEventCallback?.(event);
    
    // Send to server (in a real implementation)
    // this.sendEventToServer(event);
  }

  getEvents() {
    return [...this.events];
  }

  clearEvents() {
    this.events = [];
  }

  isActiveSession() {
    return this.isActive;
  }

  getSuspiciousScore() {
    return this.suspiciousScore;
  }

  getTabSwitchCount() {
    return this.tabSwitchCount;
  }

  getSessionDuration() {
    return Date.now() - this.startTime;
  }

  private incrementSuspiciousScore(points: number) {
    this.suspiciousScore += points;
    
    // Alert if suspicious score is too high
    if (this.suspiciousScore > 50) {
      this.logEvent('suspicious_activity', { 
        totalScore: this.suspiciousScore,
        alert: 'High suspicious activity detected'
      }, 'critical');
    }
  }

  private resetActivity() {
    this.lastActivity = Date.now();
  }

  private startIdleMonitoring() {
    if (!this.config.enableIdleDetection) return;
    
    this.idleTimer = setInterval(() => {
      const idleTime = (Date.now() - this.lastActivity) / 1000;
      if (idleTime > this.config.allowedIdleTime) {
        this.logEvent('idle_detection', { idleTime }, 'medium');
      }
    }, 30000); // Check every 30 seconds
  }

  private stopIdleMonitoring() {
    if (this.idleTimer) {
      clearInterval(this.idleTimer);
      this.idleTimer = null;
    }
  }

  // Enhanced security methods
  enableFullscreenMode() {
    if (this.config.enableFullscreenEnforcement && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch((error) => {
        this.logEvent('fullscreen_exit', { error: error.message }, 'high');
      });
      this.isFullscreen = true;
    }
  }

  private monitorNetworkChanges() {
    if (!this.config.enableNetworkMonitoring) return;
    
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener('change', () => {
        this.logEvent('network_change', {
          type: connection.type,
          effectiveType: connection.effectiveType,
          downlink: connection.downlink
        }, 'low');
      });
    }
  }

  // Screen capture prevention
  private preventScreenCapture() {
    if (!this.config.enableScreenCapture) return;

    // Detect common screen capture attempts
    document.addEventListener('keyup', (e) => {
      if (e.key === 'PrintScreen') {
        this.logEvent('screen_capture', { method: 'printscreen' }, 'critical');
        this.incrementSuspiciousScore(25);
      }
    });

    // Monitor for potential screen recording tools
    if ('mediaDevices' in navigator && 'getDisplayMedia' in navigator.mediaDevices) {
      const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
      navigator.mediaDevices.getDisplayMedia = function(...args) {
        this.logEvent('screen_capture', { method: 'screen_recording' }, 'critical');
        this.incrementSuspiciousScore(30);
        return originalGetDisplayMedia.apply(navigator.mediaDevices, args);
      }.bind(this);
    }
  }
}
