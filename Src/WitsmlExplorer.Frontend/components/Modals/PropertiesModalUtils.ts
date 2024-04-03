import Measure from "models/measure";

export const undefinedOnUnchagedEmptyString = (
  original?: string,
  edited?: string
): string | null => {
  if (edited?.length > 0) {
    return edited;
  }
  if (original == null || original.length == 0) {
    return undefined;
  }
  return "";
};

export const invalidStringInput = (
  original: string,
  edited: string,
  maxLength: number
): boolean => {
  return (
    errorOnDeletion(original, edited) ||
    (edited != null && edited.length > maxLength)
  );
};

const errorOnDeletion = (original: string, edited: string): boolean => {
  if (original == null || original.length == 0) {
    return false;
  }
  return edited != null && edited.length == 0;
};

export const invalidMeasureInput = (edited: Measure): boolean => {
  return edited != null && isNaN(edited.value);
};

export const invalidNumberInput = (original: any, edited: number): boolean => {
  return original != null && edited != null && isNaN(edited);
};
