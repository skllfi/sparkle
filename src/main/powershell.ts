import { promises as fs } from "fs";
import path from "path";
import util from "util";
import { exec, ExecException } from "child_process";
import { app, ipcMain, IpcMainInvokeEvent } from "electron";
import { mainWindow } from "./index";
import log from "electron-log";

const execPromise = util.promisify(exec);

console.log = log.log;
console.error = log.error;
console.warn = log.warn;

async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

interface PowerShellProps {
  script: string;
  name?: string;
}

interface PowerShellResult {
  success: boolean;
  output?: string;
  error?: string;
}

export async function executePowerShell(
  _: IpcMainInvokeEvent | null,
  props: PowerShellProps,
): Promise<PowerShellResult> {
  const { script, name = "script" } = props;

  try {
    const tempDir = path.join(app.getPath("userData"), "scripts");
    await ensureDirectoryExists(tempDir);
    const tempFile = path.join(tempDir, `${name}-${Date.now()}.ps1`);

    await fs.writeFile(tempFile, script);

    const { stdout, stderr } = await execPromise(
      `powershell.exe -NoProfile -ExecutionPolicy Bypass -File "${tempFile}"`,
    );

    await fs.unlink(tempFile).catch(console.error);

    if (stderr) {
      console.warn(`PowerShell stderr [${name}]:`, stderr);
    }

    console.log(`PowerShell stdout [${name}]:`, stdout);

    return { success: true, output: stdout };
  } catch (error: any) {
    console.error(`PowerShell execution error [${name}]:`, error);
    return { success: false, error: error.message };
  }
}

interface PowerShellWindowProps {
  script: string;
  name?: string;
  noExit?: boolean;
}

async function runPowerShellInWindow(
  event: IpcMainInvokeEvent,
  { script, name = "script", noExit = true }: PowerShellWindowProps,
): Promise<PowerShellResult> {
  try {
    const tempDir = path.join(app.getPath("userData"), "scripts");
    await ensureDirectoryExists(tempDir);

    const tempFile = path.join(tempDir, `${name}-${Date.now()}.ps1`);
    await fs.writeFile(tempFile, script);
    const noExitFlag = noExit ? "-NoExit" : "";
    const command = `start powershell.exe ${noExitFlag} -ExecutionPolicy Bypass -File "${tempFile}"`;

    exec(command, (error: ExecException | null) => {
      if (error) {
        console.error(`Error launching PowerShell window [${name}]:`, error);
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error(`Error in runPowerShellInWindow [${name}]:`, error);
    return { success: false, error: error.message };
  }
}

ipcMain.handle("run-powershell-window", runPowerShellInWindow);
ipcMain.handle("run-powershell", executePowerShell);

interface HandleAppsProps {
  action: "install" | "uninstall" | "check-installed";
  apps: string[];
}

ipcMain.handle(
  "handle-apps",
  async (event: IpcMainInvokeEvent, { action, apps }: HandleAppsProps) => {
    switch (action) {
      case "install":
        for (const app of apps) {
          const command = `winget install ${app} --silent --accept-package-agreements --accept-source-agreements`;
          mainWindow?.webContents.send("install-progress", `${app}`);
          const result = await executePowerShell(event, {
            script: command,
            name: `Install-${app}`,
          });
          if (result.success) {
            console.log(`Successfully installed ${app}`);
          } else {
            console.error(`Failed to install ${app}:`, result.error);
            mainWindow?.webContents.send("install-error");
          }
        }
        mainWindow?.webContents.send("install-complete");
        break;
      case "uninstall":
        for (const app of apps) {
          const command = `winget uninstall ${app} --silent`;
          mainWindow?.webContents.send("install-progress", `${app}`);
          const result = await executePowerShell(event, {
            script: command,
            name: `Uninstall-${app}`,
          });
          if (result.success) {
            console.log(`Successfully uninstalled ${app}`);
          } else {
            console.error(`Failed to uninstall ${app}:`, result.error);
            mainWindow?.webContents.send("install-error");
          }
        }
        mainWindow?.webContents.send("install-complete");
        break;
      case "check-installed":
        try {
          const result = await executePowerShell(event, {
            script: "winget list",
            name: "check-installed",
          });

          if (!result.success || typeof result.output !== "string") {
            throw new Error(
              result.error || "Failed to get installed apps list",
            );
          }

          const escapeRegExp = (string: string) => {
            return string.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
          };

          const installedAppIds = apps.filter((appId) => {
            const regex = new RegExp(`\\b${escapeRegExp(appId)}\\b`, "i");
            return regex.test(result.output!);
          });

          mainWindow?.webContents.send("installed-apps-checked", {
            success: true,
            installed: installedAppIds,
          });
        } catch (error: any) {
          console.error("Failed to check installed apps:", error);
          mainWindow?.webContents.send("installed-apps-checked", {
            success: false,
            error: error.message,
          });
        }
        break;
      default:
        console.error(`Unknown action: ${action}`);
    }
  },
);
