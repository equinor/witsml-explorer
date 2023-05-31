import { createContext } from "react";
import { LogCurveInfoRow } from "../components/ContentViews/LogCurveInfoListView";
import BhaRun from "../models/bhaRun";
import LogObject from "../models/logObject";
import MessageObject from "../models/messageObject";
import ObjectOnWellbore from "../models/objectOnWellbore";
import { ObjectType } from "../models/objectType";
import Rig from "../models/rig";
import RiskObject from "../models/riskObject";
import { Server } from "../models/server";
import Trajectory from "../models/trajectory";
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
  selectedLogTypeGroup: string;
  selectedObjectGroup: ObjectType;
  selectedObject: ObjectOnWellbore;
  selectedLogCurveInfo: LogCurveInfoRow[];
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
  selectedLogTypeGroup: null,
  selectedObjectGroup: null,
  selectedObject: null,
  selectedLogCurveInfo: null,
  currentSelected: null,
  currentProperties: new Map()
};

export const EMPTY_NAVIGATION_STATE: NavigationState = {
  selectedServer: null,
  selectedWell: null,
  selectedWellbore: null,
  selectedLogTypeGroup: null,
  selectedObjectGroup: null,
  selectedObject: null,
  selectedLogCurveInfo: null,
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
