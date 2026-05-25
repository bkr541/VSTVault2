import { app, BrowserWindow, shell } from "electron";
import path from "path";
import { registerIpcHandlers } from "./ipc";

const isDev = !app.isPackaged;

function createWindow() {
  const preloadPath = path.join(__dirname, "../preload/preload.js");

  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    titleBarStyle: "hiddenInset",
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    show: false,
    backgroundColor: "#F7F8FA",
  });

  // Graceful show after ready-to-show to prevent flash
  win.once("ready-to-show", () => {
    win.show();
  });

  if (isDev) {
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    win.loadFile(path.join(app.getAppPath(), "dist/index.html"));
  }

  // Open external links in the system browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
