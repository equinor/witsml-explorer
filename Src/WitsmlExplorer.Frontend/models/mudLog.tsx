import ObjectOnWellbore, { emptyObjectOnWellbore } from "./objectOnWellbore";

export default interface MudlogObject extends ObjectOnWellbore {
  uid: string;
}

export function emptyMudlogObject(): MudlogObject {
  return {
    ...emptyObjectOnWellbore(),
    uid: ""
  };
}
