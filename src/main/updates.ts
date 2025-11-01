import { app, ipcMain, BrowserWindow } from "electron";
import { autoUpdater } from "electron-updater";
import type { UpdateInfo, ProgressInfo } from "electron-updater";

// Define the type for the getMainWindow function
type GetMainWindow = () => BrowserWindow | null;

export function initAutoUpdater(getMainWindow: GetMainWindow): void {
  autoUpdater.autoDownload = false;
  autoUpdater.disableWebInstaller = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("update-available", (info: UpdateInfo) => {
    const win = getMainWindow();
    win?.webContents.send("updater:available", {
      version: info.version,
      releaseNotes: info.releaseNotes ?? undefined,
    });
  });

  autoUpdater.on("update-not-available", () => {
    const win = getMainWindow();
    win?.webContents.send("updater:not-available", {
      currentVersion: app.getVersion(),
    });
  });

  autoUpdater.on("error", (err: Error) => {
    const win = getMainWindow();
    win?.webContents.send("updater:error", { message: String(err) });
  });

  autoUpdater.on("download-progress", (progress: ProgressInfo) => {
    const win = getMainWindow();
    win?.webContents.send("updater:download-progress", {
      percent: progress.percent,
      transferred: progress.transferred,
      total: progress.total,
      bytesPerSecond: progress.bytesPerSecond,
    });
  });

  autoUpdater.on("update-downloaded", (info: UpdateInfo) => {
    const win = getMainWindow();
    win?.webContents.send("updater:downloaded", { version: info.version });
  });

  ipcMain.handle("updater:get-version", () => app.getVersion());

  ipcMain.handle("updater:check", async () => {
    try {
      const result = await autoUpdater.checkForUpdates();
      return { ok: true, updateInfo: result?.updateInfo ?? null };
    } catch (error) {
      return { ok: false, error: String(error) };
    }
  });

  ipcMain.handle("updater:download", async () => {
    try {
      await autoUpdater.downloadUpdate();
      return { ok: true };
    } catch (error) {
      return { ok: false, error: String(error) };
    }
  });

  ipcMain.handle("updater:install", () => {
    try {
      autoUpdater.quitAndInstall(false, true);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: String(error) };
    }
  });
}

export async function triggerAutoUpdateCheck(): Promise<void> {
  try {
    await autoUpdater.checkForUpdates();
  } catch (error) {
    // This is a silent check, so we'll just log the error
    console.warn("Failed to check for updates on startup:", error);
  }
}
