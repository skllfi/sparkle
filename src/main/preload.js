const { contextBridge, ipcRenderer, app, BrowserWindow, dialog, fs } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  minimize: () => ipcRenderer.send('window-minimize'),
  toggleMaximize: () => ipcRenderer.send('window-toggle-maximize'),
  close: () => ipcRenderer.send('window-close'),
  invoke: (channel, data) => ipcRenderer.invoke(channel, data)
})
