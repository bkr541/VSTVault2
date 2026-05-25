export type PluginFormatType = "VST2" | "VST3" | "AU" | "AAX";

// Table: plugins
export interface PluginEntry {
  id: string;
  name: string;
  normalized_name: string;
  vendor: string;
  category: string;
  favorite: boolean;
  hidden: boolean;
  description: string | null;
  is_container_shell: boolean;
  metadata_confidence: string | null;
  vendor_verified: boolean;
  product_family: string | null;
  personal_rating: number | null;
  favorite_use_case: string | null;
  complexity_level: string | null;
  character_notes: string | null;
  routing_notes: string | null;
  tutorial_url: string | null;
  website_url: string | null;
  manual_url: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

// Table: sound_sources
export interface SoundSourceEntry {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  sort_order: number;
}

// Table: producer_problems
export interface ProducerProblemEntry {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  sort_order: number;
}

// Table: desired_results
export interface DesiredResultEntry {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  sort_order: number;
}

// Table: production_stages
export interface ProductionStageEntry {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  sort_order: number;
}

// Table: plugin_use_cases
export interface PluginUseCaseEntry {
  id: string;
  user_id: string;
  plugin_id: string;
  sound_source_id: string | null;
  problem_id: string | null;
  desired_result_id: string | null;
  production_stage_id: string | null;
  effectiveness_rating: number | null;
  is_recommended: boolean;
  notes: string | null;
  source: string | null;
  confidence: string | null;
  created_at: string;
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
  version: string | null;
  architecture: string | null;
  last_modified_at: string | null;
  scan_verified_at: string | null;
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

// Table: categories
export interface CategoryEntry {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  sort_order: number;
  created_at: string;
}

// Table: subcategories
export interface SubcategoryEntry {
  id: string;
  user_id: string;
  category_id: string;
  name: string;
  slug: string;
  sort_order: number;
  created_at: string;
}

// Table: plugin_classifications
export interface PluginClassificationEntry {
  id: string;
  user_id: string;
  plugin_id: string;
  category_id: string;
  subcategory_id: string | null;
  is_primary: boolean;
  source: string | null;
  confidence: string | null;
  created_at: string;
}

// Denormalized classification item for use in ConsolidatedPlugin
export interface ClassificationItem {
  id: string;
  categoryId: string;
  subcategoryId: string | null;
  isPrimary: boolean;
  source: string | null;
  confidence: string | null;
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
  category: string;
  favorite: boolean;
  hidden: boolean;
  is_container_shell: boolean;
  metadata_confidence: string | null;
  vendor_verified: boolean;
  product_family: string | null;
  personal_rating: number | null;
  favorite_use_case: string | null;
  complexity_level: string | null;
  character_notes: string | null;
  routing_notes: string | null;
  tutorial_url: string | null;
  description: string | null;
  website_url: string | null;
  manual_url: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  formats: {
    format: PluginFormatType;
    file_path: string;
    file_name: string | null;
    file_size: number | null;
    bundle_id: string | null;
    version: string | null;
    architecture: string | null;
    last_modified_at: string | null;
    scan_verified_at: string | null;
  }[];
  tags: string[];
  notes: string | null;
  classifications: ClassificationItem[];
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
  isContainerShell: boolean;
  metadataConfidence: 'verified' | 'inferred' | 'unknown';
  productFamily: string | null;
  primaryCategorySlug: string | null;
  primarySubcategorySlug: string | null;
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
  openExternalUrl: (url: string) => Promise<void>;
}

declare global {
  interface Window {
    vstVault: VSTVaultAPI;
  }
}
