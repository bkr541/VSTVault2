import os from "os";
import path from "path";

export function getDefaultScanFolders(): string[] {
  const home = os.homedir();

  if (process.platform === "darwin") {
    return [
      "/Library/Audio/Plug-Ins/VST",
      "/Library/Audio/Plug-Ins/VST3",
      "/Library/Audio/Plug-Ins/Components",
      path.join(home, "Library/Audio/Plug-Ins/VST"),
      path.join(home, "Library/Audio/Plug-Ins/VST3"),
      path.join(home, "Library/Audio/Plug-Ins/Components"),
      "/Library/Application Support/Avid/Audio/Plug-Ins",
    ];
  }

  if (process.platform === "win32") {
    const programFiles = process.env["ProgramFiles"] || "C:\\Program Files";
    const programFilesX86 = process.env["ProgramFiles(x86)"] || "C:\\Program Files (x86)";
    return [
      path.join(programFiles, "Common Files\\VST3"),
      path.join(programFiles, "VSTPlugins"),
      path.join(programFiles, "Steinberg\\VSTPlugins"),
      path.join(programFiles, "Common Files\\Avid\\Audio\\Plug-Ins"),
      path.join(programFilesX86, "Common Files\\VST3"),
      path.join(programFilesX86, "VSTPlugins"),
      path.join(programFilesX86, "Steinberg\\VSTPlugins"),
    ];
  }

  // Linux
  return [
    path.join(home, ".vst"),
    path.join(home, ".vst3"),
    "/usr/lib/vst",
    "/usr/lib/vst3",
    "/usr/local/lib/vst",
    "/usr/local/lib/vst3",
  ];
}
