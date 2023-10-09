import ObjectOnWellbore from "./objectOnWellbore";
import { ObjectType } from "./objectType";

export default interface ObjectSearchResult extends ObjectOnWellbore {
  searchProperty?: string;
  objectType: ObjectType;
}
