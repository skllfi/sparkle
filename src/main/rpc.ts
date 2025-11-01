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

async function stopDiscordRPC(): Promise<boolean> {
  if (rpcClient) {
    try {
      await rpcClient.destroy();
    } catch (error: any) {
      console.warn(
        "(rpc.ts) ",
        "Error destroying Discord RPC client (might be expected if connection failed):",
        error.message,
      );
    }
    rpcClient = null;
    console.log("(rpc.ts) ", "Discord RPC disconnected");
    return true;
  }
  return false;
}

async function startDiscordRPC(): Promise<boolean> {
  if (rpcClient) {
    await stopDiscordRPC();
  }

  rpcClient = new discordRPC.Client({ transport: "ipc" });

  try {
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Connection timed out"));
      }, 10000); // 10s timeout

      rpcClient?.once("ready", () => {
        clearTimeout(timeout);
        resolve();
      });

      rpcClient?.once("error", (err) => {
        clearTimeout(timeout);
        reject(err);
      });

      rpcClient?.login({ clientId }).catch((err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });

    console.log("(rpc.ts) ", logo, "Discord RPC connected");

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

    return true;
  } catch (err: any) {
    console.warn("(rpc.ts) ", "Discord RPC failed:", err.message);
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
