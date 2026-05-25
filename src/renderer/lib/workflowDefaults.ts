export interface DefaultSoundSource {
  name: string;
  slug: string;
  sortOrder: number;
}

export interface DefaultProducerProblem {
  name: string;
  slug: string;
  sortOrder: number;
}

export interface DefaultDesiredResult {
  name: string;
  slug: string;
  sortOrder: number;
}

export interface DefaultProductionStage {
  name: string;
  slug: string;
  sortOrder: number;
}

export interface DefaultUseCaseMapping {
  normalizedNameContains: string;
  soundSourceSlug: string;
  problemSlug: string;
  resultSlug: string;
  stageSlug: string;
  isRecommended: boolean;
  notes?: string;
}

export const DEFAULT_SOUND_SOURCES: DefaultSoundSource[] = [
  { name: 'Vocal',      slug: 'vocal',      sortOrder: 0 },
  { name: 'Bass',       slug: 'bass',       sortOrder: 1 },
  { name: 'Sub Bass',   slug: 'sub-bass',   sortOrder: 2 },
  { name: 'Kick',       slug: 'kick',       sortOrder: 3 },
  { name: 'Snare',      slug: 'snare',      sortOrder: 4 },
  { name: 'Drums',      slug: 'drums',      sortOrder: 5 },
  { name: 'Drum Bus',   slug: 'drum-bus',   sortOrder: 6 },
  { name: 'Lead',       slug: 'lead',       sortOrder: 7 },
  { name: 'Synth',      slug: 'synth',      sortOrder: 8 },
  { name: 'Pad',        slug: 'pad',        sortOrder: 9 },
  { name: 'FX',         slug: 'fx',         sortOrder: 10 },
  { name: 'Sample',     slug: 'sample',     sortOrder: 11 },
  { name: 'Mix Bus',    slug: 'mix-bus',    sortOrder: 12 },
  { name: 'Master',     slug: 'master',     sortOrder: 13 },
  { name: 'Monitoring', slug: 'monitoring', sortOrder: 14 },
  { name: 'Any Source', slug: 'any-source', sortOrder: 15 },
];

export const DEFAULT_PRODUCER_PROBLEMS: DefaultProducerProblem[] = [
  { name: 'Thin',                    slug: 'thin',                   sortOrder: 0 },
  { name: 'Weak Impact',             slug: 'weak-impact',            sortOrder: 1 },
  { name: 'Muddy',                   slug: 'muddy',                  sortOrder: 2 },
  { name: 'Harsh',                   slug: 'harsh',                  sortOrder: 3 },
  { name: 'Too Bright',              slug: 'too-bright',             sortOrder: 4 },
  { name: 'Too Dark',                slug: 'too-dark',               sortOrder: 5 },
  { name: 'Too Narrow',              slug: 'too-narrow',             sortOrder: 6 },
  { name: 'Too Wide',                slug: 'too-wide',               sortOrder: 7 },
  { name: 'Buried In Mix',           slug: 'buried-in-mix',          sortOrder: 8 },
  { name: 'Masking Another Sound',   slug: 'masking-another-sound',  sortOrder: 9 },
  { name: 'Noisy',                   slug: 'noisy',                  sortOrder: 10 },
  { name: 'Sibilant',                slug: 'sibilant',               sortOrder: 11 },
  { name: 'Clipping',                slug: 'clipping',               sortOrder: 12 },
  { name: 'Uncontrolled Peaks',      slug: 'uncontrolled-peaks',     sortOrder: 13 },
  { name: 'Flat / Lifeless',         slug: 'flat-lifeless',          sortOrder: 14 },
  { name: 'Needs Movement',          slug: 'needs-movement',         sortOrder: 15 },
  { name: 'Needs Space',             slug: 'needs-space',            sortOrder: 16 },
  { name: 'Needs Texture',           slug: 'needs-texture',          sortOrder: 17 },
  { name: 'Needs Transition Energy', slug: 'needs-transition-energy',sortOrder: 18 },
  { name: 'Needs Loudness',          slug: 'needs-loudness',         sortOrder: 19 },
  { name: 'Needs Cleanup',           slug: 'needs-cleanup',          sortOrder: 20 },
];

