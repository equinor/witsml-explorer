import Wellbore from "./wellbore";

export default interface Well {
  uid: string;
  name: string;
  field: string;
  operator: string;
  country: string;
  timeZone?: string;
  dateTimeCreation?: Date;
  dateTimeLastChange?: Date;
  itemState?: string;
  wellbores?: Wellbore[];
}

export function emptyWell(): Well {
  return {
    uid: "",
    name: "",
    field: "",
    operator: "",
    country: "",
    timeZone: "",
    dateTimeCreation: null,
    dateTimeLastChange: null,
    itemState: "",
    wellbores: []
  };
}

export const getWellProperties = (well: Well): Map<string, string> => {
  return new Map([
    ["Well", well.name],
    ["UID Well", well.uid]
  ]);
};
