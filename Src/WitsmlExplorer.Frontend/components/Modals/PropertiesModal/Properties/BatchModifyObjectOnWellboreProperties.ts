import { getBatchModifyLogObjectProperties } from "components/Modals/PropertiesModal/Properties/LogObjectProperties";
import { getBatchModifyRigProperties } from "components/Modals/PropertiesModal/Properties/RigProperties";
import { PropertiesModalProperty } from "components/Modals/PropertiesModal/propertiesModalProperty";
import { ObjectType, ObjectTypeToModel } from "models/objectType";

// Note: Only add properties that can be updated directly (without having to create a new object and delete the old one)
export const getBatchModifyObjectOnWellboreProperties = <T extends ObjectType>(
  objectType: T
): PropertiesModalProperty<ObjectTypeToModel[T]>[] => {
  switch (objectType) {
    case ObjectType.BhaRun:
      return [];
    case ObjectType.ChangeLog:
      return [];
    case ObjectType.FluidsReport:
      return [];
    case ObjectType.FormationMarker:
      return [];
    case ObjectType.Log:
      return getBatchModifyLogObjectProperties() as PropertiesModalProperty<
        ObjectTypeToModel[T]
      >[];
    case ObjectType.Message:
      return [];
    case ObjectType.MudLog:
      return [];
    case ObjectType.Rig:
      return getBatchModifyRigProperties() as PropertiesModalProperty<
        ObjectTypeToModel[T]
      >[];
    case ObjectType.Risk:
      return [];
    case ObjectType.Trajectory:
      return [];
    case ObjectType.Tubular:
      return [];
    case ObjectType.WbGeometry:
      return [];
  }
};
