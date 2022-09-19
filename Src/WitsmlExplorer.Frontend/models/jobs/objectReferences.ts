import { ObjectType } from "../objectType";

export default interface ObjectReferences {
  serverUrl?: string;
  objectUids: string[];
  wellUid: string;
  wellboreUid: string;
  objectType: ObjectType;
}
