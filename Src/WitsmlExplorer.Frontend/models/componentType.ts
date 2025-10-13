import DataSourceConfigurationSet from "models/dataWorkOrder/dataSourceConfigurationSet";
import Fluid from "models/fluid";
import GeologyInterval from "models/geologyInterval";
import LogCurveInfo from "models/logCurveInfo";
import { ObjectType } from "models/objectType";
import TrajectoryStation from "models/trajectoryStation";
import TubularComponent from "models/tubularComponent";
import WbGeometrySection from "models/wbGeometrySection";

export enum ComponentType {
  GeologyInterval = "GeologyInterval",
  Mnemonic = "Mnemonic",
  TrajectoryStation = "TrajectoryStation",
  TubularComponent = "TubularComponent",
  WbGeometrySection = "WbGeometrySection",
  Fluid = "Fluid",
  DataSourceConfigurationSet = "DataSourceConfigurationSet"
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
    case ComponentType.Fluid:
      return ObjectType.FluidsReport;
    case ComponentType.DataSourceConfigurationSet:
      return ObjectType.DataWorkOrder;
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
  [ComponentType.Fluid]: Fluid;
  [ComponentType.DataSourceConfigurationSet]: DataSourceConfigurationSet;
};
