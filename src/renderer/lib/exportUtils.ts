import type { ConsolidatedPlugin } from "../../types";

export function generateCsv(plugins: ConsolidatedPlugin[]): string {
  const header = "Name,Vendor,Category,Formats,Paths,Favorite,Hidden,Tags,Notes\n";
  const rows = plugins.map(p => {
    const formats = p.formats.map(f => f.format).join("; ");
    const paths = p.formats.map(f => f.path).join("; ");
    const tags = p.tags.join("; ");
    const notes = (p.notes ?? "").replace(/"/g, '""').replace(/\n/g, " ");
    return `"${p.name}","${p.vendor}","${p.category}","${formats}","${paths}","${p.is_favorite ? "YES" : "NO"}","${p.is_hidden ? "YES" : "NO"}","${tags}","${notes}"`;
  });
  return header + rows.join("\n");
}

export function generateJson(plugins: ConsolidatedPlugin[]): string {
  return JSON.stringify(plugins, null, 2);
}

export function generateMarkdown(plugins: ConsolidatedPlugin[]): string {
  let md = `# VST Vault Plugin Inventory\n\n`;
  md += `Generated: ${new Date().toLocaleDateString()}\n`;
  md += `Total plugins: ${plugins.length}\n\n`;
  md += `| Name | Vendor | Category | Formats | Favorite | Notes |\n`;
  md += `| :--- | :--- | :--- | :--- | :---: | :--- |\n`;

  for (const p of plugins) {
    const formats = p.formats.map(f => f.format).join(", ");
    const fav = p.is_favorite ? "♥" : "";
    const notes = (p.notes ?? "").replace(/\|/g, "\\|");
    md += `| **${p.name}** | ${p.vendor} | ${p.category} | ${formats} | ${fav} | ${notes} |\n`;
  }
  return md;
}
