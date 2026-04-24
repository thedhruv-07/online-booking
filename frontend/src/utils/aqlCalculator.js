/**
 * AQL Calculator Utility
 * Based on ISO 2859-1 (ANSI/ASQC Z1.4) standards
 */

const codeLetterTable = [
  { min: 2, max: 8, s1: 'A', s2: 'A', s3: 'A', s4: 'A', i: 'A', ii: 'A', iii: 'B' },
  { min: 9, max: 15, s1: 'A', s2: 'A', s3: 'A', s4: 'A', i: 'A', ii: 'B', iii: 'C' },
  { min: 16, max: 25, s1: 'A', s2: 'A', s3: 'B', s4: 'B', i: 'B', ii: 'C', iii: 'D' },
  { min: 26, max: 50, s1: 'A', s2: 'B', s3: 'B', s4: 'C', i: 'C', ii: 'D', iii: 'E' },
  { min: 51, max: 90, s1: 'B', s2: 'B', s3: 'C', s4: 'C', i: 'C', ii: 'E', iii: 'F' },
  { min: 91, max: 150, s1: 'B', s2: 'B', s3: 'C', s4: 'D', i: 'D', ii: 'F', iii: 'G' },
  { min: 151, max: 280, s1: 'B', s2: 'C', s3: 'D', s4: 'E', i: 'E', ii: 'G', iii: 'H' },
  { min: 281, max: 500, s1: 'B', s2: 'C', s3: 'D', s4: 'E', i: 'F', ii: 'H', iii: 'J' },
  { min: 501, max: 1200, s1: 'C', s2: 'C', s3: 'E', s4: 'F', i: 'G', ii: 'J', iii: 'K' },
  { min: 1201, max: 3200, s1: 'C', s2: 'D', s3: 'E', s4: 'G', i: 'H', ii: 'K', iii: 'L' },
  { min: 3201, max: 10000, s1: 'C', s2: 'D', s3: 'F', s4: 'G', i: 'J', ii: 'L', iii: 'M' },
  { min: 10001, max: 35000, s1: 'C', s2: 'D', s3: 'F', s4: 'H', i: 'K', ii: 'M', iii: 'N' },
  { min: 35001, max: 150000, s1: 'D', s2: 'E', s3: 'G', s4: 'J', i: 'L', ii: 'N', iii: 'P' },
  { min: 150001, max: 500000, s1: 'D', s2: 'E', s3: 'G', s4: 'J', i: 'M', ii: 'P', iii: 'Q' },
  { min: 500001, max: Infinity, s1: 'D', s2: 'E', s3: 'H', s4: 'K', i: 'N', ii: 'Q', iii: 'R' },
];

const sampleSizeTable = {
  A: 2, B: 3, C: 5, D: 8, E: 13, F: 20, G: 32, H: 50, 
  J: 80, K: 125, L: 200, M: 315, N: 500, P: 800, Q: 1250, R: 2000
};

// Simplified AQL Tables for Ac/Re limits
const aqlLimits_1_0 = {
  A: [0, 1], B: [0, 1], C: [0, 1], D: [0, 1], E: [0, 1], F: [0, 1], 
  G: [1, 2], H: [1, 2], J: [2, 3], K: [3, 4], L: [5, 6], M: [7, 8], 
  N: [10, 11], P: [14, 15], Q: [21, 22], R: [21, 22]
};

const aqlLimits_1_5 = {
  A: [0, 1], B: [0, 1], C: [0, 1], D: [0, 1], E: [0, 1], F: [1, 2], 
  G: [1, 2], H: [2, 3], J: [3, 4], K: [5, 6], L: [7, 8], M: [10, 11], 
  N: [14, 15], P: [21, 22], Q: [21, 22], R: [21, 22]
};

const aqlLimits_2_5 = {
  A: [0, 1], B: [0, 1], C: [0, 1], D: [0, 1], E: [1, 2], F: [1, 2], 
  G: [2, 3], H: [3, 4], J: [5, 6], K: [7, 8], L: [10, 11], M: [14, 15], 
  N: [21, 22], P: [21, 22], Q: [21, 22], R: [21, 22] 
};

const aqlLimits_4_0 = {
  A: [0, 1], B: [0, 1], C: [0, 1], D: [1, 2], E: [1, 2], F: [2, 3], 
  G: [3, 4], H: [5, 6], J: [7, 8], K: [10, 11], L: [14, 15], M: [21, 22], 
  N: [21, 22], P: [21, 22], Q: [21, 22], R: [21, 22]
};

const aqlLimits_6_5 = {
  A: [0, 1], B: [1, 2], C: [1, 2], D: [1, 2], E: [2, 3], F: [3, 4], 
  G: [5, 6], H: [7, 8], J: [10, 11], K: [14, 15], L: [21, 22], M: [21, 22], 
  N: [21, 22], P: [21, 22], Q: [21, 22], R: [21, 22]
};

const limitsMap = {
  '1.0': aqlLimits_1_0,
  '1.5': aqlLimits_1_5,
  '2.5': aqlLimits_2_5,
  '4.0': aqlLimits_4_0,
  '6.5': aqlLimits_6_5,
};

/**
 * Calculate AQL Sample Size, Code Letter, and Limits
 * @param {number} lotSize - Total quantity
 * @param {string} level - 'i', 'ii', 'iii'
 * @param {string} aqlMajor - '1.5', '2.5', '4.0'
 * @param {string} aqlMinor - '2.5', '4.0', '6.5'
 */
export const calculateAQL = (lotSize, level = 'ii', aqlMajor = '2.5', aqlMinor = '4.0') => {
  const size = parseInt(lotSize) || 0;
  
  if (size < 2) {
    return {
      codeLetter: 'A',
      sampleSize: size,
      majorLimits: { ac: 0, re: 1 },
      minorLimits: { ac: 0, re: 1 },
    };
  }

  const normalizedLevel = level.toLowerCase();
  const range = codeLetterTable.find(r => size >= r.min && size <= r.max);
  const letter = range ? (range[normalizedLevel] || 'A') : 'A';

  const sampleSize = sampleSizeTable[letter] || size;
  const actualSampleSize = Math.min(sampleSize, size);

  const majorTable = limitsMap[aqlMajor] || aqlLimits_2_5;
  const minorTable = limitsMap[aqlMinor] || aqlLimits_4_0;

  const [majorAc, majorRe] = majorTable[letter] || [0, 1];
  const [minorAc, minorRe] = minorTable[letter] || [0, 1];

  return {
    codeLetter: letter,
    sampleSize: actualSampleSize,
    majorLimits: { ac: majorAc, re: majorRe },
    minorLimits: { ac: minorAc, re: minorRe },
  };
};
