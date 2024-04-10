/* eslint-env node */

import { spawn } from 'cross-spawn';
import { app, BrowserWindow } from 'electron';
import * as path from 'path';

let mainWindow;
let apiProcess;

function startApi() { // TODO: Remove ELECTRON_PORT as we are not using it in the API.
    apiProcess = spawn('dotnet', ['run', '--project', path.resolve(__dirname, '../../../Src/WitsmlExplorer.Api/WitsmlExplorer.Api.csproj')], { env: { ...process.env, ELECTRON_PORT: '5000' } });

    // Log messages from the API to the console
    apiProcess.stdout.on('data', (data) => {
        // eslint-disable-next-line no-console
        console.log(`API: ${data}`);
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({});

    if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
    }
    mainWindow.on('closed', () => mainWindow = null);
}

app.whenReady().then(() => {
    startApi();
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    apiProcess?.kill();
    apiProcess = null;
});

app.on('activate', () => {
    if (mainWindow == null) {
        createWindow();
    }
    if (apiProcess == null) {
        startApi();
    }
});
