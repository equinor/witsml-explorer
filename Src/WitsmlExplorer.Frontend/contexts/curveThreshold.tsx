interface CurveThreshold {
  depthInMeters: number;
  timeInMinutes: number;
}

export const timeFromMinutesToMilliseconds = (timeInMinutes: number): number => {
  return timeInMinutes * 60 * 1000;
};

export const DEFAULT_CURVE_THRESHOLD: CurveThreshold = {
  depthInMeters: 50,
  timeInMinutes: 60
};

export default CurveThreshold;
