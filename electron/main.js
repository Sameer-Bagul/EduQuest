const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

// Keep a global reference of the window object
let mainWindow;

// Enable live reload for Electron in development
if (isDev) {
  try {
    require('electron-reload')(__dirname, {
      electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
      hardResetMethod: 'exit'
    });
  } catch (error) {
    console.log('electron-reload not found, continuing without live reload');
  }
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
      allowRunningInsecureContent: false
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    title: 'EduQuest - Digital Assignment Platform',
    show: false, // Don't show until ready
    titleBarStyle: 'default',
    resizable: true,
    maximizable: true,
    fullscreenable: true
  });

  // Load the app
  const startUrl = isDev 
    ? 'http://localhost:5000' 
    : `file://${path.join(__dirname, '../dist/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Focus window on creation
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Security: Prevent new window creation
  mainWindow.webContents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });

  // Handle navigation to external URLs
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    // Allow navigation within the app
    if (parsedUrl.origin !== 'http://localhost:5000' && !isDev) {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });
}

// App event handlers
app.whenReady().then(() => {
  createWindow();
  
  // macOS specific behavior
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
  
  // Set application menu
  createMenu();
});

app.on('window-all-closed', () => {
  // macOS specific behavior
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent creating new windows
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

// IPC handlers
ipcMain.handle('app-version', () => {
  return app.getVersion();
});

ipcMain.handle('show-message-box', async (event, options) => {
  const result = await dialog.showMessageBox(mainWindow, options);
  return result;
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

ipcMain.handle('get-app-path', (event, name) => {
  return app.getPath(name);
});

// Proctoring specific IPC handlers
ipcMain.handle('enable-kiosk-mode', () => {
  if (mainWindow) {
    mainWindow.setKiosk(true);
    mainWindow.setMenuBarVisibility(false);
    return true;
  }
  return false;
});

ipcMain.handle('disable-kiosk-mode', () => {
  if (mainWindow) {
    mainWindow.setKiosk(false);
    mainWindow.setMenuBarVisibility(true);
    return true;
  }
  return false;
});

ipcMain.handle('enforce-fullscreen', () => {
  if (mainWindow) {
    mainWindow.setFullScreen(true);
    return true;
  }
  return false;
});

ipcMain.handle('exit-fullscreen', () => {
  if (mainWindow) {
    mainWindow.setFullScreen(false);
    return true;
  }
  return false;
});

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Assignment',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-new-assignment');
          }
        },
        {
          label: 'Export Results',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            mainWindow.webContents.send('menu-export-results');
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Proctoring',
      submenu: [
        {
          label: 'Enable Secure Mode',
          click: () => {
            mainWindow.webContents.send('enable-secure-mode');
          }
        },
        {
          label: 'View Security Logs',
          click: () => {
            mainWindow.webContents.send('show-security-logs');
          }
        },
        { type: 'separator' },
        {
          label: 'Force Fullscreen',
          click: () => {
            ipcMain.emit('enforce-fullscreen');
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About EduQuest',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About EduQuest',
              message: 'EduQuest Digital Assignment Platform',
              detail: `Version: ${app.getVersion()}\nA comprehensive platform for digital assignments with advanced proctoring capabilities.`,
              buttons: ['OK']
            });
          }
        },
        {
          label: 'User Guide',
          click: () => {
            shell.openExternal('https://eduquest-docs.example.com');
          }
        },
        { type: 'separator' },
        {
          label: 'Report Issue',
          click: () => {
            shell.openExternal('https://github.com/eduquest/issues');
          }
        }
      ]
    }
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  dialog.showErrorBox('Unexpected Error', error.message);
});