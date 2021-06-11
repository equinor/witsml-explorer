export default interface MessageObject {
  wellboreUid: string;
  wellboreName: string;
  wellUid: string;
  wellName?: string;
  dateTimeCreation?: Date;
  dateTimeLastChange?: Date;
}

export function emptyMessageObject(): MessageObject {
  return {
    wellboreUid: "",
    wellboreName: "",
    wellUid: "",
    wellName: "",
    dateTimeCreation: null,
    dateTimeLastChange: null
  };
}
