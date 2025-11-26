import Measure from "./measure.ts";
import Location from "./location.tsx";
import ReferencePoint from "./referencePoint.tsx";
import WellDatum from "./wellDatum.tsx";

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
  isActive?: boolean;
  waterDepth?: Measure;
  wellDatum?: WellDatum[];
  wellLocation?: Location[];
  referencePoint?: ReferencePoint[];
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
    waterDepth: undefined,
    wellDatum: undefined,
    wellLocation: undefined,
    referencePoint: undefined
  };
}

export const getWellProperties = (well: Well): Map<string, string> => {
  return new Map([
    ["Well", well.name],
    ["UID Well", well.uid]
  ]);
};
