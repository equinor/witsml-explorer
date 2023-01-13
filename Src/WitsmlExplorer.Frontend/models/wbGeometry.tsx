import CommonData from "./commonData";
import Measure from "./measure";
import ObjectOnWellbore, { emptyObjectOnWellbore } from "./objectOnWellbore";

export default interface WbGeometryObject extends ObjectOnWellbore {
  dTimReport?: string;
  mdBottom?: Measure;
  gapAir?: Measure;
  depthWaterMean?: Measure;
  commonData: CommonData;
}

export function emptyWbGeometryObject(): WbGeometryObject {
  return {
    ...emptyObjectOnWellbore(),
    dTimReport: null,
    mdBottom: null,
    gapAir: null,
    depthWaterMean: null,
    commonData: {
      sourceName: "",
      dTimCreation: "",
      dTimLastChange: "",
      itemState: "",
      comments: ""
    }
  };
}
