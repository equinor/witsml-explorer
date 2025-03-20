import { ExportableContentTableColumn } from "components/ContentViews/table";
import { CurveSpecification } from "models/logData";
import { CurveRanges } from "./CurveValuesPlot";

const calculateMean = (arr: number[]): number =>
  arr.reduce((a, b) => a + b, 0) / arr.length;

const calculateStdDev = (arr: number[], mean: number): number => {
  const variance =
    arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
  return Math.sqrt(variance);
};

const calculateZScore = (value: number, mean: number, stdDev: number): number =>
  (value - mean) / stdDev;

interface ZScoreThreshold {
  global: number;
  local: number;
  windowSize: number;
}

export enum ThresholdLevel {
  Low = "low",
  Medium = "medium",
  High = "high"
}

const zScoreThresholds: Record<ThresholdLevel, ZScoreThreshold> = {
  [ThresholdLevel.Low]: {
    global: 2,
    local: 2.5,
    windowSize: 12
  },
  [ThresholdLevel.Medium]: {
    global: 1.5,
    local: 1.5,
    windowSize: 20
  },
  [ThresholdLevel.High]: {
    global: 0.7,
    local: 0.5,
    windowSize: 28
  }
};

/**
 * Removes outliers from the provided data based on Z-score thresholds applied globally and locally within a moving window.
 *
 * @param {any[]} data - The dataset to process, where each element is an object containing various numeric properties.
 * @param {ExportableContentTableColumn<CurveSpecification>[]} columns - The columns specification, where the first column represents the index curve.
 * @param {ZScoreThreshold} zScoreThreshold - An object containing `global` and `local` thresholds and 'windowSize' size for Z-score calculations.
 *   - `global`: The Z-score threshold to identify potential outliers globally across the entire dataset.
 *   - `local`: The Z-score threshold to identify outliers within the moving window.
 *   - `windowSize`: The size of the moving window.
 * @returns {any[]} The transformed dataset with outliers removed.
 */
export const removeCurveDataOutliers = (
  data: any[],
  columns: ExportableContentTableColumn<CurveSpecification>[],
  thresholdLevel: ThresholdLevel
): any[] => {
  const transformedData = data.map((dataRow) => ({ ...dataRow }));
  const indexCurve = columns[0].columnOf.mnemonic;
  const zScoreThreshold = zScoreThresholds[thresholdLevel];

  columns
    .filter((col) => col.columnOf.mnemonic !== indexCurve)
    .forEach((col) => {
      const mnemonic = col.columnOf.mnemonic;
      const originalIndices = data
        .map((dataRow, index) => ({ value: dataRow[mnemonic], index }))
        .filter(
          (dataRow) => dataRow.value !== undefined && dataRow.value !== null
        );
      const columnData = originalIndices.map((dataRow) => dataRow.value);
      const mean = calculateMean(columnData);
      const stdDev = calculateStdDev(columnData, mean);
      if (stdDev) {
        for (let i = 0; i < columnData.length; i++) {
          const originalIndex = originalIndices[i].index;
          const zScoreValue = calculateZScore(columnData[i], mean, stdDev);
          if (Math.abs(zScoreValue) > zScoreThreshold.global) {
            const start = Math.max(
              0,
              i - Math.floor(zScoreThreshold.windowSize / 2)
            );
            const end = Math.min(
              columnData.length,
              i + Math.ceil(zScoreThreshold.windowSize / 2)
            );
            const window = columnData.slice(start, end);
            const windowMean = calculateMean(window);
            const windowStdDev = calculateStdDev(window, windowMean);
            if (windowStdDev) {
              const windowZScoreValue = calculateZScore(
                columnData[i],
                windowMean,
                windowStdDev
              );
              if (Math.abs(windowZScoreValue) > zScoreThreshold.local) {
                delete transformedData[originalIndex][mnemonic];
              }
            }
          }
        }
      }
    });

  return transformedData;
};

export const transformCurveData = (
  data: any[],
  columns: ExportableContentTableColumn<CurveSpecification>[],
  thresholdLevel: ThresholdLevel,
  removeOutliers: boolean,
  customRanges: CurveRanges,
  applyCustomRanges: boolean
) => {
  let transformedData = data;

  if (removeOutliers) {
    transformedData = removeCurveDataOutliers(data, columns, thresholdLevel);
  }

  if (applyCustomRanges) {
    transformedData = removeDataOutOfRange(transformedData, customRanges);
  }

  // Other potential transformations should be added here.

  return transformedData;
};

const removeDataOutOfRange = (data: any[], customRanges: CurveRanges) => {
  const dataWithRange = data.map((dataRow) => ({ ...dataRow }));
  Object.entries(customRanges).forEach(([curve, range]) => {
    for (let i = 0; i < dataWithRange.length; i++) {
      if (
        dataWithRange[i][curve] < range.minValue ||
        dataWithRange[i][curve] > range.maxValue
      ) {
        delete dataWithRange[i][curve];
      }
    }
  });
  return dataWithRange;
};
