import BhaRun from "./bhaRun";
import ChangeLog from "./changeLog";
import FluidsReport from "./fluidsReport";
import FormationMarker from "./formationMarker";
import LogObject from "./logObject";
import MessageObject from "./messageObject";
import MudLog from "./mudLog";
import Rig from "./rig";
import RiskObject from "./riskObject";
import Trajectory from "./trajectory";
import Tubular from "./tubular";
import WbGeometryObject from "./wbGeometry";

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
  return objectType.charAt(objectType.length - 1) == "y" ? objectType.slice(0, objectType.length - 1) + "ies" : objectType + "s";
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
