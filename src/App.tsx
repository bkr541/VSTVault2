import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  FolderPlus,
  FolderOpen,
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
  Music,
  Settings,
  Check,
  Briefcase,
  FileText,
  Info,
  LogOut,
  Loader2,
  ChevronRight,
  Star,
  Zap,
  BookOpen,
  Globe,
} from "lucide-react";

import { supabase } from "./renderer/lib/supabaseClient";
import { generateCsv, generateJson, generateMarkdown } from "./renderer/lib/exportUtils";
import type { User } from "@supabase/supabase-js";

import {
  ConsolidatedPlugin,
  ScanFolderEntry,
  ScanHistoryEntry,
  DiscoveredPlugin,
  ScanRunResult,
  CategoryEntry,
  SubcategoryEntry,
  SoundSourceEntry,
  ProducerProblemEntry,
  DesiredResultEntry,
  ProductionStageEntry,
  PluginUseCaseEntry,
} from "./types";
import { DEFAULT_CATEGORIES } from "./renderer/lib/categoryDefaults";
import {
  DEFAULT_SOUND_SOURCES,
  DEFAULT_PRODUCER_PROBLEMS,
  DEFAULT_DESIRED_RESULTS,
  DEFAULT_PRODUCTION_STAGES,
  DEFAULT_USE_CASE_MAPPINGS,
} from "./renderer/lib/workflowDefaults";
import { FindByProblem } from "./renderer/components/FindByProblem";
import { PluginInspector } from "./renderer/components/PluginInspector";

