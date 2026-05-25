import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  FolderPlus,
  Search,
  Activity,
  Heart,
  EyeOff,
  Download,
  Tag,
  Grid,
  List,
  Sparkles,
  AlertTriangle,
  Plus,
  Trash2,
  FolderOpen,
  Music,
  Settings,
  Check,
  Briefcase,
  FileText,
  Info,
  LogOut,
  Loader2,
} from "lucide-react";

import { supabase } from "./renderer/lib/supabaseClient";
import { generateCsv, generateJson, generateMarkdown } from "./renderer/lib/exportUtils";
import type { User } from "@supabase/supabase-js";

import {
  ConsolidatedPlugin,
  PluginCategory,
  ScanFolderEntry,
  ScanHistoryEntry,
  DiscoveredPlugin,
  ScanRunResult,
} from "./types";

import { Button } from "./renderer/components/ui/Button";
import { Input } from "./renderer/components/ui/Input";
import { Textarea } from "./renderer/components/ui/Textarea";
import { Select } from "./renderer/components/ui/Select";
import { Toggle } from "./renderer/components/ui/Toggle";
import { Card } from "./renderer/components/ui/Card";
import { Badge } from "./renderer/components/ui/Badge";
import { Modal } from "./renderer/components/ui/Modal";
import { Table } from "./renderer/components/ui/Table";
import { SearchInput } from "./renderer/components/ui/SearchInput";
import { EmptyState } from "./renderer/components/ui/EmptyState";
import { Tooltip } from "./renderer/components/ui/Tooltip";
import { IconButton } from "./renderer/components/ui/IconButton";
import { SidebarItem } from "./renderer/components/ui/SidebarItem";

// ── Auth screen ──────────────────────────────────────────────────────────────

