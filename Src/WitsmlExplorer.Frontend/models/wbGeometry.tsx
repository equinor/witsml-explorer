import CommonData from "models/commonData";
import Measure from "models/measure";
import ObjectOnWellbore from "models/objectOnWellbore";

export default interface WbGeometryObject extends ObjectOnWellbore {
  dTimReport?: string;
  mdBottom?: Measure;
  gapAir?: Measure;
  depthWaterMean?: Measure;
  commonData: CommonData;
}