export const DEFAULT_DESIRED_RESULTS: DefaultDesiredResult[] = [
  { name: 'Punch',          slug: 'punch',          sortOrder: 0 },
  { name: 'Weight',         slug: 'weight',         sortOrder: 1 },
  { name: 'Warmth',         slug: 'warmth',         sortOrder: 2 },
  { name: 'Aggression',     slug: 'aggression',     sortOrder: 3 },
  { name: 'Clarity',        slug: 'clarity',        sortOrder: 4 },
  { name: 'Width',          slug: 'width',          sortOrder: 5 },
  { name: 'Depth',          slug: 'depth',          sortOrder: 6 },
  { name: 'Air',            slug: 'air',            sortOrder: 7 },
  { name: 'Movement',       slug: 'movement',       sortOrder: 8 },
  { name: 'Texture',        slug: 'texture',        sortOrder: 9 },
  { name: 'Distortion',     slug: 'distortion',     sortOrder: 10 },
  { name: 'Clean Loudness', slug: 'clean-loudness', sortOrder: 11 },
  { name: 'Stereo Control', slug: 'stereo-control', sortOrder: 12 },
  { name: 'Noise Removal',  slug: 'noise-removal',  sortOrder: 13 },
  { name: 'Vocal Polish',   slug: 'vocal-polish',   sortOrder: 14 },
  { name: 'Atmosphere',     slug: 'atmosphere',     sortOrder: 15 },
  { name: 'Tension',        slug: 'tension',        sortOrder: 16 },
  { name: 'Drop Impact',    slug: 'drop-impact',    sortOrder: 17 },
];

export const DEFAULT_PRODUCTION_STAGES: DefaultProductionStage[] = [
  { name: 'Sound Design',      slug: 'sound-design',      sortOrder: 0 },
  { name: 'Arrangement',       slug: 'arrangement',       sortOrder: 1 },
  { name: 'Transition Design', slug: 'transition-design', sortOrder: 2 },
  { name: 'Vocal Production',  slug: 'vocal-production',  sortOrder: 3 },
  { name: 'Mixing',            slug: 'mixing',            sortOrder: 4 },
  { name: 'Mastering',         slug: 'mastering',         sortOrder: 5 },
  { name: 'Repair',            slug: 'repair',            sortOrder: 6 },
  { name: 'Monitoring',        slug: 'monitoring',        sortOrder: 7 },
];

