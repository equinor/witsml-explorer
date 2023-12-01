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

export const validPhoneNumber = (telnum: string): boolean => {
  let result = true;
  if (telnum) {
    const arr: Array<string> = telnum.split("");
    arr.forEach((e) => {
      if (isNaN(parseInt(e)) && e != " " && e != "-" && e != "+") {
        result = false;
      }
    });
  }
  return result;
};
