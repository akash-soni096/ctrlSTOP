const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');
const { io } = require("socket.io-client");

// --- 1. THE SECRET FLAG ---
// We use this variable to tell the window if the "Exit" command 
// came from our shortcut (True) or a user trying to Alt+F4 (False).
let isForceQuitting = false; 

const socket = io("http://localhost:3000"); 

socket.on("connect", () => {
  console.log("Connected to ctrlSTOP Brain!");
});

socket.on("command_unlock", (data) => {
  console.log("Server says: UNLOCK THIS PC!");
});

let mainWindow;

function createWindow() {
 mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
    },
  });

  mainWindow.loadURL('http://localhost:5173');

  // --- 2. UPDATED SHORTCUT LOGIC ---
  globalShortcut.register('CommandOrControl+Shift+X', () => {
    console.log("Force Quit Triggered via Shortcut");
    
    // Set the flag to TRUE before quitting
    isForceQuitting = true; 
    app.quit();
  });

  // --- 3. UPDATED LOCK LOGIC ---
  mainWindow.on('close', (e) => {
    if (isForceQuitting) {
      // If the flag is true, let the window close normally.
      // Do nothing (don't prevent default).
      return; 
    }

    // Otherwise, BLOCK IT!
    e.preventDefault(); 
    console.log("Nice try! ctrlSTOP is locking this PC.");
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
}); 

if (app.isPackaged) {
    // If running as .exe, load the baked file
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  } else {
    // If running in VS Code, load the localhost server
    mainWindow.loadURL('http://localhost:5173');
  }