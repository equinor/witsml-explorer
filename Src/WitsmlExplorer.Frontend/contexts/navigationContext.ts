import { createContext } from "react";
import { LogCurveInfoRow } from "../components/ContentViews/LogCurveInfoListView";
import BhaRun from "../models/bhaRun";
import LogObject from "../models/logObject";
import MessageObject from "../models/messageObject";
import Rig from "../models/rig";
import RiskObject from "../models/riskObject";
import { Server } from "../models/server";
import Trajectory from "../models/trajectory";
import Tubular from "../models/tubular";
import WbGeometryObject from "../models/wbGeometry";
import Well from "../models/well";
import Wellbore from "../models/wellbore";
import CurveThreshold, { DEFAULT_CURVE_THRESHOLD } from "./curveThreshold";
import Filter, { EMPTY_FILTER } from "./filter";
import { NavigationAction } from "./navigationAction";

interface NavigationContextProps {
  navigationState: NavigationState;
  dispatchNavigation: (action: NavigationAction) => void;
}

const NavigationContext = createContext<NavigationContextProps>({} as NavigationContextProps);

export type Selectable = Server | Well | Wellbore | string | BhaRun | LogObject | LogCurveInfoRow[] | Trajectory | MessageObject | RiskObject | Rig | WbGeometryObject;

export const selectedJobsFlag = "jobs";
export const selectedServerManagerFlag = "serverManager";

export interface NavigationState {
  selectedServer: Server;
  selectedWell: Well;
  selectedWellbore: Wellbore;
  selectedBhaRunGroup: string;
  selectedLogGroup: string;
  selectedLogTypeGroup: string;
  selectedLog: LogObject;
  selectedMessageGroup: string;
  selectedMudlogGroup: string;
  selectedRig: Rig;
  selectedRigGroup: string;
  selectedRisk: RiskObject;
  selectedRiskGroup: string;
  selectedLogCurveInfo: LogCurveInfoRow[];
  selectedTrajectoryGroup: string;
  selectedTrajectory: Trajectory;
  selectedTubularGroup: string;
  selectedTubular: Tubular;
  selectedWbGeometryGroup: string;
  selectedWbGeometry: WbGeometryObject;
  servers: Server[];
  currentSelected: Selectable;
  wells: Well[];
  filteredWells: Well[];
  selectedFilter: Filter;
  selectedCurveThreshold: CurveThreshold;
  expandedTreeNodes: string[];
  currentProperties: Map<string, string>;
}

export const allDeselected: any = {
  selectedServer: null,
  selectedWell: null,
  selectedWellbore: null,
  selectedBhaRunGroup: null,
  selectedLogGroup: null,
  selectedLogTypeGroup: null,
  selectedLog: null,
  selectedMessageGroup: null,
  selectedMudlogGroup: null,
  selectedRiskGroup: null,
  selectedRisk: null,
  selectedLogCurveInfo: null,
  selectedRig: null,
  selectedRigGroup: null,
  selectedTrajectoryGroup: null,
  selectedTrajectory: null,
  selectedTubularGroup: null,
  selectedTubular: null,
  selectedWbGeometryGroup: null,
  selectedWbGeometry: null,
  currentSelected: null,
  currentProperties: new Map()
};

export const EMPTY_NAVIGATION_STATE: NavigationState = {
  selectedServer: null,
  selectedWell: null,
  selectedWellbore: null,
  selectedBhaRunGroup: null,
  selectedLogGroup: null,
  selectedLogTypeGroup: null,
  selectedLog: null,
  selectedMessageGroup: null,
  selectedMudlogGroup: null,
  selectedRig: null,
  selectedRigGroup: null,
  selectedRiskGroup: null,
  selectedRisk: null,
  selectedLogCurveInfo: null,
  selectedTrajectoryGroup: null,
  selectedTrajectory: null,
  selectedTubularGroup: null,
  selectedTubular: null,
  selectedWbGeometryGroup: null,
  selectedWbGeometry: null,
  servers: [],
  currentSelected: null,
  wells: [],
  filteredWells: [],
  selectedFilter: EMPTY_FILTER,
  selectedCurveThreshold: DEFAULT_CURVE_THRESHOLD,
  expandedTreeNodes: [],
  currentProperties: new Map<string, string>()
};

export default NavigationContext;
