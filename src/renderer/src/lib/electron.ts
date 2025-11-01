export function minimize(): void {
  window.electron.ipcRenderer.send("window-minimize");
}

export function toggleMaximize(): void {
  window.electron.ipcRenderer.send("window-toggle-maximize");
}

export function close(): void {
  window.electron.ipcRenderer.send("window-close");
}

export async function invoke({
  channel,
  payload,
}: {
  channel: string;
  payload?: any;
}): Promise<any> {
  return window.electron.ipcRenderer.invoke(channel, payload);
}
