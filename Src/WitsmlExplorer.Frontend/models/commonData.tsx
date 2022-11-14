export default interface CommonData {
  sourceName: string;
  dTimCreation?: string;
  dTimLastChange?: string;
  itemState?: string;
  comments?: string;
  defaultDatum?: string;
  serviceCategory?: string;
}

export function emptyCommonData(): CommonData {
  return {
    sourceName: "",
    dTimCreation: "",
    dTimLastChange: "",
    itemState: "",
    comments: "",
    defaultDatum: "",
    serviceCategory: ""
  };
}
