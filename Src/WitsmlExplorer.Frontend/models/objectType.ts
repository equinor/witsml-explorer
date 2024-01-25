import BhaRun from "models/bhaRun";
import ChangeLog from "models/changeLog";
import FluidsReport from "models/fluidsReport";
import FormationMarker from "models/formationMarker";
import LogObject from "models/logObject";
import MessageObject from "models/messageObject";
import MudLog from "models/mudLog";
import Rig from "models/rig";
import RiskObject from "models/riskObject";
import Trajectory from "models/trajectory";
import Tubular from "models/tubular";
import WbGeometryObject from "models/wbGeometry";

export enum ObjectType {
  BhaRun = "BhaRun",
  ChangeLog = "ChangeLog",
  FluidsReport = "FluidsReport",
  FormationMarker = "FormationMarker",
  Log = "Log",
  Message = "Message",
  MudLog = "MudLog",
  Rig = "Rig",
  Risk = "Risk",
  Trajectory = "Trajectory",
  Tubular = "Tubular",
  WbGeometry = "WbGeometry"
}

export const pluralizeObjectType = (objectType: ObjectType) => {
  return objectType.charAt(objectType.length - 1) == "y"
    ? objectType.slice(0, objectType.length - 1) + "ies"
    : objectType + "s";
};

export type ObjectTypeToModel = {
  [ObjectType.BhaRun]: BhaRun;
  [ObjectType.ChangeLog]: ChangeLog;
  [ObjectType.FluidsReport]: FluidsReport;
  [ObjectType.FormationMarker]: FormationMarker;
  [ObjectType.Log]: LogObject;
  [ObjectType.Message]: MessageObject;
  [ObjectType.MudLog]: MudLog;
  [ObjectType.Rig]: Rig;
  [ObjectType.Risk]: RiskObject;
  [ObjectType.Trajectory]: Trajectory;
  [ObjectType.Tubular]: Tubular;
  [ObjectType.WbGeometry]: WbGeometryObject;
};
