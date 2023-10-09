import { ObjectType } from "../../models/objectType";
import BhaRunContextMenu from "./BhaRunContextMenu";
import FluidsReportContextMenu from "./FluidsReportContextMenu";
import FormationMarkerContextMenu from "./FormationMarkerContextMenu";
import LogObjectContextMenu from "./LogObjectContextMenu";
import MessageObjectContextMenu from "./MessageObjectContextMenu";
import MudLogContextMenu from "./MudLogContextMenu";
import { ObjectContextMenuProps } from "./ObjectMenuItems";
import RigContextMenu from "./RigContextMenu";
import RiskObjectContextMenu from "./RiskContextMenu";
import TrajectoryContextMenu from "./TrajectoryContextMenu";
import TubularContextMenu from "./TubularContextMenu";
import WbGeometryObjectContextMenu from "./WbGeometryContextMenu";

export const ObjectTypeToContextMenu: Record<ObjectType, React.ComponentType<ObjectContextMenuProps> | null> = {
  [ObjectType.BhaRun]: BhaRunContextMenu,
  [ObjectType.ChangeLog]: null,
  [ObjectType.FluidsReport]: FluidsReportContextMenu,
  [ObjectType.FormationMarker]: FormationMarkerContextMenu,
  [ObjectType.Log]: LogObjectContextMenu,
  [ObjectType.Message]: MessageObjectContextMenu,
  [ObjectType.MudLog]: MudLogContextMenu,
  [ObjectType.Rig]: RigContextMenu,
  [ObjectType.Risk]: RiskObjectContextMenu,
  [ObjectType.Trajectory]: TrajectoryContextMenu,
  [ObjectType.Tubular]: TubularContextMenu,
  [ObjectType.WbGeometry]: WbGeometryObjectContextMenu
};
