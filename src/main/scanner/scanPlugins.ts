import fs from "fs";
import path from "path";
import { PluginFormatType, DiscoveredPlugin, ScanRunResult } from "../../types";
import { readInfoPlist, guessVendorFromPath, guessCategory, normalizeName } from "./pluginMetadata";

const PLUGIN_EXTENSIONS: Record<string, PluginFormatType> = {
  ".vst": "VST2",
  ".vst3": "VST3",
  ".component": "AU",
  ".aaxplugin": "AAX",
  ".aax": "AAX",
};

function isInsideBundle(dirPath: string): boolean {
  const parts = dirPath.split(path.sep);
  return parts.some(p => Object.keys(PLUGIN_EXTENSIONS).some(ext => p.endsWith(ext)));
}

function getFileSizeSafe(filePath: string): number {
  try {
    return fs.statSync(filePath).size;
  } catch {
    return 0;
  }
}

function getModTimeSafe(filePath: string): string {
  try {
    return fs.statSync(filePath).mtime.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function scanDirectory(
  dirPath: string,
  warnings: string[],
  discovered: DiscoveredPlugin[]
): void {
  if (!fs.existsSync(dirPath)) return;

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch (err) {
    warnings.push(`Cannot read directory: ${dirPath} — ${String(err)}`);
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const ext = path.extname(entry.name).toLowerCase();
    const formatType = PLUGIN_EXTENSIONS[ext];

    if (formatType) {
      // This entry is a plugin bundle or file
      processPlugin(fullPath, entry.name, ext, formatType, warnings, discovered);
    } else if (entry.isDirectory() && !isInsideBundle(fullPath)) {
      // Regular subdirectory — recurse
      scanDirectory(fullPath, warnings, discovered);
    } else if (
      entry.isFile() &&
      ext === ".dll" &&
      formatType === undefined
    ) {
      // .dll files: treat as VST2 only if directly in a configured scan folder
      // (handled by the caller filtering, skip here to avoid noise)
    }
  }
}

function processPlugin(
  fullPath: string,
  fileName: string,
  ext: string,
  format: PluginFormatType,
  warnings: string[],
  discovered: DiscoveredPlugin[]
): void {
  let stat: fs.Stats;
  try {
    stat = fs.statSync(fullPath);
  } catch (err) {
    warnings.push(`Cannot stat: ${fullPath} — ${String(err)}`);
    return;
  }

  const baseName = path.basename(fileName, ext);
  let name = baseName;
  let vendor = "Unknown Vendor";
  let version: string | null = null;
  let architecture: string | null = null;
  let bundleId: string | null = null;
  const metadata: Record<string, unknown> = {};

  // macOS bundle: read Info.plist
  if (stat.isDirectory()) {
    const plist = readInfoPlist(fullPath);

    if (plist.bundleName) name = plist.bundleName;
    else if (plist.bundleDisplayName) name = plist.bundleDisplayName;

    if (plist.manufacturer) vendor = plist.manufacturer;
    if (plist.shortVersionString) version = plist.shortVersionString;
    else if (plist.bundleVersion) version = plist.bundleVersion;

    if (plist.bundleId) bundleId = plist.bundleId;
    if (plist.architecture) architecture = plist.architecture;

    Object.assign(metadata, plist);
  }

  // Fall back to path-based vendor guessing
  if (vendor === "Unknown Vendor") {
    vendor = guessVendorFromPath(fullPath);
  }

  // Architecture defaults
  if (!architecture) {
    architecture = format === "AAX" ? "x64" : "Universal";
  }

  discovered.push({
    name,
    normalizedName: normalizeName(name),
    vendor,
    category: guessCategory(name),
    version,
    architecture,
    format,
    filePath: fullPath,
    fileName,
    bundleId,
    fileSize: stat.isDirectory() ? 0 : stat.size,
    lastModifiedAt: stat.mtime.toISOString(),
    metadata,
  });
}

export async function runScan(folders: string[]): Promise<Omit<ScanRunResult, "durationMs">> {
  const warnings: string[] = [];
  const discovered: DiscoveredPlugin[] = [];

  for (const folder of folders) {
    if (!fs.existsSync(folder)) {
      // Skip non-existent folders silently; user chose these paths
      continue;
    }

    let stat: fs.Stats;
    try {
      stat = fs.statSync(folder);
    } catch (err) {
      warnings.push(`Cannot access folder: ${folder} — ${String(err)}`);
      continue;
    }

    if (!stat.isDirectory()) {
      warnings.push(`Not a directory: ${folder}`);
      continue;
    }

    scanDirectory(folder, warnings, discovered);
  }

  // Deduplicate: if the exact same filePath appears more than once (same folder
  // listed twice), only keep one entry.
  const seenPaths = new Set<string>();
  const deduped = discovered.filter(d => {
    if (seenPaths.has(d.filePath)) return false;
    seenPaths.add(d.filePath);
    return true;
  });

  return {
    discovered: deduped,
    warnings,
    foldersScanned: folders.length,
  };
}
