import LogCurveInfo from "models/logCurveInfo";

export interface Indexes {
  mnemonic: string;
  sourceStart: string | number;
  targetStart: string | number;
  sourceEnd: string | number;
  targetEnd: string | number;
  sourceUnit: string;
  targetUnit: string;
}

export const missingIndex = "-";

function logCurveInfoToIndexes(
  sourceLogCurveInfo?: LogCurveInfo,
  targetLogCurveInfo?: LogCurveInfo
): Indexes {
  return {
    mnemonic: sourceLogCurveInfo
      ? sourceLogCurveInfo.mnemonic
      : targetLogCurveInfo.mnemonic,
    sourceStart: getStartIndex(sourceLogCurveInfo),
    targetStart: getStartIndex(targetLogCurveInfo),
    sourceEnd: getEndIndex(sourceLogCurveInfo),
    targetEnd: getEndIndex(targetLogCurveInfo),
    sourceUnit: sourceLogCurveInfo?.unit,
    targetUnit: targetLogCurveInfo?.unit
  };
}

function getStartIndex(logCurveInfo?: LogCurveInfo): string | number {
  if (!logCurveInfo) {
    return missingIndex;
  }
  if (logCurveInfo.minDepthIndex != null) {
    return logCurveInfo.minDepthIndex;
  }
  if (logCurveInfo.minDateTimeIndex != null) {
    return logCurveInfo.minDateTimeIndex;
  }
  return missingIndex;
}

function getEndIndex(logCurveInfo?: LogCurveInfo): string | number {
  if (!logCurveInfo) {
    return missingIndex;
  }
  if (logCurveInfo.maxDepthIndex != null) {
    return logCurveInfo.maxDepthIndex;
  }
  if (logCurveInfo.maxDateTimeIndex != null) {
    return logCurveInfo.maxDateTimeIndex;
  }
  return missingIndex;
}

function areMismatched(
  sourceLogCurveInfo: LogCurveInfo,
  targetLogCurveInfo: LogCurveInfo
): boolean {
  return (
    sourceLogCurveInfo.minDateTimeIndex !=
      targetLogCurveInfo.minDateTimeIndex ||
    sourceLogCurveInfo.maxDateTimeIndex !=
      targetLogCurveInfo.maxDateTimeIndex ||
    sourceLogCurveInfo.minDepthIndex != targetLogCurveInfo.minDepthIndex ||
    sourceLogCurveInfo.maxDepthIndex != targetLogCurveInfo.maxDepthIndex ||
    sourceLogCurveInfo.unit != targetLogCurveInfo.unit
  );
}

export function calculateMismatchedIndexes(
  sourceLogCurveInfo: LogCurveInfo[],
  targetLogCurveInfo: LogCurveInfo[]
): Indexes[] {
  const mismatchedIndexes = [];

  for (const sourceCurve of sourceLogCurveInfo) {
    const targetCurve = targetLogCurveInfo.find(
      (targetCurve) => targetCurve.mnemonic == sourceCurve.mnemonic
    );
    if (!targetCurve || areMismatched(sourceCurve, targetCurve)) {
      mismatchedIndexes.push(logCurveInfoToIndexes(sourceCurve, targetCurve));
    }
  }
  for (const targetCurve of targetLogCurveInfo) {
    const sourceCurve = sourceLogCurveInfo.find(
      (sourceCurve) => sourceCurve.mnemonic == targetCurve.mnemonic
    );
    if (!sourceCurve) {
      mismatchedIndexes.push(logCurveInfoToIndexes(sourceCurve, targetCurve));
    }
  }
  return mismatchedIndexes;
}

const toFixed = (value: string | number): string => {
  const number = Number(value);
  if (Number.isNaN(number)) {
    return missingIndex;
  }
  return number.toFixed(4);
};

export function markNumberDifferences(
  string1: string | number,
  string2: string | number
): (string | JSX.Element)[][] {
  string1 = toFixed(string1);
  string2 = toFixed(string2);
  if (string1 == missingIndex || string2 == missingIndex) {
    return [[<mark key="1">{string1}</mark>], [<mark key="2">{string2}</mark>]];
  }
  if (string1.length > string2.length) {
    string2 = " ".repeat(string1.length - string2.length) + string2;
  } else if (string2.length > string1.length) {
    string1 = " ".repeat(string2.length - string1.length) + string1;
  }

  let firstDifference = -1;
  for (let i = 0; i < string1.length; i++) {
    const char1 = string1.charAt(i);
    const char2 = string2.charAt(i);
    if (char1 !== char2) {
      firstDifference = i;
      break;
    }
  }
  if (firstDifference === -1) {
    return [[string1], [string2]];
  }
  return [
    [
      string1.slice(0, firstDifference),
      <mark key="mark">{string1.slice(firstDifference)}</mark>
    ],
    [
      string2.slice(0, firstDifference),
      <mark key="mark">{string2.slice(firstDifference)}</mark>
    ]
  ];
}

export function markDateTimeStringDifferences(
  string1: string,
  string2: string
): (string | JSX.Element)[][] {
  if (string1 == missingIndex || string2 == missingIndex) {
    return [[<mark key="1">{string1}</mark>], [<mark key="2">{string2}</mark>]];
  }
  const parts1 = splitDateTimeString(string1);
  const parts2 = splitDateTimeString(string2);
  const result1 = [];
  const result2 = [];
  for (let i = 0; i < Math.min(parts1.length, parts2.length); i++) {
    if (parts1[i] != parts2[i]) {
      result1.push(<mark key={i}>{parts1[i]}</mark>);
      result2.push(<mark key={i}>{parts2[i]}</mark>);
    } else {
      result1.push(parts1[i]);
      result2.push(parts2[i]);
    }
  }
  return [result1, result2];
}

function splitDateTimeString(dateTime: string) {
  //split an ISO 8601 string into groups that should be marked together
  //the regex includes separators in the result to simplify putting the string back together
  return dateTime.split(/(?=[:T.\-Z])|(?<=[:T.\-Z])/g);
}
