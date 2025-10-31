import { create } from "zustand";

interface SystemInfo {
  cpu_model: string;
  cpu_cores: number;
  cpu_threads: number;
  gpu_model: string;
  vram: string;
  hasGPU: boolean;
  isNvidia: boolean;
  memory_total: number;
  memory_type: string;
  os: string;
  os_version: string;
  disk_model: string;
  disk_size: string;
}

interface SystemState {
  systemInfo: SystemInfo | null;
  setSystemInfo: (info: SystemInfo) => void;
}

const useSystemStore = create<SystemState>((set) => ({
  systemInfo: null,
  setSystemInfo: (info) => set(() => ({ systemInfo: info })),
}));

export default useSystemStore;
