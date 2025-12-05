/**
 * Wylie to Uchen Script Converter
 * Converts Romanized Tibetan (Wylie) to Uchen Script (དུ་ཆེན་)
 *
 * This is a simplified converter. For production, consider using:
 * - pyewts: Python library (npm: pyewts-js)
 * - Full Wylie spec: https://www.thlib.org/reference/transliteration/wylie
 */

const WYLIE_TO_UCHEN: Record<string, string> = {
  // Basic consonants
  ka: 'ཀ',
  kha: 'ཁ',
  ga: 'ག',
  nga: 'ང',
  ca: 'ཅ',
  cha: 'ཆ',
  ja: 'ཇ',
  nya: 'ཉ',
  ta: 'ཏ',
  tha: 'ཐ',
  da: 'ད',
  na: 'ན',
  pa: 'པ',
  pha: 'ཕ',
  ba: 'བ',
  ma: 'མ',
  tsa: 'ཙ',
  tsha: 'ཚ',
  dza: 'ཛ',
  wa: 'ཝ',
  zha: 'ཞ',
  za: 'ཟ',
  ya: 'ཡ',
  ra: 'ར',
  la: 'ལ',
  sha: 'ཤ',
  sa: 'ས',
  ha: 'ཧ',
  a: 'ཨ',

  // Vowels
  i: 'ི',
  u: 'ུ',
  e: 'ེ',
  o: 'ོ',

  // Consonant clusters (simplified)
  kyo: 'ཀྱོ',
  kyi: 'ཀྱི',
  gyo: 'གྱོ',
  gyi: 'གྱི',
  pyo: 'པྱོ',
  pyi: 'པྱི',
  byo: 'བྱོ',
  byi: 'བྱི',
  myo: 'མྱོ',
  myi: 'མྱི',
  klo: 'ཀ་ལོ',
  glo: 'གལོ',
  plo: 'པ་ལོ',
  blo: 'བ་ལོ',

  // Common standalone particles and suffixes
  bo: 'བོ',
  mo: 'མོ',
  po: 'པོ',
  to: 'ཏོ',
  do: 'དོ',
  no: 'ནོ',
  lo: 'ལོ',
  ro: 'རོ',
  so: 'སོ',

  // Punctuation
  '|': '།',
  '||': '༎',
};

/**
 * Convert Wylie (Romanized) to Uchen Script
 * This is a best-effort converter for common words
 *
 * @param wylie - Input in Wylie romanization
 * @returns Output in Uchen script (དུ་ཆེན་)
 */
export function wylieToUchen(wylie: string): string {
  if (!wylie) return '';

  // Normalize input
  let normalized = wylie.toLowerCase().trim();

  // Try exact matches first (longest first)
  const sortedKeys = Object.keys(WYLIE_TO_UCHEN).sort(
    (a, b) => b.length - a.length,
  );

  let result = normalized;
  for (const key of sortedKeys) {
    const regex = new RegExp(`\\b${key}\\b`, 'gi');
    result = result.replace(regex, WYLIE_TO_UCHEN[key]);
  }

  return result;
}

/**
 * Check if string is already in Uchen (contains Tibetan characters)
 */
export function isUchen(text: string): boolean {
  // Tibetan Unicode range: U+0F00 to U+0FFF
  return /[\u0F00-\u0FFF]/.test(text);
}

/**
 * Auto-detect and convert Wylie input
 * If input is already in Uchen, return as-is
 * Otherwise convert from Wylie
 */
export function autoConvert(input: string): string {
  if (isUchen(input)) {
    return input;
  }
  return wylieToUchen(input);
}

/**
 * Get display text (Uchen) and search query (normalized)
 * Useful for showing Uchen while searching with Wylie input
 */
export function getDisplayAndSearch(input: string): {
  display: string;
  search: string;
} {
  const display = autoConvert(input);
  const search = input.toLowerCase().trim();

  return {display, search};
}
