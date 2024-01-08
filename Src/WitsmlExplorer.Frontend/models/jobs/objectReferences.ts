import { ObjectType } from "models/objectType";

export default interface ObjectReferences {
  serverUrl?: string;
  objectUids: string[];
  wellUid: string;
  wellboreUid: string;
  objectType: ObjectType;
  wellName: string;
  wellboreName: string;
  names: string[];
}
