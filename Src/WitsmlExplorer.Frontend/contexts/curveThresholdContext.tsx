import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useState
} from "react";

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
  const [curveThreshold, setCurveThreshold] = useState(DEFAULT_CURVE_THRESHOLD);

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
