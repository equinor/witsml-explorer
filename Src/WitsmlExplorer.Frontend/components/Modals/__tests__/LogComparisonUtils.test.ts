import LogCurveInfo from "../../../models/logCurveInfo";
import { calculateMismatchedIndexes } from "../LogComparisonUtils";

const irrelevantProperties = {
  uid: "",
  classWitsml: "",
  unit: "",
  mnemAlias: "",
  sensorOffset: {
    value: 0,
    uom: ""
  }
};

const mnemonic = "mnemonic";
const matchingMinDateTimeIndex = "minDateTimeIndex";
const matchingMaxDateTimeIndex = "maxDateTimeIndex";
const mismatchedDateTime = "mismatch";
const matchingMinDepthIndex = 1;
const matchingMaxDepthIndex = 2;
const mismatchedDepth = 1.5;

const matchingDateTimes: LogCurveInfo = {
  mnemonic,
  minDateTimeIndex: matchingMinDateTimeIndex,
  maxDateTimeIndex: matchingMaxDateTimeIndex,
  ...irrelevantProperties
};

const matchingDepths: LogCurveInfo = {
  mnemonic,
  minDepthIndex: matchingMinDepthIndex,
  maxDepthIndex: matchingMaxDepthIndex,
  ...irrelevantProperties
};

it("Should detect mismatched maxDateTimeIndex", () => {
  const source: LogCurveInfo[] = [
    {
      ...matchingDateTimes
    }
  ];
  const target: LogCurveInfo[] = [
    {
      ...matchingDateTimes,
      maxDateTimeIndex: mismatchedDateTime
    }
  ];
  const result = calculateMismatchedIndexes(source, target);
  expect(result[0].mnemonic).toEqual(mnemonic);
  expect(result[0].sourceStart).toEqual(matchingMinDateTimeIndex);
  expect(result[0].sourceEnd).toEqual(matchingMaxDateTimeIndex);
  expect(result[0].targetStart).toEqual(matchingMinDateTimeIndex);
  expect(result[0].targetEnd).toEqual(mismatchedDateTime);
});

it("Should detect mismatched minDateTimeIndex", () => {
  const source: LogCurveInfo[] = [
    {
      ...matchingDateTimes
    }
  ];
  const target: LogCurveInfo[] = [
    {
      ...matchingDateTimes,
      minDateTimeIndex: mismatchedDateTime
    }
  ];
  const result = calculateMismatchedIndexes(source, target);
  expect(result[0].mnemonic).toEqual(mnemonic);
  expect(result[0].sourceStart).toEqual(matchingMinDateTimeIndex);
  expect(result[0].sourceEnd).toEqual(matchingMaxDateTimeIndex);
  expect(result[0].targetStart).toEqual(mismatchedDateTime);
  expect(result[0].targetEnd).toEqual(matchingMaxDateTimeIndex);
});

it("Should detect missing maxDateTimeIndex in target", () => {
  const source: LogCurveInfo[] = [
    {
      ...matchingDateTimes
    }
  ];
  const target: LogCurveInfo[] = [
    {
      ...matchingDateTimes,
      maxDateTimeIndex: null
    }
  ];
  const result = calculateMismatchedIndexes(source, target);
  expect(result[0].mnemonic).toEqual(mnemonic);
  expect(result[0].sourceStart).toEqual(matchingMinDateTimeIndex);
  expect(result[0].sourceEnd).toEqual(matchingMaxDateTimeIndex);
  expect(result[0].targetStart).toEqual(matchingMinDateTimeIndex);
});

it("Should detect missing minDateTimeIndex in target", () => {
  const source: LogCurveInfo[] = [
    {
      ...matchingDateTimes
    }
  ];
  const target: LogCurveInfo[] = [
    {
      ...matchingDateTimes,
      minDateTimeIndex: null
    }
  ];
  const result = calculateMismatchedIndexes(source, target);
  expect(result[0].mnemonic).toEqual(mnemonic);
  expect(result[0].sourceStart).toEqual(matchingMinDateTimeIndex);
  expect(result[0].sourceEnd).toEqual(matchingMaxDateTimeIndex);
  expect(result[0].targetEnd).toEqual(matchingMaxDateTimeIndex);
});

it("Should detect missing target mnemonic", () => {
  const source: LogCurveInfo[] = [
    {
      ...matchingDateTimes
    }
  ];
  const target: LogCurveInfo[] = [];
  const result = calculateMismatchedIndexes(source, target);
  expect(result[0].mnemonic).toEqual(mnemonic);
  expect(result[0].sourceStart).toEqual(matchingMinDateTimeIndex);
  expect(result[0].sourceEnd).toEqual(matchingMaxDateTimeIndex);
});

it("Should detect missing source mnemonic", () => {
  const source: LogCurveInfo[] = [];
  const target: LogCurveInfo[] = [
    {
      ...matchingDateTimes,
      minDateTimeIndex: mismatchedDateTime
    }
  ];
  const result = calculateMismatchedIndexes(source, target);
  expect(result[0].mnemonic).toEqual(mnemonic);
  expect(result[0].targetStart).toEqual(mismatchedDateTime);
  expect(result[0].targetEnd).toEqual(matchingMaxDateTimeIndex);
});

it("Should detect mismatched maxDepthIndex", () => {
  const source: LogCurveInfo[] = [
    {
      ...matchingDepths
    }
  ];
  const target: LogCurveInfo[] = [
    {
      ...matchingDepths,
      maxDepthIndex: mismatchedDepth
    }
  ];
  const result = calculateMismatchedIndexes(source, target);
  expect(result[0].mnemonic).toEqual(mnemonic);
  expect(result[0].sourceStart).toEqual(matchingMinDepthIndex);
  expect(result[0].sourceEnd).toEqual(matchingMaxDepthIndex);
  expect(result[0].targetStart).toEqual(matchingMinDepthIndex);
  expect(result[0].targetEnd).toEqual(mismatchedDepth);
});

it("Should detect mismatched minDepthIndex", () => {
  const source: LogCurveInfo[] = [
    {
      ...matchingDepths
    }
  ];
  const target: LogCurveInfo[] = [
    {
      ...matchingDepths,
      minDepthIndex: mismatchedDepth
    }
  ];
  const result = calculateMismatchedIndexes(source, target);
  expect(result[0].mnemonic).toEqual(mnemonic);
  expect(result[0].sourceStart).toEqual(matchingMinDepthIndex);
  expect(result[0].sourceEnd).toEqual(matchingMaxDepthIndex);
  expect(result[0].targetStart).toEqual(mismatchedDepth);
  expect(result[0].targetEnd).toEqual(matchingMaxDepthIndex);
});

it("Should disregard matching dateTime indexes", () => {
  const source: LogCurveInfo[] = [
    {
      ...matchingDateTimes
    }
  ];
  const target: LogCurveInfo[] = [
    {
      ...matchingDateTimes
    }
  ];
  const result = calculateMismatchedIndexes(source, target);
  expect(result).toEqual([]);
});

it("Should disregard matching depth indexes", () => {
  const source: LogCurveInfo[] = [
    {
      ...matchingDepths
    }
  ];
  const target: LogCurveInfo[] = [
    {
      ...matchingDepths
    }
  ];
  const result = calculateMismatchedIndexes(source, target);
  expect(result).toEqual([]);
});
