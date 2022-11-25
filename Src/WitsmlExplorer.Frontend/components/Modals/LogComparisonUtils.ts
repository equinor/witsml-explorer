import LogCurveInfo from "../../models/logCurveInfo";

export interface Indexes {
  mnemonic: string;
  sourceStart: string | number;
  targetStart: string | number;
  sourceEnd: string | number;
  targetEnd: string | number;
}

function logCurveInfoToIndexes(sourceLogCurveInfo?: LogCurveInfo, targetLogCurveInfo?: LogCurveInfo): Indexes {
  return {
    mnemonic: sourceLogCurveInfo ? sourceLogCurveInfo.mnemonic : targetLogCurveInfo.mnemonic,
    sourceStart: getStartIndex(sourceLogCurveInfo),
    targetStart: getStartIndex(targetLogCurveInfo),
    sourceEnd: getEndIndex(sourceLogCurveInfo),
    targetEnd: getEndIndex(targetLogCurveInfo)
  };
}

function getStartIndex(logCurveInfo?: LogCurveInfo): string | number {
  if (!logCurveInfo) {
    return "-";
  }
  if (logCurveInfo.minDepthIndex != null) {
    return logCurveInfo.minDepthIndex;
  }
  if (logCurveInfo.minDateTimeIndex != null) {
    return logCurveInfo.minDateTimeIndex;
  }
  return "undefined";
}

function getEndIndex(logCurveInfo?: LogCurveInfo): string | number {
  if (!logCurveInfo) {
    return "-";
  }
  if (logCurveInfo.maxDepthIndex != null) {
    return logCurveInfo.maxDepthIndex;
  }
  if (logCurveInfo.maxDateTimeIndex != null) {
    return logCurveInfo.maxDateTimeIndex;
  }
  return "undefined";
}

function areMismatched(sourceLogCurveInfo: LogCurveInfo, targetLogCurveInfo: LogCurveInfo): boolean {
  return (
    sourceLogCurveInfo.minDateTimeIndex != targetLogCurveInfo.minDateTimeIndex ||
    sourceLogCurveInfo.maxDateTimeIndex != targetLogCurveInfo.maxDateTimeIndex ||
    sourceLogCurveInfo.minDepthIndex != targetLogCurveInfo.minDepthIndex ||
    sourceLogCurveInfo.maxDepthIndex != targetLogCurveInfo.maxDepthIndex
  );
}

export function calculateMismatchedIndexes(sourceLogCurveInfo: LogCurveInfo[], targetLogCurveInfo: LogCurveInfo[]): Indexes[] {
  const mismatchedIndexes = [];

  for (const sourceCurve of sourceLogCurveInfo) {
    const targetCurve = targetLogCurveInfo.find((targetCurve) => targetCurve.mnemonic == sourceCurve.mnemonic);
    if (!targetCurve || areMismatched(sourceCurve, targetCurve)) {
      mismatchedIndexes.push(logCurveInfoToIndexes(sourceCurve, targetCurve));
    }
  }
  for (const targetCurve of targetLogCurveInfo) {
    const sourceCurve = sourceLogCurveInfo.find((sourceCurve) => sourceCurve.mnemonic == targetCurve.mnemonic);
    if (!sourceCurve) {
      mismatchedIndexes.push(logCurveInfoToIndexes(sourceCurve, targetCurve));
    }
  }
  return mismatchedIndexes;
}
