import GeologyInterval from "./geologyInterval";
import LogCurveInfo from "./logCurveInfo";
import { ObjectType } from "./objectType";
import TrajectoryStation from "./trajectoryStation";
import TubularComponent from "./tubularComponent";
import WbGeometrySection from "./wbGeometrySection";

export enum ComponentType {
  GeologyInterval = "GeologyInterval",
  Mnemonic = "Mnemonic",
  TrajectoryStation = "TrajectoryStation",
  TubularComponent = "TubularComponent",
  WbGeometrySection = "WbGeometrySection"
}

export const getParentType = (componentType: ComponentType): ObjectType => {
  switch (componentType) {
    case ComponentType.GeologyInterval:
      return ObjectType.MudLog;
    case ComponentType.Mnemonic:
      return ObjectType.Log;
    case ComponentType.TrajectoryStation:
      return ObjectType.Trajectory;
    case ComponentType.TubularComponent:
      return ObjectType.Tubular;
    case ComponentType.WbGeometrySection:
      return ObjectType.WbGeometry;
    default:
      return undefined;
  }
};

export type ComponentTypeToModel = {
  [ComponentType.GeologyInterval]: GeologyInterval;
  [ComponentType.Mnemonic]: LogCurveInfo;
  [ComponentType.TrajectoryStation]: TrajectoryStation;
  [ComponentType.TubularComponent]: TubularComponent;
  [ComponentType.WbGeometrySection]: WbGeometrySection;
};
