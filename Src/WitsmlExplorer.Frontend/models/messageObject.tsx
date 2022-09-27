import ObjectOnWellbore, { emptyObjectOnWellbore } from "./objectOnWellbore";

export default interface MessageObject extends ObjectOnWellbore {
  messageText: string;
  dateTimeCreation?: Date;
  dateTimeLastChange?: Date;
}

export function emptyMessageObject(): MessageObject {
  return {
    ...emptyObjectOnWellbore(),
    messageText: "",
    dateTimeCreation: null,
    dateTimeLastChange: null
  };
}