function AuthScreen({
  onAuth,
}: {
  onAuth: (user: User) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === "login") {
        const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        if (data.user) onAuth(data.user);
      } else {
        const { data, error: authError } = await supabase.auth.signUp({ email, password });
        if (authError) throw authError;
        if (data.user) {
          setError("Check your email to confirm your account, then sign in.");
          setMode("login");
        }
      }
    } catch (err: any) {
      setError(err.message ?? "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#F7F8FA]">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center space-x-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#0F5B59] flex items-center justify-center text-white">
            <Music size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">VST Vault</h1>
            <p className="text-xs text-gray-400 font-medium">Local Plugin Indexer</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <h2 className="text-base font-bold text-gray-800 mb-1">
            {mode === "login" ? "Sign in to your vault" : "Create your vault"}
          </h2>
          <p className="text-xs text-gray-400 mb-6">
            {mode === "login"
              ? "Access your plugin catalog."
              : "Get started cataloging your plugins."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@studio.com"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5B59]/30 focus:border-[#0F5B59] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5B59]/30 focus:border-[#0F5B59] transition-all"
              />
            </div>

            {error && (
              <p className={`text-xs font-medium rounded-lg px-3 py-2 ${error.includes("Check your email") ? "bg-teal-50 text-teal-700 border border-teal-100" : "bg-red-50 text-red-600 border border-red-100"}`}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#0F5B59] text-white text-sm font-bold rounded-lg hover:bg-teal-800 transition-colors flex items-center justify-center space-x-2 disabled:opacity-60"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              <span>{mode === "login" ? "Sign In" : "Create Account"}</span>
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-5">
            {mode === "login" ? "No account yet? " : "Already have an account? "}
            <button
              onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); }}
              className="text-[#0F5B59] font-semibold hover:underline"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Core data
  const [allPlugins, setAllPlugins] = useState<ConsolidatedPlugin[]>([]);
  const [scanFolders, setScanFolders] = useState<ScanFolderEntry[]>([]);
  const [lastScan, setLastScan] = useState<ScanHistoryEntry | null>(null);
  const [dataLoading, setDataLoading] = useState(false);

  // UX filters / navigation
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [filterHidden, setFilterHidden] = useState(false);
  const [sortBy, setSortBy] = useState("name-asc");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Inspector
  const [selectedPluginId, setSelectedPluginId] = useState<string | null>(null);
  const [inspectEditCategory, setInspectEditCategory] = useState<PluginCategory>(PluginCategory.Unknown);
  const [inspectEditTagsStr, setInspectEditTagsStr] = useState("");
  const [inspectEditNotes, setInspectEditNotes] = useState("");
  const [inspectEditName, setInspectEditName] = useState("");
  const [inspectEditVendor, setInspectEditVendor] = useState("");
  const [hasEditChanges, setHasEditChanges] = useState(false);

  // Scan
  const [isScanning, setIsScanning] = useState(false);
  const [scanReport, setScanReport] = useState<(ScanRunResult & { durationMs: number; added: number }) | null>(null);
  const [showScanReportModal, setShowScanReportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");

  // ── Auth ────────────────────────────────────────────────────────────────────

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) loadAllData();
    else setAllPlugins([]);
  }, [user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setAllPlugins([]);
    setScanFolders([]);
    setLastScan(null);
    setSelectedPluginId(null);
  };

  // ── Data loading ────────────────────────────────────────────────────────────

  const loadAllData = async () => {
    setDataLoading(true);
    await Promise.all([loadPlugins(), loadScanFolders(), loadScanHistory()]);
    setDataLoading(false);
  };

  const loadPlugins = async () => {
    const [pluginsRes, formatsRes, pluginTagsRes, tagsRes, notesRes] = await Promise.all([
      supabase.from("plugins").select("*").order("name"),
      supabase.from("plugin_formats").select("*"),
      supabase.from("plugin_tags").select("*"),
      supabase.from("tags").select("*"),
      supabase.from("notes").select("*"),
    ]);

    const plugins = pluginsRes.data ?? [];
    const formats = formatsRes.data ?? [];
    const pluginTags = pluginTagsRes.data ?? [];
    const tags = tagsRes.data ?? [];
    const notes = notesRes.data ?? [];

    const consolidated: ConsolidatedPlugin[] = plugins.map(p => {
      const pFormats = formats
        .filter(f => f.plugin_id === p.id)
        .map(f => ({
          format: f.format,
          path: f.path,
          version: f.version,
          architecture: f.architecture,
          is_loadable_outside: f.is_loadable_outside,
          last_scanned: f.last_scanned,
        }));

      const tagIds = pluginTags.filter(pt => pt.plugin_id === p.id).map(pt => pt.tag_id);
      const pTags = tags.filter(t => tagIds.includes(t.id)).map(t => t.name);
      const pNote = notes.find(n => n.plugin_id === p.id)?.content ?? null;

      return {
        id: p.id,
        name: p.name,
        vendor: p.vendor,
        category: p.category as PluginCategory,
        is_favorite: p.is_favorite,
        is_hidden: p.is_hidden,
        created_at: p.created_at,
        updated_at: p.updated_at,
        formats: pFormats,
        tags: pTags,
        notes: pNote,
      };
    });

    setAllPlugins(consolidated);
  };

  const loadScanFolders = async () => {
    const { data } = await supabase.from("scan_folders").select("*").order("created_at");
    setScanFolders(
      (data ?? []).map(f => ({
        id: f.id,
        path: f.path,
        is_custom: f.is_custom,
        is_enabled: f.is_enabled ?? true,
        created_at: f.created_at,
      }))
    );
  };

  const loadScanHistory = async () => {
    const { data } = await supabase
      .from("scan_history")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(1);
    if (data && data.length > 0) setLastScan(data[0] as ScanHistoryEntry);
  };

  // ── Derived state ─────────────────────────────────────────────────────────

  const { counts, tagCounts, filteredPlugins } = useMemo(() => {
    const visible = allPlugins.filter(p => !p.is_hidden);

    const categories = Object.values(PluginCategory).reduce((acc, cat) => {
      acc[cat] = visible.filter(p => p.category === cat).length;
      return acc;
    }, {} as Record<string, number>);

    const tagMap = new Map<string, number>();
    for (const p of visible) {
      for (const t of p.tags) tagMap.set(t, (tagMap.get(t) ?? 0) + 1);
    }
    const tagCounts = Array.from(tagMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const counts = {
      total: visible.length,
      favorites: visible.filter(p => p.is_favorite).length,
      hidden: allPlugins.filter(p => p.is_hidden).length,
      categories,
    };

    let result = filterHidden
      ? allPlugins.filter(p => p.is_hidden)
      : allPlugins.filter(p => !p.is_hidden);

    if (filterFavorites) result = result.filter(p => p.is_favorite);
    if (selectedCategory !== "All") result = result.filter(p => p.category === selectedCategory);
    if (selectedTag) result = result.filter(p => p.tags.includes(selectedTag));
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.vendor.toLowerCase().includes(q) ||
          (p.notes?.toLowerCase().includes(q) ?? false)
      );
    }

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "name-desc": return b.name.localeCompare(a.name);
        case "vendor": return a.vendor.localeCompare(b.vendor);
        case "date": return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default: return a.name.localeCompare(b.name);
      }
    });

    return { counts, tagCounts, filteredPlugins: result };
  }, [allPlugins, filterHidden, filterFavorites, selectedCategory, selectedTag, search, sortBy]);

  // ── Toast ────────────────────────────────────────────────────────────────────

  const showToast = useCallback((msg: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  }, []);

  // ── Plugin actions ────────────────────────────────────────────────────────

  const selectPlugin = (p: ConsolidatedPlugin) => {
    setSelectedPluginId(p.id);
    setInspectEditName(p.name);
    setInspectEditVendor(p.vendor);
    setInspectEditCategory(p.category);
    setInspectEditTagsStr(p.tags.join(", "));
    setInspectEditNotes(p.notes ?? "");
    setHasEditChanges(false);
  };

  const handleToggleFavorite = async (pId: string) => {
    const plugin = allPlugins.find(p => p.id === pId);
    if (!plugin) return;
    const newVal = !plugin.is_favorite;
    const { error } = await supabase
      .from("plugins")
      .update({ is_favorite: newVal, updated_at: new Date().toISOString() })
      .eq("id", pId);
    if (error) { showToast("Failed to update favorite.", "error"); return; }
    setAllPlugins(prev => prev.map(p => p.id === pId ? { ...p, is_favorite: newVal } : p));
    showToast(newVal ? "Added to favorites" : "Removed from favorites");
  };

  const handleToggleHide = async (pId: string) => {
    const plugin = allPlugins.find(p => p.id === pId);
    if (!plugin) return;
    const newVal = !plugin.is_hidden;
    const { error } = await supabase
      .from("plugins")
      .update({ is_hidden: newVal, updated_at: new Date().toISOString() })
      .eq("id", pId);
    if (error) { showToast("Failed to update visibility.", "error"); return; }
    setAllPlugins(prev => prev.map(p => p.id === pId ? { ...p, is_hidden: newVal } : p));
    if (selectedPluginId === pId) setSelectedPluginId(null);
    showToast(newVal ? "Plugin hidden" : "Plugin restored");
  };

  const handleSaveInspectEdits = async () => {
    if (!selectedPluginId || !user) return;
    const tagsArray = inspectEditTagsStr
      .split(",")
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const { error: pluginError } = await supabase
      .from("plugins")
      .update({
        name: inspectEditName,
        vendor: inspectEditVendor,
        category: inspectEditCategory,
        updated_at: new Date().toISOString(),
      })
      .eq("id", selectedPluginId);

    if (pluginError) { showToast("Failed to save plugin.", "error"); return; }

    // Update notes
    const { data: existingNote } = await supabase
      .from("notes")
      .select("id")
      .eq("plugin_id", selectedPluginId)
      .maybeSingle();

    if (inspectEditNotes.trim()) {
      if (existingNote) {
        await supabase.from("notes").update({
          content: inspectEditNotes,
          updated_at: new Date().toISOString(),
        }).eq("id", existingNote.id);
      } else {
        await supabase.from("notes").insert({
          plugin_id: selectedPluginId,
          content: inspectEditNotes,
          user_id: user.id,
        });
      }
    } else if (existingNote) {
      await supabase.from("notes").delete().eq("id", existingNote.id);
    }

    // Update tags
    await supabase.from("plugin_tags").delete().eq("plugin_id", selectedPluginId);
    for (const tagName of tagsArray) {
      let { data: tag } = await supabase
        .from("tags")
        .select("id")
        .ilike("name", tagName)
        .maybeSingle();
      if (!tag) {
        const { data: newTag } = await supabase
          .from("tags")
          .insert({ name: tagName, user_id: user.id })
          .select("id")
          .single();
        tag = newTag;
      }
      if (tag) {
        await supabase.from("plugin_tags").insert({
          plugin_id: selectedPluginId,
          tag_id: tag.id,
          user_id: user.id,
        });
      }
    }

    showToast("Plugin saved!");
    setHasEditChanges(false);
    await loadPlugins();
  };

  // ── Scan ─────────────────────────────────────────────────────────────────

  const handleTriggerScan = async (mode: "quick" | "full" | "custom") => {
    if (!user) { showToast("Sign in to sync scan results.", "error"); return; }
    if (!window.vstVault) { showToast("Scan requires the Electron app — run `npm run dev` instead of launch.command.", "error"); return; }

    const enabledFolders = scanFolders.filter(f => f.is_enabled !== false).map(f => f.path);
    if (enabledFolders.length === 0) {
      showToast("No scan folders configured. Add folders in Settings.", "info");
      return;
    }

    setIsScanning(true);
    const modeLabel = mode === "full" ? "Full Rescan" : mode === "custom" ? "Custom Scan" : "Quick Scan";
    showToast(`Running ${modeLabel}...`, "info");

    // Record scan start
    const { data: historyRow } = await supabase
      .from("scan_history")
      .insert({
        started_at: new Date().toISOString(),
        scan_mode: modeLabel,
        folders_scanned: enabledFolders.length,
        plugins_discovered: 0,
        plugins_added: 0,
        user_id: user.id,
      })
      .select("id")
      .single();

    try {
      const result = await window.vstVault.scanPlugins({ folders: enabledFolders, mode });
      const added = await processScanResults(result, user.id);

      // Update scan history
      if (historyRow) {
        await supabase.from("scan_history").update({
          plugins_discovered: result.discovered.length,
          plugins_added: added,
          errors_logged: result.warnings.length > 0 ? JSON.stringify(result.warnings) : null,
        }).eq("id", historyRow.id);

        // Log scan errors
        for (const warning of result.warnings) {
          await supabase.from("scan_errors").insert({
            scan_history_id: historyRow.id,
            folder_path: "",
            error_message: warning,
            user_id: user.id,
          }).maybeSingle();
        }
      }

      setScanReport({ ...result, added });
      setShowScanReportModal(true);
      await Promise.all([loadPlugins(), loadScanHistory()]);
    } catch (err: any) {
      showToast("Scan failed: " + String(err.message ?? err), "error");
      if (historyRow) {
        await supabase.from("scan_history").update({
          errors_logged: JSON.stringify([String(err)]),
        }).eq("id", historyRow.id);
      }
    } finally {
      setIsScanning(false);
    }
  };

  const processScanResults = async (result: ScanRunResult, userId: string): Promise<number> => {
    // Group discovered plugins by normalized name for deduplication
    const groups = new Map<string, DiscoveredPlugin[]>();
    for (const d of result.discovered) {
      const g = groups.get(d.normalizedName) ?? [];
      g.push(d);
      groups.set(d.normalizedName, g);
    }

    let added = 0;

    for (const [, group] of groups) {
      const first = group[0];

      // Check if plugin already exists (match by name, case-insensitive)
      const existing = allPlugins.find(
        p => p.name.toLowerCase() === first.name.toLowerCase()
      );

      let pluginId: string;

      if (!existing) {
        const { data: newPlugin, error } = await supabase
          .from("plugins")
          .insert({
            name: first.name,
            vendor: first.vendor,
            category: first.category,
            is_favorite: false,
            is_hidden: false,
            user_id: userId,
          })
          .select("id")
          .single();

        if (error || !newPlugin) {
          console.error("Failed to insert plugin:", first.name, error);
          continue;
        }
        pluginId = newPlugin.id;
        added++;
      } else {
        pluginId = existing.id;
      }

      for (const d of group) {
        // Check if this format+path already exists
        const { data: existingFmt } = await supabase
          .from("plugin_formats")
          .select("id")
          .eq("plugin_id", pluginId)
          .eq("format", d.format)
          .eq("path", d.filePath)
          .maybeSingle();

        if (existingFmt) {
          await supabase.from("plugin_formats").update({
            version: d.version,
            last_scanned: new Date().toISOString(),
          }).eq("id", existingFmt.id);
        } else {
          await supabase.from("plugin_formats").insert({
            plugin_id: pluginId,
            format: d.format,
            path: d.filePath,
            version: d.version,
            architecture: d.architecture,
            is_loadable_outside: d.format !== "AAX",
            last_scanned: new Date().toISOString(),
            user_id: userId,
          });
        }
      }
    }

    return added;
  };

  // ── Scan folders ─────────────────────────────────────────────────────────

  const handleChooseFolder = async () => {
    if (!window.vstVault) { showToast("Native folder picker requires Electron.", "info"); return; }
    const chosen = await window.vstVault.chooseScanFolder();
    if (!chosen || !user) return;

    const already = scanFolders.find(f => f.path === chosen);
    if (already) { showToast("Folder already in list.", "info"); return; }

    const { data, error } = await supabase
      .from("scan_folders")
      .insert({ path: chosen, is_custom: true, is_enabled: true, user_id: user.id })
      .select()
      .single();

    if (error) { showToast("Failed to save folder.", "error"); return; }
    setScanFolders(prev => [...prev, {
      id: data.id, path: data.path, is_custom: data.is_custom,
      is_enabled: data.is_enabled ?? true, created_at: data.created_at,
    }]);
    showToast("Folder added to scan list.");
  };

  const handleRemoveFolder = async (id: string) => {
    const { error } = await supabase.from("scan_folders").delete().eq("id", id);
    if (error) { showToast("Failed to remove folder.", "error"); return; }
    setScanFolders(prev => prev.filter(f => f.id !== id));
    showToast("Folder removed.");
  };

  const handleLoadDefaultFolders = async () => {
    if (!window.vstVault || !user) return;
    const defaults = await window.vstVault.getDefaultScanFolders();
    let added = 0;
    for (const p of defaults) {
      const already = scanFolders.find(f => f.path === p);
      if (already) continue;
      const { data } = await supabase
        .from("scan_folders")
        .insert({ path: p, is_custom: false, is_enabled: true, user_id: user.id })
        .select()
        .single();
      if (data) {
        setScanFolders(prev => [...prev, {
          id: data.id, path: data.path, is_custom: data.is_custom,
          is_enabled: data.is_enabled ?? true, created_at: data.created_at,
        }]);
        added++;
      }
    }
    if (added > 0) showToast(`Added ${added} default folder${added === 1 ? "" : "s"}.`);
    else showToast("Default folders already in list.", "info");
  };

  // ── Exports ───────────────────────────────────────────────────────────────

  const handleExport = async (format: "csv" | "json" | "md") => {
    if (!window.vstVault) { showToast("Export requires Electron.", "info"); return; }
    const visible = filteredPlugins;
    let content = "";
    let filename = "";

    switch (format) {
      case "csv":
        content = generateCsv(visible);
        filename = "vst_vault_inventory.csv";
        break;
      case "json":
        content = generateJson(visible);
        filename = "vst_vault_inventory.json";
        break;
      case "md":
        content = generateMarkdown(visible);
        filename = "vst_vault_inventory.md";
        break;
    }

    const saved = await window.vstVault.saveExportFile({ filename, content });
    if (saved) showToast("Export saved successfully.");
    else showToast("Export cancelled.", "info");
  };

  const handleOpenFolder = async (filePath: string) => {
    if (!window.vstVault) { showToast("Open folder requires Electron.", "info"); return; }
    await window.vstVault.openContainingFolder(filePath);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F7F8FA]">
        <Loader2 size={24} className="animate-spin text-[#0F5B59]" />
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onAuth={u => setUser(u)} />;
  }

  const activePlugin = filteredPlugins.find(p => p.id === selectedPluginId) ??
    allPlugins.find(p => p.id === selectedPluginId);
  const categoryOptions = Object.values(PluginCategory).map(cat => ({ value: cat, label: cat }));

  return (
    <div className="flex h-screen bg-[#F7F8FA] font-sans antialiased overflow-hidden">

      {/* Toast */}
      {toastMessage && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-lg shadow-lg border text-sm font-semibold tracking-wide flex items-center space-x-3.5 animate-in fade-in slide-in-from-top-6 duration-200 ${
          toastType === "error"
            ? "bg-red-50 text-red-700 border-red-200"
            : toastType === "info"
            ? "bg-teal-50 text-[#0F5B59] border-teal-200"
            : "bg-teal-50 text-[#0F5B59] border-teal-100"
        }`}>
          <div className={`p-1 rounded-full ${toastType === "error" ? "bg-red-100" : "bg-teal-100"}`}>
            <Check size={14} />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-white border-r border-[#E5E7EB] flex flex-col z-30 select-none">

        {/* Brand */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0F5B59] flex items-center justify-center text-white">
              <Music size={18} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-800 tracking-tight leading-none">VST Vault</h1>
              <span className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">Local Indexer</span>
            </div>
          </div>
          <IconButton size="sm" onClick={() => setShowSettingsModal(true)}>
            <Settings size={15} />
          </IconButton>
        </div>

        {/* Scan commands */}
        <div className="p-4 border-b border-gray-100 bg-[#F7F8FA]/60">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1 block mb-2.5">Auto discovery</span>
          <div className="space-y-2">
            <Button
              className="w-full justify-start space-x-2 relative cursor-pointer"
              size="sm"
              disabled={isScanning}
              onClick={() => handleTriggerScan("quick")}
            >
              {isScanning ? (
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white/50 border-t-white" />
              ) : (
                <Activity size={14} />
              )}
              <span>{isScanning ? "Scanning..." : "Run Quick Scan"}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isScanning}
              onClick={() => handleTriggerScan("full")}
              className="w-full text-[11px]"
            >
              Full Rescan
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2 block mb-1.5">Library</span>
            <SidebarItem label="All Plugins" icon={<Briefcase size={14} />}
              active={!filterFavorites && !filterHidden && selectedCategory === "All" && !selectedTag}
              count={counts.total}
              onClick={() => { setFilterFavorites(false); setFilterHidden(false); setSelectedCategory("All"); setSelectedTag(null); }} />
            <SidebarItem label="Favorites" icon={<Heart size={14} />}
              active={filterFavorites && !filterHidden} count={counts.favorites}
              onClick={() => { setFilterFavorites(true); setFilterHidden(false); setSelectedCategory("All"); setSelectedTag(null); }} />
            <SidebarItem label="Hidden" icon={<EyeOff size={14} />}
              active={filterHidden} count={counts.hidden}
              onClick={() => { setFilterHidden(true); setFilterFavorites(false); setSelectedCategory("All"); setSelectedTag(null); }} />
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2 block mb-1.5">Categories</span>
            {categoryOptions.map(opt => {
              const active = selectedCategory === opt.value && !filterFavorites && !filterHidden && !selectedTag;
              const qty = counts.categories[opt.value] || 0;
              return (
                <SidebarItem key={opt.value} label={opt.label} icon={<Music size={13} />}
                  active={active} count={qty}
                  onClick={() => { setSelectedCategory(opt.value); setFilterFavorites(false); setFilterHidden(false); setSelectedTag(null); }} />
              );
            })}
          </div>

          {tagCounts.length > 0 && (
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2 block mb-1.5">Tags</span>
              {tagCounts.map(t => (
                <SidebarItem key={t.name} label={t.name} icon={<Tag size={13} />}
                  active={selectedTag === t.name && !filterFavorites && !filterHidden}
                  count={t.count}
                  onClick={() => { setSelectedTag(t.name); setSelectedCategory("All"); setFilterFavorites(false); setFilterHidden(false); }} />
              ))}
            </div>
          )}
        </div>

        {/* Last scan status */}
        <div className="border-t border-[#E5E7EB] p-4 select-none">
          <div className="rounded-xl bg-[#F3F4F6] p-4 text-left">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Last Scan</div>
            <div className="mt-1 text-xs font-semibold text-gray-700">
              {lastScan
                ? new Date(lastScan.started_at).toLocaleString([], { hour: "2-digit", minute: "2-digit", hour12: true })
                : "Never"}
            </div>
            <div className="mt-3 h-1.5 w-full rounded-full bg-[#E5E7EB]">
              <div className="h-1.5 w-full rounded-full bg-[#0F5B59]" />
            </div>
            <div className="mt-2 text-[10px] text-[#6B7280]">
              {counts.total.toLocaleString()} plugins indexed
            </div>
          </div>
        </div>

        {/* Footer: user + sign out */}
        <div className="p-3 border-t border-gray-100 bg-[#F7F8FA]/30 flex items-center justify-between">
          <span className="text-[10px] text-gray-400 font-mono truncate max-w-[140px]">{user.email}</span>
          <Tooltip content="Sign out">
            <IconButton size="sm" variant="ghost" onClick={handleSignOut}>
              <LogOut size={13} />
            </IconButton>
          </Tooltip>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA]">

        {/* Top bar */}
        <header className="h-16 bg-white border-b border-[#E5E7EB] px-6 flex items-center justify-between flex-shrink-0 z-20">
          <div className="flex items-center space-x-3 w-96">
            <SearchInput
              value={search}
              onChange={e => setSearch(e.target.value)}
              onClear={() => setSearch("")}
              placeholder="Search plugin names, vendors, notes..."
            />
          </div>

          <div className="flex items-center space-x-4">
            {/* Export buttons */}
            <div className="flex items-center bg-gray-55 text-xs text-gray-500 font-semibold border border-gray-200 rounded divide-x divide-gray-200 shadow-xs">
              <button
                onClick={() => handleExport("csv")}
                className="px-3 py-1.5 hover:bg-gray-50 text-gray-600 flex items-center space-x-1 hover:text-[#0F5B59] transition-all"
                title="Export as CSV spreadsheet"
              >
                <FileText size={12} />
                <span>CSV</span>
              </button>
              <button
                onClick={() => handleExport("md")}
                className="px-3 py-1.5 hover:bg-gray-50 text-gray-600 flex items-center space-x-1 hover:text-[#0F5B59] transition-all"
                title="Export as Markdown"
              >
                <Sparkles size={12} />
                <span>Markdown</span>
              </button>
              <button
                onClick={() => handleExport("json")}
                className="px-3 py-1.5 hover:bg-gray-50 text-gray-600 flex items-center space-x-1 hover:text-[#0F5B59] transition-all"
                title="Export as JSON"
              >
                <Download size={12} />
                <span>JSON</span>
              </button>
            </div>

            {/* View mode toggle */}
            <div className="flex items-center border border-gray-200 rounded overflow-hidden shadow-xs bg-white">
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 transition-colors cursor-pointer ${viewMode === "list" ? "bg-teal-50 text-[#0F5B59]" : "bg-white text-gray-400 hover:text-gray-600"}`}
              >
                <List size={15} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 transition-colors cursor-pointer ${viewMode === "grid" ? "bg-teal-50 text-[#0F5B59]" : "bg-white text-gray-400 hover:text-gray-600"}`}
              >
                <Grid size={15} />
              </button>
            </div>
          </div>
        </header>

        {/* Plugin list */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                  {filterFavorites ? "Favorites" : filterHidden ? "Hidden Plugins" : `${selectedCategory} Plugins`}
                </h2>
                {selectedTag && <Badge variant="primary" className="ml-2 font-mono">tag: {selectedTag}</Badge>}
              </div>
              <p className="text-xs text-gray-400 mt-1 font-medium select-none">
                {dataLoading ? "Loading..." : `${filteredPlugins.length} plugin${filteredPlugins.length === 1 ? "" : "s"}`}
              </p>
            </div>

            <div className="flex items-center mt-3 md:mt-0 space-x-3 text-xs">
              <span className="text-gray-400 font-semibold uppercase tracking-wider">Sort by</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-white border border-gray-200 px-3 py-1.5 rounded font-medium text-gray-700 outline-none focus:ring-1 focus:ring-[#0F5B59] focus:border-[#0F5B59] transition-all cursor-pointer shadow-xs"
              >
                <option value="name-asc">Name (A–Z)</option>
                <option value="name-desc">Name (Z–A)</option>
                <option value="vendor">Vendor</option>
                <option value="date">Date Added</option>
              </select>
            </div>
          </div>

          {filteredPlugins.length === 0 ? (
            <div className="py-20 select-none">
              <EmptyState
                title="No Plugins Found"
                description={
                  search || selectedTag || selectedCategory !== "All"
                    ? "Adjust your filters to find plugins."
                    : "Run a Quick Scan to discover installed plugins on this machine."
                }
                action={
                  !(search || selectedTag || selectedCategory !== "All") ? (
                    <Button onClick={() => handleTriggerScan("quick")} className="space-x-1.5">
                      <Plus size={14} />
                      <span>Run Quick Scan</span>
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={() => {
                      setSearch(""); setSelectedCategory("All"); setSelectedTag(null);
                      setFilterFavorites(false); setFilterHidden(false);
                    }}>
                      Reset Filters
                    </Button>
                  )
                }
              />
            </div>
          ) : viewMode === "list" ? (
            <div className="bg-white rounded-lg border border-gray-200/60 shadow-sm overflow-hidden">
              <Table
                columns={[
                  {
                    header: "",
                    accessor: (p: ConsolidatedPlugin) => (
                      <button
                        onClick={e => { e.stopPropagation(); handleToggleFavorite(p.id); }}
                        className={`transition-colors p-1 rounded hover:bg-gray-50 cursor-pointer ${p.is_favorite ? "text-red-500" : "text-gray-300 hover:text-gray-400"}`}
                      >
                        <Heart size={14} fill={p.is_favorite ? "#EF4444" : "none"} />
                      </button>
                    ),
                    className: "w-10 text-center",
                  },
                  {
                    header: "Plugin Name",
                    accessor: (p: ConsolidatedPlugin) => (
                      <div className="font-semibold text-gray-900 flex items-center space-x-2">
                        <span>{p.name}</span>
                        {p.is_favorite && <span className="text-[10px] bg-red-50 px-1 py-0.5 rounded text-red-500 font-bold uppercase tracking-wider shrink-0 select-none">Pref</span>}
                      </div>
                    ),
                  },
                  {
                    header: "Vendor",
                    accessor: (p: ConsolidatedPlugin) => <span className="text-gray-500 font-medium">{p.vendor}</span>,
                  },
                  {
                    header: "Category",
                    accessor: (p: ConsolidatedPlugin) => <Badge variant="neutral">{p.category}</Badge>,
                  },
                  {
                    header: "Formats",
                    accessor: (p: ConsolidatedPlugin) => (
                      <div className="flex flex-wrap gap-1">
                        {p.formats.map((fmt, idx) => {
                          const v: "primary" | "neutral" | "secondary" | "warning" =
                            fmt.format === "VST3" ? "primary" :
                            fmt.format === "AU" ? "neutral" :
                            fmt.format === "VST2" ? "secondary" : "warning";
                          return (
                            <Badge key={idx} variant={v} className="font-mono text-[9px] px-1.5 py-0">
                              {fmt.format}
                            </Badge>
                          );
                        })}
                      </div>
                    ),
                  },
                  {
                    header: "Notes / Tags",
                    accessor: (p: ConsolidatedPlugin) => (
                      <div className="max-w-[200px] truncate text-xs text-gray-400 font-mono">
                        {p.notes ? p.notes : p.tags.length > 0 ? p.tags.join(", ") : "—"}
                      </div>
                    ),
                  },
                ]}
                data={filteredPlugins}
                onRowClick={p => selectPlugin(p)}
                selectedId={selectedPluginId ?? ""}
                rowIdAccessor={p => p.id}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlugins.map(p => {
                const isSelected = selectedPluginId === p.id;
                return (
                  <Card
                    key={p.id}
                    hoverable
                    onClick={() => selectPlugin(p)}
                    className={`cursor-pointer transition-all duration-200 border text-left flex flex-col justify-between h-44 ${
                      isSelected
                        ? "border-[#0F5B59] ring-2 ring-teal-500/10 bg-teal-50/5"
                        : "border-gray-200/60 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="p-4 flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 leading-tight mb-1 truncate max-w-[160px]">{p.name}</h4>
                          <span className="text-xs text-gray-400 font-medium block">{p.vendor}</span>
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); handleToggleFavorite(p.id); }}
                          className={`p-1.5 rounded duration-150 transition-colors cursor-pointer ${p.is_favorite ? "text-red-500" : "text-gray-300 hover:bg-gray-50"}`}
                        >
                          <Heart size={14} fill={p.is_favorite ? "#EF4444" : "none"} />
                        </button>
                      </div>
                      <div className="mt-3.5 flex flex-wrap gap-1">
                        {p.formats.map((fmt, idx) => (
                          <span key={idx} className="text-[10px] font-mono font-bold bg-gray-100 hover:bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded leading-none">
                            {fmt.format}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="px-4 py-2.5 bg-[#F7F8FA] border-t border-gray-100 flex items-center justify-between">
                      <Badge variant="neutral" className="text-[10px] leading-none">{p.category}</Badge>
                      <span className="text-[9px] font-mono font-medium text-gray-400">
                        {p.formats[0]?.version ?? ""}
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* RIGHT INSPECTOR */}
      <aside className="w-96 bg-white border-l border-[#E5E7EB] flex flex-col z-20 select-text shrink-0 pb-1 h-screen">
        {activePlugin ? (
          <div className="flex flex-col h-full">
            <div className="px-5 py-4 border-b border-gray-100 bg-[#F7F8FA]/30 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Music size={15} className="text-[#0F5B59]" />
                <span className="text-base font-bold text-[#111827]">Details</span>
              </div>
              <div className="flex items-center space-x-1">
                <Tooltip content={activePlugin.is_favorite ? "Remove favorite" : "Set as favorite"}>
                  <IconButton size="sm" variant={activePlugin.is_favorite ? "active" : "ghost"}
                    onClick={() => handleToggleFavorite(activePlugin.id)}>
                    <Heart size={15} fill={activePlugin.is_favorite ? "#0F5B59" : "none"} />
                  </IconButton>
                </Tooltip>
                <Tooltip content={activePlugin.is_hidden ? "Restore plugin" : "Hide plugin"}>
                  <IconButton size="sm" onClick={() => handleToggleHide(activePlugin.id)}>
                    <EyeOff size={15} />
                  </IconButton>
                </Tooltip>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              <div className="text-left pb-4 border-b border-gray-100">
                <input
                  type="text"
                  value={inspectEditName}
                  onChange={e => { setInspectEditName(e.target.value); setHasEditChanges(true); }}
                  className="w-full font-bold text-lg text-gray-900 focus:bg-gray-50 px-1 py-0.5 rounded outline-none border border-transparent focus:border-gray-200"
                />
                <input
                  type="text"
                  value={inspectEditVendor}
                  onChange={e => { setInspectEditVendor(e.target.value); setHasEditChanges(true); }}
                  className="w-full text-xs text-gray-400 focus:bg-gray-50 px-1 py-0.5 rounded outline-none border border-transparent focus:border-gray-200 mt-1"
                />
              </div>

              <div className="space-y-4 text-left">
                <div>
                  <Select
                    label="Category"
                    options={categoryOptions}
                    value={inspectEditCategory}
                    onChange={e => { setInspectEditCategory(e.target.value as PluginCategory); setHasEditChanges(true); }}
                  />
                  <p className="text-[10px] text-gray-400 mt-1 select-none font-medium">
                    Auto-detected; override as needed.
                  </p>
                </div>

                <div>
                  <Input
                    label="Tags"
                    placeholder="analog, warm, cpu-heavy"
                    value={inspectEditTagsStr}
                    onChange={e => { setInspectEditTagsStr(e.target.value); setHasEditChanges(true); }}
                  />
                  <p className="text-[10px] text-gray-400 mt-1 select-none font-medium">
                    Separate with commas.
                  </p>
                </div>

                <div>
                  <Textarea
                    label="Notes"
                    placeholder="Presets, settings, rating..."
                    value={inspectEditNotes}
                    onChange={e => { setInspectEditNotes(e.target.value); setHasEditChanges(true); }}
                  />
                </div>

                {hasEditChanges && (
                  <Button onClick={handleSaveInspectEdits} className="w-full text-xs py-2 shadow-xs bg-[#0F5B59] hover:bg-teal-800 tracking-wide font-bold uppercase transition-all">
                    Save Changes
                  </Button>
                )}
              </div>

              {/* Formats */}
              <div className="space-y-3.5 pt-4 text-left border-t border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Installed Formats ({activePlugin.formats.length})
                </span>
                <div className="space-y-3 bg-[#F7F8FA] p-3 rounded-lg border border-gray-100">
                  {activePlugin.formats.map((fmt, idx) => (
                    <div key={idx} className="space-y-1.5 pb-2.5 last:pb-0 border-b border-gray-200/50 last:border-0">
                      <div className="flex items-center justify-between">
                        <Badge variant={fmt.format === "AAX" ? "warning" : "primary"}>{fmt.format}</Badge>
                        <span className="text-[10px] font-mono text-gray-500 font-semibold">{fmt.version ?? ""}</span>
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono break-all leading-tight">
                        <div className="text-gray-400 uppercase text-[9px] font-bold tracking-wider mb-0.5">Location</div>
                        {fmt.path}
                      </div>
                      {fmt.architecture && (
                        <div className="text-[9px] font-semibold text-gray-400 font-mono">
                          Arch: <span className="text-gray-700">{fmt.architecture}</span>
                        </div>
                      )}
                      {!fmt.is_loadable_outside && (
                        <span className="text-[9px] font-bold text-amber-500 flex items-center space-x-1 select-none">
                          <AlertTriangle size={10} />
                          <span>AAX — requires Pro Tools</span>
                        </span>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-[9px] py-1 px-1.5 h-auto text-gray-500 hover:text-[#0F5B59] bg-white cursor-pointer hover:bg-gray-150"
                        onClick={() => handleOpenFolder(fmt.path)}
                      >
                        <FolderOpen size={10} className="mr-1 inline" /> Open in Finder
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-[#F7F8FA]/30 text-center select-none text-[10px] text-gray-400 font-mono">
              Added: {new Date(activePlugin.created_at).toLocaleDateString()}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center select-none">
            <Music size={32} className="text-gray-200 mb-2 animate-pulse" />
            <span className="text-xs text-gray-400 font-medium">Select a plugin to inspect and edit its metadata.</span>
          </div>
        )}
      </aside>

      {/* SETTINGS MODAL */}
      <Modal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title="Scan Folder Settings"
        footer={
          <Button onClick={() => setShowSettingsModal(false)} variant="primary" className="text-xs">
            Done
          </Button>
        }
        maxWidth="lg"
      >
        <div className="space-y-5 text-left select-none">
          <div className="bg-teal-50/50 p-4 rounded-lg border border-teal-100 flex items-start space-x-3.5 mb-5">
            <Info className="text-[#0F5B59] mt-0.5 shrink-0" size={18} />
            <div className="text-xs space-y-1">
              <span className="font-bold text-gray-800 block">Scan Folder Configuration</span>
              <p className="text-gray-500 leading-relaxed">
                Add folders that contain your installed plugins. Use the Browse button to pick folders natively, or load platform defaults. Folders that don't exist on this machine are skipped at scan time.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button onClick={handleChooseFolder} className="space-x-1.5 text-xs">
              <FolderPlus size={14} />
              <span>Browse & Add Folder</span>
            </Button>
            <Button variant="outline" onClick={handleLoadDefaultFolders} className="text-xs">
              Load Platform Defaults
            </Button>
          </div>

          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block pb-1 border-b border-gray-100">
              Configured Folders ({scanFolders.length})
            </span>
            <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto pr-1">
              {scanFolders.length === 0 ? (
                <p className="text-xs text-gray-400 py-4 text-center">No folders configured yet.</p>
              ) : (
                scanFolders.map(sf => (
                  <div key={sf.id} className="py-2.5 flex items-center justify-between text-xs hover:bg-gray-50/50 transition-colors rounded px-2">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <FolderOpen size={14} className="text-teal-600 shrink-0" />
                      <span className="text-gray-700 font-mono truncate">{sf.path}</span>
                      {!sf.is_custom && (
                        <span className="text-[8px] bg-gray-100 px-1 py-0.5 rounded text-gray-400 uppercase font-bold shrink-0">Default</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveFolder(sf.id)}
                      className="text-red-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded cursor-pointer ml-2"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">Run Scan Now</span>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => { setShowSettingsModal(false); handleTriggerScan("quick"); }}
                className="text-xs py-1.5"
                disabled={isScanning}
              >
                Quick Scan
              </Button>
              <Button
                variant="outline"
                onClick={() => { setShowSettingsModal(false); handleTriggerScan("full"); }}
                className="text-xs py-1.5"
                disabled={isScanning}
              >
                Full Rescan
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* SCAN REPORT MODAL */}
      <Modal
        isOpen={showScanReportModal}
        onClose={() => setShowScanReportModal(false)}
        title="Scan Complete"
        footer={
          <Button onClick={() => setShowScanReportModal(false)} variant="primary" className="text-xs px-5">
            Done
          </Button>
        }
        maxWidth="lg"
      >
        {scanReport && (
          <div className="text-left select-none space-y-4">
            <div className="bg-teal-50 p-4 border border-teal-100 rounded-lg flex items-start space-x-3.5">
              <Sparkles className="text-teal-700 shrink-0" size={20} />
              <div className="text-xs space-y-1">
                <span className="font-bold text-teal-800 leading-tight block">Scan completed in {scanReport.durationMs}ms</span>
                <p className="text-teal-600 font-medium">
                  Scanned {scanReport.foldersScanned} folder{scanReport.foldersScanned === 1 ? "" : "s"}.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-1">Discovered</span>
                <span className="text-lg font-bold text-gray-850 font-mono">{scanReport.discovered.length}</span>
                <p className="text-[10px] text-gray-400">Plugin bundles found</p>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-1">New Plugins</span>
                <span className="text-lg font-bold text-gray-850 font-mono">{scanReport.added}</span>
                <p className="text-[10px] text-gray-400">Added to your catalog</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
                Warnings ({scanReport.warnings.length})
              </span>
              <div className="bg-gray-900 text-[10px] font-mono text-zinc-300 p-3.5 rounded max-h-40 overflow-y-auto leading-relaxed border border-gray-850">
                {scanReport.warnings.length === 0 ? (
                  <span className="text-emerald-500 font-semibold">• No warnings. Clean scan.</span>
                ) : (
                  scanReport.warnings.map((w, idx) => (
                    <div key={idx} className="pb-1 text-amber-400 border-b border-zinc-800 last:border-0 last:pb-0">
                      • {w}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
