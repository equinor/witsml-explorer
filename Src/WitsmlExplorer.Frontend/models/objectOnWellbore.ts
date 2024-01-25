import ObjectReference from "models/jobs/objectReference";
import ObjectReferences from "models/jobs/objectReferences";
import { ObjectType } from "models/objectType";

export default interface ObjectOnWellbore {
  uid: string;
  wellboreUid: string;
  wellUid: string;
  name: string;
  wellboreName: string;
  wellName: string;
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

export const getObjectOnWellboreProperties = (
  objectOnWellbore: ObjectOnWellbore,
  objectType: ObjectType
): Map<string, string> => {
  return new Map([
    ["Well", objectOnWellbore.wellName],
    ["UID Well", objectOnWellbore.wellUid],
    ["Wellbore", objectOnWellbore.wellboreName],
    ["UID Wellbore", objectOnWellbore.wellboreUid],
    [objectType.toString(), objectOnWellbore.name],
    [`UID ${objectType.toString()}`, objectOnWellbore.uid]
  ]);
};
