const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        frame: false, 
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,  
            contextIsolation: true,  
            enableRemoteModule: false
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'public', 'index.html'));
}

ipcMain.on('minimize-window', () => mainWindow.minimize());
ipcMain.on('maximize-window', () => mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize());
ipcMain.on('close-window', () => mainWindow.close());

app.whenReady().then(createWindow);
