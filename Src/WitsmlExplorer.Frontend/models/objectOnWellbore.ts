import { ObjectType } from "./objectType";

export default interface ObjectOnWellbore {
  uid: string;
  wellboreUid: string;
  wellUid: string;
  name: string;
  wellboreName: string;
  wellName: string;
}

export function emptyObjectOnWellbore(): ObjectOnWellbore {
  return {
    wellboreUid: "",
    wellboreName: "",
    wellUid: "",
    wellName: "",
    uid: "",
    name: ""
  };
}

export const calculateObjectNodeId = (objectOnWellbore: ObjectOnWellbore): string => {
  return objectOnWellbore.wellUid + objectOnWellbore.wellboreUid + objectOnWellbore.uid;
};

export const getObjectOnWellboreProperties = (objectOnWellbore: ObjectOnWellbore, objectType: ObjectType): Map<string, string> => {
  return new Map([
    ["Well", objectOnWellbore.wellName],
    ["UID Well", objectOnWellbore.wellUid],
    ["Wellbore", objectOnWellbore.wellboreName],
    ["UID Wellbore", objectOnWellbore.wellboreUid],
    [objectType.toString(), objectOnWellbore.name],
    [`UID ${objectType.toString()}`, objectOnWellbore.uid]
  ]);
};