// normalizedNameContains: substring matched against plugins.normalized_name (case-insensitive handled at query time)
// Editing a seeded use case (not deleting) persists customization since source becomes 'manual'
export const DEFAULT_USE_CASE_MAPPINGS: DefaultUseCaseMapping[] = [
  // ── Nectar (iZotope vocal suite) ────────────────────────────────────────────
  {
    normalizedNameContains: 'nectar',
    soundSourceSlug: 'vocal', problemSlug: 'buried-in-mix',
    resultSlug: 'vocal-polish', stageSlug: 'vocal-production',
    isRecommended: true,
    notes: 'Vocal mixing starting point for making vocals more polished and present.',
  },

  // ── Vocal Doubler ────────────────────────────────────────────────────────────
  {
    normalizedNameContains: 'vocaldoubler',
    soundSourceSlug: 'vocal', problemSlug: 'too-narrow',
    resultSlug: 'width', stageSlug: 'vocal-production',
    isRecommended: true,
  },

  // ── T-De-Esser / de-esser plugins ────────────────────────────────────────────
  {
    normalizedNameContains: 'tdeesser',
    soundSourceSlug: 'vocal', problemSlug: 'sibilant',
    resultSlug: 'clarity', stageSlug: 'mixing',
    isRecommended: true,
  },
  {
    normalizedNameContains: 'deesser',
    soundSourceSlug: 'vocal', problemSlug: 'sibilant',
    resultSlug: 'clarity', stageSlug: 'mixing',
    isRecommended: true,
  },

  // ── RX Voice De-noise ────────────────────────────────────────────────────────
  {
    normalizedNameContains: 'voicedenoise',
    soundSourceSlug: 'vocal', problemSlug: 'noisy',
    resultSlug: 'noise-removal', stageSlug: 'repair',
    isRecommended: true,
  },

  // ── Little AlterBoy ──────────────────────────────────────────────────────────
  {
    normalizedNameContains: 'littlealterboy',
    soundSourceSlug: 'vocal', problemSlug: 'flat-lifeless',
    resultSlug: 'texture', stageSlug: 'sound-design',
    isRecommended: false,
  },

  // ── VocalSynth ───────────────────────────────────────────────────────────────
  {
    normalizedNameContains: 'vocalsynth',
    soundSourceSlug: 'vocal', problemSlug: 'flat-lifeless',
    resultSlug: 'texture', stageSlug: 'sound-design',
    isRecommended: false,
  },

  // ── SausageFattener ──────────────────────────────────────────────────────────
  {
    normalizedNameContains: 'sausagefattener',
    soundSourceSlug: 'bass', problemSlug: 'weak-impact',
    resultSlug: 'weight', stageSlug: 'sound-design',
    isRecommended: true,
    notes: 'Useful for adding aggressive density or harmonic thickness to bass layers; monitor gain and sub clarity.',
  },

  // ── Trash (iZotope) ──────────────────────────────────────────────────────────
  {
    normalizedNameContains: 'trash',
    soundSourceSlug: 'bass', problemSlug: 'needs-texture',
    resultSlug: 'aggression', stageSlug: 'sound-design',
    isRecommended: true,
  },

  // ── kHs Transient Shaper ─────────────────────────────────────────────────────
  {
    normalizedNameContains: 'khstransientshaper',
    soundSourceSlug: 'kick', problemSlug: 'weak-impact',
    resultSlug: 'punch', stageSlug: 'mixing',
    isRecommended: true,
  },
  {
    normalizedNameContains: 'khstransientshaper',
    soundSourceSlug: 'drums', problemSlug: 'flat-lifeless',
    resultSlug: 'punch', stageSlug: 'mixing',
    isRecommended: false,
  },

  // ── Trackspacer ──────────────────────────────────────────────────────────────
  {
    normalizedNameContains: 'trackspacer',
    soundSourceSlug: 'bass', problemSlug: 'masking-another-sound',
    resultSlug: 'clarity', stageSlug: 'mixing',
    isRecommended: true,
    notes: 'Useful when kick and bass, vocal and instrumental, or lead layers are competing for frequency space.',
  },
  {
    normalizedNameContains: 'trackspacer',
    soundSourceSlug: 'vocal', problemSlug: 'buried-in-mix',
    resultSlug: 'clarity', stageSlug: 'mixing',
    isRecommended: false,
  },

  // ── MEqualizer ───────────────────────────────────────────────────────────────
  {
    normalizedNameContains: 'mequalizer',
    soundSourceSlug: 'any-source', problemSlug: 'muddy',
    resultSlug: 'clarity', stageSlug: 'mixing',
    isRecommended: false,
  },

  // ── Ozone Equalizer (any version) ────────────────────────────────────────────
  {
    normalizedNameContains: 'ozoneequalizer',
    soundSourceSlug: 'any-source', problemSlug: 'muddy',
    resultSlug: 'clarity', stageSlug: 'mixing',
    isRecommended: false,
  },

  // ── Barricade (ToneBoosters limiter) ─────────────────────────────────────────
  {
    normalizedNameContains: 'barricade',
    soundSourceSlug: 'master', problemSlug: 'needs-loudness',
    resultSlug: 'clean-loudness', stageSlug: 'mastering',
    isRecommended: true,
  },

  // ── Ozone (mastering suite, any version) ─────────────────────────────────────
  {
    normalizedNameContains: 'ozoneelements',
    soundSourceSlug: 'master', problemSlug: 'needs-loudness',
    resultSlug: 'clean-loudness', stageSlug: 'mastering',
    isRecommended: true,
  },
  {
    normalizedNameContains: 'ozone11',
    soundSourceSlug: 'master', problemSlug: 'needs-loudness',
    resultSlug: 'clean-loudness', stageSlug: 'mastering',
    isRecommended: true,
  },

  // ── Ozone Imager ─────────────────────────────────────────────────────────────
  {
    normalizedNameContains: 'ozoneimager',
    soundSourceSlug: 'lead', problemSlug: 'too-narrow',
    resultSlug: 'width', stageSlug: 'mixing',
    isRecommended: false,
  },

  // ── Valhalla VintageVerb ─────────────────────────────────────────────────────
  {
    normalizedNameContains: 'valhallavintageverb',
    soundSourceSlug: 'lead', problemSlug: 'needs-space',
    resultSlug: 'depth', stageSlug: 'mixing',
    isRecommended: false,
  },

  // ── Valhalla Shimmer ─────────────────────────────────────────────────────────
  {
    normalizedNameContains: 'valhallashimmer',
    soundSourceSlug: 'pad', problemSlug: 'needs-space',
    resultSlug: 'atmosphere', stageSlug: 'sound-design',
    isRecommended: false,
  },

  // ── Portal ───────────────────────────────────────────────────────────────────
  {
    normalizedNameContains: 'portal',
    soundSourceSlug: 'fx', problemSlug: 'needs-texture',
    resultSlug: 'texture', stageSlug: 'sound-design',
    isRecommended: false,
  },

  // ── kHs Tape Stop ────────────────────────────────────────────────────────────
  {
    normalizedNameContains: 'khstapestop',
    soundSourceSlug: 'fx', problemSlug: 'needs-transition-energy',
    resultSlug: 'tension', stageSlug: 'transition-design',
    isRecommended: false,
  },

  // ── ShaperBox ────────────────────────────────────────────────────────────────
  {
    normalizedNameContains: 'shaperbox',
    soundSourceSlug: 'bass', problemSlug: 'needs-movement',
    resultSlug: 'movement', stageSlug: 'sound-design',
    isRecommended: false,
  },

  // ── Voxengo SPAN ─────────────────────────────────────────────────────────────
  {
    normalizedNameContains: 'voxengospan',
    soundSourceSlug: 'master', problemSlug: 'muddy',
    resultSlug: 'clarity', stageSlug: 'monitoring',
    isRecommended: false,
  },

  // ── Morphit ──────────────────────────────────────────────────────────────────
  {
    normalizedNameContains: 'morphit',
    soundSourceSlug: 'monitoring', problemSlug: 'needs-cleanup',
    resultSlug: 'stereo-control', stageSlug: 'monitoring',
    isRecommended: false,
  },
];
