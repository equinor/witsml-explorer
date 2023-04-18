import CommonData from "./commonData";
import ObjectOnWellbore from "./objectOnWellbore";

export default interface Tubular extends ObjectOnWellbore {
  typeTubularAssy: string;
  commonData: CommonData;
}
