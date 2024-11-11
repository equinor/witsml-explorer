import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  // Navigation events
  newWindow: (route: string) => ipcRenderer.send("newWindow", route),
  onNavigate: (callback: any) =>
    ipcRenderer.on("navigate", (_, route: string) => callback(route)),
  removeNavigateListener: () => ipcRenderer.removeAllListeners("navigate"),

  // Config events
  getConfig: () => ipcRenderer.invoke("getConfig"),

  // Close window events
  onCloseWindow: (callback: any) =>
    ipcRenderer.on("closeWindow", () => callback()),
  removeCloseWindowListener: () =>
    ipcRenderer.removeAllListeners("closeWindow"),
  closeWindowResponse: (isUnfinishedJobs: boolean) =>
    ipcRenderer.send("closeWindowResponse", isUnfinishedJobs),

  // App version events
  getAppVersion: () => ipcRenderer.invoke("getAppVersion"),

  // Updates events
  onUpdateStatus: (callback: any) =>
    ipcRenderer.on("updateStatus", (_, updateStatus: any) =>
      callback(updateStatus)
    ),
  removeUpdateStatusListener: () =>
    ipcRenderer.removeAllListeners("updateStatus"),
  checkForUpdates: () => ipcRenderer.invoke("checkForUpdates"),
  downloadUpdate: () => ipcRenderer.invoke("downloadUpdate"),
  quitAndInstallUpdate: (isUnfinishedJobs: boolean) =>
    ipcRenderer.send("quitAndInstallUpdate", isUnfinishedJobs)
});
