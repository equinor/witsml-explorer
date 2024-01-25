import CurveThreshold from "contexts/curveThreshold";
import NavigationType from "contexts/navigationType";
import ObjectOnWellbore from "models/objectOnWellbore";
import { ObjectType } from "models/objectType";
import { Server } from "models/server";
import Well from "models/well";
import Wellbore from "models/wellbore";

export interface Action {
  type: any;
  payload: any;
}

export interface SelectServerAction extends Action {
  type: NavigationType.SelectServer;
  payload: { server: Server };
}

export interface ToggleTreeNodeAction extends Action {
  type: NavigationType.ToggleTreeNode;
  payload: { nodeId: string };
}

export interface CollapseTreeNodeChildrenAction extends Action {
  type: NavigationType.CollapseTreeNodeChildren;
  payload: { nodeId: string };
}

export interface ExpandTreeNodesAction extends Action {
  type: NavigationType.ExpandTreeNodes;
  payload: { nodeIds: string[] };
}

export interface SelectWellAction extends Action {
  type: NavigationType.SelectWell;
  payload: { well: Well };
}

export interface SelectWellboreAction extends Action {
  type: NavigationType.SelectWellbore;
  payload: {
    well: Well;
    wellbore: Wellbore;
  };
}

export interface SelectJobsAction extends Action {
  type: NavigationType.SelectJobs;
}

export interface SelectQueryViewAction extends Action {
  type: NavigationType.SelectQueryView;
}

export interface SelectObjectGroupAction extends Action {
  type: NavigationType.SelectObjectGroup;
  payload: {
    wellUid: string;
    wellboreUid: string;
    objectType: ObjectType;
    objects: ObjectOnWellbore[] | null;
  };
}

export interface SelectLogTypeAction extends Action {
  type: NavigationType.SelectLogType;
  payload: { well: Well; wellbore: Wellbore; logTypeGroup: any };
}

export interface SelectLogCurveInfoAction extends Action {
  type: NavigationType.ShowCurveValues;
  payload: { logCurveInfo: any };
}

export interface SelectObjectAction extends Action {
  type: NavigationType.SelectObject;
  payload: {
    object: ObjectOnWellbore;
    well: Well;
    wellbore: Wellbore;
    objectType: ObjectType;
  };
}

export interface SetCurveThresholdAction extends Action {
  type: NavigationType.SetCurveThreshold;
  payload: { curveThreshold: CurveThreshold };
}

export interface SelectServerManagerAction extends Action {
  type: NavigationType.SelectServerManager;
}

export interface SelectObjectOnWellboreViewAction extends Action {
  type: NavigationType.SelectObjectOnWellboreView;
}
