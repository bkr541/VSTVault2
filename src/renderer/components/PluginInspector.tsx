import React, { useMemo } from "react";
import {
  Heart,
  EyeOff,
  X,
  Star,
  Plus,
  Trash2,
  FolderOpen,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  Music,
} from "lucide-react";
import type {
  ConsolidatedPlugin,
  CategoryEntry,
  SubcategoryEntry,
  SoundSourceEntry,
  ProducerProblemEntry,
  DesiredResultEntry,
  ProductionStageEntry,
  PluginUseCaseEntry,
} from "../../types";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Textarea } from "./ui/Textarea";
import { Select } from "./ui/Select";
import { Badge } from "./ui/Badge";
import { Tooltip } from "./ui/Tooltip";
import { IconButton } from "./ui/IconButton";

// ── Helpers ───────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-3">
      {children}
    </span>
  );
}

function StarRow({
  rating,
  size = 13,
  interactive = false,
  onRate,
}: {
  rating: number;
  size?: number;
  interactive?: boolean;
  onRate?: (n: number) => void;
}) {
  return (
    <div className="flex items-center space-x-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={interactive && onRate ? () => onRate(n === rating ? 0 : n) : undefined}
          className={interactive ? "p-0.5 transition-colors cursor-pointer" : "cursor-default"}
          tabIndex={interactive ? 0 : -1}
        >
          <Star
            size={size}
            className={n <= rating ? "text-amber-400" : interactive ? "text-gray-200 hover:text-gray-400" : "text-gray-200"}
            fill={n <= rating ? "#FBBF24" : "none"}
          />
        </button>
      ))}
    </div>
  );
}

