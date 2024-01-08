import CommonData from "models/commonData";
import ObjectOnWellbore from "models/objectOnWellbore";

export default interface Tubular extends ObjectOnWellbore {
  typeTubularAssy: string;
  commonData: CommonData;
}
