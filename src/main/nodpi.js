import { execFile, exec } from "child_process";
import path from "path";
import fs from "fs";
import { setProxy, disableProxy } from "./proxyHandler.js";

let nodpiProcess = null;
let mainWindow = null;

const nodpiPath = path.join(process.resourcesPath, "bin", "nodpi", "NoDPI.exe");
const blacklistPath = path.join(
  process.resourcesPath,
  "bin",
  "nodpi",
  "blacklist.txt",
);

export function initNoDPI(mWindow) {
  mainWindow = mWindow;
}

export function startNoDPI() {
  return new Promise((resolve) => {
    if (nodpiProcess) {
      resolve({ success: true, message: "NoDPI is already running." });
      return;
    }

    nodpiProcess = execFile(nodpiPath);

    nodpiProcess.stdout.on("data", (data) => {
      if (mainWindow) {
        mainWindow.webContents.send("nodpi-stdout", data.toString());
      }
    });

    nodpiProcess.stderr.on("data", (data) => {
      console.error(`NoDPI stderr: ${data}`);
    });

    nodpiProcess.on("close", (code) => {
      console.log(`NoDPI process exited with code ${code}`);
      nodpiProcess = null;
      disableProxy(); // Disable proxy on unexpected close
      if (mainWindow) {
        mainWindow.webContents.send("proxy-status-changed");
      }
    });

    nodpiProcess.on("spawn", async () => {
      try {
        await setProxy("127.0.0.1", "8080");
        if (mainWindow) {
          mainWindow.webContents.send("proxy-status-changed");
        }
        resolve({ success: true });
      } catch (error) {
        resolve({ success: false, error: error.message });
      }
    });

    nodpiProcess.on("error", (err) => {
      console.error("Failed to start NoDPI process.", err);
      nodpiProcess = null;
      resolve({ success: false, error: err.message });
    });
  });
}

export async function stopNoDPI() {
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

export function checkNoDPIStatus() {
  return { isRunning: nodpiProcess !== null };
}

export function getNoDPIBlacklist() {
  try {
    if (fs.existsSync(blacklistPath)) {
      const content = fs.readFileSync(blacklistPath, "utf-8");
      return { success: true, content };
    }
    return { success: true, content: "" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export function updateNoDPIBlacklist(content) {
  try {
    fs.writeFileSync(blacklistPath, content, "utf-8");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

const autostartKey = "SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run";
const autostartName = "SparkleNoDPIAutostart";

export function isNoDPIAutostartEnabled() {
  return new Promise((resolve) => {
    exec(`reg query "HKCU\\${autostartKey}" /v ${autostartName}`, (error) => {
      resolve({ isEnabled: !error });
    });
  });
}

export function enableNoDPIAutostart() {
  return new Promise((resolve) => {
    const command = `reg add "HKCU\\${autostartKey}" /v ${autostartName} /t REG_SZ /d "${process.execPath}" --hidden" /f`;
    exec(command, (error) => {
      if (error) {
        resolve({ success: false, error: error.message });
      } else {
        resolve({ success: true });
      }
    });
  });
}

export function disableNoDPIAutostart() {
  return new Promise((resolve) => {
    const command = `reg delete "HKCU\\${autostartKey}" /v ${autostartName} /f`;
    exec(command, (error) => {
      resolve({ success: true, error: error ? error.message : null });
    });
  });
}
