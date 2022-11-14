import CommonData, { emptyCommonData } from "./commonData";
import ObjectOnWellbore, { emptyObjectOnWellbore } from "./objectOnWellbore";

export default interface MessageObject extends ObjectOnWellbore {
  messageText: string;
  dTim: string;
  typeMessage: string;
  commonData: CommonData;
}

export function emptyMessageObject(): MessageObject {
  return {
    ...emptyObjectOnWellbore(),
    messageText: "",
    dTim: "",
    typeMessage: "",
    commonData: emptyCommonData()
  };
}
