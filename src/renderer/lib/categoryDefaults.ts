export interface DefaultSubcategory {
  name: string;
  slug: string;
  sortOrder: number;
}

export interface DefaultCategory {
  name: string;
  slug: string;
  sortOrder: number;
  subcategories: DefaultSubcategory[];
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  {
    name: 'Instruments', slug: 'instruments', sortOrder: 0,
    subcategories: [
      { name: 'Wavetable Synth',         slug: 'wavetable-synth',       sortOrder: 0 },
      { name: 'Virtual Analog Synth',    slug: 'virtual-analog-synth',  sortOrder: 1 },
      { name: 'Bass Synth',              slug: 'bass-synth',            sortOrder: 2 },
      { name: 'Sampler / Library Host',  slug: 'sampler-library-host',  sortOrder: 3 },
      { name: 'Piano / Keys',            slug: 'piano-keys',            sortOrder: 4 },
      { name: 'Hybrid Instrument',       slug: 'hybrid-instrument',     sortOrder: 5 },
    ],
  },
  {
    name: 'Dynamics', slug: 'dynamics', sortOrder: 1,
    subcategories: [
      { name: 'Compressor',              slug: 'compressor',            sortOrder: 0 },
      { name: 'Multiband Compressor',    slug: 'multiband-compressor',  sortOrder: 1 },
      { name: 'Limiter',                 slug: 'limiter',               sortOrder: 2 },
      { name: 'Transient Shaper',        slug: 'transient-shaper',      sortOrder: 3 },
      { name: 'De-Esser',               slug: 'de-esser',              sortOrder: 4 },
      { name: 'Gate',                    slug: 'gate',                  sortOrder: 5 },
    ],
  },
  {
    name: 'EQ & Filtering', slug: 'eq-filtering', sortOrder: 2,
    subcategories: [
      { name: 'Parametric EQ',           slug: 'parametric-eq',         sortOrder: 0 },
      { name: 'Dynamic EQ / Masking',    slug: 'dynamic-eq-masking',    sortOrder: 1 },
      { name: 'Creative Filter',         slug: 'creative-filter',       sortOrder: 2 },
      { name: 'Spectral Balance',        slug: 'spectral-balance',      sortOrder: 3 },
    ],
  },
  {
    name: 'Saturation & Distortion', slug: 'saturation-distortion', sortOrder: 3,
    subcategories: [
      { name: 'Saturation',              slug: 'saturation',            sortOrder: 0 },
      { name: 'Fattening / Clipping',    slug: 'fattening-clipping',    sortOrder: 1 },
      { name: 'Distortion Suite',        slug: 'distortion-suite',      sortOrder: 2 },
      { name: 'Waveshaping',             slug: 'waveshaping',           sortOrder: 3 },
      { name: 'Phase Distortion',        slug: 'phase-distortion',      sortOrder: 4 },
      { name: 'Bitcrushing',             slug: 'bitcrushing',           sortOrder: 5 },
      { name: 'Tape Color',              slug: 'tape-color',            sortOrder: 6 },
    ],
  },
  {
    name: 'Space & Time', slug: 'space-time', sortOrder: 4,
    subcategories: [
      { name: 'Reverb',                  slug: 'reverb',                sortOrder: 0 },
      { name: 'Shimmer Reverb',          slug: 'shimmer-reverb',        sortOrder: 1 },
      { name: 'Vocal Reverb',            slug: 'vocal-reverb',          sortOrder: 2 },
      { name: 'Delay',                   slug: 'delay',                 sortOrder: 3 },
      { name: 'Granular Delay',          slug: 'granular-delay',        sortOrder: 4 },
      { name: 'Reverse',                 slug: 'reverse',               sortOrder: 5 },
      { name: 'Tape Stop',               slug: 'tape-stop',             sortOrder: 6 },
      { name: 'Stutter / Glitch',        slug: 'stutter-glitch',        sortOrder: 7 },
    ],
  },
  {
    name: 'Modulation & Movement', slug: 'modulation-movement', sortOrder: 5,
    subcategories: [
      { name: 'Stereo Movement',         slug: 'stereo-movement',       sortOrder: 0 },
      { name: 'Rhythmic Movement',       slug: 'rhythmic-movement',     sortOrder: 1 },
      { name: 'Multi-Effect Motion',     slug: 'multi-effect-motion',   sortOrder: 2 },
      { name: 'Pitch Shifting',          slug: 'pitch-shifting',        sortOrder: 3 },
      { name: 'Formant Processing',      slug: 'formant-processing',    sortOrder: 4 },
      { name: 'Ring Modulation',         slug: 'ring-modulation',       sortOrder: 5 },
    ],
  },
  {
    name: 'Vocals', slug: 'vocals', sortOrder: 6,
    subcategories: [
      { name: 'Vocal Mixing Suite',      slug: 'vocal-mixing-suite',    sortOrder: 0 },
      { name: 'Pitch / Formant',         slug: 'pitch-formant',         sortOrder: 1 },
      { name: 'Doubler / Width',         slug: 'doubler-width',         sortOrder: 2 },
      { name: 'De-Esser',               slug: 'vocal-de-esser',        sortOrder: 3 },
      { name: 'Vocal Repair',            slug: 'vocal-repair',          sortOrder: 4 },
      { name: 'Vocal Space',             slug: 'vocal-space',           sortOrder: 5 },
      { name: 'Creative Vocal Design',   slug: 'creative-vocal-design', sortOrder: 6 },
    ],
  },
  {
    name: 'Repair & Cleanup', slug: 'repair-cleanup', sortOrder: 7,
    subcategories: [
      { name: 'Repair Assistant',        slug: 'repair-assistant',      sortOrder: 0 },
      { name: 'De-Noise',               slug: 'de-noise',              sortOrder: 1 },
      { name: 'De-Click',               slug: 'de-click',              sortOrder: 2 },
      { name: 'De-Clip',                slug: 'de-clip',               sortOrder: 3 },
      { name: 'De-Hum',                 slug: 'de-hum',                sortOrder: 4 },
      { name: 'De-Reverb',              slug: 'de-reverb',             sortOrder: 5 },
    ],
  },
  {
    name: 'Stereo & Monitoring', slug: 'stereo-monitoring', sortOrder: 8,
    subcategories: [
      { name: 'Stereo Imaging',          slug: 'stereo-imaging',        sortOrder: 0 },
      { name: 'Goniometer',              slug: 'goniometer',            sortOrder: 1 },
      { name: 'Headphone Correction',    slug: 'headphone-correction',  sortOrder: 2 },
      { name: 'Stereometer',             slug: 'stereometer',           sortOrder: 3 },
    ],
  },
  {
    name: 'Metering & Analysis', slug: 'metering-analysis', sortOrder: 9,
    subcategories: [
      { name: 'Spectrum Analyzer',       slug: 'spectrum-analyzer',     sortOrder: 0 },
      { name: 'Loudness Meter',          slug: 'loudness-meter',        sortOrder: 1 },
      { name: 'Oscilloscope',            slug: 'oscilloscope',          sortOrder: 2 },
      { name: 'Waveform Monitor',        slug: 'waveform-monitor',      sortOrder: 3 },
      { name: 'Spectrogram',             slug: 'spectrogram',           sortOrder: 4 },
      { name: 'Metering Suite',          slug: 'metering-suite',        sortOrder: 5 },
    ],
  },
  {
    name: 'Mastering', slug: 'mastering', sortOrder: 10,
    subcategories: [
      { name: 'Mastering Suite',         slug: 'mastering-suite',       sortOrder: 0 },
      { name: 'Limiting',                slug: 'limiting',              sortOrder: 1 },
      { name: 'Stereo Imaging',          slug: 'mastering-stereo-imaging', sortOrder: 2 },
      { name: 'Loudness Metering',       slug: 'loudness-metering',     sortOrder: 3 },
      { name: 'Spectrum Checking',       slug: 'spectrum-checking',     sortOrder: 4 },
    ],
  },
  {
    name: 'Utility', slug: 'utility', sortOrder: 11,
    subcategories: [
      { name: 'Sample Browser',          slug: 'sample-browser',        sortOrder: 0 },
      { name: 'Bridge / Integration',    slug: 'bridge-integration',    sortOrder: 1 },
      { name: 'Audio Helper',            slug: 'audio-helper',          sortOrder: 2 },
      { name: 'Plugin Container',        slug: 'plugin-container',      sortOrder: 3 },
    ],
  },
];
