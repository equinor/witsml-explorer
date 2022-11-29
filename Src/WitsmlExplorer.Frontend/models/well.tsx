import Wellbore from "./wellbore";

export default interface Well {
  uid: string;
  name: string;
  field: string;
  operator: string;
  country: string;
  timeZone?: string;
  dateTimeCreation?: string;
  dateTimeLastChange?: string;
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
    dateTimeCreation: "",
    dateTimeLastChange: "",
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
