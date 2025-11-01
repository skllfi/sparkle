import { ipcMain } from "electron";
import discordRPC from "discord-rpc";
import { logo } from ".";
import jsonData from "../../package.json";
import log from "electron-log";

console.log = log.log;
console.error = log.error;
console.warn = log.warn;

const clientId = "1188686354490609754";
let rpcClient: discordRPC.Client | null = null;
let rpcReady = false; // A flag to ensure we only destroy a connected client

async function stopDiscordRPC(): Promise<boolean> {
  if (!rpcClient) {
    return false;
  }

  try {
    // Only call destroy() if the client was fully connected.
    // The library crashes otherwise.
    if (rpcReady) {
      await rpcClient.destroy();
    }
  } catch (error: any) {
    console.warn(
      "(rpc.ts) ",
      "Error destroying Discord RPC client:",
      error.message,
    );
  }

  console.log("(rpc.ts) ", "Discord RPC disconnected");
  rpcClient = null;
  rpcReady = false;
  return true;
}

async function startDiscordRPC(): Promise<boolean> {
  // Clean up any existing client before starting a new one
  if (rpcClient) {
    await stopDiscordRPC();
  }

  rpcClient = new discordRPC.Client({ transport: "ipc" });
  rpcReady = false; // Reset the flag for the new client

  try {
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Connection timed out"));
      }, 10000); // 10-second timeout

      // Attach listeners before login to prevent race conditions
      rpcClient?.once("ready", () => {
        clearTimeout(timeout);
        rpcReady = true; // Set the flag on successful connection
        resolve();
      });

      rpcClient?.once("error", (err) => {
        clearTimeout(timeout);
        reject(err);
      });

      // login can throw an error if the client is not running
      rpcClient?.login({ clientId }).catch((err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });

    console.log("(rpc.ts) ", logo, "Discord RPC connected");

    // Check client exists before setting activity (it might have been stopped)
    if (rpcClient) {
      await rpcClient.setActivity({
        details: "Optimizing your PC",
        state: `Running Sparkle v${jsonData.version || "2"}`,
        buttons: [
          { label: "Download Sparkle", url: "https://parcoil.com/sparkle" },
          {
            label: "Join Discord",
            url: "https://discord.com/invite/En5YJYWj3Z",
          },
        ],
        largeImageKey: "sparklelogo",
        largeImageText: "Sparkle Optimizer",
        instance: false,
      });
    }

    return true;
  } catch (err: any) {
    console.warn("(rpc.ts) ", "Discord RPC failed to start:", err.message);
    // Perform cleanup if start fails
    await stopDiscordRPC();
    return false;
  }
}

ipcMain.handle("start-discord-rpc", async () => {
  return await startDiscordRPC();
});

ipcMain.handle("stop-discord-rpc", async () => {
  return await stopDiscordRPC();
});

export { startDiscordRPC, stopDiscordRPC };
