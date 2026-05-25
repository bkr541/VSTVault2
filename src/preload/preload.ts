import { contextBridge, ipcRenderer } from "electron";
import type { VSTVaultAPI } from "../types";

const api: VSTVaultAPI = {
  scanPlugins: (options) =>
    ipcRenderer.invoke("scan:run", options),

  chooseScanFolder: () =>
    ipcRenderer.invoke("dialog:choose-folder"),

  getDefaultScanFolders: () =>
    ipcRenderer.invoke("scan:get-default-folders"),

  openContainingFolder: (filePath) =>
    ipcRenderer.invoke("shell:open-folder", filePath),

  saveExportFile: (opts) =>
    ipcRenderer.invoke("export:save-file", opts),

  getAppVersion: () =>
    ipcRenderer.invoke("app:get-version"),
};

contextBridge.exposeInMainWorld("vstVault", api);
