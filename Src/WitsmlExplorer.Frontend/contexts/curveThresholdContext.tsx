import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useState
} from "react";
import {
  STORAGE_FILTER_INACTIVE_TIME_CURVES_KEY,
  STORAGE_FILTER_INACTIVE_TIME_CURVES_VALUE_KEY,
  getLocalStorageItem
} from "tools/localStorageHelpers";

export interface CurveThreshold {
  depthInMeters: number;
  timeInMinutes: number;
  hideInactiveCurves: boolean;
}

const DEFAULT_CURVE_THRESHOLD: CurveThreshold = {
  depthInMeters: 50,
  timeInMinutes: 60,
  hideInactiveCurves: false
};

interface CurveThresholdContextType {
  curveThreshold: CurveThreshold;
  setCurveThreshold: Dispatch<SetStateAction<CurveThreshold>>;
}

const CurveThresholdContext = createContext<CurveThresholdContextType>(null);

interface CurveThresholdProviderProps {
  children: ReactNode;
}

export function CurveThresholdProvider({
  children
}: CurveThresholdProviderProps) {
  const [curveThreshold, setCurveThreshold] = useState({
    ...DEFAULT_CURVE_THRESHOLD,
    ...getLocalStorageThreshold()
  });

  return (
    <CurveThresholdContext.Provider
      value={{ curveThreshold, setCurveThreshold }}
    >
      {children}
    </CurveThresholdContext.Provider>
  );
}

export function useCurveThreshold() {
  const context = useContext(CurveThresholdContext);
  if (!context)
    throw new Error(
      `useCurveThreshold() has to be used within <CurveThresholdProvider>`
    );
  return context;
}

export const timeFromMinutesToMilliseconds = (
  timeInMinutes: number
): number => {
  return timeInMinutes * 60 * 1000;
};

const getLocalStorageThreshold = (): Partial<CurveThreshold> => {
  const localStorageThreshold: Partial<CurveThreshold> = {};

  const hideInactiveCurves = getLocalStorageItem<boolean>(
    STORAGE_FILTER_INACTIVE_TIME_CURVES_KEY
  );
  if (hideInactiveCurves !== null) {
    localStorageThreshold["hideInactiveCurves"] = hideInactiveCurves;
  }

  const timeInMinutes = getLocalStorageItem<number>(
    STORAGE_FILTER_INACTIVE_TIME_CURVES_VALUE_KEY
  );
  if (timeInMinutes !== null) {
    localStorageThreshold["timeInMinutes"] = timeInMinutes;
  }

  return localStorageThreshold;
};
