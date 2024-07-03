import { PropertiesModalMode } from "components/Modals/ModalParts";
import { getBhaRunProperties } from "components/Modals/PropertiesModal/Properties/BhaRunProperties";
import { getFormationMarkerProperties } from "components/Modals/PropertiesModal/Properties/FormationMarkerProperties";
import { getLogObjectProperties } from "components/Modals/PropertiesModal/Properties/LogObjectProperties";
import { getMessageProperties } from "components/Modals/PropertiesModal/Properties/MessageProperties";
import { getMudLogProperties } from "components/Modals/PropertiesModal/Properties/MudLogProperties";
import { getRigProperties } from "components/Modals/PropertiesModal/Properties/RigProperties";
import { getRiskProperties } from "components/Modals/PropertiesModal/Properties/RiskProperties";
import { getTrajectoryProperties } from "components/Modals/PropertiesModal/Properties/TrajectoryProperties";
import { getTubularProperties } from "components/Modals/PropertiesModal/Properties/TubularProperties";
import { getWbGeometryProperties } from "components/Modals/PropertiesModal/Properties/WbGeometryProperties";
import { getFluidsReportProperties } from "components/Modals/PropertiesModal/Properties/getFluidsReportProperties";
import { PropertiesModalProperty } from "components/Modals/PropertiesModal/propertiesModalProperty";
import { ObjectType, ObjectTypeToModel } from "models/objectType";

// Note: Only add properties that can be updated directly (without having to create a new object and delete the old one)
export const getObjectOnWellboreProperties = <T extends ObjectType>(
  objectType: T,
  mode: PropertiesModalMode,
  indexType: string = null
): PropertiesModalProperty<ObjectTypeToModel[T]>[] => {
  switch (objectType) {
    case ObjectType.BhaRun:
      return getBhaRunProperties(mode) as PropertiesModalProperty<
        ObjectTypeToModel[T]
      >[];
    case ObjectType.ChangeLog:
      return [];
    case ObjectType.FluidsReport:
      return getFluidsReportProperties(mode) as PropertiesModalProperty<
        ObjectTypeToModel[T]
      >[];
    case ObjectType.FormationMarker:
      return getFormationMarkerProperties(mode) as PropertiesModalProperty<
        ObjectTypeToModel[T]
      >[];
    case ObjectType.Log:
      return getLogObjectProperties(mode, indexType) as PropertiesModalProperty<
        ObjectTypeToModel[T]
      >[];
    case ObjectType.Message:
      return getMessageProperties(mode) as PropertiesModalProperty<
        ObjectTypeToModel[T]
      >[];
    case ObjectType.MudLog:
      return getMudLogProperties(mode) as PropertiesModalProperty<
        ObjectTypeToModel[T]
      >[];
    case ObjectType.Rig:
      return getRigProperties(mode) as PropertiesModalProperty<
        ObjectTypeToModel[T]
      >[];
    case ObjectType.Risk:
      return getRiskProperties(mode) as PropertiesModalProperty<
        ObjectTypeToModel[T]
      >[];
    case ObjectType.Trajectory:
      return getTrajectoryProperties(mode) as PropertiesModalProperty<
        ObjectTypeToModel[T]
      >[];
    case ObjectType.Tubular:
      return getTubularProperties(mode) as PropertiesModalProperty<
        ObjectTypeToModel[T]
      >[];
    case ObjectType.WbGeometry:
      return getWbGeometryProperties(mode) as PropertiesModalProperty<
        ObjectTypeToModel[T]
      >[];
  }
};
