import ObjectOnWellbore from "./objectOnWellbore";

export default interface geologyintervalObject extends ObjectOnWellbore {
  uid: string;
  typeLithology: string;
  codeLith: string;
  lithPc: number;
  [key: string]: any;
}