import { Button } from "./renderer/components/ui/Button";
import { Card } from "./renderer/components/ui/Card";
import { Badge } from "./renderer/components/ui/Badge";
import { Modal } from "./renderer/components/ui/Modal";
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
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [filterHidden, setFilterHidden] = useState(false);
  const [metaView, setMetaView] = useState<"none" | "containers" | "unknown-vendor" | "needs-review" | "find-by-problem" | "missing-description" | "missing-manual" | "missing-website" | "missing-image" | "missing-rating" | "missing-use-cases">("none");
  const [sortBy, setSortBy] = useState("name-asc");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [expandedVendors, setExpandedVendors] = useState<Set<string>>(new Set());
  const [expandedSidebarCategories, setExpandedSidebarCategories] = useState<Set<string>>(new Set());

  // Classification data
  const [allCategories, setAllCategories] = useState<CategoryEntry[]>([]);
  const [allSubcategories, setAllSubcategories] = useState<SubcategoryEntry[]>([]);

  // Workflow intelligence
  const [allSoundSources, setAllSoundSources] = useState<SoundSourceEntry[]>([]);
  const [allProblems, setAllProblems] = useState<ProducerProblemEntry[]>([]);
  const [allResults, setAllResults] = useState<DesiredResultEntry[]>([]);
  const [allStages, setAllStages] = useState<ProductionStageEntry[]>([]);
  const [allUseCases, setAllUseCases] = useState<PluginUseCaseEntry[]>([]);

  // Inspector
  const [selectedPluginId, setSelectedPluginId] = useState<string | null>(null);
  const [inspectEditCategoryId, setInspectEditCategoryId] = useState<string>("");
  const [inspectEditSubcategoryId, setInspectEditSubcategoryId] = useState<string>("");
  const [inspectEditTagsStr, setInspectEditTagsStr] = useState("");
  const [inspectEditNotes, setInspectEditNotes] = useState("");
  const [inspectEditName, setInspectEditName] = useState("");
  const [inspectEditVendor, setInspectEditVendor] = useState("");
  const [hasEditChanges, setHasEditChanges] = useState(false);

  // Inspector: personal fields
  const [inspectEditRating, setInspectEditRating] = useState(0);
  const [inspectEditFavoriteUseCase, setInspectEditFavoriteUseCase] = useState("");
  const [inspectEditComplexity, setInspectEditComplexity] = useState("");
  const [inspectEditCharacterNotes, setInspectEditCharacterNotes] = useState("");
  const [inspectEditRoutingNotes, setInspectEditRoutingNotes] = useState("");
  const [inspectEditTutorialUrl, setInspectEditTutorialUrl] = useState("");
  const [inspectEditDescription, setInspectEditDescription] = useState("");
  const [inspectEditWebsiteUrl, setInspectEditWebsiteUrl] = useState("");
  const [inspectEditManualUrl, setInspectEditManualUrl] = useState("");
  const [inspectEditImageUrl, setInspectEditImageUrl] = useState("");

  // Inspector: add use case form
  const [showAddUseCase, setShowAddUseCase] = useState(false);
  const [addUcSourceId, setAddUcSourceId] = useState("");
  const [addUcProblemId, setAddUcProblemId] = useState("");
  const [addUcResultId, setAddUcResultId] = useState("");
  const [addUcStageId, setAddUcStageId] = useState("");
  const [addUcRating, setAddUcRating] = useState(0);
  const [addUcNotes, setAddUcNotes] = useState("");
  const [addUcRecommended, setAddUcRecommended] = useState(false);

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
    await Promise.all([loadPlugins(), loadScanFolders(), loadScanHistory(), loadCategoriesAndSeed()]);
    await loadWorkflowDataAndSeed();
    setDataLoading(false);
  };

  const loadPlugins = async () => {
    const [pluginsRes, formatsRes, pluginTagsRes, tagsRes, notesRes, classificationsRes] = await Promise.all([
      supabase.from("plugins").select("*").order("name"),
      supabase.from("plugin_formats").select("*"),
      supabase.from("plugin_tags").select("*"),
      supabase.from("tags").select("*"),
      supabase.from("notes").select("*"),
      supabase.from("plugin_classifications").select("*"),
    ]);

    if (pluginsRes.error) console.error("loadPlugins error:", pluginsRes.error);

    const plugins = pluginsRes.data ?? [];
    const formats = formatsRes.data ?? [];
    const pluginTags = pluginTagsRes.data ?? [];
    const tags = tagsRes.data ?? [];
    const notes = notesRes.data ?? [];
    const classifications = classificationsRes.data ?? [];

    const consolidated: ConsolidatedPlugin[] = plugins.map(p => {
      const pFormats = formats
        .filter(f => f.plugin_id === p.id)
        .map(f => ({
          format: f.format,
          file_path: f.file_path,
          file_name: f.file_name ?? null,
          file_size: f.file_size ?? null,
          bundle_id: f.bundle_id ?? null,
          version: f.version ?? null,
          architecture: f.architecture ?? null,
          last_modified_at: f.last_modified_at ?? null,
          scan_verified_at: f.scan_verified_at ?? null,
        }));

      const tagIds = pluginTags.filter(pt => pt.plugin_id === p.id).map(pt => pt.tag_id);
      const pTags = tags.filter(t => tagIds.includes(t.id)).map(t => t.name);
      const pNote = notes.find(n => n.plugin_id === p.id)?.body ?? null;
      const pClassifications = classifications
        .filter(c => c.plugin_id === p.id)
        .map(c => ({
          id: c.id,
          categoryId: c.category_id,
          subcategoryId: c.subcategory_id ?? null,
          isPrimary: c.is_primary,
          source: c.source ?? null,
          confidence: c.confidence ?? null,
        }));

      return {
        id: p.id,
        name: p.name,
        normalized_name: p.normalized_name ?? "",
        vendor: p.vendor,
        category: p.category ?? "",
        favorite: p.favorite ?? false,
        hidden: p.hidden ?? false,
        is_container_shell: p.is_container_shell ?? false,
        metadata_confidence: p.metadata_confidence ?? null,
        vendor_verified: p.vendor_verified ?? false,
        product_family: p.product_family ?? null,
        personal_rating: p.personal_rating ?? null,
        favorite_use_case: p.favorite_use_case ?? null,
        complexity_level: p.complexity_level ?? null,
        character_notes: p.character_notes ?? null,
        routing_notes: p.routing_notes ?? null,
        tutorial_url: p.tutorial_url ?? null,
        description: p.description ?? null,
        website_url: p.website_url ?? null,
        manual_url: p.manual_url ?? null,
        image_url: p.image_url ?? null,
        created_at: p.created_at,
        updated_at: p.updated_at,
        formats: pFormats,
        tags: pTags,
        notes: pNote,
        classifications: pClassifications,
      };
    });

    setAllPlugins(consolidated);
  };

  const loadScanFolders = async () => {
    const { data, error } = await supabase.from("scan_folders").select("*").order("created_at");
    if (error) console.error("loadScanFolders error:", error);
    setScanFolders(
      (data ?? []).map(f => ({
        id: f.id,
        folder_path: f.folder_path,
        created_at: f.created_at,
      }))
    );
  };

  const seedDefaultCategories = async (userId: string) => {
    const { data: insertedCats } = await supabase
      .from("categories")
      .insert(DEFAULT_CATEGORIES.map(cat => ({
        user_id: userId, name: cat.name, slug: cat.slug, sort_order: cat.sortOrder,
      })))
      .select("id, slug");

    if (!insertedCats) return;
    const catSlugToId = new Map(insertedCats.map(c => [c.slug, c.id]));

    const allSubs = DEFAULT_CATEGORIES.flatMap(cat =>
      cat.subcategories.map(sub => ({
        user_id: userId,
        category_id: catSlugToId.get(cat.slug)!,
        name: sub.name,
        slug: sub.slug,
        sort_order: sub.sortOrder,
      }))
    ).filter(s => s.category_id);

    if (allSubs.length > 0) {
      await supabase.from("subcategories").insert(allSubs);
    }
  };

  const loadCategoriesAndSeed = async () => {
    if (!user) return;
    const [catsRes, subcatsRes] = await Promise.all([
      supabase.from("categories").select("*").order("sort_order"),
      supabase.from("subcategories").select("*").order("sort_order"),
    ]);

    if (!catsRes.data || catsRes.data.length === 0) {
      await seedDefaultCategories(user.id);
      const [catsRes2, subcatsRes2] = await Promise.all([
        supabase.from("categories").select("*").order("sort_order"),
        supabase.from("subcategories").select("*").order("sort_order"),
      ]);
      setAllCategories((catsRes2.data ?? []) as CategoryEntry[]);
      setAllSubcategories((subcatsRes2.data ?? []) as SubcategoryEntry[]);
    } else {
      setAllCategories((catsRes.data ?? []) as CategoryEntry[]);
      setAllSubcategories((subcatsRes.data ?? []) as SubcategoryEntry[]);
    }
  };

  const loadScanHistory = async () => {
    const { data, error } = await supabase
      .from("scan_history")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(1);
    if (error) console.error("loadScanHistory error:", error);
    if (data && data.length > 0) setLastScan(data[0] as ScanHistoryEntry);
  };

  const loadWorkflowDataAndSeed = async () => {
    if (!user) return;

    const [sourcesRes, problemsRes, resultsRes, stagesRes] = await Promise.all([
      supabase.from("sound_sources").select("*").order("sort_order"),
      supabase.from("producer_problems").select("*").order("sort_order"),
      supabase.from("desired_results").select("*").order("sort_order"),
      supabase.from("production_stages").select("*").order("sort_order"),
    ]);

    let sources = (sourcesRes.data ?? []) as SoundSourceEntry[];
    let problems = (problemsRes.data ?? []) as ProducerProblemEntry[];
    let results = (resultsRes.data ?? []) as DesiredResultEntry[];
    let stages = (stagesRes.data ?? []) as ProductionStageEntry[];

    if (sources.length === 0) {
      const { data: s } = await supabase.from("sound_sources").insert(
        DEFAULT_SOUND_SOURCES.map(x => ({ user_id: user.id, name: x.name, slug: x.slug, sort_order: x.sortOrder }))
      ).select("*");
      sources = (s ?? []) as SoundSourceEntry[];
    }
    if (problems.length === 0) {
      const { data: p } = await supabase.from("producer_problems").insert(
        DEFAULT_PRODUCER_PROBLEMS.map(x => ({ user_id: user.id, name: x.name, slug: x.slug, sort_order: x.sortOrder }))
      ).select("*");
      problems = (p ?? []) as ProducerProblemEntry[];
    }
    if (results.length === 0) {
      const { data: r } = await supabase.from("desired_results").insert(
        DEFAULT_DESIRED_RESULTS.map(x => ({ user_id: user.id, name: x.name, slug: x.slug, sort_order: x.sortOrder }))
      ).select("*");
      results = (r ?? []) as DesiredResultEntry[];
    }
    if (stages.length === 0) {
      const { data: st } = await supabase.from("production_stages").insert(
        DEFAULT_PRODUCTION_STAGES.map(x => ({ user_id: user.id, name: x.name, slug: x.slug, sort_order: x.sortOrder }))
      ).select("*");
      stages = (st ?? []) as ProductionStageEntry[];
    }

    setAllSoundSources(sources);
    setAllProblems(problems);
    setAllResults(results);
    setAllStages(stages);

    // Load existing use cases
    const { data: ucData } = await supabase.from("plugin_use_cases").select("*");
    const existingUcs = (ucData ?? []) as PluginUseCaseEntry[];

    // Seed use cases for known plugins (skip exact-match seeded duplicates)
    if (sources.length > 0 && problems.length > 0) {
      const { data: pluginsData } = await supabase
        .from("plugins")
        .select("id, normalized_name")
        .eq("is_container_shell", false);
      const allPluginsForSeed = pluginsData ?? [];

      const toInsert: object[] = [];
      for (const mapping of DEFAULT_USE_CASE_MAPPINGS) {
        const sourceId = sources.find(s => s.slug === mapping.soundSourceSlug)?.id;
        const problemId = problems.find(p => p.slug === mapping.problemSlug)?.id ?? null;
        const resultId = results.find(r => r.slug === mapping.resultSlug)?.id ?? null;
        const stageId = stages.find(s => s.slug === mapping.stageSlug)?.id ?? null;
        if (!sourceId) continue;

        const matchingPlugins = allPluginsForSeed.filter(p =>
          (p.normalized_name as string).includes(mapping.normalizedNameContains)
        );
        for (const plugin of matchingPlugins) {
          const alreadyExists = existingUcs.some(
            uc =>
              uc.plugin_id === plugin.id &&
              uc.sound_source_id === sourceId &&
              uc.problem_id === problemId &&
              uc.desired_result_id === resultId &&
              uc.source === "seeded"
          );
          if (!alreadyExists) {
            toInsert.push({
              user_id: user.id,
              plugin_id: plugin.id,
              sound_source_id: sourceId,
              problem_id: problemId,
              desired_result_id: resultId,
              production_stage_id: stageId,
              is_recommended: mapping.isRecommended,
              notes: mapping.notes ?? null,
              source: "seeded",
              confidence: "suggested",
            });
          }
        }
      }

      if (toInsert.length > 0) {
        await supabase.from("plugin_use_cases").insert(toInsert);
        const { data: refreshed } = await supabase.from("plugin_use_cases").select("*");
        setAllUseCases((refreshed ?? []) as PluginUseCaseEntry[]);
        return;
      }
    }

    setAllUseCases(existingUcs);
  };

  const handleSaveUseCase = async () => {
    if (!user || !selectedPluginId || !addUcSourceId) return;
    const { error } = await supabase.from("plugin_use_cases").insert({
      user_id: user.id,
      plugin_id: selectedPluginId,
      sound_source_id: addUcSourceId || null,
      problem_id: addUcProblemId || null,
      desired_result_id: addUcResultId || null,
      production_stage_id: addUcStageId || null,
      effectiveness_rating: addUcRating || null,
      is_recommended: addUcRecommended,
      notes: addUcNotes.trim() || null,
      source: "manual",
      confidence: "manual",
    });
    if (error) { showToast("Failed to save use case.", "error"); return; }
    showToast("Use case added.");
    setShowAddUseCase(false);
    setAddUcSourceId(""); setAddUcProblemId(""); setAddUcResultId("");
    setAddUcStageId(""); setAddUcRating(0); setAddUcNotes(""); setAddUcRecommended(false);
    const { data } = await supabase.from("plugin_use_cases").select("*");
    setAllUseCases((data ?? []) as PluginUseCaseEntry[]);
  };

  const handleCancelUseCase = () => {
    setShowAddUseCase(false);
    setAddUcSourceId(""); setAddUcProblemId(""); setAddUcResultId("");
    setAddUcStageId(""); setAddUcRating(0); setAddUcNotes(""); setAddUcRecommended(false);
  };

  const handleDeleteUseCase = async (ucId: string) => {
    const { error } = await supabase.from("plugin_use_cases").delete().eq("id", ucId);
    if (error) { showToast("Failed to delete use case.", "error"); return; }
    setAllUseCases(prev => prev.filter(uc => uc.id !== ucId));
  };

  const handleUpdateUseCaseRating = async (ucId: string, rating: number) => {
    const newRating = allUseCases.find(uc => uc.id === ucId)?.effectiveness_rating === rating ? null : rating;
    const { error } = await supabase
      .from("plugin_use_cases")
      .update({ effectiveness_rating: newRating, source: "manual", confidence: "manual" })
      .eq("id", ucId);
    if (error) { showToast("Failed to update rating.", "error"); return; }
    setAllUseCases(prev => prev.map(uc => uc.id === ucId ? { ...uc, effectiveness_rating: newRating, source: "manual", confidence: "manual" } : uc));
  };

  // ── Derived state ─────────────────────────────────────────────────────────

  const { counts, tagCounts, filteredPlugins, catPluginCounts, pluginsWithUcsSet } = useMemo(() => {
    // Visible = non-hidden, non-container (used for standard counts and category counts)
    const visible = allPlugins.filter(p => !p.hidden && !p.is_container_shell);
    const pluginsWithUcsSet = new Set(allUseCases.map(uc => uc.plugin_id));

    const tagMap = new Map<string, number>();
    for (const p of visible) {
      for (const t of p.tags) tagMap.set(t, (tagMap.get(t) ?? 0) + 1);
    }
    const tagCounts = Array.from(tagMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));

    // Classification-based counts for the hierarchical sidebar
    const catCounts = new Map<string, number>();
    const subcatCounts = new Map<string, number>();
    for (const p of visible) {
      const seenCats = new Set<string>();
      const seenSubcats = new Set<string>();
      for (const c of p.classifications) {
        if (!seenCats.has(c.categoryId)) {
          catCounts.set(c.categoryId, (catCounts.get(c.categoryId) ?? 0) + 1);
          seenCats.add(c.categoryId);
        }
        if (c.subcategoryId && !seenSubcats.has(c.subcategoryId)) {
          subcatCounts.set(c.subcategoryId, (subcatCounts.get(c.subcategoryId) ?? 0) + 1);
          seenSubcats.add(c.subcategoryId);
        }
      }
    }

    const counts = {
      total: visible.length,
      favorites: visible.filter(p => p.favorite).length,
      hidden: allPlugins.filter(p => p.hidden && !p.is_container_shell).length,
      containers: allPlugins.filter(p => p.is_container_shell).length,
      unknownVendor: visible.filter(p => p.vendor === 'Unknown Vendor').length,
      needsReview: visible.filter(p => p.vendor === 'Unknown Vendor' || p.classifications.length === 0).length,
      missingDescription: visible.filter(p => !p.description).length,
      missingManual: visible.filter(p => !p.manual_url).length,
      missingWebsite: visible.filter(p => !p.website_url).length,
      missingImage: visible.filter(p => !p.image_url).length,
      missingRating: visible.filter(p => !p.personal_rating).length,
      missingUseCases: visible.filter(p => !pluginsWithUcsSet.has(p.id)).length,
      withDescription: visible.filter(p => !!p.description).length,
      withManual: visible.filter(p => !!p.manual_url).length,
      withWebsite: visible.filter(p => !!p.website_url).length,
      withImage: visible.filter(p => !!p.image_url).length,
      withRating: visible.filter(p => !!p.personal_rating).length,
      withUseCases: visible.filter(p => pluginsWithUcsSet.has(p.id)).length,
    };

    let result: ConsolidatedPlugin[];

    // MetaView filters are exclusive
    if (metaView === 'containers') {
      result = allPlugins.filter(p => p.is_container_shell);
    } else if (metaView === 'unknown-vendor') {
      result = allPlugins.filter(p => !p.is_container_shell && p.vendor === 'Unknown Vendor');
    } else if (metaView === 'needs-review') {
      result = allPlugins.filter(p => !p.is_container_shell && (p.vendor === 'Unknown Vendor' || p.classifications.length === 0));
    } else if (metaView === 'missing-description') {
      result = allPlugins.filter(p => !p.is_container_shell && !p.hidden && !p.description);
    } else if (metaView === 'missing-manual') {
      result = allPlugins.filter(p => !p.is_container_shell && !p.hidden && !p.manual_url);
    } else if (metaView === 'missing-website') {
      result = allPlugins.filter(p => !p.is_container_shell && !p.hidden && !p.website_url);
    } else if (metaView === 'missing-image') {
      result = allPlugins.filter(p => !p.is_container_shell && !p.hidden && !p.image_url);
    } else if (metaView === 'missing-rating') {
      result = allPlugins.filter(p => !p.is_container_shell && !p.hidden && !p.personal_rating);
    } else if (metaView === 'missing-use-cases') {
      result = allPlugins.filter(p => !p.is_container_shell && !p.hidden && !pluginsWithUcsSet.has(p.id));
    } else if (filterHidden) {
      result = allPlugins.filter(p => p.hidden && !p.is_container_shell);
    } else {
      result = allPlugins.filter(p => !p.hidden && !p.is_container_shell);
      if (filterFavorites) result = result.filter(p => p.favorite);
      if (selectedCategoryId) {
        result = result.filter(p =>
          p.classifications.some(c => {
            if (c.categoryId !== selectedCategoryId) return false;
            if (selectedSubcategoryId && c.subcategoryId !== selectedSubcategoryId) return false;
            return true;
          })
        );
      }
      if (selectedTag) result = result.filter(p => p.tags.includes(selectedTag));
    }

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

    return { counts, tagCounts, filteredPlugins: result, catPluginCounts: { catCounts, subcatCounts }, pluginsWithUcsSet };
  }, [allPlugins, allUseCases, filterHidden, filterFavorites, metaView, selectedCategoryId, selectedSubcategoryId, selectedTag, search, sortBy]);

  const vendorGroups = useMemo(() => {
    const groups = new Map<string, ConsolidatedPlugin[]>();
    for (const p of filteredPlugins) {
      const list = groups.get(p.vendor) ?? [];
      list.push(p);
      groups.set(p.vendor, list);
    }
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredPlugins]);

  // ── Toast ────────────────────────────────────────────────────────────────────

  const toggleVendor = useCallback((vendor: string) => {
    setExpandedVendors(prev => {
      const next = new Set(prev);
      if (next.has(vendor)) next.delete(vendor); else next.add(vendor);
      return next;
    });
  }, []);

  const expandAllVendors = useCallback(() => {
    setExpandedVendors(new Set(vendorGroups.map(([v]) => v)));
  }, [vendorGroups]);

  const collapseAllVendors = useCallback(() => {
    setExpandedVendors(new Set());
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilterFavorites(false);
    setFilterHidden(false);
    setMetaView("none");
    setSelectedCategoryId(null);
    setSelectedSubcategoryId(null);
    setSelectedTag(null);
  }, []);

  const activateMetaView = useCallback((view: "containers" | "unknown-vendor" | "needs-review" | "missing-description" | "missing-manual" | "missing-website" | "missing-image" | "missing-rating" | "missing-use-cases") => {
    setFilterFavorites(false);
    setFilterHidden(false);
    setSelectedCategoryId(null);
    setSelectedSubcategoryId(null);
    setSelectedTag(null);
    setMetaView(view);
  }, []);

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
    const primaryClass = p.classifications.find(c => c.isPrimary);
    setInspectEditCategoryId(primaryClass?.categoryId ?? "");
    setInspectEditSubcategoryId(primaryClass?.subcategoryId ?? "");
    setInspectEditTagsStr(p.tags.join(", "));
    setInspectEditNotes(p.notes ?? "");
    setInspectEditRating(p.personal_rating ?? 0);
    setInspectEditFavoriteUseCase(p.favorite_use_case ?? "");
    setInspectEditComplexity(p.complexity_level ?? "");
    setInspectEditCharacterNotes(p.character_notes ?? "");
    setInspectEditRoutingNotes(p.routing_notes ?? "");
    setInspectEditTutorialUrl(p.tutorial_url ?? "");
    setInspectEditDescription(p.description ?? "");
    setInspectEditWebsiteUrl(p.website_url ?? "");
    setInspectEditManualUrl(p.manual_url ?? "");
    setInspectEditImageUrl(p.image_url ?? "");
    setHasEditChanges(false);
    setShowAddUseCase(false);
  };

  const handleToggleFavorite = async (pId: string) => {
    const plugin = allPlugins.find(p => p.id === pId);
    if (!plugin) return;
    const newVal = !plugin.favorite;
    const { error } = await supabase
      .from("plugins")
      .update({ favorite: newVal, updated_at: new Date().toISOString() })
      .eq("id", pId);
    if (error) { showToast("Failed to update favorite.", "error"); return; }
    setAllPlugins(prev => prev.map(p => p.id === pId ? { ...p, favorite: newVal } : p));
    showToast(newVal ? "Added to favorites" : "Removed from favorites");
  };

  const handleToggleHide = async (pId: string) => {
    const plugin = allPlugins.find(p => p.id === pId);
    if (!plugin) return;
    const newVal = !plugin.hidden;
    const { error } = await supabase
      .from("plugins")
      .update({ hidden: newVal, updated_at: new Date().toISOString() })
      .eq("id", pId);
    if (error) { showToast("Failed to update visibility.", "error"); return; }
    setAllPlugins(prev => prev.map(p => p.id === pId ? { ...p, hidden: newVal } : p));
    if (selectedPluginId === pId) setSelectedPluginId(null);
    showToast(newVal ? "Plugin hidden" : "Plugin restored");
  };

  const handleSaveInspectEdits = async () => {
    if (!selectedPluginId || !user) return;
    const tagsArray = inspectEditTagsStr
      .split(",")
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const activeForEdit = allPlugins.find(p => p.id === selectedPluginId);
    const vendorChanged = inspectEditVendor !== activeForEdit?.vendor;
    const primaryClass = activeForEdit?.classifications.find(c => c.isPrimary);
    const classificationChanged =
      inspectEditCategoryId !== (primaryClass?.categoryId ?? "") ||
      inspectEditSubcategoryId !== (primaryClass?.subcategoryId ?? "");

    // Derive a backwards-compat category string from the selected category
    const selectedCatName = allCategories.find(c => c.id === inspectEditCategoryId)?.name ?? activeForEdit?.category ?? "";

    const { error: pluginError } = await supabase
      .from("plugins")
      .update({
        name: inspectEditName,
        vendor: inspectEditVendor,
        category: selectedCatName,
        personal_rating: inspectEditRating || null,
        favorite_use_case: inspectEditFavoriteUseCase.trim() || null,
        complexity_level: inspectEditComplexity || null,
        character_notes: inspectEditCharacterNotes.trim() || null,
        routing_notes: inspectEditRoutingNotes.trim() || null,
        tutorial_url: inspectEditTutorialUrl.trim() || null,
        description: inspectEditDescription.trim() || null,
        website_url: inspectEditWebsiteUrl.trim() || null,
        manual_url: inspectEditManualUrl.trim() || null,
        image_url: inspectEditImageUrl.trim() || null,
        updated_at: new Date().toISOString(),
        ...((vendorChanged || classificationChanged) ? { metadata_confidence: 'manual', vendor_verified: true } : {}),
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
          body: inspectEditNotes,
          updated_at: new Date().toISOString(),
        }).eq("id", existingNote.id);
      } else {
        await supabase.from("notes").insert({
          plugin_id: selectedPluginId,
          body: inspectEditNotes,
          user_id: user.id,
        });
      }
    } else if (existingNote) {
      await supabase.from("notes").delete().eq("id", existingNote.id);
    }

    // Update primary classification if changed
    if (inspectEditCategoryId && classificationChanged) {
      if (primaryClass) {
        await supabase.from("plugin_classifications").update({
          category_id: inspectEditCategoryId,
          subcategory_id: inspectEditSubcategoryId || null,
          source: 'manual',
          confidence: 'manual',
        }).eq("id", primaryClass.id);
      } else {
        await supabase.from("plugin_classifications").insert({
          plugin_id: selectedPluginId,
          category_id: inspectEditCategoryId,
          subcategory_id: inspectEditSubcategoryId || null,
          is_primary: true,
          source: 'manual',
          confidence: 'manual',
          user_id: user.id,
        });
      }
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

    const enabledFolders = scanFolders.map(f => f.folder_path);
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
        plugins_found: 0,
        user_id: user.id,
      })
      .select("id")
      .single();

    try {
      const result = await window.vstVault.scanPlugins({ folders: enabledFolders, mode });
      const added = await processScanResults(result, user.id, allCategories, allSubcategories);

      if (historyRow) {
        await supabase.from("scan_history").update({
          completed_at: new Date().toISOString(),
          plugins_found: result.discovered.length,
        }).eq("id", historyRow.id);

        for (const warning of result.warnings) {
          await supabase.from("scan_errors").insert({
            scan_history_id: historyRow.id,
            folder_path: "",
            error_message: warning,
            user_id: user.id,
          });
        }
      }

      setScanReport({ ...result, added });
      setShowScanReportModal(true);
      await Promise.all([loadPlugins(), loadScanHistory()]);
    } catch (err: any) {
      showToast("Scan failed: " + String(err.message ?? err), "error");
    } finally {
      setIsScanning(false);
    }
  };

  const processScanResults = async (
    result: ScanRunResult,
    userId: string,
    categories: CategoryEntry[],
    subcategories: SubcategoryEntry[],
  ): Promise<number> => {
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

      const existing = allPlugins.find(
        p => p.normalized_name === first.normalizedName || p.name.toLowerCase() === first.name.toLowerCase()
      );

      let pluginId: string;

      if (!existing) {
        const { data: newPlugin, error } = await supabase
          .from("plugins")
          .insert({
            name: first.name,
            normalized_name: first.normalizedName,
            vendor: first.vendor,
            category: first.category,
            favorite: false,
            hidden: false,
            is_container_shell: first.isContainerShell,
            metadata_confidence: first.metadataConfidence,
            vendor_verified: first.metadataConfidence === 'verified',
            product_family: first.productFamily ?? null,
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
        // Only update vendor/category/confidence from scan if the user hasn't manually overridden them
        if (existing.metadata_confidence !== 'manual' && first.metadataConfidence === 'verified') {
          await supabase.from("plugins").update({
            vendor: first.vendor,
            category: first.category,
            is_container_shell: first.isContainerShell,
            metadata_confidence: 'verified',
            vendor_verified: true,
            product_family: first.productFamily ?? null,
            updated_at: new Date().toISOString(),
          }).eq("id", pluginId);
        }
      }

      // Create primary classification for known products (only if none exists)
      if (first.primaryCategorySlug) {
        const catRow = categories.find(c => c.slug === first.primaryCategorySlug);
        if (catRow) {
          const subRow = first.primarySubcategorySlug
            ? subcategories.find(s => s.category_id === catRow.id && s.slug === first.primarySubcategorySlug)
            : undefined;
          const existingPlugin = allPlugins.find(p => p.id === pluginId);
          const hasClassification = existingPlugin?.classifications.some(c => c.isPrimary);
          if (!hasClassification) {
            await supabase.from("plugin_classifications").insert({
              plugin_id: pluginId,
              category_id: catRow.id,
              subcategory_id: subRow?.id ?? null,
              is_primary: true,
              source: 'scan',
              confidence: first.metadataConfidence,
              user_id: userId,
            });
          }
        }
      }

      const now = new Date().toISOString();
      for (const d of group) {
        const { data: existingFmt } = await supabase
          .from("plugin_formats")
          .select("id")
          .eq("plugin_id", pluginId)
          .eq("format", d.format)
          .eq("file_path", d.filePath)
          .maybeSingle();

        if (!existingFmt) {
          await supabase.from("plugin_formats").insert({
            plugin_id: pluginId,
            format: d.format,
            file_path: d.filePath,
            file_name: d.fileName,
            file_size: d.fileSize,
            bundle_id: d.bundleId,
            version: d.version,
            architecture: d.architecture,
            last_modified_at: d.lastModifiedAt,
            scan_verified_at: now,
            user_id: userId,
          });
        } else {
          await supabase.from("plugin_formats").update({
            file_size: d.fileSize,
            version: d.version,
            architecture: d.architecture,
            last_modified_at: d.lastModifiedAt,
            scan_verified_at: now,
          }).eq("id", existingFmt.id);
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

    const already = scanFolders.find(f => f.folder_path === chosen);
    if (already) { showToast("Folder already in list.", "info"); return; }

    const { data, error } = await supabase
      .from("scan_folders")
      .insert({ folder_path: chosen, user_id: user.id })
      .select()
      .single();

    if (error) {
      console.error("scan_folders insert failed:", error.code, error.message, error.details);
      showToast(`Failed to save folder: ${error.message}`, "error");
      return;
    }
    setScanFolders(prev => [...prev, {
      id: data.id, folder_path: data.folder_path, created_at: data.created_at,
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
      const already = scanFolders.find(f => f.folder_path === p);
      if (already) continue;
      const { data } = await supabase
        .from("scan_folders")
        .insert({ folder_path: p, user_id: user.id })
        .select()
        .single();
      if (data) {
        setScanFolders(prev => [...prev, {
          id: data.id, folder_path: data.folder_path, created_at: data.created_at,
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
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2 block mb-1.5">Discover</span>
            <SidebarItem
              label="Find By Problem"
              icon={<Zap size={14} />}
              active={metaView === "find-by-problem"}
              onClick={() => { clearAllFilters(); setMetaView("find-by-problem"); setSelectedPluginId(null); }}
            />
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2 block mb-1.5">Library</span>
            <SidebarItem label="All Plugins" icon={<Briefcase size={14} />}
              active={!filterFavorites && !filterHidden && metaView === "none" && !selectedCategoryId && !selectedTag}
              count={counts.total}
              onClick={() => clearAllFilters()} />
            <SidebarItem label="Favorites" icon={<Heart size={14} />}
              active={filterFavorites && !filterHidden && metaView === "none"} count={counts.favorites}
              onClick={() => { clearAllFilters(); setFilterFavorites(true); }} />
            <SidebarItem label="Hidden" icon={<EyeOff size={14} />}
              active={filterHidden && metaView === "none"} count={counts.hidden}
              onClick={() => { clearAllFilters(); setFilterHidden(true); }} />
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2 block mb-1.5">Categories</span>
            {allCategories.map(cat => {
              const catCount = catPluginCounts.catCounts.get(cat.id) ?? 0;
              const isExpanded = expandedSidebarCategories.has(cat.id);
              const isCatActive = selectedCategoryId === cat.id && !selectedSubcategoryId && metaView === "none" && !filterFavorites && !filterHidden;
              const catSubs = allSubcategories.filter(s => s.category_id === cat.id && (catPluginCounts.subcatCounts.get(s.id) ?? 0) > 0);
              return (
                <div key={cat.id}>
                  <button
                    onClick={() => {
                      clearAllFilters();
                      setSelectedCategoryId(cat.id);
                      setSelectedSubcategoryId(null);
                      setExpandedSidebarCategories(prev => {
                        const next = new Set(prev);
                        if (next.has(cat.id) && selectedCategoryId === cat.id) next.delete(cat.id);
                        else next.add(cat.id);
                        return next;
                      });
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium rounded-lg transition-colors text-left cursor-pointer ${
                      isCatActive
                        ? "bg-[#F3F4F6] text-[#0F5B59] font-semibold"
                        : "text-[#6B7280] hover:bg-[#F9FAFB] hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <ChevronRight size={11} className={`shrink-0 transition-transform duration-150 ${isExpanded ? "rotate-90" : ""} ${isCatActive ? "text-[#0F5B59]" : "text-[#9CA3AF]"}`} />
                      <span className="truncate">{cat.name}</span>
                    </div>
                    {catCount > 0 && (
                      <span className={`flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded font-medium ${isCatActive ? "bg-[#E8F3F2] text-[#0F5B59]" : "bg-transparent text-[#9CA3AF]"}`}>
                        {catCount}
                      </span>
                    )}
                  </button>
                  {isExpanded && catSubs.map(sub => {
                    const subCount = catPluginCounts.subcatCounts.get(sub.id) ?? 0;
                    const isSubActive = selectedCategoryId === cat.id && selectedSubcategoryId === sub.id && metaView === "none";
                    return (
                      <button
                        key={sub.id}
                        onClick={() => {
                          clearAllFilters();
                          setSelectedCategoryId(cat.id);
                          setSelectedSubcategoryId(sub.id);
                        }}
                        className={`w-full flex items-center justify-between pl-7 pr-3 py-1 text-[11px] font-medium rounded-lg transition-colors text-left cursor-pointer ${
                          isSubActive
                            ? "bg-[#F3F4F6] text-[#0F5B59] font-semibold"
                            : "text-[#9CA3AF] hover:bg-[#F9FAFB] hover:text-gray-700"
                        }`}
                      >
                        <span className="truncate">{sub.name}</span>
                        <span className={`flex-shrink-0 text-[10px] px-1 font-medium ${isSubActive ? "text-[#0F5B59]" : "text-[#C4C9D4]"}`}>
                          {subCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {tagCounts.length > 0 && (
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2 block mb-1.5">Tags</span>
              {tagCounts.map(t => (
                <SidebarItem key={t.name} label={t.name} icon={<Tag size={13} />}
                  active={selectedTag === t.name && !filterFavorites && !filterHidden && metaView === "none"}
                  count={t.count}
                  onClick={() => { clearAllFilters(); setSelectedTag(t.name); }} />
              ))}
            </div>
          )}

          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2 block mb-1.5">Review</span>
            {counts.needsReview > 0 && (
              <SidebarItem label="Needs Review" icon={<AlertTriangle size={13} />}
                active={metaView === "needs-review"}
                count={counts.needsReview}
                onClick={() => activateMetaView("needs-review")} />
            )}
            {counts.unknownVendor > 0 && (
              <SidebarItem label="Unknown Vendor" icon={<Info size={13} />}
                active={metaView === "unknown-vendor"}
                count={counts.unknownVendor}
                onClick={() => activateMetaView("unknown-vendor")} />
            )}
            {counts.containers > 0 && (
              <SidebarItem label="Containers" icon={<Briefcase size={13} />}
                active={metaView === "containers"}
                count={counts.containers}
                onClick={() => activateMetaView("containers")} />
            )}
          </div>

          {counts.total > 0 && (
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2 block mb-1.5">Metadata</span>
              {counts.missingDescription > 0 && (
                <SidebarItem label="No Description" icon={<FileText size={13} />}
                  active={metaView === "missing-description"}
                  count={counts.missingDescription}
                  onClick={() => activateMetaView("missing-description")} />
              )}
              {counts.missingManual > 0 && (
                <SidebarItem label="No Manual Link" icon={<BookOpen size={13} />}
                  active={metaView === "missing-manual"}
                  count={counts.missingManual}
                  onClick={() => activateMetaView("missing-manual")} />
              )}
              {counts.missingWebsite > 0 && (
                <SidebarItem label="No Website" icon={<Globe size={13} />}
                  active={metaView === "missing-website"}
                  count={counts.missingWebsite}
                  onClick={() => activateMetaView("missing-website")} />
              )}
              {counts.missingRating > 0 && (
                <SidebarItem label="Not Rated" icon={<Star size={13} />}
                  active={metaView === "missing-rating"}
                  count={counts.missingRating}
                  onClick={() => activateMetaView("missing-rating")} />
              )}
              {counts.missingUseCases > 0 && (
                <SidebarItem label="No Use Cases" icon={<Zap size={13} />}
                  active={metaView === "missing-use-cases"}
                  count={counts.missingUseCases}
                  onClick={() => activateMetaView("missing-use-cases")} />
              )}
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

        {/* Find By Problem view */}
        {metaView === "find-by-problem" && (
          <FindByProblem
            allPlugins={allPlugins}
            allUseCases={allUseCases}
            allSoundSources={allSoundSources}
            allProblems={allProblems}
            allResults={allResults}
            allStages={allStages}
            onSelectPlugin={selectPlugin}
            selectedPluginId={selectedPluginId}
          />
        )}

        {/* Plugin list */}
        {metaView !== "find-by-problem" && <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                  {metaView === 'containers' ? "Containers" :
                   metaView === 'unknown-vendor' ? "Unknown Vendor" :
                   metaView === 'needs-review' ? "Needs Review" :
                   metaView === 'missing-description' ? "Missing Description" :
                   metaView === 'missing-manual' ? "No Manual Link" :
                   metaView === 'missing-website' ? "No Website" :
                   metaView === 'missing-image' ? "No Image" :
                   metaView === 'missing-rating' ? "Not Rated" :
                   metaView === 'missing-use-cases' ? "No Use Cases" :
                   filterFavorites ? "Favorites" :
                   filterHidden ? "Hidden Plugins" :
                   selectedSubcategoryId ? (allSubcategories.find(s => s.id === selectedSubcategoryId)?.name ?? "Plugins") :
                   selectedCategoryId ? (allCategories.find(c => c.id === selectedCategoryId)?.name ?? "Plugins") :
                   "All Plugins"}
                </h2>
                {selectedTag && <Badge variant="primary" className="ml-2 font-mono">tag: {selectedTag}</Badge>}
              </div>
              <div className="flex items-center space-x-3 mt-1">
                <p className="text-xs text-gray-400 font-medium select-none">
                  {dataLoading ? "Loading..." : `${filteredPlugins.length} plugin${filteredPlugins.length === 1 ? "" : "s"} · ${vendorGroups.length} vendor${vendorGroups.length === 1 ? "" : "s"}`}
                </p>
                {/* Completion dashboard — shown only on all-plugins view */}
                {metaView === "none" && !filterFavorites && !filterHidden && !selectedCategoryId && !selectedTag && counts.total > 0 && (
                  <div className="flex items-center flex-wrap gap-1.5 mt-2">
                    {[
                      { label: "Descriptions", val: counts.withDescription, view: "missing-description" as const },
                      { label: "Manuals", val: counts.withManual, view: "missing-manual" as const },
                      { label: "Websites", val: counts.withWebsite, view: "missing-website" as const },
                      { label: "Rated", val: counts.withRating, view: "missing-rating" as const },
                      { label: "Use Cases", val: counts.withUseCases, view: "missing-use-cases" as const },
                    ].map(stat => {
                      const pct = Math.round((stat.val / counts.total) * 100);
                      const complete = stat.val === counts.total;
                      return (
                        <button
                          key={stat.label}
                          onClick={() => !complete ? activateMetaView(stat.view) : undefined}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-colors ${
                            complete
                              ? "bg-teal-50 text-teal-700 border-teal-200 cursor-default"
                              : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300 cursor-pointer hover:text-gray-700"
                          }`}
                          title={complete ? `All ${counts.total} plugins have ${stat.label.toLowerCase()}` : `${counts.total - stat.val} missing — click to review`}
                        >
                          {stat.val}/{counts.total} {stat.label} {pct < 100 && <span className="opacity-60">({pct}%)</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
                {vendorGroups.length > 0 && (
                  <div className="flex items-center space-x-1 text-[10px] font-semibold">
                    <button onClick={expandAllVendors} className="text-[#0F5B59] hover:underline">Expand all</button>
                    <span className="text-gray-300">·</span>
                    <button onClick={collapseAllVendors} className="text-gray-400 hover:text-gray-600 hover:underline">Collapse all</button>
                  </div>
                )}
              </div>
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
                  search || selectedTag || selectedCategoryId
                    ? "Adjust your filters to find plugins."
                    : "Run a Quick Scan to discover installed plugins on this machine."
                }
                action={
                  !(search || selectedTag || selectedCategoryId) ? (
                    <Button onClick={() => handleTriggerScan("quick")} className="space-x-1.5">
                      <Plus size={14} />
                      <span>Run Quick Scan</span>
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={() => {
                      clearAllFilters(); setSearch("");
                    }}>
                      Reset Filters
                    </Button>
                  )
                }
              />
            </div>
          ) : viewMode === "list" ? (
            <div className="bg-white rounded-lg border border-gray-200/60 shadow-sm overflow-hidden">
              {/* Column headers */}
              <div className="flex items-center px-4 py-2 bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider select-none">
                <div className="w-7 shrink-0" />
                <div className="flex-1 min-w-0">Plugin Name</div>
                <div className="w-36 shrink-0">Category</div>
                <div className="w-32 shrink-0">Formats</div>
                <div className="w-44 shrink-0">Notes / Tags</div>
              </div>

              {vendorGroups.map(([vendor, plugins]) => {
                const isExpanded = expandedVendors.has(vendor);
                return (
                  <div key={vendor} className="border-b border-gray-100 last:border-0">
                    {/* Vendor group header */}
                    <button
                      onClick={() => toggleVendor(vendor)}
                      className="w-full flex items-center px-4 py-2.5 bg-gray-50/60 hover:bg-gray-100/60 transition-colors text-left select-none border-b border-gray-100"
                    >
                      <ChevronRight
                        size={13}
                        className={`text-gray-400 mr-2.5 shrink-0 transition-transform duration-150 ${isExpanded ? "rotate-90" : ""}`}
                      />
                      <span className="text-xs font-bold text-gray-700 flex-1 tracking-tight">{vendor}</span>
                      <span className="text-[10px] text-gray-400 font-semibold bg-gray-100 px-2 py-0.5 rounded-full">
                        {plugins.length} {plugins.length === 1 ? "plugin" : "plugins"}
                      </span>
                    </button>

                    {/* Plugin rows */}
                    {isExpanded && plugins.map(p => (
                      <div
                        key={p.id}
                        onClick={() => selectPlugin(p)}
                        className={`flex items-center px-4 py-2.5 cursor-pointer transition-colors border-b border-gray-50/80 last:border-0 ${
                          selectedPluginId === p.id
                            ? "bg-teal-50/50 border-l-2 border-l-[#0F5B59]"
                            : "hover:bg-gray-50/60"
                        }`}
                      >
                        <button
                          onClick={e => { e.stopPropagation(); handleToggleFavorite(p.id); }}
                          className={`p-1 rounded hover:bg-gray-100 mr-2 shrink-0 transition-colors ${p.favorite ? "text-red-500" : "text-gray-300 hover:text-gray-400"}`}
                        >
                          <Heart size={13} fill={p.favorite ? "#EF4444" : "none"} />
                        </button>
                        <div className="flex-1 min-w-0 mr-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-semibold text-gray-900 truncate">{p.name}</span>
                            {p.favorite && <span className="text-[9px] bg-red-50 px-1 py-0.5 rounded text-red-500 font-bold uppercase tracking-wider shrink-0 select-none">Pref</span>}
                          </div>
                        </div>
                        <div className="w-36 shrink-0 mr-2">
                          <Badge variant="neutral">{p.category}</Badge>
                        </div>
                        <div className="w-32 shrink-0 flex flex-wrap gap-1 mr-2">
                          {p.formats.map((fmt, idx) => {
                            const v: "primary" | "neutral" | "secondary" | "warning" =
                              fmt.format === "VST3" ? "primary" :
                              fmt.format === "AU" ? "neutral" :
                              fmt.format === "VST2" ? "secondary" : "warning";
                            return <Badge key={idx} variant={v} className="font-mono text-[9px] px-1.5 py-0">{fmt.format}</Badge>;
                          })}
                        </div>
                        <div className="w-44 shrink-0 flex items-center gap-1.5 overflow-hidden">
                          {p.personal_rating && (
                            <div className="flex items-center shrink-0">
                              {[1,2,3,4,5].map(n => (
                                <Star key={n} size={9} className={n <= p.personal_rating! ? "text-amber-400" : "text-gray-200"} fill={n <= p.personal_rating! ? "#FBBF24" : "none"} />
                              ))}
                            </div>
                          )}
                          {pluginsWithUcsSet.has(p.id) && <Zap size={9} className="text-teal-500 shrink-0" />}
                          {p.metadata_confidence === "manual" && <span className="text-[8px] font-bold text-teal-600 shrink-0 bg-teal-50 px-1 rounded">M</span>}
                          <span className="text-xs text-gray-400 font-mono truncate">
                            {p.notes || (p.tags.length > 0 ? p.tags.join(", ") : "")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-6">
              {vendorGroups.map(([vendor, plugins]) => {
                const isExpanded = expandedVendors.has(vendor);
                return (
                  <div key={vendor}>
                    <button
                      onClick={() => toggleVendor(vendor)}
                      className="flex items-center space-x-2 mb-3 select-none group"
                    >
                      <ChevronRight
                        size={14}
                        className={`text-gray-400 transition-transform duration-150 ${isExpanded ? "rotate-90" : ""}`}
                      />
                      <span className="text-sm font-bold text-gray-700 tracking-tight">{vendor}</span>
                      <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-semibold">
                        {plugins.length}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {plugins.map(p => {
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
                                  <div className="min-w-0 flex-1 mr-2">
                                    <h4 className="text-sm font-bold text-gray-900 leading-tight mb-1 truncate">{p.name}</h4>
                                  </div>
                                  <button
                                    onClick={e => { e.stopPropagation(); handleToggleFavorite(p.id); }}
                                    className={`p-1.5 rounded duration-150 transition-colors cursor-pointer shrink-0 ${p.favorite ? "text-red-500" : "text-gray-300 hover:bg-gray-50"}`}
                                  >
                                    <Heart size={14} fill={p.favorite ? "#EF4444" : "none"} />
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
                                <span className="text-[9px] font-mono font-medium text-gray-400 truncate max-w-[100px]">
                                  {p.formats[0]?.file_name ?? ""}
                                </span>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>}

      </main>

      {/* RIGHT INSPECTOR — slides in from right */}
      {activePlugin && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setSelectedPluginId(null)}
        />
      )}
      <aside className={`fixed top-0 right-0 h-screen w-96 bg-white border-l border-[#E5E7EB] flex flex-col z-40 select-text shadow-2xl transition-transform duration-300 ease-in-out ${
        activePlugin ? "translate-x-0" : "translate-x-full"
      }`}>
        {activePlugin && (
          <PluginInspector
            plugin={activePlugin}
            allCategories={allCategories}
            allSubcategories={allSubcategories}
            allSoundSources={allSoundSources}
            allProblems={allProblems}
            allResults={allResults}
            allStages={allStages}
            pluginUseCases={allUseCases.filter(uc => uc.plugin_id === activePlugin.id)}
            editName={inspectEditName} setEditName={setInspectEditName}
            editVendor={inspectEditVendor} setEditVendor={setInspectEditVendor}
            editCategoryId={inspectEditCategoryId} setEditCategoryId={setInspectEditCategoryId}
            editSubcategoryId={inspectEditSubcategoryId} setEditSubcategoryId={setInspectEditSubcategoryId}
            editTagsStr={inspectEditTagsStr} setEditTagsStr={setInspectEditTagsStr}
            editNotes={inspectEditNotes} setEditNotes={setInspectEditNotes}
            editRating={inspectEditRating} setEditRating={setInspectEditRating}
            editFavoriteUseCase={inspectEditFavoriteUseCase} setEditFavoriteUseCase={setInspectEditFavoriteUseCase}
            editComplexity={inspectEditComplexity} setEditComplexity={setInspectEditComplexity}
            editCharacterNotes={inspectEditCharacterNotes} setEditCharacterNotes={setInspectEditCharacterNotes}
            editRoutingNotes={inspectEditRoutingNotes} setEditRoutingNotes={setInspectEditRoutingNotes}
            editTutorialUrl={inspectEditTutorialUrl} setEditTutorialUrl={setInspectEditTutorialUrl}
            editDescription={inspectEditDescription} setEditDescription={setInspectEditDescription}
            editWebsiteUrl={inspectEditWebsiteUrl} setEditWebsiteUrl={setInspectEditWebsiteUrl}
            editManualUrl={inspectEditManualUrl} setEditManualUrl={setInspectEditManualUrl}
            editImageUrl={inspectEditImageUrl} setEditImageUrl={setInspectEditImageUrl}
            hasEditChanges={hasEditChanges} setHasEditChanges={setHasEditChanges}
            showAddUseCase={showAddUseCase} setShowAddUseCase={setShowAddUseCase}
            addUcSourceId={addUcSourceId} setAddUcSourceId={setAddUcSourceId}
            addUcProblemId={addUcProblemId} setAddUcProblemId={setAddUcProblemId}
            addUcResultId={addUcResultId} setAddUcResultId={setAddUcResultId}
            addUcStageId={addUcStageId} setAddUcStageId={setAddUcStageId}
            addUcRating={addUcRating} setAddUcRating={setAddUcRating}
            addUcNotes={addUcNotes} setAddUcNotes={setAddUcNotes}
            addUcRecommended={addUcRecommended} setAddUcRecommended={setAddUcRecommended}
            onClose={() => setSelectedPluginId(null)}
            onToggleFavorite={() => handleToggleFavorite(activePlugin.id)}
            onToggleHide={() => handleToggleHide(activePlugin.id)}
            onSave={handleSaveInspectEdits}
            onSaveUseCase={handleSaveUseCase}
            onCancelUseCase={handleCancelUseCase}
            onDeleteUseCase={handleDeleteUseCase}
            onUpdateUseCaseRating={handleUpdateUseCaseRating}
            onOpenFolder={handleOpenFolder}
          />
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
                      <span className="text-gray-700 font-mono truncate">{sf.folder_path}</span>
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
