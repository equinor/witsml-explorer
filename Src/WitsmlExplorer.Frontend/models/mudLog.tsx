import ObjectOnWellbore, { emptyObjectOnWellbore } from "./objectOnWellbore";

// This is disabled because more attributes will be included later
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export default interface MudLog extends ObjectOnWellbore {}

export function emptymudLog(): MudLog {
  return {
    ...emptyObjectOnWellbore()
  };
}