function UrlField({
  label,
  value,
  placeholder,
  onChange,
  onOpen,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  onOpen: (url: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
        {label}
      </label>
      <div className="flex items-center space-x-1.5">
        <input
          type="url"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 min-w-0 px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#0F5B59]/20 focus:border-[#0F5B59] text-gray-800 placeholder-gray-300 transition-all"
        />
        {value && (
          <button
            type="button"
            onClick={() => onOpen(value)}
            className="p-1.5 text-gray-400 hover:text-[#0F5B59] transition-colors rounded shrink-0"
            title={`Open ${label}`}
          >
            <ExternalLink size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export interface PluginInspectorProps {
  plugin: ConsolidatedPlugin;
  allCategories: CategoryEntry[];
  allSubcategories: SubcategoryEntry[];
  allSoundSources: SoundSourceEntry[];
  allProblems: ProducerProblemEntry[];
  allResults: DesiredResultEntry[];
  allStages: ProductionStageEntry[];
  pluginUseCases: PluginUseCaseEntry[];

  // Edit state — individual fields to match App.tsx state pattern
  editName: string; setEditName: (v: string) => void;
  editVendor: string; setEditVendor: (v: string) => void;
  editCategoryId: string; setEditCategoryId: (v: string) => void;
  editSubcategoryId: string; setEditSubcategoryId: (v: string) => void;
  editTagsStr: string; setEditTagsStr: (v: string) => void;
  editNotes: string; setEditNotes: (v: string) => void;
  editRating: number; setEditRating: (v: number) => void;
  editFavoriteUseCase: string; setEditFavoriteUseCase: (v: string) => void;
  editComplexity: string; setEditComplexity: (v: string) => void;
  editCharacterNotes: string; setEditCharacterNotes: (v: string) => void;
  editRoutingNotes: string; setEditRoutingNotes: (v: string) => void;
  editTutorialUrl: string; setEditTutorialUrl: (v: string) => void;
  editDescription: string; setEditDescription: (v: string) => void;
  editWebsiteUrl: string; setEditWebsiteUrl: (v: string) => void;
  editManualUrl: string; setEditManualUrl: (v: string) => void;
  editImageUrl: string; setEditImageUrl: (v: string) => void;
  hasEditChanges: boolean;
  setHasEditChanges: (v: boolean) => void;

  // Add use-case form
  showAddUseCase: boolean;
  setShowAddUseCase: React.Dispatch<React.SetStateAction<boolean>>;
  addUcSourceId: string; setAddUcSourceId: (v: string) => void;
  addUcProblemId: string; setAddUcProblemId: (v: string) => void;
  addUcResultId: string; setAddUcResultId: (v: string) => void;
  addUcStageId: string; setAddUcStageId: (v: string) => void;
  addUcRating: number; setAddUcRating: (v: number) => void;
  addUcNotes: string; setAddUcNotes: (v: string) => void;
  addUcRecommended: boolean; setAddUcRecommended: (v: boolean) => void;

  // Action handlers
  onClose: () => void;
  onToggleFavorite: () => void;
  onToggleHide: () => void;
  onSave: () => void;
  onSaveUseCase: () => void;
  onCancelUseCase: () => void;
  onDeleteUseCase: (id: string) => void;
  onUpdateUseCaseRating: (id: string, rating: number) => void;
  onOpenFolder: (path: string) => void;
}

export function PluginInspector({
  plugin,
  allCategories,
  allSubcategories,
  allSoundSources,
  allProblems,
  allResults,
  allStages,
  pluginUseCases,
  editName, setEditName,
  editVendor, setEditVendor,
  editCategoryId, setEditCategoryId,
  editSubcategoryId, setEditSubcategoryId,
  editTagsStr, setEditTagsStr,
  editNotes, setEditNotes,
  editRating, setEditRating,
  editFavoriteUseCase, setEditFavoriteUseCase,
  editComplexity, setEditComplexity,
  editCharacterNotes, setEditCharacterNotes,
  editRoutingNotes, setEditRoutingNotes,
  editTutorialUrl, setEditTutorialUrl,
  editDescription, setEditDescription,
  editWebsiteUrl, setEditWebsiteUrl,
  editManualUrl, setEditManualUrl,
  editImageUrl, setEditImageUrl,
  hasEditChanges,
  setHasEditChanges,
  showAddUseCase, setShowAddUseCase,
  addUcSourceId, setAddUcSourceId,
  addUcProblemId, setAddUcProblemId,
  addUcResultId, setAddUcResultId,
  addUcStageId, setAddUcStageId,
  addUcRating, setAddUcRating,
  addUcNotes, setAddUcNotes,
  addUcRecommended, setAddUcRecommended,
  onClose,
  onToggleFavorite,
  onToggleHide,
  onSave,
  onSaveUseCase,
  onCancelUseCase,
  onDeleteUseCase,
  onUpdateUseCaseRating,
  onOpenFolder,
}: PluginInspectorProps) {
  const mark = () => setHasEditChanges(true);

  const categoryOptions = allCategories.map(c => ({ value: c.id, label: c.name }));
  const subcategoryOptions = allSubcategories
    .filter(s => s.category_id === editCategoryId)
    .map(s => ({ value: s.id, label: s.name }));

  // Derived: sound sources and stages used by this plugin's use cases
  const usedSourceNames = useMemo(() => {
    const names = pluginUseCases
      .map(uc => allSoundSources.find(s => s.id === uc.sound_source_id)?.name)
      .filter((n): n is string => Boolean(n) && n !== "Any Source");
    return [...new Set(names)];
  }, [pluginUseCases, allSoundSources]);

  const usedStageNames = useMemo(() => {
    const names = pluginUseCases
      .map(uc => allStages.find(s => s.id === uc.production_stage_id)?.name)
      .filter((n): n is string => Boolean(n));
    return [...new Set(names)];
  }, [pluginUseCases, allStages]);

  const handleOpenUrl = (url: string) => {
    if (!url) return;
    const fullUrl = url.startsWith("http") ? url : `https://${url}`;
    if (window.vstVault?.openExternalUrl) {
      window.vstVault.openExternalUrl(fullUrl);
    } else {
      window.open(fullUrl, "_blank", "noopener,noreferrer");
    }
  };

  const confidenceVariant: Record<string, "primary" | "info" | "neutral" | "error"> = {
    manual: "primary",
    verified: "info",
    inferred: "neutral",
    unknown: "error",
  };
  const confidenceLabel: Record<string, string> = {
    manual: "Manually Edited",
    verified: "Verified",
    inferred: "Auto-detected",
    unknown: "Needs Review",
  };

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 bg-[#F7F8FA]/30 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Music size={15} className="text-[#0F5B59]" />
          <span className="text-base font-bold text-[#111827]">Plugin Details</span>
        </div>
        <div className="flex items-center space-x-1">
          <Tooltip content={plugin.favorite ? "Remove favorite" : "Set as favorite"}>
            <IconButton size="sm" variant={plugin.favorite ? "active" : "ghost"} onClick={onToggleFavorite}>
              <Heart size={15} fill={plugin.favorite ? "#0F5B59" : "none"} />
            </IconButton>
          </Tooltip>
          <Tooltip content={plugin.hidden ? "Restore plugin" : "Hide plugin"}>
            <IconButton size="sm" onClick={onToggleHide}>
              <EyeOff size={15} />
            </IconButton>
          </Tooltip>
          <Tooltip content="Close">
            <IconButton size="sm" variant="ghost" onClick={onClose}>
              <X size={15} />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-1">

        {/* ── OVERVIEW ────────────────────────────────────────────────────── */}
        <div className="pb-5 border-b border-gray-100">
          <SectionLabel>Overview</SectionLabel>

          {/* Image thumbnail — live preview from edit URL */}
          {editImageUrl && (
            <div className="mb-3 flex items-center space-x-3">
              <img
                src={editImageUrl}
                alt={`${plugin.name} logo`}
                className="w-14 h-14 object-contain rounded-lg border border-gray-100 bg-gray-50"
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>
          )}

          {/* Name + Vendor */}
          <div className="mb-3">
            <input
              type="text"
              value={editName}
              onChange={e => { setEditName(e.target.value); mark(); }}
              className="w-full font-bold text-lg text-gray-900 focus:bg-gray-50 px-1 py-0.5 rounded outline-none border border-transparent focus:border-gray-200"
            />
            <input
              type="text"
              value={editVendor}
              onChange={e => { setEditVendor(e.target.value); mark(); }}
              className="w-full text-xs text-gray-400 focus:bg-gray-50 px-1 py-0.5 rounded outline-none border border-transparent focus:border-gray-200 mt-0.5"
            />
          </div>

          {/* Product family */}
          {plugin.product_family && (
            <p className="text-[11px] text-gray-400 font-medium mb-2 px-1">
              Family: <span className="text-gray-600">{plugin.product_family}</span>
            </p>
          )}

          {/* Category */}
          <div className="space-y-2 mb-3">
            <Select
              label="Primary Category"
              options={[{ value: "", label: "— Unclassified —" }, ...categoryOptions]}
              value={editCategoryId}
              onChange={e => { setEditCategoryId(e.target.value); setEditSubcategoryId(""); mark(); }}
            />
            {editCategoryId && (
              <Select
                label="Subcategory"
                options={[{ value: "", label: "— None —" }, ...subcategoryOptions]}
                value={editSubcategoryId}
                onChange={e => { setEditSubcategoryId(e.target.value); mark(); }}
              />
            )}
            <p className="text-[10px] text-gray-400 font-medium">
              Auto-detected; saving locks this as manually set.
            </p>
          </div>

          {/* Personal rating */}
          <div className="mb-3">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">My Rating</label>
            <div className="flex items-center space-x-1">
              <StarRow
                rating={editRating}
                size={16}
                interactive
                onRate={n => { setEditRating(n); mark(); }}
              />
              {editRating > 0 && (
                <span className="text-[11px] text-gray-400 ml-1 font-medium">{editRating}/5</span>
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="flex items-center flex-wrap gap-1.5">
            {plugin.is_container_shell && (
              <span className="text-[9px] font-bold bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded uppercase tracking-wider">
                Container / Shell
              </span>
            )}
            {plugin.metadata_confidence && (
              <Badge
                variant={confidenceVariant[plugin.metadata_confidence] ?? "neutral"}
                className="text-[9px] py-0.5"
              >
                {confidenceLabel[plugin.metadata_confidence] ?? plugin.metadata_confidence}
              </Badge>
            )}
            {plugin.vendor_verified && plugin.metadata_confidence !== "manual" && (
              <Badge variant="info" className="text-[9px] py-0.5">Vendor Verified</Badge>
            )}
          </div>
        </div>

        {/* ── WHAT IT DOES ────────────────────────────────────────────────── */}
        <div className="py-5 border-b border-gray-100 space-y-3">
          <SectionLabel>What It Does</SectionLabel>

          <div>
            <Textarea
              label="Description"
              placeholder="What this plugin does and where it excels..."
              value={editDescription}
              onChange={e => { setEditDescription(e.target.value); mark(); }}
              className="min-h-[80px] text-xs"
            />
          </div>

          <Textarea
            label="Character Notes"
            placeholder="How this plugin sounds, colors, or textures..."
            value={editCharacterNotes}
            onChange={e => { setEditCharacterNotes(e.target.value); mark(); }}
            className="min-h-[72px] text-xs"
          />

          <Select
            label="Complexity Level"
            options={[
              { value: "", label: "— Not set —" },
              { value: "Quick Fix", label: "Quick Fix — plug in and go" },
              { value: "Intermediate", label: "Intermediate — some tweaking needed" },
              { value: "Surgical", label: "Surgical — precise control required" },
              { value: "Experimental", label: "Experimental — unpredictable / creative" },
            ]}
            value={editComplexity}
            onChange={e => { setEditComplexity(e.target.value); mark(); }}
          />

          {/* Derived from use cases */}
          {(usedSourceNames.length > 0 || usedStageNames.length > 0) && (
            <div className="space-y-1.5 pt-1">
              {usedSourceNames.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Best for</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {usedSourceNames.map(name => (
                      <span key={name} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {usedStageNames.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Stages</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {usedStageNames.map(name => (
                      <span key={name} className="text-[10px] bg-teal-50 text-teal-700 border border-teal-100 px-2 py-0.5 rounded-full font-semibold">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── MY NOTES ────────────────────────────────────────────────────── */}
        <div className="py-5 border-b border-gray-100 space-y-3">
          <SectionLabel>My Notes</SectionLabel>

          <Input
            label="Favorite Use Case"
            placeholder="e.g. Add presence on vocal chops"
            value={editFavoriteUseCase}
            onChange={e => { setEditFavoriteUseCase(e.target.value); mark(); }}
          />

          <Textarea
            label="Routing / Setup Notes"
            placeholder="Sidechain, send, parallel routing tips..."
            value={editRoutingNotes}
            onChange={e => { setEditRoutingNotes(e.target.value); mark(); }}
            className="min-h-[72px] text-xs"
          />

          <div>
            <Textarea
              label="General Notes"
              placeholder="Presets, settings, tips..."
              value={editNotes}
              onChange={e => { setEditNotes(e.target.value); mark(); }}
              className="min-h-[72px] text-xs"
            />
          </div>

          <div>
            <Input
              label="Tags"
              placeholder="analog, warm, cpu-heavy"
              value={editTagsStr}
              onChange={e => { setEditTagsStr(e.target.value); mark(); }}
            />
            <p className="text-[10px] text-gray-400 mt-1 font-medium">Separate with commas.</p>
          </div>
        </div>

        {/* ── LEARN MORE ──────────────────────────────────────────────────── */}
        <div className="py-5 border-b border-gray-100 space-y-3">
          <SectionLabel>Learn More</SectionLabel>

          <UrlField
            label="Product Website"
            value={editWebsiteUrl}
            placeholder="https://vendor.com/product"
            onChange={v => { setEditWebsiteUrl(v); mark(); }}
            onOpen={handleOpenUrl}
          />

          <UrlField
            label="Manual / Documentation"
            value={editManualUrl}
            placeholder="https://..."
            onChange={v => { setEditManualUrl(v); mark(); }}
            onOpen={handleOpenUrl}
          />

          <UrlField
            label="Tutorial URL"
            value={editTutorialUrl}
            placeholder="https://youtube.com/..."
            onChange={v => { setEditTutorialUrl(v); mark(); }}
            onOpen={handleOpenUrl}
          />

          <UrlField
            label="Image / Logo URL"
            value={editImageUrl}
            placeholder="https://..."
            onChange={v => { setEditImageUrl(v); mark(); }}
            onOpen={handleOpenUrl}
          />
        </div>

        {/* ── SAVE BUTTON ─────────────────────────────────────────────────── */}
        {hasEditChanges && (
          <div className="py-3">
            <Button
              onClick={onSave}
              className="w-full text-xs py-2 shadow-xs bg-[#0F5B59] hover:bg-teal-800 tracking-wide font-bold uppercase transition-all"
            >
              Save Changes
            </Button>
          </div>
        )}

        {/* ── USE IT WHEN... ──────────────────────────────────────────────── */}
        {!plugin.is_container_shell && (
          <div className="py-5 border-b border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <SectionLabel>Use It When... ({pluginUseCases.length})</SectionLabel>
              <button
                onClick={() => setShowAddUseCase(v => !v)}
                className="text-[10px] font-semibold text-[#0F5B59] hover:underline flex items-center space-x-1 mb-3"
              >
                <Plus size={11} />
                <span>Add</span>
              </button>
            </div>

            {showAddUseCase && (
              <div className="bg-[#F7F8FA] rounded-lg border border-gray-200 p-3 space-y-2.5">
                <Select
                  label="Sound Source *"
                  options={[{ value: "", label: "— Select —" }, ...allSoundSources.map(s => ({ value: s.id, label: s.name }))]}
                  value={addUcSourceId}
                  onChange={e => setAddUcSourceId(e.target.value)}
                />
                <Select
                  label="Problem"
                  options={[{ value: "", label: "— None —" }, ...allProblems.map(p => ({ value: p.id, label: p.name }))]}
                  value={addUcProblemId}
                  onChange={e => setAddUcProblemId(e.target.value)}
                />
                <Select
                  label="Desired Result"
                  options={[{ value: "", label: "— None —" }, ...allResults.map(r => ({ value: r.id, label: r.name }))]}
                  value={addUcResultId}
                  onChange={e => setAddUcResultId(e.target.value)}
                />
                <Select
                  label="Production Stage"
                  options={[{ value: "", label: "— None —" }, ...allStages.map(s => ({ value: s.id, label: s.name }))]}
                  value={addUcStageId}
                  onChange={e => setAddUcStageId(e.target.value)}
                />
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                    Effectiveness
                  </label>
                  <StarRow
                    rating={addUcRating}
                    size={15}
                    interactive
                    onRate={setAddUcRating}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="uc-recommended"
                    checked={addUcRecommended}
                    onChange={e => setAddUcRecommended(e.target.checked)}
                    className="rounded border-gray-300 text-[#0F5B59]"
                  />
                  <label htmlFor="uc-recommended" className="text-xs font-medium text-gray-600">
                    Mark as recommended
                  </label>
                </div>
                <Textarea
                  label="Notes"
                  placeholder="When and how to use this combination..."
                  value={addUcNotes}
                  onChange={e => setAddUcNotes(e.target.value)}
                  className="min-h-[72px] text-xs"
                />
                <div className="flex space-x-2 pt-1">
                  <Button size="sm" onClick={onSaveUseCase} disabled={!addUcSourceId} className="text-[11px]">
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={onCancelUseCase} className="text-[11px]">
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {pluginUseCases.length === 0 && !showAddUseCase ? (
              <p className="text-[11px] text-gray-400 font-medium">
                No use cases defined. Click Add to describe when to use this plugin.
              </p>
            ) : (
              <div className="space-y-2">
                {pluginUseCases.map(uc => {
                  const sourceName = allSoundSources.find(s => s.id === uc.sound_source_id)?.name;
                  const problemName = allProblems.find(p => p.id === uc.problem_id)?.name;
                  const resultName = allResults.find(r => r.id === uc.desired_result_id)?.name;
                  const stageName = allStages.find(s => s.id === uc.production_stage_id)?.name;
                  const parts = [sourceName, problemName, resultName].filter(Boolean);
                  return (
                    <div key={uc.id} className="bg-[#F7F8FA] rounded-lg border border-gray-100 p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 leading-snug">
                            {parts.join(" → ") || "—"}
                          </p>
                          {stageName && (
                            <span className="text-[10px] text-gray-400 font-medium">{stageName}</span>
                          )}
                          {uc.notes && (
                            <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{uc.notes}</p>
                          )}
                          <div className="flex items-center space-x-2 mt-1.5 flex-wrap gap-y-1">
                            <StarRow
                              rating={uc.effectiveness_rating ?? 0}
                              size={11}
                              interactive
                              onRate={n => onUpdateUseCaseRating(uc.id, n)}
                            />
                            {uc.is_recommended && (
                              <span className="inline-flex items-center space-x-0.5 text-[9px] bg-teal-50 text-[#0F5B59] border border-teal-200 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                <Sparkles size={8} />
                                <span>Recommended</span>
                              </span>
                            )}
                            <span className={`text-[9px] font-semibold ${uc.source === "manual" ? "text-teal-600" : "text-gray-400"}`}>
                              {uc.source === "manual" ? "Manual" : "Suggested"}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => onDeleteUseCase(uc.id)}
                          className="ml-2 p-1 text-gray-300 hover:text-red-400 transition-colors cursor-pointer rounded shrink-0"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── INSTALLED FORMATS ───────────────────────────────────────────── */}
        <div className="py-5 space-y-3">
          <SectionLabel>Installed Formats ({plugin.formats.length})</SectionLabel>
          <div className="space-y-3 bg-[#F7F8FA] p-3 rounded-lg border border-gray-100">
            {plugin.formats.map((fmt, idx) => (
              <div key={idx} className="space-y-1.5 pb-2.5 last:pb-0 border-b border-gray-200/50 last:border-0">
                <div className="flex items-center justify-between">
                  <Badge variant={fmt.format === "AAX" ? "warning" : "primary"}>{fmt.format}</Badge>
                  <span className="text-[10px] font-mono text-gray-500 font-semibold">{fmt.file_name ?? ""}</span>
                </div>
                {(fmt.version || fmt.architecture) && (
                  <div className="flex items-center space-x-2">
                    {fmt.version && (
                      <span className="text-[9px] font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-semibold">
                        v{fmt.version}
                      </span>
                    )}
                    {fmt.architecture && (
                      <span className="text-[9px] font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                        {fmt.architecture}
                      </span>
                    )}
                  </div>
                )}
                <div className="text-[10px] text-gray-500 font-mono break-all leading-tight">
                  <div className="text-gray-400 uppercase text-[9px] font-bold tracking-wider mb-0.5">Location</div>
                  {fmt.file_path}
                </div>
                {fmt.scan_verified_at && (
                  <div className="text-[9px] text-gray-400">
                    Scanned: {new Date(fmt.scan_verified_at).toLocaleDateString()}
                  </div>
                )}
                {fmt.format === "AAX" && (
                  <span className="text-[9px] font-bold text-amber-500 flex items-center space-x-1">
                    <AlertTriangle size={10} />
                    <span>AAX — requires Pro Tools</span>
                  </span>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-[9px] py-1 px-1.5 h-auto text-gray-500 hover:text-[#0F5B59] bg-white cursor-pointer hover:bg-gray-100"
                  onClick={() => onOpenFolder(fmt.file_path)}
                >
                  <FolderOpen size={10} className="mr-1 inline" /> Open in Finder
                </Button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100 bg-[#F7F8FA]/30 text-center select-none text-[10px] text-gray-400 font-mono flex-shrink-0">
        Added: {new Date(plugin.created_at).toLocaleDateString()}
        {plugin.updated_at !== plugin.created_at && (
          <span className="ml-2 opacity-60">· Updated: {new Date(plugin.updated_at).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  );
}
