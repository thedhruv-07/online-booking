import { codeLetterTable } from './codeLetterTable';
import { samplingPlanTable } from './samplingPlanTable';

export const getAQLResult = ({ lotSize, level, majorAQL, minorAQL }) => {
  const size = Number(lotSize) || 0;
  
  if (size === 0) return { codeLetter: '-', sampleSize: 0, major: 0, minor: 0 };

  // 1. Find Code Letter
  const sizeRange = codeLetterTable.find(
    (range) => size >= range.min && size <= range.max
  );

  if (!sizeRange) return { codeLetter: '-', sampleSize: 0, major: 0, minor: 0 };

  const codeLetter = sizeRange[level];
  if (!codeLetter) return { codeLetter: '-', sampleSize: 0, major: 0, minor: 0 };

  // 2. Find Sample Size and limits
  const plan = samplingPlanTable[codeLetter];
  
  if (!plan) return { codeLetter, sampleSize: 0, major: 0, minor: 0 };

  // Extract limits based on major/minor AQL string
  const majorData = plan.aql?.[majorAQL];
  const minorData = plan.aql?.[minorAQL];
  
  const majorLimit = majorData ? majorData.accept : 0;
  const minorLimit = minorData ? minorData.accept : 0;

  return {
    codeLetter,
    sampleSize: plan.sampleSize,
    major: majorLimit,
    minor: minorLimit,
  };
};
