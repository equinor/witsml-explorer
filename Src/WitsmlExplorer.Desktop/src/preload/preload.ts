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
    ipcRenderer.send("closeWindowResponse", isUnfinishedJobs)
});
