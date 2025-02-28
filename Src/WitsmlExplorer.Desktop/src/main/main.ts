/* eslint-disable no-console */
/// <reference types="vite/client" />

import { spawn } from "cross-spawn";
import {
  app,
  BrowserWindow,
  dialog,
  Event,
  ipcMain,
  IpcMainEvent,
  MessageBoxOptions
} from "electron";
import { autoUpdater, ProgressInfo, UpdateInfo } from "electron-updater";
import * as fs from "fs";
import * as path from "path";

// Auto updater settings
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;
let isUpdateAvailableChecked = false;

let apiProcess: any;

const isDevelopment = process.env.NODE_ENV === "development";
const isTest = process.env.ELECTRON_IS_TEST === "true";

interface AppConfig {
  apiPort: string;
  dbPath: string;
  logsPath: string;
  enableHttp: string;
}

// Function to read the configuration file. If it does not exist, create it with default values.
function readOrCreateAppConfig() {
  const userDataPath = app.getPath("userData");
  const configPath = path.join(userDataPath, "config.json");
  const defaultConfig: AppConfig = {
    apiPort: "35427",
    dbPath: path.join(userDataPath, "witsml-explorer-db.db"),
    logsPath: path.join(userDataPath, "logs"),
    enableHttp: "false"
  };

  let config: AppConfig;
  let existingConfig: AppConfig;

  try {
    const configData = fs.readFileSync(configPath, "utf-8");
    existingConfig = JSON.parse(configData);
    // Merge the configs to ensure that new properties are added to the existing config.
    config = { ...defaultConfig, ...existingConfig };
  } catch (err) {
    console.error(err);
    config = defaultConfig;
  }

  if (JSON.stringify(existingConfig) !== JSON.stringify(config)) {
    try {
      fs.writeFileSync(configPath, JSON.stringify(config, null, 4), "utf-8");
      console.log("Config created/updated:", configPath);
    } catch (error) {
      console.error("Failed to write configuration:", error);
      showErrorAndQuit(
        `Failed to write configuration file: ${configPath}. ${error}`
      );
    }
  }

  console.log("Using configuration:\n", config);
  return config;
}

function showErrorAndQuit(message: string) {
  dialog.showMessageBoxSync(this, {
    type: "error",
    buttons: ["OK"],
    title: "Confirm",
    message
  });
  app.quit();
}

function showUnfinishedJobsWarningOnClose(browserWindow: BrowserWindow) {
  const options: MessageBoxOptions = {
    type: "warning",
    buttons: ["Cancel", "Quit"],
    title: "WARNING",
    message: "Unfinished jobs will be terminated",
    detail:
      "You have unfinished jobs that may cause issues if not completed before exiting.\n\nAre you sure you want to exit the application?"
  };
  return dialog.showMessageBoxSync(browserWindow, options);
}

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value?: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}

// Function to manually control a Promise
export function deferred<T>(): Deferred<T> {
  let resolve: (value?: T | PromiseLike<T>) => void;
  let reject: (reason?: any) => void;
  const promise = new Promise<T>((res, rej) => {
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
      "CONFIG_PATH": path.join(basePath, "api.config.json"),
      "ASPNETCORE_URLS": `http://localhost:${appConfig.apiPort}`,
      "ASPNETCORE_ENVIRONMENT": "Development",
      "Serilog:WriteTo:1:Args:path": path.join(
        appConfig.logsPath,
        "witsml-explorer-api-.log"
      ),
      "LiteDB:Name": appConfig.dbPath,
      "enableHttp": appConfig.enableHttp
    };
    apiProcess = spawn(
      "dotnet",
      [
        "run",
        "--project",
        path.join(basePath, "../WitsmlExplorer.Api/WitsmlExplorer.Api.csproj"),
        "--no-launch-profile"
      ],
      { env }
    );
  } else {
    const env = {
      ...process.env,
      "ASPNETCORE_URLS": `http://localhost:${appConfig.apiPort}`,
      "CONFIG_PATH": "./api.config.json",
      "Serilog:WriteTo:1:Args:path": path.join(
        appConfig.logsPath,
        "witsml-explorer-api-.log"
      ),
      "LiteDB:Name": appConfig.dbPath,
      "enableHttp": appConfig.enableHttp
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
    console.log(`API: ${data}`);

    if (data.includes("Application started")) resolve();
  });

  await promise.catch(() => {
    showErrorAndQuit(
      "API was not able to run, the application will be forced quit!"
    );
  });
}

