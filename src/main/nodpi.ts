import { execFile, exec, ChildProcess } from "child_process";
import path from "path";
import fs from "fs/promises";
import { setProxy, disableProxy } from "./proxyHandler";
import { BrowserWindow } from "electron";

let nodpiProcess: ChildProcess | null = null;
let mainWindow: BrowserWindow | null = null;

const nodpiPath = path.join(process.resourcesPath, "bin", "nodpi", "NoDPI.exe");
const blacklistPath = path.join(
  process.resourcesPath,
  "bin",
  "nodpi",
  "blacklist.txt",
);

export function initNoDPI(mWindow: BrowserWindow): void {
  mainWindow = mWindow;
}

interface StartNoDPIResult {
  success: boolean;
  message?: string;
  error?: string;
}

export function startNoDPI(): Promise<StartNoDPIResult> {
  return new Promise((resolve) => {
    if (nodpiProcess) {
      resolve({ success: true, message: "NoDPI is already running." });
      return;
    }

    nodpiProcess = execFile(nodpiPath);

    nodpiProcess.stdout?.on("data", (data: string) => {
      if (mainWindow) {
        mainWindow.webContents.send("nodpi-stdout", data.toString());
      }
    });

    nodpiProcess.stderr?.on("data", (data: string) => {
      console.error(`NoDPI stderr: ${data}`);
    });

    nodpiProcess.on("close", (code: number) => {
      console.log(`NoDPI process exited with code ${code}`);
      nodpiProcess = null;
      void disableProxy(); // Disable proxy on unexpected close
      if (mainWindow) {
        mainWindow.webContents.send("proxy-status-changed");
      }
    });

    nodpiProcess.on("spawn", async () => {
      try {
        await setProxy("127.0.0.1", 8080);
        if (mainWindow) {
          mainWindow.webContents.send("proxy-status-changed");
        }
        resolve({ success: true });
      } catch (error: any) {
        resolve({ success: false, error: error.message });
      }
    });

    nodpiProcess.on("error", (err: Error) => {
      console.error("Failed to start NoDPI process.", err);
      nodpiProcess = null;
      resolve({ success: false, error: err.message });
    });
  });
}

export async function stopNoDPI(): Promise<{ success: boolean }> {
  if (nodpiProcess) {
    nodpiProcess.kill();
    nodpiProcess = null;
  }
  await disableProxy();
  if (mainWindow) {
    mainWindow.webContents.send("proxy-status-changed");
  }
  return { success: true };
}

export function checkNoDPIStatus(): { isRunning: boolean } {
  return { isRunning: nodpiProcess !== null };
}

interface BlacklistResult {
  success: boolean;
  content?: string;
  error?: string;
}

export async function getNoDPIBlacklist(): Promise<BlacklistResult> {
  try {
    const content = await fs.readFile(blacklistPath, "utf-8");
    return { success: true, content };
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return { success: true, content: "" }; // File doesn't exist, return empty string
    }
    return { success: false, error: error.message };
  }
}

export async function updateNoDPIBlacklist(content: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await fs.writeFile(blacklistPath, content, "utf-8");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}


const autostartKey = "SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run";
const autostartName = "SparkleNoDPIAutostart";

export function isNoDPIAutostartEnabled(): Promise<{ isEnabled: boolean }> {
  return new Promise((resolve) => {
    exec(`reg query "HKCU\\${autostartKey}" /v ${autostartName}`, (error) => {
      resolve({ isEnabled: !error });
    });
  });
}

export function enableNoDPIAutostart(): Promise<{
  success: boolean;
  error?: string;
}> {
  return new Promise((resolve) => {
    const command = `reg add "HKCU\\${autostartKey}" /v ${autostartName} /t REG_SZ /d "''${process.execPath}'' --hidden" /f`;
    exec(command, (error) => {
      if (error) {
        resolve({ success: false, error: error.message });
      } else {
        resolve({ success: true });
      }
    });
  });
}

export function disableNoDPIAutostart(): Promise<{
  success: boolean;
  error?: string | null;
}> {
  return new Promise((resolve) => {
    const command = `reg delete "HKCU\\${autostartKey}" /v ${autostartName} /f`;
    exec(command, (error) => {
      resolve({ success: true, error: error ? error.message : null });
    });
  });
}
