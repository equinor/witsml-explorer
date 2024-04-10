/* eslint-env node */

import { app, BrowserWindow } from 'electron';
// import * as path from 'path';

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({});

    // Vite dev server URL
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.on('closed', () => mainWindow = null);
}

app.whenReady().then(() => {
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow == null) {
        createWindow();
    }
});
