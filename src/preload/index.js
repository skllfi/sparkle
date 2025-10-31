import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";

const api = {
  // NoDPI Handlers
  startNoDPI: () => ipcRenderer.invoke("nodpi:start"),
  stopNoDPI: () => ipcRenderer.invoke("nodpi:stop"),
  checkNoDPIStatus: () => ipcRenderer.invoke("nodpi:status"),
  getNoDPIBlacklist: () => ipcRenderer.invoke("nodpi:get-blacklist"),
  updateNoDPIBlacklist: (content) =>
    ipcRenderer.invoke("nodpi:update-blacklist", content),
  isNoDPIAutostartEnabled: () => ipcRenderer.invoke("nodpi:autostart-status"),
  enableNoDPIAutostart: () => ipcRenderer.invoke("nodpi:autostart-enable"),
  disableNoDPIAutostart: () => ipcRenderer.invoke("nodpi:autostart-disable"),
  onNoDPIOutput: (callback) => {
    const listener = (event, data) => callback(data);
    ipcRenderer.on("nodpi-stdout", listener);
    return () => ipcRenderer.removeListener("nodpi-stdout", listener);
  },

  // Proxy Handlers
  setProxy: (address, port) =>
    ipcRenderer.invoke("proxy:set", { address, port }),
  disableProxy: () => ipcRenderer.invoke("proxy:disable"),
  getProxyStatus: () => ipcRenderer.invoke("proxy:status"),
  onProxyStatusChanged: (callback) => {
    ipcRenderer.on("proxy-status-changed", callback);
    return () => ipcRenderer.removeListener("proxy-status-changed", callback);
  },
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = electronAPI;
  window.api = api;
}
