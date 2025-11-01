import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Определяем объект, который будет нашим единственным мок-экземпляром.
// Он должен быть определен до того, как он будет использован в фабрике jest.mock.
const mockStoreInstance = {
  get: jest.fn(),
  set: jest.fn(),
  clear: jest.fn(),
};

// Мокируем electron-store, чтобы он возвращал наш единственный экземпляр.
// Из-за поднятия этот код концептуально перемещается наверх.
// Фабричная функция замыкает mockStoreInstance.
jest.mock("electron-store", () => {
  return jest.fn().mockImplementation(() => {
    return mockStoreInstance;
  });
});

// Мокируем другие зависимости.
jest.mock("../src/main/rpc", () => ({
  startDiscordRPC: jest.fn(),
}));

jest.mock("../src/main/index", () => ({
  logo: "[Sparkle]:",
}));

// Теперь импортируем тестируемый код.
// Когда этот модуль будет оценен, он вызовет `new Store()` и получит наш мок.
import { initDiscordRPC } from "../src/main/utils/discord";
import { startDiscordRPC } from "../src/main/rpc";
import Store from "electron-store"; // Импортируем мокированную версию

describe("initDiscordRPC", () => {
  beforeEach(() => {
    // Перед каждым тестом сбрасываем состояние общего мок-экземпляра.
    mockStoreInstance.get.mockReset();
    mockStoreInstance.set.mockReset();
    mockStoreInstance.clear.mockReset();

    // Также сбрасываем другие моки
    (startDiscordRPC as jest.Mock).mockReset();
    (Store as jest.Mock).mockClear();
  });

  it("should call startDiscordRPC when discord-rpc is undefined", async () => {
    mockStoreInstance.get.mockReturnValue(undefined);
    await initDiscordRPC();
    expect(startDiscordRPC).toHaveBeenCalledTimes(1);
    expect(mockStoreInstance.set).toHaveBeenCalledWith("discord-rpc", true);
  });

  it("should call startDiscordRPC when discord-rpc is true", async () => {
    mockStoreInstance.get.mockReturnValue(true);
    await initDiscordRPC();
    expect(startDiscordRPC).toHaveBeenCalledTimes(1);
  });

  it("should not call startDiscordRPC when discord-rpc is false", async () => {
    mockStoreInstance.get.mockReturnValue(false);
    await initDiscordRPC();
    expect(startDiscordRPC).not.toHaveBeenCalled();
  });

  it("should check store only once when discord-rpc is true", async () => {
    mockStoreInstance.get.mockReturnValue(true);
    await initDiscordRPC();
    expect(mockStoreInstance.get).toHaveBeenCalledTimes(1);
  });
});
