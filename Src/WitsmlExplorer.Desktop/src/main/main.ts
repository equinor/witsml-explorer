/* eslint-env node */
/* eslint-disable no-console */
/// <reference types="vite/client" />

import { spawn } from "cross-spawn";
import { app, BrowserWindow, dialog, ipcMain } from "electron";
import * as fs from 'fs';
import * as path from "path";

let mainWindow;
let apiProcess: any;

const isDevelopment = process.env.NODE_ENV === "development";

interface AppConfig {
    apiPort: string;
    dbPath: string;
}

// Function to read the configuration file. If it does not exist, create it with default values first.
function readOrCreateAppConfig() {
    const userDataPath = app.getPath('userData');
    const configPath = path.join(userDataPath, 'config.json');

    try {
        fs.accessSync(configPath);
    } catch (err) {
        const defaultConfig: AppConfig = {
            apiPort: "35427",
            dbPath: path.join(userDataPath, 'witsml-explorer-db.db')
        };
        fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 4), 'utf-8');
        console.log('Default config created:', configPath);
    }

    try {
        const configData = fs.readFileSync(configPath, 'utf-8');
        console.log('Configuration read:', configPath, '\n', configData)
        const data = JSON.parse(configData);
        if (!data) throw new Error('Invalid configuration data');
        return JSON.parse(configData);
    } catch (error) {
        console.error('Failed to read configuration:', error);
        showErrorAndQuit(`Failed to read configuration file: ${configPath}. ${error}`);
    }
}

function showErrorAndQuit(message: string) {
    dialog.showMessageBoxSync(this, {
        type: 'error',
        buttons: ['OK'],
        title: 'Confirm',
        message
    });
    app.quit()
}

// Function to manually control a Promise
function deferred() {
    let resolve: any;
    let reject: any;
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}

function getProductionPath(
    relativePath: string,
    isAsarUnpacked: boolean = false
) {
    if (isAsarUnpacked) {
        const asarUnpackedPath = __dirname.replace(
            /\.asar([\\/])/,
            ".asar.unpacked$1"
        );
        return path.join(asarUnpackedPath, "../", relativePath);
    } else {
        return path.join(__dirname, "../", relativePath);
    }
}

async function startApi(appConfig: AppConfig) {
    if (isDevelopment) {
        const basePath = app.getAppPath();
        const env = {
            ...process.env,
            CONFIG_PATH: path.join(basePath, "api.config.json"),
            ASPNETCORE_URLS: `http://localhost:${appConfig.apiPort}`,
            ASPNETCORE_ENVIRONMENT: "Development",
            "LiteDB:Name": appConfig.dbPath
        };
        apiProcess = spawn(
            "dotnet",
            [
                "run",
                "--project",
                path.join(basePath, "../WitsmlExplorer.Api/WitsmlExplorer.Api.csproj"),
                '--no-launch-profile'
            ],
            { env }
        );
    } else {
        const env = {
            ...process.env,
            ASPNETCORE_URLS: `http://localhost:${appConfig.apiPort}`,
            CONFIG_PATH: './api.config.json',
            "LiteDB:Name": appConfig.dbPath
        };
        const apiPath = getProductionPath("api/", true);
        apiProcess = spawn(path.join(apiPath, "WitsmlExplorer.Api"), [], {
            env,
            cwd: apiPath
        });
    }

    // Promise that is manually resolved when the API has started.
    const { promise, resolve, reject } = deferred();

    // The app will wait 30 seconds for the API to start, if not it will be forced quit.
    setTimeout(() => {
        reject();
    }, 60000);

    // Log messages from the API to the console
    apiProcess.stdout.setEncoding("utf8");
    apiProcess.stdout.on("data", (data: string) => {
        // eslint-disable-next-line no-console
        console.log(`API: ${data}`);

        if (data.includes("Application started")) resolve();
    });

    await promise.catch(() => {
        showErrorAndQuit('API was not able to run, the application will be forced quit!')
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        webPreferences: {
            preload: path.join(__dirname, '../preload/preload.js')
        }
    });
    mainWindow.setMenuBarVisibility(false);

    if (isDevelopment) {
        mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
    } else {
        mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
    }
    mainWindow.on("closed", (): void => (mainWindow = null));
}

app.whenReady().then(async () => {
    const appConfig = readOrCreateAppConfig();
    await startApi(appConfig);
    ipcMain.handle('getConfig', () => appConfig);
    createWindow();

    // From Electron docs: macOS apps generally continue running even without any windows open, and activating the app when no windows are available should open a new one.
    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("before-quit", () => {
    apiProcess?.kill();
    apiProcess = null;
});
