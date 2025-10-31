import { app, shell, BrowserWindow, ipcMain, globalShortcut } from "electron";
import path, { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import * as Sentry from "@sentry/electron/main";
import { IPCMode } from "@sentry/electron/main";
import log from "electron-log";
import "./system";
import "./powershell";
import "./rpc";
import "./tweakHandler";
import "./dnsHandler";
import "./backup";
import { executePowerShell } from "./powershell";
import { createTray } from "./tray";
import { setupTweaksHandlers } from "./tweakHandler";
import { setupDNSHandlers } from "./dnsHandler";
import Store from "electron-store";
import { startDiscordRPC, stopDiscordRPC } from "./rpc";
import { initAutoUpdater, triggerAutoUpdateCheck } from "./updates.js";
import { ensureWinget } from "./system";
import {
  initNoDPI,
  startNoDPI,
  stopNoDPI,
  checkNoDPIStatus,
  getNoDPIBlacklist,
  updateNoDPIBlacklist,
  isNoDPIAutostartEnabled,
  enableNoDPIAutostart,
  disableNoDPIAutostart,
} from "./nodpi";
import { setProxy, disableProxy, getProxyStatus } from "./proxyHandler";

Sentry.init({
  dsn: "https://d1e8991c715dd717e6b7b44dbc5c43dd@o4509167771648000.ingest.us.sentry.io/4509167772958720",
  ipcMode: IPCMode.Both,
});
console.log = log.log;
console.error = log.error;
console.warn = log.warn;

export const logo = "[Sparkle]:";
log.initialize();
async function Defender() {
  const Apppath = path.dirname(process.execPath);
  if (app.isPackaged) {
    const result = await executePowerShell(null, {
      script: `Add-MpPreference -ExclusionPath ${Apppath}`,
      name: "Add-MpPreference",
    });
    if (result.success) {
      console.log(logo, "Added Sparkle to Windows Defender Exclusions");
    } else {
      console.error(
        logo,
        "Failed to add Sparkle to Windows Defender Exclusions",
        result.error,
      );
    }
  } else {
    console.log(
      logo,
      "Running in development mode, skipping Windows Defender exclusion",
    );
  }
}

const store = new Store();

let trayInstance = null;
if (store.get("showTray") === undefined) {
  store.set("showTray", true);
}

ipcMain.handle("tray:get", () => {
  return store.get("showTray");
});
ipcMain.handle("tray:set", (event, value) => {
  store.set("showTray", value);
  if (mainWindow) {
    if (value) {
      if (!trayInstance) {
        trayInstance = createTray(mainWindow);
      }
    } else {
      if (trayInstance) {
        trayInstance.destroy();
        trayInstance = null;
      }
    }
  }
  return store.get("showTray");
});

const initDiscordRPC = async () => {
  if (store.get("discord-rpc") === undefined) {
    store.set("discord-rpc", true);
    console.log("(main.js) ", logo, "Starting Discord RPC");
    await startDiscordRPC();
  } else if (store.get("discord-rpc") === true) {
    console.log("(main.js) ", logo, "Starting Discord RPC (from settings)");
    await startDiscordRPC();
  }
};

initDiscordRPC().catch((err) => {
  console.warn("(main.js) ", "Failed to initialize Discord RPC:", err.message);
});

ipcMain.handle("discord-rpc:toggle", async (event, value) => {
  try {
    if (value) {
      store.set("discord-rpc", true);
      console.log(logo, "Starting Discord RPC");
      await startDiscordRPC();
    } else {
      store.set("discord-rpc", false);
      console.log(logo, "Stopping Discord RPC");
      await stopDiscordRPC();
    }
    return { success: true, enabled: store.get("discord-rpc") };
  } catch (error) {
    console.error(logo, "Error toggling Discord RPC:", error);
    return {
      success: false,
      error: error.message,
      enabled: store.get("discord-rpc"),
    };
  }
});
ipcMain.handle("discord-rpc:get", () => {
  return store.get("discord-rpc");
});

// NoDPI Handlers
ipcMain.handle("nodpi:start", () => startNoDPI());
ipcMain.handle("nodpi:stop", () => stopNoDPI());
ipcMain.handle("nodpi:status", () => checkNoDPIStatus());
ipcMain.handle("nodpi:get-blacklist", () => getNoDPIBlacklist());
ipcMain.handle("nodpi:update-blacklist", (event, content) =>
  updateNoDPIBlacklist(content),
);
ipcMain.handle("nodpi:autostart-status", () => isNoDPIAutostartEnabled());
ipcMain.handle("nodpi:autostart-enable", () => enableNoDPIAutostart());
ipcMain.handle("nodpi:autostart-disable", () => disableNoDPIAutostart());

// Proxy Handlers
ipcMain.handle("proxy:set", (event, { address, port }) =>
  setProxy(address, port),
);
ipcMain.handle("proxy:disable", () => disableProxy());
ipcMain.handle("proxy:status", () => getProxyStatus());

export let mainWindow = null;

function createWindow() {
  const shouldShow = !process.argv.includes("--hidden");

  mainWindow = new BrowserWindow({
    width: 1380,
    backgroundColor: "#0c121f",
    height: 760,
    minWidth: 1380,
    minHeight: 760,
    center: true,
    frame: false,
    show: false, // Always start hidden, we show it later if needed
    autoHideMenuBar: true,
    icon: path.join(__dirname, "../../resources/sparkle2.ico"),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      devTools: app.isPackaged ? false : true,
      sandbox: false,
    },
  });

  initNoDPI(mainWindow);

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }

  if (shouldShow) {
    mainWindow.once("ready-to-show", () => {
      mainWindow.show();
    });
  }
}

app.whenReady().then(async () => {
  createWindow();

  const nodpiAutostart = await isNoDPIAutostartEnabled();
  if (nodpiAutostart.isEnabled) {
    console.log(logo, "NoDPI autostart is enabled, starting service...");
    await startNoDPI();
  }

  initAutoUpdater(() => mainWindow);
  if (store.get("showTray")) {
    setTimeout(() => {
      trayInstance = createTray(mainWindow);
    }, 50);
  }
  setTimeout(() => {
    void triggerAutoUpdateCheck();
  }, 1500);

  setTimeout(() => {
    void Defender();
    void ensureWinget();
    setupTweaksHandlers();
    setupDNSHandlers();
  }, 0);

  if (app.isPackaged) {
    globalShortcut.register("CommandOrControl+R", () => {});
    globalShortcut.register("F5", () => {});
    globalShortcut.register("CommandOrControl+Shift+R", () => {});
  }

  electronApp.setAppUserModelId("com.parcoil.sparkle");

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  ipcMain.on("window-minimize", () => {
    if (mainWindow) mainWindow.minimize();
  });

  ipcMain.on("window-toggle-maximize", () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });

  ipcMain.on("window-close", () => {
    if (mainWindow) {
      if (store.get("showTray")) {
        mainWindow.hide();
      } else {
        app.quit();
      }
    }
  });

  app.on("quit", async () => {
    const nodpiStatus = checkNoDPIStatus();
    if (nodpiStatus.isRunning) {
      console.log(logo, "Stopping NoDPI and disabling proxy on quit...");
      await stopNoDPI();
    }
  });

  const gotTheLock = app.requestSingleInstanceLock();

  if (!gotTheLock) {
    app.quit();
  } else {
    app.on("second-instance", () => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        if (!mainWindow.isVisible()) mainWindow.show();
        mainWindow.focus();
      }
    });
  }
  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
