import { ObjectType } from "./objectType";

export enum ComponentType {
  GeologyInterval = "Geology Interval",
  Mnemonic = "Mnemonic",
  TrajectoryStation = "Trajectory Station",
  TubularComponent = "Tubular Component",
  WbGeometrySection = "WbGeometry Section"
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
