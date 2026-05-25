export enum PluginCategory {
  Synth = "Synth",
  Sampler = "Sampler",
  DrumMachine = "Drum Machine",
  EQ = "EQ",
  Compressor = "Compressor",
  Limiter = "Limiter",
  Reverb = "Reverb",
  Delay = "Delay",
  Distortion = "Distortion",
  Modulation = "Modulation",
  Utility = "Utility",
  Analyzer = "Analyzer",
  Unknown = "Unknown"
}

export type PluginFormatType = "VST2" | "VST3" | "AU" | "AAX";

// Table: plugins
export interface PluginEntry {
  id: string;
  name: string;
  normalized_name: string;
  vendor: string;
  category: PluginCategory;
  favorite: boolean;
  hidden: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// Table: plugin_formats
export interface PluginFormatEntry {
  id: string;
  plugin_id: string;
  format: PluginFormatType;
  file_path: string;
  file_name: string | null;
  file_size: number | null;
  bundle_id: string | null;
  created_at: string;
  updated_at: string;
}

// Table: scan_folders
export interface ScanFolderEntry {
  id: string;
  folder_path: string;
  created_at: string;
}

// Table: tags
export interface TagEntry {
  id: string;
  name: string;
}

// Table: plugin_tags
export interface PluginTagEntry {
  plugin_id: string;
  tag_id: string;
}

// Table: notes
export interface NoteEntry {
  id: string;
  plugin_id: string;
  body: string;
  created_at: string;
  updated_at: string;
}

// Table: scan_history
export interface ScanHistoryEntry {
  id: string;
  started_at: string;
  completed_at: string | null;
  scan_mode: string;
  folders_scanned: number;
  plugins_found: number;
}

// Table: scan_errors
export interface ScanErrorEntry {
  id: string;
  scan_history_id: string;
  folder_path: string;
  error_message: string;
  created_at: string;
}

// Consolidated Presentation Interface for UI
export interface ConsolidatedPlugin {
  id: string;
  name: string;
  normalized_name: string;
  vendor: string;
  category: PluginCategory;
  favorite: boolean;
  hidden: boolean;
  created_at: string;
  updated_at: string;
  formats: {
    format: PluginFormatType;
    file_path: string;
    file_name: string | null;
    file_size: number | null;
    bundle_id: string | null;
  }[];
  tags: string[];
  notes: string | null;
}

export type ScanMode = "quick" | "full" | "custom";

// ── Scan result types returned from the Electron main process ──

export interface DiscoveredPlugin {
  name: string;
  normalizedName: string;
  vendor: string;
  category: string;
  version: string | null;
  architecture: string | null;
  format: PluginFormatType;
  filePath: string;
  fileName: string;
  bundleId: string | null;
  fileSize: number;
  lastModifiedAt: string;
  metadata: Record<string, unknown>;
}

export interface ScanRunResult {
  discovered: DiscoveredPlugin[];
  warnings: string[];
  foldersScanned: number;
  durationMs: number;
}

// ── Electron preload API surface exposed on window.vstVault ──

export interface VSTVaultAPI {
  scanPlugins: (options: { folders: string[]; mode: string }) => Promise<ScanRunResult>;
  chooseScanFolder: () => Promise<string | null>;
  getDefaultScanFolders: () => Promise<string[]>;
  openContainingFolder: (filePath: string) => Promise<void>;
  saveExportFile: (opts: { filename: string; content: string }) => Promise<boolean>;
  getAppVersion: () => Promise<string>;
}

declare global {
  interface Window {
    vstVault: VSTVaultAPI;
  }
}
