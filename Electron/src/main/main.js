/* eslint-env node */

import { spawn } from 'cross-spawn';
import { app, BrowserWindow, dialog } from 'electron';
import * as path from 'path';

let mainWindow;
let apiProcess;

// Function to manual control a Promise
function deferred() {
    let resolve;
    let reject;
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}

const isDevelopment = process.env.NODE_ENV === 'development';

function getProductionPath(relativePath, isAsarUnpacked = false) {
    if (isAsarUnpacked) {
        let asarUnpackedPath = __dirname.replace(/\.asar([\\/])/, '.asar.unpacked$1');
        return path.join(asarUnpackedPath, '../', relativePath);
    } else {
        return path.join(__dirname, '../', relativePath);
    }
}
async function startApi() {

    if (isDevelopment) {
        const basePath = app.getAppPath();
        const env = {
            ...process.env,
            CONFIG_PATH: path.join(basePath, 'api.config.json'),
            "LiteDB:Name": path.join(app.getPath('userData'), 'witsml-explorer-db.db')
        };
        apiProcess = spawn('dotnet', ['run', '--project', path.join(basePath, '../Src/WitsmlExplorer.Api/WitsmlExplorer.Api.csproj')], { env });
    } else {
        const env = {
            ...process.env,
            CONFIG_PATH: './api.config.json',
            "LiteDB:Name": path.join(app.getPath('userData'), 'witsml-explorer-db.db')
        };
        const apiPath = getProductionPath('api/', true);
        apiProcess = spawn(path.join(apiPath, 'WitsmlExplorer.Api'), [], { env, cwd: apiPath });
    }

    // Promise that is manual resolved when API has started.
    const { promise, resolve, reject } = deferred();

    // The app will wait 30 seconds for the API to start, if not it will be forced quit.
    setTimeout(() => {
        reject()
    }, 30000);

    // Log messages from the API to the console
    apiProcess.stdout.setEncoding('utf8');
    apiProcess.stdout.on('data', (data) => {
        // eslint-disable-next-line no-console
        console.log(`API: ${data}`);

        if (data.includes("Application started")) resolve();
    });

    await promise.catch((e) => {
        dialog.showMessageBoxSync(this, {
            type: 'error',
            buttons: ['OK'],
            title: 'Confirm',
            message: 'API was not able to run, the application will be forced quit!'
        });
        app.quit()
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
    });
    mainWindow.setMenuBarVisibility(false);

    if (isDevelopment) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
    }
    mainWindow.on('closed', () => mainWindow = null);
}

app.whenReady().then(async () => {
    await startApi();
    createWindow();

    // From Electron docs: macOS apps generally continue running even without any windows open, and activating the app when no windows are available should open a new one.
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    });
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

