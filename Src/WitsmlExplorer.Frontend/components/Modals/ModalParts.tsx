export enum PropertiesModalMode {
  New,
  Edit
}

export const validText = (text: string): boolean => {
  return text && text.length > 0;
};

export const validTimeZone = (timeZone: string): boolean => {
  const timeZoneValidator = new RegExp("(\\+(0\\d|1[0-4])|-(0\\d|1[0-2])):(00|30|45)");
  return timeZoneValidator.test(timeZone);
};
