export interface ProctoringEvent {
  type: 'tab_change' | 'copy_attempt' | 'paste_attempt' | 'context_menu' | 'key_combination';
  timestamp: number;
  details?: any;
}

export class ProctoringManager {
  private isActive = false;
  private events: ProctoringEvent[] = [];
  private onEventCallback?: (event: ProctoringEvent) => void;

  constructor(onEvent?: (event: ProctoringEvent) => void) {
    this.onEventCallback = onEvent;
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
    this.logEvent('context_menu');
  };

  private handleSelectStart = (e: Event) => {
    const target = e.target as HTMLElement;
    // Allow selection in input/textarea elements
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }
    e.preventDefault();
  };

  private handleCopy = (e: Event) => {
    e.preventDefault();
    this.logEvent('copy_attempt');
  };

  private handlePaste = (e: Event) => {
    e.preventDefault();
    this.logEvent('paste_attempt');
  };

  private handleCut = (e: Event) => {
    e.preventDefault();
    this.logEvent('copy_attempt');
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
        this.logEvent('key_combination', { combination: combo });
        return;
      }
    }
  };

  private handleVisibilityChange = () => {
    if (document.hidden) {
      this.logEvent('tab_change', { hidden: true });
    }
  };

  private handleWindowBlur = () => {
    this.logEvent('tab_change', { type: 'blur' });
  };

  private handleWindowFocus = () => {
    this.logEvent('tab_change', { type: 'focus' });
  };

  private logEvent(type: ProctoringEvent['type'], details?: any) {
    const event: ProctoringEvent = {
      type,
      timestamp: Date.now(),
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
}
