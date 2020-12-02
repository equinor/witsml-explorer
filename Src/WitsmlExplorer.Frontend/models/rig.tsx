export default interface Rig {
  airGap: string;
  dateTimeCreation?: Date;
  dateTimeLastChange?: Date;
  itemState?: string;
  name: string;
  owner: string;
  typeRig: string;
  uid: string;
  wellboreName?: string;
  wellboreUid: string;
  wellName?: string;
  wellUid: string;
}

export function emptyRig(): Rig {
  return {
    airGap: "",
    dateTimeCreation: null,
    dateTimeLastChange: null,
    itemState: "",
    name: "",
    owner: "",
    typeRig: "",
    uid: "",
    wellboreName: "",
    wellboreUid: "",
    wellName: "",
    wellUid: ""
  };
}
