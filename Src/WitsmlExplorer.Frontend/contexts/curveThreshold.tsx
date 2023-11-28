interface CurveThreshold {
  depthInMeters: number;
  timeInMinutes: number;
  hideInactiveCurves: boolean;
}

export const timeFromMinutesToMilliseconds = (
  timeInMinutes: number
): number => {
  return timeInMinutes * 60 * 1000;
};

export const DEFAULT_CURVE_THRESHOLD: CurveThreshold = {
  depthInMeters: 50,
  timeInMinutes: 60,
  hideInactiveCurves: false
};

export default CurveThreshold;
