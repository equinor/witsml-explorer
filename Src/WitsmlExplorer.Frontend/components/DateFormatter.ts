import { DateTimeFormat, TimeZone } from "contexts/operationStateReducer";
import { format, formatInTimeZone, toDate } from "date-fns-tz";

//https://date-fns.org/v2.29.3/docs/format
const naturalDateTimeFormat = "dd.MM.yyyy HH:mm:ss.SSS";
const rawDateTimeFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX";
let dateTimeFormat = rawDateTimeFormat;
export const dateTimeFormatNoOffset = "yyyy-MM-dd'T'HH:mm:ss.SSS";
export const dateTimeFormatTextField = "yyyy-MM-dd'T'HH:mm:ss";

// Minus character U+2212 is preferred by ISO 8601 over hyphen minus '-' so we check both
// date-fns-tz behaves weirdly with minus so we replace it
const unicodeMinus = "\u2212";

function formatDateString(
  dateString: string,
  timeZone: TimeZone,
  dateTimeFormatString: DateTimeFormat
) {
  try {
    if (dateString == null) {
      return null;
    }
    if (dateTimeFormatString == DateTimeFormat.Natural) {
      dateTimeFormat = naturalDateTimeFormat;
    } else if (dateTimeFormatString == DateTimeFormat.RawNoOffset) {
      dateTimeFormat = dateTimeFormatNoOffset;
    } else if (dateTimeFormatString == DateTimeFormat.Raw) {
      dateTimeFormat = rawDateTimeFormat;
    }
    const replaced = dateString.replace(unicodeMinus, "-");
    const parsed = toDate(replaced);
    if (timeZone == TimeZone.Raw) {
      const offset = getOffset(replaced) ?? "Z";
      return formatInTimeZone(parsed, offset, dateTimeFormat);
    }

    //we get the offset from the time zone for the current day to
    //use the same offset regardless of daylight saving time
    const offset = getOffsetFromTimeZone(timeZone);
    return formatInTimeZone(parsed, offset, dateTimeFormat);
  } catch (e) {
    console.error(e);
    return "Invalid date";
  }
}

export default formatDateString;

export function getOffsetFromTimeZone(timeZone: TimeZone): string {
  if (timeZone == TimeZone.Local) {
    return format(new Date(), "xxx");
  } else if (timeZone == TimeZone.Utc) {
    return "+00:00";
  }
  return formatInTimeZone(new Date(), timeZone, "xxx");
}

export function getOffset(dateString: string): string | null {
  if (!dateString || dateString.indexOf("Z") == dateString.length - 1) {
    return "Z";
  }

  const replaced = dateString.replace(unicodeMinus, "-");
  const charAtSignPosition = replaced.charAt(replaced.length - 6);
  if (charAtSignPosition == "+" || charAtSignPosition == "-") {
    const offset = dateString.slice(dateString.length - 6);
    return validateOffset(offset) ? offset : null;
  }

  return null;
}

function validateOffset(offset: string): boolean {
  try {
    return offset.match(/[+-][0-2]\d:[0-5]\d|Z/)[0] == offset;
  } catch {
    return false;
  }
}

export function validateIsoDateString(dateString: string): boolean {
  try {
    const replaced = dateString
      .replace(unicodeMinus, "-")
      .replace("+00:00", "Z")
      .replace("-00:00", "Z");
    const offset = getOffset(replaced);
    if (!offset) {
      return false;
    }
    const parsed = toDate(replaced);
    const formatted = formatInTimeZone(parsed, offset, rawDateTimeFormat);
    return replaced == formatted;
  } catch {
    return false;
  }
}

export function validateIsoDateStringNoOffset(
  dateString: string,
  offset: string
): boolean {
  try {
    const parsed = toDate(dateString + offset);
    const formatted = formatInTimeZone(parsed, offset, dateTimeFormatNoOffset);
    return dateString == formatted;
  } catch {
    return false;
  }
}
