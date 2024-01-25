import Wellbore from "models/wellbore";

export default interface Well {
  uid: string;
  name: string;
  field: string;
  operator: string;
  country: string;
  numLicense?: string;
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
    numLicense: "",
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
