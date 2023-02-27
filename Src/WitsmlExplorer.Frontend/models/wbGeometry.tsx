import CommonData from "./commonData";
import Measure from "./measure";
import ObjectOnWellbore from "./objectOnWellbore";

export default interface WbGeometryObject extends ObjectOnWellbore {
  dTimReport?: string;
  mdBottom?: Measure;
  gapAir?: Measure;
  depthWaterMean?: Measure;
  commonData: CommonData;
}
