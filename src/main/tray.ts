import { Tray, Menu, app, BrowserWindow } from "electron";
import path from "path";

export function createTray(mainWindow: BrowserWindow): void {
  const tray = new Tray(path.join(__dirname, "../../resources/sparkle2.ico"));

  const contextMenu = Menu.buildFromTemplate([
    { label: "Open Window", click: () => mainWindow.show() },
    { label: "Quit", click: () => app.quit() },
  ]);

  tray.setToolTip("Sparkle Optimizer");
  tray.setTitle("Sparkle Optimizer");
  tray.setContextMenu(contextMenu);
  tray.on("click", () => {
    toggleWindowState(mainWindow);
  });
}

function toggleWindowState(mainWindow: BrowserWindow): void {
  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    mainWindow.show();
  }
}
