export enum ObjectType {
  BhaRun = "BhaRun",
  Log = "Log",
  Message = "Message",
  MudLog = "MudLog",
  Rig = "Rig",
  Risk = "Risk",
  Trajectory = "Trajectory",
  Tubular = "Tubular",
  WbGeometry = "WbGeometry"
}

export const pluralizeObjectType = (objectType: ObjectType) => {
  return objectType.charAt(objectType.length - 1) == "y" ? objectType.slice(0, objectType.length - 1) + "ies" : objectType + "s";
};
