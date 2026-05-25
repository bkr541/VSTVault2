export type MetadataConfidence = 'verified' | 'inferred' | 'manual' | 'unknown';

export interface ProductMapping {
  matcher: RegExp;
  vendor: string;
  productFamily?: string;
  category?: string;
  confidence: 'verified' | 'inferred';
  isContainerShell?: boolean;
  primaryCategorySlug?: string;
  primarySubcategorySlug?: string;
}

// Listed most-specific first — first match wins.
// Use anchored /^Name\b/ patterns to avoid partial-name false positives.
export const PRODUCT_VENDOR_MAPPINGS: ProductMapping[] = [

  // ── Container / Shell entries ──────────────────────────────────────────────
  { matcher: /^WaveShell/i, vendor: 'Waves', productFamily: 'WaveShell', category: 'Plugin Container',
    confidence: 'verified', isContainerShell: true,
    primaryCategorySlug: 'utility', primarySubcategorySlug: 'plugin-container' },

  // ── Xfer Records ──────────────────────────────────────────────────────────
  { matcher: /^Serum\s*2\b/i, vendor: 'Xfer Records', productFamily: 'Serum', category: 'Synthesizer',
    confidence: 'verified', primaryCategorySlug: 'instruments', primarySubcategorySlug: 'wavetable-synth' },
  { matcher: /^Serum\b/i, vendor: 'Xfer Records', productFamily: 'Serum', category: 'Synthesizer',
    confidence: 'verified', primaryCategorySlug: 'instruments', primarySubcategorySlug: 'wavetable-synth' },

  // ── Native Instruments ────────────────────────────────────────────────────
  { matcher: /^Kontakt\b/i, vendor: 'Native Instruments', productFamily: 'Kontakt',
    category: 'Instrument / Sample Playback', confidence: 'verified',
    primaryCategorySlug: 'instruments', primarySubcategorySlug: 'sampler-library-host' },

  // ── Wavesfactory ──────────────────────────────────────────────────────────
  { matcher: /^Trackspacer\b/i, vendor: 'Wavesfactory', productFamily: 'Trackspacer',
    category: 'Dynamic EQ / Masking', confidence: 'verified',
    primaryCategorySlug: 'eq-filtering', primarySubcategorySlug: 'dynamic-eq-masking' },

  // ── Dada Life ─────────────────────────────────────────────────────────────
  { matcher: /^SausageFattener\b/i, vendor: 'Dada Life', productFamily: 'SausageFattener',
    category: 'Saturation / Impact', confidence: 'verified',
    primaryCategorySlug: 'saturation-distortion', primarySubcategorySlug: 'fattening-clipping' },

  // ── Kilohearts — specific products first, then catch-all ──────────────────
  { matcher: /^kHs Tape Stop\b/i, vendor: 'Kilohearts', productFamily: 'kHs',
    category: 'Transition Effect', confidence: 'verified',
    primaryCategorySlug: 'space-time', primarySubcategorySlug: 'tape-stop' },
  { matcher: /^kHs Transient Shaper\b/i, vendor: 'Kilohearts', productFamily: 'kHs',
    category: 'Transient Shaper', confidence: 'verified',
    primaryCategorySlug: 'dynamics', primarySubcategorySlug: 'transient-shaper' },
  { matcher: /^kHs Reverb\b/i, vendor: 'Kilohearts', productFamily: 'kHs',
    category: 'Reverb', confidence: 'verified',
    primaryCategorySlug: 'space-time', primarySubcategorySlug: 'reverb' },
  { matcher: /^kHs Resonator\b/i, vendor: 'Kilohearts', productFamily: 'kHs',
    category: 'Modulation', confidence: 'verified',
    primaryCategorySlug: 'modulation-movement', primarySubcategorySlug: 'rhythmic-movement' },
  { matcher: /^kHs Trance Gate\b/i, vendor: 'Kilohearts', productFamily: 'kHs',
    category: 'Modulation', confidence: 'verified',
    primaryCategorySlug: 'dynamics', primarySubcategorySlug: 'gate' },
  { matcher: /^kHs Reverser\b/i, vendor: 'Kilohearts', productFamily: 'kHs',
    category: 'Modulation', confidence: 'verified',
    primaryCategorySlug: 'space-time', primarySubcategorySlug: 'reverse' },
  { matcher: /^kHs Ring Mod\b/i, vendor: 'Kilohearts', productFamily: 'kHs',
    category: 'Modulation', confidence: 'verified',
    primaryCategorySlug: 'modulation-movement', primarySubcategorySlug: 'ring-modulation' },
  { matcher: /^kHs Stereo\b/i, vendor: 'Kilohearts', productFamily: 'kHs',
    category: 'Utility', confidence: 'verified',
    primaryCategorySlug: 'stereo-monitoring', primarySubcategorySlug: 'stereo-imaging' },
  { matcher: /^kHs Shaper\b/i, vendor: 'Kilohearts', productFamily: 'kHs',
    category: 'Distortion', confidence: 'verified',
    primaryCategorySlug: 'saturation-distortion', primarySubcategorySlug: 'waveshaping' },
  { matcher: /^kHs Pitch Shifter\b/i, vendor: 'Kilohearts', productFamily: 'kHs',
    category: 'Modulation', confidence: 'verified',
    primaryCategorySlug: 'modulation-movement', primarySubcategorySlug: 'pitch-shifting' },
  { matcher: /^kHs Phase Distortion\b/i, vendor: 'Kilohearts', productFamily: 'kHs',
    category: 'Distortion', confidence: 'verified',
    primaryCategorySlug: 'saturation-distortion', primarySubcategorySlug: 'phase-distortion' },
  { matcher: /^kHs Nonlinear Filter\b/i, vendor: 'Kilohearts', productFamily: 'kHs',
    category: 'Distortion', confidence: 'verified',
    primaryCategorySlug: 'saturation-distortion', primarySubcategorySlug: 'waveshaping' },
  // kHs catch-all: vendor is verified but classification needs manual review
  { matcher: /^kHs\s/i, vendor: 'Kilohearts', productFamily: 'kHs', confidence: 'verified' },

  // ── iZotope — RX repair tools first (avoid "reverb" keyword matching) ─────
  { matcher: /^RX\s+\d+\s+De.?reverb\b/i, vendor: 'iZotope', productFamily: 'RX',
    category: 'Audio Repair', confidence: 'verified',
    primaryCategorySlug: 'repair-cleanup', primarySubcategorySlug: 'de-reverb' },
  { matcher: /^RX\s+\d+\s+De.?noise\b/i, vendor: 'iZotope', productFamily: 'RX',
    category: 'Audio Repair', confidence: 'verified',
    primaryCategorySlug: 'repair-cleanup', primarySubcategorySlug: 'de-noise' },
  { matcher: /^RX\s+\d+\s+De.?click\b/i, vendor: 'iZotope', productFamily: 'RX',
    category: 'Audio Repair', confidence: 'verified',
    primaryCategorySlug: 'repair-cleanup', primarySubcategorySlug: 'de-click' },
  { matcher: /^RX\s+\d+\s+De.?clip\b/i, vendor: 'iZotope', productFamily: 'RX',
    category: 'Audio Repair', confidence: 'verified',
    primaryCategorySlug: 'repair-cleanup', primarySubcategorySlug: 'de-clip' },
  { matcher: /^RX\s+\d+\s+De.?hum\b/i, vendor: 'iZotope', productFamily: 'RX',
    category: 'Audio Repair', confidence: 'verified',
    primaryCategorySlug: 'repair-cleanup', primarySubcategorySlug: 'de-hum' },
  { matcher: /^RX\s+\d+\s+(Repair Assistant|Voice De.?noise|Spectral Repair|Dialogue Isolation|Mouth De.?click|Breath Control|Music Rebalance|Ambience Match|Loudness Control)/i,
    vendor: 'iZotope', productFamily: 'RX', category: 'Audio Repair', confidence: 'verified',
    primaryCategorySlug: 'repair-cleanup', primarySubcategorySlug: 'repair-assistant' },
  { matcher: /^RX\b/i, vendor: 'iZotope', productFamily: 'RX',
    category: 'Audio Repair', confidence: 'verified',
    primaryCategorySlug: 'repair-cleanup', primarySubcategorySlug: 'repair-assistant' },
  { matcher: /^Ozone Imager\b/i, vendor: 'iZotope', productFamily: 'Ozone',
    category: 'Utility', confidence: 'verified',
    primaryCategorySlug: 'stereo-monitoring', primarySubcategorySlug: 'stereo-imaging' },
  { matcher: /^Ozone\b/i, vendor: 'iZotope', productFamily: 'Ozone',
    confidence: 'verified',
    primaryCategorySlug: 'mastering', primarySubcategorySlug: 'mastering-suite' },
  { matcher: /^Nectar\b/i, vendor: 'iZotope', productFamily: 'Nectar',
    category: 'Vocal Processing', confidence: 'verified',
    primaryCategorySlug: 'vocals', primarySubcategorySlug: 'vocal-mixing-suite' },
  { matcher: /^Trash\b/i, vendor: 'iZotope', productFamily: 'Trash',
    category: 'Distortion', confidence: 'verified',
    primaryCategorySlug: 'saturation-distortion', primarySubcategorySlug: 'distortion-suite' },
  { matcher: /^VocalSynth\b/i, vendor: 'iZotope', productFamily: 'VocalSynth',
    category: 'Vocal Processing', confidence: 'verified',
    primaryCategorySlug: 'vocals', primarySubcategorySlug: 'creative-vocal-design' },
  { matcher: /^Vocal Doubler\b/i, vendor: 'iZotope', productFamily: 'Vocal Doubler',
    category: 'Vocal Processing', confidence: 'verified',
    primaryCategorySlug: 'vocals', primarySubcategorySlug: 'doubler-width' },

  // ── MeldaProduction — exact product names only, no broad M-prefix catch ───
  { matcher: /^MEqualizer\b/i, vendor: 'MeldaProduction', productFamily: 'MeldaProduction',
    category: 'EQ', confidence: 'verified',
    primaryCategorySlug: 'eq-filtering', primarySubcategorySlug: 'parametric-eq' },
  { matcher: /^MCharmVerb\b/i, vendor: 'MeldaProduction', productFamily: 'MeldaProduction',
    category: 'Reverb', confidence: 'verified',
    primaryCategorySlug: 'space-time', primarySubcategorySlug: 'reverb' },
  { matcher: /^MDelay\b/i, vendor: 'MeldaProduction', productFamily: 'MeldaProduction',
    category: 'Delay', confidence: 'verified',
    primaryCategorySlug: 'space-time', primarySubcategorySlug: 'delay' },
  { matcher: /^MSaturator\b/i, vendor: 'MeldaProduction', productFamily: 'MeldaProduction',
    category: 'Distortion / Saturation', confidence: 'verified',
    primaryCategorySlug: 'saturation-distortion', primarySubcategorySlug: 'saturation' },

  // ── ToneBoosters ──────────────────────────────────────────────────────────
  { matcher: /^Barricade\b/i, vendor: 'ToneBoosters', productFamily: 'ToneBoosters',
    category: 'Dynamics / Limiter', confidence: 'verified',
    primaryCategorySlug: 'dynamics', primarySubcategorySlug: 'limiter' },
  { matcher: /^Flowtones\b/i, vendor: 'ToneBoosters', productFamily: 'ToneBoosters',
    confidence: 'verified' },
  { matcher: /^Sibalance\b/i, vendor: 'ToneBoosters', productFamily: 'ToneBoosters',
    category: 'Dynamics / De-esser', confidence: 'verified',
    primaryCategorySlug: 'dynamics', primarySubcategorySlug: 'de-esser' },
  { matcher: /^DualVCF\b/i, vendor: 'ToneBoosters', productFamily: 'ToneBoosters',
    confidence: 'verified',
    primaryCategorySlug: 'eq-filtering', primarySubcategorySlug: 'creative-filter' },
  { matcher: /^Morphit\b/i, vendor: 'ToneBoosters', productFamily: 'ToneBoosters',
    category: 'Monitoring', confidence: 'verified',
    primaryCategorySlug: 'stereo-monitoring', primarySubcategorySlug: 'headphone-correction' },
  { matcher: /^ReelBus\b/i, vendor: 'ToneBoosters', productFamily: 'ToneBoosters',
    category: 'Distortion / Saturation', confidence: 'verified',
    primaryCategorySlug: 'saturation-distortion', primarySubcategorySlug: 'tape-color' },
  { matcher: /^Lowtone\b/i, vendor: 'ToneBoosters', productFamily: 'ToneBoosters',
    confidence: 'verified',
    primaryCategorySlug: 'instruments', primarySubcategorySlug: 'bass-synth' },
  { matcher: /^(?:TB\s+)?MBC\b/i, vendor: 'ToneBoosters', productFamily: 'ToneBoosters',
    category: 'Dynamics / Compressor', confidence: 'verified',
    primaryCategorySlug: 'dynamics', primarySubcategorySlug: 'multiband-compressor' },

  // ── Valhalla DSP — delay before the generic reverb catch ──────────────────
  { matcher: /^ValhallaDelay\b/i, vendor: 'Valhalla DSP', productFamily: 'Valhalla',
    category: 'Delay', confidence: 'verified',
    primaryCategorySlug: 'space-time', primarySubcategorySlug: 'delay' },
  { matcher: /^ValhallaShimmer\b/i, vendor: 'Valhalla DSP', productFamily: 'Valhalla',
    category: 'Reverb', confidence: 'verified',
    primaryCategorySlug: 'space-time', primarySubcategorySlug: 'shimmer-reverb' },
  { matcher: /^Valhalla\b/i, vendor: 'Valhalla DSP', productFamily: 'Valhalla',
    category: 'Reverb', confidence: 'verified',
    primaryCategorySlug: 'space-time', primarySubcategorySlug: 'reverb' },
];

export function matchProduct(name: string): ProductMapping | null {
  for (const mapping of PRODUCT_VENDOR_MAPPINGS) {
    if (mapping.matcher.test(name)) return mapping;
  }
  return null;
}
