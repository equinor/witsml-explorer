export default interface MessageObject {
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
    messageText: "",
    dateTimeCreation: null,
    dateTimeLastChange: null
  };
}
