import GeologyInterval from "./geologyInterval";
import ObjectReference from "./jobs/objectReference";
import ObjectReferences from "./jobs/objectReferences";
import { ObjectType } from "./objectType";
import Wellbore from "./wellbore";

export default interface ObjectOnWellbore {
  typeLithology: any;
  uid: string;
  wellboreUid: string;
  wellUid: string;
  name: string;
  wellboreName: string;
  wellName: string;
  mudloguid?: string;
}

export function toObjectReference(
  objectOnWellbore: ObjectOnWellbore
): ObjectReference {
  return {
    uid: objectOnWellbore.uid,
    wellboreUid: objectOnWellbore.wellboreUid,
    wellUid: objectOnWellbore.wellUid,
    name: objectOnWellbore.name,
    wellboreName: objectOnWellbore.wellboreName,
    wellName: objectOnWellbore.wellName
  };
}
export function toObjectReferences(
  objectsOnWellbore: ObjectOnWellbore[],
  objectType: ObjectType,
  serverUrl: string = null
): ObjectReferences {
  return {
    wellboreUid: objectsOnWellbore[0].wellboreUid,
    wellboreName: objectsOnWellbore[0].wellboreName,
    wellUid: objectsOnWellbore[0].wellUid,
    wellName: objectsOnWellbore[0].wellName,
    objectUids: objectsOnWellbore.map((o) => o.uid),
    names: objectsOnWellbore.map((o) => o.name),
    objectType,
    serverUrl
  };
}

export const calculateObjectNodeId = (
  objectOnWellbore: ObjectOnWellbore,
  objectType: ObjectType
): string => {
  return (
    objectOnWellbore.wellUid +
    objectOnWellbore.wellboreUid +
    objectType +
    objectOnWellbore.uid
  );
};

export const getObjectOnWellboreProperties = (objectOnWellbore: ObjectOnWellbore | GeologyInterval, objectType: ObjectType, wellbore: Wellbore): Map<string, string> => {
  const selectedwellboreData = wellbore?.mudLogs?.filter((mudlogs) => mudlogs.uid == objectOnWellbore?.mudloguid);
  return new Map(
    objectType === ObjectType.geologyInterval
      ? [
          ["Well", selectedwellboreData[0]?.wellName],
          ["UID Well", selectedwellboreData[0]?.wellUid],
          ["Wellbore", selectedwellboreData[0]?.wellboreName],
          ["UID Wellbore", selectedwellboreData[0]?.wellboreUid],
          [objectType.toString(), objectOnWellbore?.typeLithology],
          [`UID ${objectType.toString()}`, objectOnWellbore?.uid]
        ]
      : [
          ["Well", (objectOnWellbore as ObjectOnWellbore)?.wellName],
          ["UID Well", (objectOnWellbore as ObjectOnWellbore)?.wellUid],
          ["Wellbore", (objectOnWellbore as ObjectOnWellbore)?.wellboreName],
          ["UID Wellbore", (objectOnWellbore as ObjectOnWellbore)?.wellboreUid],
          [objectType.toString(), (objectOnWellbore as ObjectOnWellbore)?.name],
          [`UID ${objectType.toString()}`, (objectOnWellbore as ObjectOnWellbore)?.uid]
        ]
  );
