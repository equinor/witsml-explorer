import { LogCurveInfoRow } from "components/ContentViews/LogCurveInfoListView";
import CurveThreshold, {
  DEFAULT_CURVE_THRESHOLD
} from "contexts/curveThreshold";
import { NavigationAction } from "contexts/navigationAction";
import BhaRun from "models/bhaRun";
import LogObject from "models/logObject";
import MessageObject from "models/messageObject";
import ObjectOnWellbore from "models/objectOnWellbore";
import { ObjectType } from "models/objectType";
import Rig from "models/rig";
import RiskObject from "models/riskObject";
import { Server } from "models/server";
import Trajectory from "models/trajectory";
import WbGeometryObject from "models/wbGeometry";
import Well from "models/well";
import Wellbore from "models/wellbore";
import { createContext } from "react";

interface NavigationContextProps {
  navigationState: NavigationState;
  dispatchNavigation: (action: NavigationAction) => void;
}

const NavigationContext = createContext<NavigationContextProps>(
  {} as NavigationContextProps
);

export type Selectable =
  | Server
  | Well
  | Wellbore
  | string
  | BhaRun
  | LogObject
  | LogCurveInfoRow[]
  | Trajectory
  | MessageObject
  | RiskObject
  | Rig
  | WbGeometryObject;

export enum ViewFlags {
  Jobs = "jobs",
  Query = "query",
  ServerManager = "serverManager",
  ObjectSearchView = "objectSearchView"
}

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
  selectedCurveThreshold: DEFAULT_CURVE_THRESHOLD,
  expandedTreeNodes: [],
  currentProperties: new Map<string, string>()
};

export default NavigationContext;
