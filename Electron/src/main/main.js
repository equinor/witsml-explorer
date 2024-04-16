/* eslint-env node */

import { spawn } from 'cross-spawn';
import { app, BrowserWindow } from 'electron';
import * as path from 'path';

const basePath = app.getAppPath();

let mainWindow;
let apiProcess;

const isDevelopment = process.env.NODE_ENV === 'development';

function startApi() {
    if (isDevelopment) {
        const env = {
            ...process.env,
            CONFIG_PATH: path.resolve(basePath, 'api.config.json')
        };
        apiProcess = spawn('dotnet', ['run', '--project', path.resolve(basePath, '../Src/WitsmlExplorer.Api/WitsmlExplorer.Api.csproj')], { env });
    } else {
        const env = {
            ...process.env,
            CONFIG_PATH: './api.config.json'
        };
        const apiPath = path.resolve(__dirname, '../api/');
        apiProcess = spawn(path.resolve(apiPath, 'WitsmlExplorer.Api'), [], { env, cwd: apiPath });
    }

    // Log messages from the API to the console
    apiProcess.stdout.on('data', (data) => {
        // eslint-disable-next-line no-console
        console.log(`API: ${data}`);
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({});

    if (isDevelopment) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
    }
    mainWindow.on('closed', () => mainWindow = null);
}

app.whenReady().then(() => {
    startApi();
    // TODO: Either make sure that we wait until the API is running, or ensure that the frontend can handle the API not being available initially.
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
