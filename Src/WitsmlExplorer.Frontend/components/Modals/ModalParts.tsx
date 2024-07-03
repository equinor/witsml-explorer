import MaxLength from "models/maxLength";
import Measure from "models/measure";
import RefNameString from "models/refNameString";
import StratigraphicStruct from "models/stratigraphicStruct";

export enum PropertiesModalMode {
  New,
  Edit
}

export const validText = (
  text: string,
  minLength = 1,
  maxLength: number = null
): boolean => {
  if (maxLength !== null && minLength > maxLength)
    throw new Error("The value for minLength should be less than maxLength.");
  if (minLength !== null && (text?.length ?? 0) < minLength) return false;
  if (maxLength !== null && (text?.length ?? 0) > maxLength) return false;
  return true;
};

export const validTimeZone = (timeZone: string): boolean => {
  const timeZoneValidator = new RegExp(
    "(^Z$)|(\\+(0\\d|1[0-4])|-(0\\d|1[0-2])):(00|30|45)"
  );
  return timeZoneValidator.test(timeZone);
};

export const validInteger = (num: string): boolean => {
  let result = true;
  if (num) {
    const arr: Array<string> = num.split("");
    arr.forEach((e) => {
      if (isNaN(parseInt(e)) && e != " " && e != "-" && e != "+") {
        result = false;
      }
    });
  }
  return result;
};

export const validNumber = (num: string): boolean => {
  return !isNaN(parseFloat(num)) && isFinite(parseFloat(num));
};

export const validPhoneNumber = (telnum: string): boolean => {
  return validInteger(telnum) && validText(telnum, 1, MaxLength.String32);
};

export const validMeasure = (measure: Measure): boolean => {
  return (
    typeof measure.value === "number" &&
    !isNaN(measure.value) &&
    validText(measure.uom, 1, MaxLength.UomEnum)
  );
};

export const validBoolean = (value: any): boolean => {
  return typeof value === "boolean";
};

export const validStratigraphicStruct = (
  stratigraphicStruct: StratigraphicStruct
): boolean => {
  return (
    validText(stratigraphicStruct.value, 1, MaxLength.Name) &&
    validText(stratigraphicStruct.kind, 1, MaxLength.Name)
  );
};

export const validRefNameString = (refNameString: RefNameString): boolean => {
  return (
    validText(refNameString.value, 1, MaxLength.Name) &&
    validText(refNameString.uidRef, 1, MaxLength.Uid)
  );
};

export const validPositiveInteger = (num: string): boolean => {
  return /^\+?(0|[1-9]\d*)$/.test(num);
};

export const validOption = (option: string, validOptions: string[]) => {
  return validOptions.includes(option);
};

export const validMultiOption = (options: string, validOptions: string[]) => {
  return options.split(", ").every((option) => validOptions.includes(option));
};
