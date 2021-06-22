import LogObject from "./logObject";

export default interface MessageObject {
  uid: string;
  name: string;
  wellboreUid: string;
  wellboreName: string;
  wellUid: string;
  wellName?: string;
  messageText: string;
  dateTimeCreation?: Date;
  dateTimeLastChange?: Date;
}

export function emptyMessageObject(): MessageObject {
  return {
    wellboreUid: "",
    wellboreName: "",
    wellUid: "",
    wellName: "",
    uid: "",
    name: "",
    messageText: "",
    dateTimeCreation: null,
    dateTimeLastChange: null
  };
}

export const calculateMessageObjectNodeId = (messageObject: MessageObject): string => {
  return messageObject.wellUid + messageObject.wellboreUid + messageObject.uid;
};

export const getMessageObjectProperties = (messageObject: MessageObject): Map<string, string> => {
  return new Map([
    ["Well", messageObject.wellName],
    ["UID Well", messageObject.wellUid],
    ["Wellbore", messageObject.wellboreName],
    ["UID Wellbore", messageObject.wellboreUid],
    ["Message", messageObject.name],
    ["UID Message", messageObject.uid]
  ]);
};
