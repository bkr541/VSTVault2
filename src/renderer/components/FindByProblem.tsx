import React, { useState, useMemo } from "react";
import { Star, Sparkles, Zap } from "lucide-react";
import type {
  ConsolidatedPlugin,
  PluginUseCaseEntry,
  SoundSourceEntry,
  ProducerProblemEntry,
  DesiredResultEntry,
  ProductionStageEntry,
} from "../../types";

interface UseCaseMatch {
  plugin: ConsolidatedPlugin;
  useCase: PluginUseCaseEntry;
  matchReason: string;
  stageName: string;
}

interface FindByProblemProps {
  allPlugins: ConsolidatedPlugin[];
  allUseCases: PluginUseCaseEntry[];
  allSoundSources: SoundSourceEntry[];
  allProblems: ProducerProblemEntry[];
  allResults: DesiredResultEntry[];
  allStages: ProductionStageEntry[];
  onSelectPlugin: (p: ConsolidatedPlugin) => void;
  selectedPluginId: string | null;
}

const ChipButton: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer select-none ${
        active
          ? "bg-[#0F5B59] text-white border-[#0F5B59] shadow-sm"
          : "bg-white text-gray-600 border-gray-200 hover:border-[#0F5B59] hover:text-[#0F5B59]"
      }`}
    >
      {label}
    </button>
  );
}

function StarRow({ rating }: { rating: number | null }) {
  if (!rating) return null;
  return (
    <div className="flex items-center space-x-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          size={11}
          className={n <= rating ? "text-amber-400" : "text-gray-200"}
          fill={n <= rating ? "#FBBF24" : "none"}
        />
      ))}
    </div>
  );
}

export function FindByProblem({
  allPlugins,
  allUseCases,
  allSoundSources,
  allProblems,
  allResults,
  allStages,
  onSelectPlugin,
  selectedPluginId,
}: FindByProblemProps) {
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);

  const anySourceId = useMemo(
    () => allSoundSources.find(s => s.slug === "any-source")?.id ?? null,
    [allSoundSources]
  );

  const matchedResults = useMemo<UseCaseMatch[]>(() => {
    if (!selectedSourceId && !selectedProblemId && !selectedResultId) return [];

    const matched = allUseCases.filter(uc => {
      if (
        selectedSourceId &&
        uc.sound_source_id !== selectedSourceId &&
        uc.sound_source_id !== anySourceId
      )
        return false;
      if (selectedProblemId && uc.problem_id !== selectedProblemId) return false;
      if (selectedResultId && uc.desired_result_id !== selectedResultId) return false;
      return true;
    });

    const byPlugin = new Map<string, UseCaseMatch>();
    for (const uc of matched) {
      const plugin = allPlugins.find(
        p => p.id === uc.plugin_id && !p.is_container_shell && !p.hidden
      );
      if (!plugin) continue;

      const sourceName =
        allSoundSources.find(s => s.id === uc.sound_source_id)?.name ?? "";
      const problemName =
        allProblems.find(p => p.id === uc.problem_id)?.name ?? "";
      const resultName =
        allResults.find(r => r.id === uc.desired_result_id)?.name ?? "";
      const stageName =
        allStages.find(s => s.id === uc.production_stage_id)?.name ?? "";

      const parts = [sourceName, problemName, resultName].filter(Boolean);
      const matchReason = parts.join(" → ");

      const existing = byPlugin.get(plugin.id);
      const isCurrentBetter =
        !existing ||
        (!existing.useCase.is_recommended && uc.is_recommended) ||
        (existing.useCase.is_recommended === uc.is_recommended &&
          (existing.useCase.effectiveness_rating ?? 0) <
            (uc.effectiveness_rating ?? 0));

      if (isCurrentBetter) {
        byPlugin.set(plugin.id, { plugin, useCase: uc, matchReason, stageName });
      }
    }

    return Array.from(byPlugin.values()).sort((a, b) => {
      if (a.useCase.is_recommended !== b.useCase.is_recommended)
        return a.useCase.is_recommended ? -1 : 1;
      const rDiff =
        (b.useCase.effectiveness_rating ?? 0) -
        (a.useCase.effectiveness_rating ?? 0);
      if (rDiff !== 0) return rDiff;
      if (a.plugin.favorite !== b.plugin.favorite)
        return a.plugin.favorite ? -1 : 1;
      return a.plugin.name.localeCompare(b.plugin.name);
    });
  }, [
    selectedSourceId,
    selectedProblemId,
    selectedResultId,
    allUseCases,
    allPlugins,
    allSoundSources,
    allProblems,
    allResults,
    allStages,
    anySourceId,
  ]);

  const hasSelection = !!(selectedSourceId || selectedProblemId || selectedResultId);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-1">
          <Zap size={18} className="text-[#0F5B59]" />
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Find By Problem
          </h2>
        </div>
        <p className="text-xs text-gray-400 font-medium">
          Select what you're working on to see which plugins you own can help.
        </p>
      </div>

      {/* Filter sections */}
      <div className="space-y-5 mb-8">
        {/* Step 1: Sound source */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              1. What are you working on?
            </span>
            {selectedSourceId && (
              <button
                onClick={() => setSelectedSourceId(null)}
                className="text-[10px] text-gray-400 hover:text-gray-600 font-semibold"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {allSoundSources.map(s => (
              <ChipButton
                key={s.id}
                label={s.name}
                active={selectedSourceId === s.id}
                onClick={() =>
                  setSelectedSourceId(
                    selectedSourceId === s.id ? null : s.id
                  )
                }
              />
            ))}
          </div>
        </div>

        {/* Step 2: Problem */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              2. What is wrong?{" "}
              <span className="text-gray-400 normal-case font-normal tracking-normal">
                (optional)
              </span>
            </span>
            {selectedProblemId && (
              <button
                onClick={() => setSelectedProblemId(null)}
                className="text-[10px] text-gray-400 hover:text-gray-600 font-semibold"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {allProblems.map(p => (
              <ChipButton
                key={p.id}
                label={p.name}
                active={selectedProblemId === p.id}
                onClick={() =>
                  setSelectedProblemId(
                    selectedProblemId === p.id ? null : p.id
                  )
                }
              />
            ))}
          </div>
        </div>

        {/* Step 3: Desired result */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              3. What result do you want?{" "}
              <span className="text-gray-400 normal-case font-normal tracking-normal">
                (optional)
              </span>
            </span>
            {selectedResultId && (
              <button
                onClick={() => setSelectedResultId(null)}
                className="text-[10px] text-gray-400 hover:text-gray-600 font-semibold"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {allResults.map(r => (
              <ChipButton
                key={r.id}
                label={r.name}
                active={selectedResultId === r.id}
                onClick={() =>
                  setSelectedResultId(
                    selectedResultId === r.id ? null : r.id
                  )
                }
              />
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {!hasSelection ? (
        <div className="py-12 text-center select-none">
          <Zap size={32} className="mx-auto text-gray-200 mb-3" />
          <p className="text-sm font-semibold text-gray-400">
            Choose a sound source to see matching plugins
          </p>
          <p className="text-xs text-gray-300 mt-1">
            Problem and result filters narrow the results further.
          </p>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-gray-700">
              {matchedResults.length === 0
                ? "No plugins matched"
                : `${matchedResults.length} plugin${matchedResults.length === 1 ? "" : "s"} found`}
            </span>
            {matchedResults.length > 0 && (
              <span className="text-[10px] text-gray-400 font-medium">
                Recommended · Rating · Favorites · Alphabetical
              </span>
            )}
          </div>

          {matchedResults.length === 0 ? (
            <div className="py-8 text-center select-none">
              <p className="text-sm font-semibold text-gray-400 mb-1">
                No use cases match this combination yet.
              </p>
              <p className="text-xs text-gray-300">
                Add use cases in the plugin inspector to build up your library knowledge.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {matchedResults.map(({ plugin, useCase, matchReason, stageName }) => {
                const isSelected = selectedPluginId === plugin.id;
                return (
                  <button
                    key={plugin.id}
                    onClick={() => onSelectPlugin(plugin)}
                    className={`w-full text-left bg-white rounded-xl border p-4 shadow-sm transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#0F5B59] ring-2 ring-teal-500/10"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span className="text-sm font-bold text-gray-900">
                            {plugin.name}
                          </span>
                          {useCase.is_recommended && (
                            <span className="inline-flex items-center space-x-1 text-[9px] bg-teal-50 text-[#0F5B59] border border-teal-200 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                              <Sparkles size={9} />
                              <span>Recommended</span>
                            </span>
                          )}
                          {plugin.favorite && (
                            <span className="text-[9px] bg-red-50 text-red-500 border border-red-100 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                              Fav
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5 font-medium">
                          {plugin.vendor}
                          {plugin.category ? ` · ${plugin.category}` : ""}
                        </p>
                      </div>
                      {useCase.effectiveness_rating && (
                        <div className="ml-3 flex-shrink-0">
                          <StarRow rating={useCase.effectiveness_rating} />
                        </div>
                      )}
                    </div>

                    {matchReason && (
                      <div className="mt-2 mb-1">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                          Matches:
                        </span>
                        <p className="text-xs font-semibold text-[#0F5B59] mt-0.5">
                          {matchReason}
                        </p>
                      </div>
                    )}

                    {stageName && (
                      <span className="inline-block text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-semibold mt-1">
                        {stageName}
                      </span>
                    )}

                    {(useCase.notes || plugin.favorite_use_case) && (
                      <p className="text-[11px] text-gray-500 mt-2 leading-relaxed border-t border-gray-100 pt-2">
                        {useCase.notes || plugin.favorite_use_case}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
