import BhaRunContextMenu from "components/ContextMenus/BhaRunContextMenu";
import FluidsReportContextMenu from "components/ContextMenus/FluidsReportContextMenu";
import FormationMarkerContextMenu from "components/ContextMenus/FormationMarkerContextMenu";
import LogObjectContextMenu from "components/ContextMenus/LogObjectContextMenu";
import MessageObjectContextMenu from "components/ContextMenus/MessageObjectContextMenu";
import MudLogContextMenu from "components/ContextMenus/MudLogContextMenu";
import { ObjectContextMenuProps } from "components/ContextMenus/ObjectMenuItems";
import RigContextMenu from "components/ContextMenus/RigContextMenu";
import RiskObjectContextMenu from "components/ContextMenus/RiskContextMenu";
import TrajectoryContextMenu from "components/ContextMenus/TrajectoryContextMenu";
import TubularContextMenu from "components/ContextMenus/TubularContextMenu";
import WbGeometryObjectContextMenu from "components/ContextMenus/WbGeometryContextMenu";
import { ObjectType } from "models/objectType";

export const ObjectTypeToContextMenu: Record<
  ObjectType,
  React.ComponentType<ObjectContextMenuProps> | null
> = {
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
