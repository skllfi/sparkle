
/// <reference types="vite/client" />

declare module '*.png' {
  const value: any;
  export default value;
}

declare module '*.svg' {
  const value: any;
  export default value;
}

// Extend the Window interface
interface Window {
  electron: {
    // Define the methods exposed by your preload script
    ipcRenderer: {
        send: (channel: string, ...args: any[]) => void;
        on: (channel: string, listener: (...args: any[]) => void) => void;
        invoke: (channel: string, ...args: any[]) => Promise<any>;
        removeListener: (channel: string, listener: (...args: any[]) => void) => void;
        removeAllListeners: (channel: string) => void;
    }
    relaunch: () => void;
    openBrowser: (url: string) => void;
    close: () => void;
    minimize: () => void;
    toggleMaximize: () => void;
    isMaximized: () => Promise<boolean>;
    onMaximizedStateChanged: (callback: (isMaximized: boolean) => void) => void;
  };
  api: {
    // Define the methods exposed via contextBridge
    [key: string]: (...args: any[]) => Promise<any> | void;
  };
}

// Add types for React's CSSProperties
declare namespace React {
  interface CSSProperties {
    WebkitAppRegion?: 'drag' | 'no-drag';
  }
}
