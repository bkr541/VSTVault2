import fs from "fs";
import path from "path";

export interface PlistMetadata {
  bundleName?: string;
  bundleDisplayName?: string;
  bundleId?: string;
  bundleVersion?: string;
  shortVersionString?: string;
  manufacturer?: string;
  architecture?: string;
}

function extractPlistValue(content: string, key: string): string | undefined {
  const regex = new RegExp(`<key>${key}<\\/key>\\s*<string>([^<]+)<\\/string>`, "i");
  const match = content.match(regex);
  return match ? match[1].trim() : undefined;
}

export function readInfoPlist(bundlePath: string): PlistMetadata {
  const plistPath = path.join(bundlePath, "Contents", "Info.plist");
  if (!fs.existsSync(plistPath)) return {};

  try {
    const content = fs.readFileSync(plistPath, "utf-8");
    return {
      bundleName: extractPlistValue(content, "CFBundleName"),
      bundleDisplayName: extractPlistValue(content, "CFBundleDisplayName"),
      bundleId: extractPlistValue(content, "CFBundleIdentifier"),
      bundleVersion: extractPlistValue(content, "CFBundleVersion"),
      shortVersionString: extractPlistValue(content, "CFBundleShortVersionString"),
      manufacturer:
        extractPlistValue(content, "CFBundleManufacturer") ||
        extractPlistValue(content, "AudioUnit Manufacturer"),
      architecture: extractPlistValue(content, "LSArchitecturePriority"),
    };
  } catch {
    return {};
  }
}

const VENDOR_PATTERNS: [RegExp, string][] = [
  [/valhalla/i, "Valhalla DSP"],
  [/fabfilter|fab.filter/i, "FabFilter"],
  [/xfer/i, "Xfer Records"],
  [/native.instruments|ni\b/i, "Native Instruments"],
  [/soundtoys/i, "Soundtoys"],
  [/voxengo/i, "Voxengo"],
  [/waves/i, "Waves"],
  [/izotope/i, "iZotope"],
  [/arturia/i, "Arturia"],
  [/spectrasonics/i, "Spectrasonics"],
  [/uhe/i, "u-he"],
  [/sugar.bytes/i, "Sugar Bytes"],
  [/plugin.alliance/i, "Plugin Alliance"],
  [/slate.digital/i, "Slate Digital"],
  [/eventide/i, "Eventide"],
  [/lexicon/i, "Lexicon"],
  [/tc.electronic/i, "TC Electronic"],
  [/universal.audio|uad\b/i, "Universal Audio"],
  [/softube/i, "Softube"],
  [/cerberus.audio/i, "Cerberus Audio"],
  [/cytomic/i, "Cytomic"],
  [/noiseengineering/i, "Noise Engineering"],
];

export function guessVendorFromPath(filePath: string): string {
  for (const [pattern, vendor] of VENDOR_PATTERNS) {
    if (pattern.test(filePath)) return vendor;
  }
  return "Unknown Vendor";
}

import { PluginCategory } from "../../types";

const CATEGORY_RULES: { keys: string[]; category: PluginCategory }[] = [
  { keys: ["reverb", "valhalla", "room", "hall", "plate", "shimmer", "ambience", "spaces"], category: PluginCategory.Reverb },
  { keys: ["delay", "echo", "repeater", "tape delay", "pingpong"], category: PluginCategory.Delay },
  { keys: ["compressor", "comp", "dynamics", "vca ", "fet ", "opto ", "cla-", "api-"], category: PluginCategory.Compressor },
  { keys: ["limiter", "maximizer", "l1", "l2", "l3", "inflator", "ceiling"], category: PluginCategory.Limiter },
  { keys: ["eq", "equalizer", "pro-q", "pro-q3", "parametric", "spectrum", "tilt"], category: PluginCategory.EQ },
  { keys: ["synth", "serum", "massive", "vital", "diva", "sylenth", "nexus", "pigments", "phase plant", "omnisphere", "form ", "fm8", "operator", "alchemy"], category: PluginCategory.Synth },
  { keys: ["sampler", "kontakt", "play", "omnisphere", "stylus", "battery", "auto sampler"], category: PluginCategory.Sampler },
  { keys: ["drum", "kick", "snare", "percussion", "beat", "battery", "trigger", "hit"], category: PluginCategory.DrumMachine },
  { keys: ["distortion", "drive", "saturator", "saturation", "overdrive", "decapitator", "trash", "fuzz", "amp sim", "guitar rig"], category: PluginCategory.Distortion },
  { keys: ["chorus", "flanger", "phaser", "tremolo", "vibrato", "rotary", "dimension", "microshift", "ensemble", "mod "], category: PluginCategory.Modulation },
  { keys: ["analyzer", "meter", "scope", "span", "loudness", "goniometer", "spectrogram", "insight", "tuner"], category: PluginCategory.Analyzer },
  { keys: ["utility", "gain", "pan", "splitter", "matrix", "m/s", "phase align", "router", "trim"], category: PluginCategory.Utility },
];

export function guessCategory(pluginName: string): PluginCategory {
  const norm = pluginName.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.keys.some(k => norm.includes(k))) {
      return rule.category;
    }
  }
  return PluginCategory.Unknown;
}

export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}
