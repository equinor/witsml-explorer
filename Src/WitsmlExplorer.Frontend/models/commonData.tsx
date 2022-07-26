export default interface CommonData {
  sourceName: string;
  dTimCreation?: Date;
  dTimLastChange?: Date;
  itemState?: string;
  comments?: string;
}

export function emptyCommonData(): CommonData {
  return {
    sourceName: "",
    dTimCreation: null,
    dTimLastChange: null,
    itemState: "",
    comments: ""
  };
}