function createWindow(route: string = "") {
  const newBrowserWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, "../preload/preload.js")
    },
    icon: path.join(__dirname, "../../resources/logo.png")
  });
  newBrowserWindow.setMenuBarVisibility(false);

  const loadWindow = isDevelopment
    ? () => newBrowserWindow.loadURL(process.env["ELECTRON_RENDERER_URL"])
    : () =>
        newBrowserWindow.loadFile(
          path.join(__dirname, "../renderer/index.html")
        );

  loadWindow().then(() => {
    if (route) {
      newBrowserWindow.webContents.send("navigate", route);
    }
  });

  newBrowserWindow.on("close", async (e: Event) => {
    // If the API process is not running, we skip the close window check as it depends on the API.
    if (apiProcess === null) return;
    if (BrowserWindow.getAllWindows().length === 1) {
      e.preventDefault();
      newBrowserWindow.webContents.send("closeWindow");
    }
  });

  autoUpdater.on("update-available", (info: UpdateInfo) => {
    newBrowserWindow.webContents.send("updateStatus", {
      status: "update-available",
      updateInfo: info
    });
  });

  autoUpdater.on("update-not-available", (info: UpdateInfo) => {
    newBrowserWindow.webContents.send("updateStatus", {
      status: "update-not-available",
      updateInfo: info
    });
  });

  autoUpdater.on("checking-for-update", () => {
    newBrowserWindow.webContents.send("updateStatus", {
      status: "checking-for-update",
      updateInfo: null
    });
  });

  autoUpdater.on("update-downloaded", (info: UpdateInfo) => {
    newBrowserWindow.webContents.send("updateStatus", {
      status: "update-downloaded",
      updateInfo: info
    });
  });

  autoUpdater.on("download-progress", (info: ProgressInfo) => {
    newBrowserWindow.webContents.send("updateStatus", {
      status: "download-progress",
      updateInfo: info
    });
  });

  autoUpdater.on("error", (info: Error) => {
    newBrowserWindow.webContents.send("updateStatus", {
      status: "error",
      updateInfo: info
    });
  });
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // Only allow one instance of the application. app.on('second-instance') will be called in the first instance and create a new window instead.
  app.quit();
} else {
  app.whenReady().then(async () => {
    const appConfig = readOrCreateAppConfig();
    await startApi(appConfig);
    ipcMain.handle("getConfig", () => appConfig);

    ipcMain.on("closeWindowResponse", async (_event, isUnfinishedJobs) => {
      const browserWindow = BrowserWindow.fromWebContents(_event.sender);
      if (isUnfinishedJobs) {
        const dialogResponse = showUnfinishedJobsWarningOnClose(browserWindow);
        if (dialogResponse === 1) browserWindow.destroy();
      } else {
        browserWindow.destroy();
      }
    });

    ipcMain.on("newWindow", (_event: IpcMainEvent, route: string) => {
      createWindow(route);
    });

    ipcMain.handle("getAppVersion", () => app.getVersion());

    ipcMain.handle("checkForUpdates", () => {
      if (!isUpdateAvailableChecked && !isTest) {
        isUpdateAvailableChecked = true;
        const updateCheckResult = autoUpdater.checkForUpdates();
        return updateCheckResult;
      }
      return;
    });

    ipcMain.handle("downloadUpdate", () => {
      const downloadedPaths = autoUpdater.downloadUpdate();
      return downloadedPaths;
    });

    ipcMain.on("quitAndInstallUpdate", async (_event, isUnfinishedJobs) => {
      const browserWindow = BrowserWindow.fromWebContents(_event.sender);
      if (isUnfinishedJobs) {
        const dialogResponse = showUnfinishedJobsWarningOnClose(browserWindow);
        if (dialogResponse === 1) autoUpdater.quitAndInstall();
      } else {
        autoUpdater.quitAndInstall();
      }
    });

    createWindow();

    // From Electron docs: macOS apps generally continue running even without any windows open, and activating the app when no windows are available should open a new one.
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on("second-instance", () => {
    // Create a new window in this instance if trying to open the application again.
    createWindow();
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
}
