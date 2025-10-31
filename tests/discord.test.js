// tests/discord.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";
import Store from "electron-store";
import { startDiscordRPC } from "../src/main/rpc";
import { initDiscordRPC } from "../src/main/utils/discord";

vi.mock("electron-store", () => {
  const storeMocks = {
    get: vi.fn(),
    set: vi.fn(),
    clear: vi.fn(),
  };

  let storeData = {};
  const StoreClass = class {
    constructor() {
      this.get = storeMocks.get;
      this.set = storeMocks.set;
      this.clear = storeMocks.clear;

      this.get.mockImplementation((key) => storeData[key]);
      this.set.mockImplementation((key, value) => {
        storeData[key] = value;
      });
      this.clear.mockImplementation(() => {
        storeData = {};
      });
    }
  };
  return { default: StoreClass };
});

vi.mock("../src/main/rpc", () => ({
  startDiscordRPC: vi.fn(),
}));

vi.mock("../src/main/index", () => ({
  logo: "[Sparkle]:",
}));

describe("initDiscordRPC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const store = new Store();
    store.clear();
  });

  it("should call startDiscordRPC when discord-rpc is undefined", async () => {
    await initDiscordRPC();
    expect(startDiscordRPC).toHaveBeenCalledTimes(1);
    expect(new Store().set).toHaveBeenCalledWith("discord-rpc", true);
  });

  it("should call startDiscordRPC when discord-rpc is true", async () => {
    new Store().get.mockReturnValue(true);
    await initDiscordRPC();
    expect(startDiscordRPC).toHaveBeenCalledTimes(1);
  });

  it("should not call startDiscordRPC when discord-rpc is false", async () => {
    new Store().get.mockReturnValue(false);
    await initDiscordRPC();
    expect(startDiscordRPC).not.toHaveBeenCalled();
  });

  it("should check store only once when discord-rpc is true", async () => {
    new Store().get.mockReturnValue(true);
    await initDiscordRPC();
    expect(new Store().get).toHaveBeenCalledTimes(1);
  });
});
