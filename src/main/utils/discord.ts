// src/main/utils/discord.ts
import Store from "electron-store";
import { startDiscordRPC } from "../rpc";
import { logo } from "../index";

const store = new Store();

export const initDiscordRPC = async (): Promise<void> => {
  const discordRpcEnabled = store.get("discord-rpc");

  if (discordRpcEnabled === false) {
    return;
  }

  if (discordRpcEnabled === undefined) {
    store.set("discord-rpc", true);
    console.log("(main.ts) ", logo, "Starting Discord RPC");
    await startDiscordRPC();
  } else {
    console.log("(main.ts) ", logo, "Starting Discord RPC (from settings)");
    await startDiscordRPC();
  }
};
