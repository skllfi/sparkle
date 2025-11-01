import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";
import { electronAPI } from "@electron-toolkit/preload";

const api = {
  // NoDPI Handlers
  startNoDPI: (): Promise<void> => ipcRenderer.invoke("nodpi:start"),
  stopNoDPI: (): Promise<void> => ipcRenderer.invoke("nodpi:stop"),
  checkNoDPIStatus: (): Promise<boolean> => ipcRenderer.invoke("nodpi:status"),
  getNoDPIBlacklist: (): Promise<string> =>
    ipcRenderer.invoke("nodpi:get-blacklist"),
  updateNoDPIBlacklist: (content: string): Promise<void> =>
    ipcRenderer.invoke("nodpi:update-blacklist", content),
  isNoDPIAutostartEnabled: (): Promise<boolean> =>
    ipcRenderer.invoke("nodpi:autostart-status"),
  enableNoDPIAutostart: (): Promise<void> =>
    ipcRenderer.invoke("nodpi:autostart-enable"),
  disableNoDPIAutostart: (): Promise<void> =>
    ipcRenderer.invoke("nodpi:autostart-disable"),
  onNoDPIOutput: (callback: (data: string) => void) => {
    const listener = (event: IpcRendererEvent, data: string) => callback(data);
    ipcRenderer.on(
      "nodpi-stdout",
      listener as (event: IpcRendererEvent, ...args: any[]) => void,
    );
    return () =>
      ipcRenderer.removeListener(
        "nodpi-stdout",
        listener as (event: IpcRendererEvent, ...args: any[]) => void,
      );
  },

  // Proxy Handlers
  setProxy: (address: string, port: number): Promise<void> =>
    ipcRenderer.invoke("proxy:set", { address, port }),
  disableProxy: (): Promise<void> => ipcRenderer.invoke("proxy:disable"),
  getProxyStatus: (): Promise<any> => ipcRenderer.invoke("proxy:status"),
  onProxyStatusChanged: (
    callback: (event: IpcRendererEvent, ...args: any[]) => void,
  ) => {
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
  // @ts-expect-error (define in dts)
  window.electron = electronAPI;
  // @ts-expect-error (define in dts)
  window.api = api;
}
