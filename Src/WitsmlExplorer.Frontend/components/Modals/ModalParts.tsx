export enum PropertiesModalMode {
  New,
  Edit
}

export const validText = (text: string, minLength: number | undefined = undefined, maxLength: number | undefined = undefined): boolean => {
  if (minLength === undefined && maxLength === undefined) return Boolean(text) && text.length > 0;
  if (typeof minLength === "number" && maxLength === undefined) return text.length >= minLength;
  if (minLength === undefined && typeof maxLength === "number") return text.length <= maxLength;
  if (minLength >= maxLength) throw new Error("The value for minLength should be less than maxLength.");
  return text.length >= minLength && text.length <= maxLength;
};

export const validTimeZone = (timeZone: string): boolean => {
  const timeZoneValidator = new RegExp("(^Z$)|(\\+(0\\d|1[0-4])|-(0\\d|1[0-2])):(00|30|45)");
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
