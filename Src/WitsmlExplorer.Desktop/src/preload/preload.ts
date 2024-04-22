import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  getConfig: () => ipcRenderer.invoke("getConfig"),
  onCloseWindow: (callback: any) =>
    ipcRenderer.on("closeWindow", () => callback()),
  removeCloseWindow: () => ipcRenderer.removeAllListeners("closeWindow"),
  closeWindowResponse: (response: number) =>
    ipcRenderer.send("closeWindowResponse", response)
});
