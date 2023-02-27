import CommonData from "./commonData";
import ObjectOnWellbore from "./objectOnWellbore";

export default interface MessageObject extends ObjectOnWellbore {
  messageText: string;
  dTim: string;
  typeMessage: string;
  commonData: CommonData;
}
