import { ipcMain, dialog, shell } from "electron";
import fs from "fs";
import path from "path";
import { runScan } from "./scanner/scanPlugins";
import { getDefaultScanFolders } from "./scanner/defaultPluginFolders";

export function registerIpcHandlers() {
  // ── Scanner ──────────────────────────────────────────────────

  ipcMain.handle("scan:run", async (_event, opts: { folders: string[]; mode: string }) => {
    const start = Date.now();
    const result = await runScan(opts.folders);
    return { ...result, durationMs: Date.now() - start };
  });

  ipcMain.handle("scan:get-default-folders", async () => {
    return getDefaultScanFolders();
  });

  // ── Dialog ──────────────────────────────────────────────────

  ipcMain.handle("dialog:choose-folder", async (event) => {
    const win = require("electron").BrowserWindow.fromWebContents(event.sender);
    const result = await dialog.showOpenDialog(win!, {
      properties: ["openDirectory"],
      title: "Choose Plugin Scan Folder",
      buttonLabel: "Select Folder",
    });

    if (result.canceled || result.filePaths.length === 0) return null;
    return result.filePaths[0];
  });

  // ── Shell ──────────────────────────────────────────────────

  ipcMain.handle("shell:open-folder", async (_event, filePath: string) => {
    if (fs.existsSync(filePath)) {
      shell.showItemInFolder(filePath);
    } else {
      const parent = path.dirname(filePath);
      if (fs.existsSync(parent)) {
        shell.openPath(parent);
      }
    }
  });

  ipcMain.handle("shell:open-url", async (_event, url: string) => {
    if (url.startsWith("https://") || url.startsWith("http://")) {
      shell.openExternal(url);
    }
  });

  // ── Export ──────────────────────────────────────────────────

  ipcMain.handle("export:save-file", async (event, opts: { filename: string; content: string }) => {
    const win = require("electron").BrowserWindow.fromWebContents(event.sender);
    const ext = path.extname(opts.filename).slice(1) || "txt";

    const filters: Record<string, { name: string; extensions: string[] }> = {
      csv: { name: "CSV Spreadsheet", extensions: ["csv"] },
      json: { name: "JSON File", extensions: ["json"] },
      md: { name: "Markdown File", extensions: ["md"] },
    };

    const result = await dialog.showSaveDialog(win!, {
      defaultPath: opts.filename,
      filters: [filters[ext] ?? { name: "File", extensions: [ext] }],
    });

    if (result.canceled || !result.filePath) return false;

    try {
      fs.writeFileSync(result.filePath, opts.content, "utf-8");
      return true;
    } catch (err) {
      console.error("Export write error:", err);
      return false;
    }
  });

  // ── App info ──────────────────────────────────────────────────

  ipcMain.handle("app:get-version", () => {
    return require("electron").app.getVersion();
  });
}
