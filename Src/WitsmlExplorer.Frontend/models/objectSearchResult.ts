import ObjectOnWellbore from "models/objectOnWellbore";
import { ObjectType } from "models/objectType";

export default interface ObjectSearchResult extends ObjectOnWellbore {
  searchProperty?: string;
  objectType: ObjectType;
}
