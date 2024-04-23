import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  getConfig: () => ipcRenderer.invoke("getConfig"),
  onCloseWindow: (callback: any) =>
    ipcRenderer.on("closeWindow", () => callback()),
  removeCloseWindowListener: () =>
    ipcRenderer.removeAllListeners("closeWindow"),
  closeWindowResponse: (isUnfinishedJobs: boolean) =>
    ipcRenderer.send("closeWindowResponse", isUnfinishedJobs)
});
