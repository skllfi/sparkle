import { ipcMain } from "electron";
import discordRPC from "discord-rpc";
import { logo } from ".";
import jsonData from "../../package.json";
import log from "electron-log";

console.log = log.log;
console.error = log.error;
console.warn = log.warn;

const clientId = "1188686354490609754";
let rpcClient: discordRPC.Client | null;

async function startDiscordRPC(): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(async () => {
      try {
        rpcClient = new discordRPC.Client({ transport: "ipc" });

        rpcClient.on("ready", () => {
          console.log("(rpc.ts) ", logo, "Discord RPC connected");

          rpcClient
            ?.setActivity({
              details: "Optimizing your PC",
              state: `Running Sparkle v${jsonData.version || "2"}`,
              buttons: [
                {
                  label: "Download Sparkle",
                  url: "https://parcoil.com/sparkle",
                },
                {
                  label: "Join Discord",
                  url: "https://discord.com/invite/En5YJYWj3Z",
                },
              ],
              largeImageKey: "sparklelogo",
              largeImageText: "Sparkle Optimizer",
              instance: false,
            })
            .catch((err: Error) => {
              console.warn(
                "(rpc.ts) ",
                "Failed to set Discord RPC activity:",
                err.message,
              );
            });
        });

        rpcClient.on("error", (error: Error) => {
          console.warn("(rpc.ts) ", "Discord RPC error:", error.message);
          stopDiscordRPC();
        });

        await rpcClient.login({ clientId }).catch((error: Error) => {
          console.warn("(rpc.ts) ", "Discord RPC login failed:", error.message);
          stopDiscordRPC();
        });

        resolve(true);
      } catch (error: any) {
        console.warn(
          "(rpc.ts) ",
          "Failed to initialize Discord RPC:",
          error.message,
        );
        stopDiscordRPC();
        resolve(false);
      }
    }, 1000);
  });
}

function stopDiscordRPC(): boolean {
  if (rpcClient) {
    rpcClient.destroy();
    rpcClient = null;
    console.log("(rpc.ts) ", "Discord RPC disconnected");
    return true;
  }
  return false;
}

ipcMain.handle("start-discord-rpc", async () => {
  return await startDiscordRPC();
});

ipcMain.handle("stop-discord-rpc", () => {
  return stopDiscordRPC();
});

export { startDiscordRPC, stopDiscordRPC };
